import {
  ProxmoxAPI,
  type ProxmoxGuestType,
  type ProxmoxNode,
  type ProxmoxResource,
} from "./client";
import { ProxmoxModel } from "./model";

const cleanEnv = (value?: string | null) =>
  typeof value === "string" ? value.trim() : undefined;

const proxmoxEnvConfig = {
  baseUrl: cleanEnv(process.env.PROXMOX_API_URL),
  tokenId: cleanEnv(process.env.PROXMOX_API_TOKEN_ID),
  tokenSecret: cleanEnv(process.env.PROXMOX_API_TOKEN_SECRET),
  allowInsecureTls:
    (process.env.PROXMOX_ALLOW_INSECURE ?? "false").toLowerCase() === "true",
} as const;


let cachedClient: ProxmoxAPI | null = null;

function ensureClient(): ProxmoxAPI {
  if (!cachedClient) {
    if (
      !proxmoxEnvConfig.baseUrl ||
      !proxmoxEnvConfig.tokenId ||
      !proxmoxEnvConfig.tokenSecret
    ) {
      throw new Error(
        "Proxmox API credentials are not configured. Set PROXMOX_API_URL, PROXMOX_API_TOKEN_ID and PROXMOX_API_TOKEN_SECRET.",
      );
    }

    console.log("[Proxmox] Initializing client with base URL:", proxmoxEnvConfig.baseUrl)

    cachedClient = new ProxmoxAPI({
      baseUrl: proxmoxEnvConfig.baseUrl,
      tokenId: proxmoxEnvConfig.tokenId,
      tokenSecret: proxmoxEnvConfig.tokenSecret,
      allowInsecureTls: proxmoxEnvConfig.allowInsecureTls,
    });
  }

  return cachedClient;
}

const round2 = (value: number) => Math.round(value * 100) / 100;
const percent = (used: number, total: number) =>
  total > 0 ? round2((used / total) * 100) : 0;

const ratioPercent = (value: number | undefined) =>
  value !== undefined ? round2(value * 100) : 0;

function mapNode(node: ProxmoxNode) {
  const memoryUsed = node.mem ?? 0;
  const memoryTotal = node.maxmem ?? 0;
  const diskUsed = node.disk ?? 0;
  const diskTotal = node.maxdisk ?? 0;

  return {
    name: node.node,
    status: node.status,
    health: node.level ?? "ok",
    cpuCores: node.maxcpu ?? 0,
    cpuLoadPercent: ratioPercent(node.cpu),
    memoryUsed,
    memoryTotal,
    memoryPercent: percent(memoryUsed, memoryTotal),
    diskUsed,
    diskTotal,
    diskPercent: percent(diskUsed, diskTotal),
    uptimeSeconds: node.uptime ?? 0,
  };
}

function mapGuests(resources: ProxmoxResource[], limit?: number) {
  const guests = resources
    .filter((resource) => resource.type === "qemu" || resource.type === "lxc")
    .map((resource) => {
      const name = resource.name ?? resource.id;
      const memoryUsed = resource.mem ?? 0;
      const memoryTotal = resource.maxmem ?? 0;

      return {
        id: resource.vmid?.toString() ?? resource.id,
        name,
        type: resource.type,
        node: resource.node ?? "unknown",
        status: resource.status ?? "unknown",
        cpuPercent: ratioPercent(resource.cpu),
        memoryPercent: percent(memoryUsed, memoryTotal),
        uptimeSeconds: resource.uptime ?? 0,
      };
    })
    .sort((a, b) => b.cpuPercent - a.cpuPercent);

  return typeof limit === "number" ? guests.slice(0, limit) : guests;
}

function mapStorage(resources: ProxmoxResource[]) {
  return resources
    .filter((resource) => resource.type === "storage")
    .map((resource) => {
      const used = resource.disk ?? 0;
      const total = resource.maxdisk ?? 0;

      return {
        id: resource.id,
        node: resource.node ?? "shared",
        storage: resource.storage ?? resource.id,
        type: resource.plugintype ?? "unknown",
        used,
        total,
        usagePercent: percent(used, total),
      };
    })
    .sort((a, b) => b.usagePercent - a.usagePercent);
}

export abstract class ProxmoxService {
  static async getHomelabOverview(): Promise<ProxmoxModel.homelabOverviewResponse> {
    const client = ensureClient();

    const [nodes, resources, tasks] = await Promise.all([
      client.getNodes(),
      client.getClusterResources(),
      client.getRecentTasks(),
    ]);

    const nodeSummaries = nodes.map(mapNode);
    const storageSummaries = mapStorage(resources);
    const guestSummaries = mapGuests(resources, 6);

    const totalMemUsed = nodes.reduce((sum, node) => sum + (node.mem ?? 0), 0);
    const totalMemCapacity = nodes.reduce(
      (sum, node) => sum + (node.maxmem ?? 0),
      0,
    );

    const cpuLoad = nodes.reduce((sum, node) => {
      const fraction = node.cpu ?? 0;
      const capacity = node.maxcpu ?? 0;
      return sum + fraction * capacity;
    }, 0);
    const cpuCapacity = nodes.reduce(
      (sum, node) => sum + (node.maxcpu ?? 0),
      0,
    );

    const totalStorageUsed = storageSummaries.reduce(
      (sum, storage) => sum + storage.used,
      0,
    );
    const totalStorageCapacity = storageSummaries.reduce(
      (sum, storage) => sum + storage.total,
      0,
    );

    const nodesOnline = nodes.filter((node) => node.status === "online").length;
    const nodesOffline = nodes.length - nodesOnline;

    const recentTasks = tasks.map((task) => {
      const start = task.starttime ? task.starttime * 1000 : undefined;
      const end = task.endtime ? task.endtime * 1000 : undefined;
      const duration =
        start && end ? Math.max((end - start) / 1000, 0) : undefined;

      return {
        id: task.upid ?? task.id ?? `${task.node}-${task.type}`,
        node: task.node,
        type: task.type,
        status: task.status ?? "unknown",
        user: task.user ?? "system",
        startedAt: start ? new Date(start).toISOString() : null,
        endedAt: end ? new Date(end).toISOString() : null,
        durationSeconds: duration ?? null,
      };
    });

    return {
      fetchedAt: new Date().toISOString(),
      cluster: {
        nodesOnline,
        nodesOffline,
        totalCpuPercent: percent(cpuLoad, cpuCapacity),
        totalMemoryPercent: percent(totalMemUsed, totalMemCapacity),
        totalStoragePercent: percent(totalStorageUsed, totalStorageCapacity),
      },
      nodes: nodeSummaries,
      topGuests: guestSummaries,
      storage: storageSummaries,
      recentTasks,
    };
  }

  static async listServers(): Promise<ProxmoxModel.serverListResponse> {
    const client = ensureClient();
    const resources = await client.getClusterResources();

    return {
      servers: mapGuests(resources),
    };
  }

  static async startServer(
    body: ProxmoxModel.serverCommandBody,
  ): Promise<ProxmoxModel.serverCommandResponse> {
    const { node, vmId, type } = normalizeCommandInput(body);
    const client = ensureClient();
    const taskId = await client.startGuest(node, type, vmId);

    return {
      success: true,
      action: "start",
      taskId,
      message: `Start requested for ${type.toUpperCase()} ${vmId} on ${node}`,
    };
  }

  static async stopServer(
    body: ProxmoxModel.serverCommandBody,
  ): Promise<ProxmoxModel.serverCommandResponse> {
    const { node, vmId, type } = normalizeCommandInput(body);
    const client = ensureClient();
    const taskId = await client.stopGuest(node, type, vmId);

    return {
      success: true,
      action: "stop",
      taskId,
      message: `Stop requested for ${type.toUpperCase()} ${vmId} on ${node}`,
    };
  }
}

const allowedGuestTypes: ProxmoxGuestType[] = ["qemu", "lxc"];

function normalizeCommandInput(body: ProxmoxModel.serverCommandBody) {
  const type = body.type.toLowerCase();
  if (!allowedGuestTypes.includes(type as ProxmoxGuestType)) {
    throw new Error(`Unsupported server type "${body.type}"`);
  }

  const vmId =
    typeof body.vmId === "number"
      ? body.vmId
      : Number.parseInt(body.vmId, 10);
  if (!Number.isFinite(vmId)) {
    throw new Error(`Invalid vmId "${body.vmId}"`);
  }

  return {
    node: body.node,
    vmId,
    type: type as ProxmoxGuestType,
  };
}
