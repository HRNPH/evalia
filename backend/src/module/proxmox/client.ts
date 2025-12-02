import https from "node:https";

type ProxmoxConfig = {
  baseUrl: string;
  tokenId: string;
  tokenSecret: string;
  allowInsecureTls?: boolean;
};

type ProxmoxResponse<T> = {
	data: T
}

export type ProxmoxNode = {
	node: string
	status: string
	level?: string
	mem?: number
	maxmem?: number
	disk?: number
	maxdisk?: number
	cpu?: number
	maxcpu?: number
	uptime?: number
}

export type ProxmoxGuestType = "qemu" | "lxc";

export type ProxmoxResource = {
	id: string
	type: string
	node?: string
	vmid?: number
	name?: string
	status?: string
	mem?: number
	maxmem?: number
	disk?: number
	maxdisk?: number
	cpu?: number
	maxcpu?: number
	uptime?: number
	storage?: string
	plugintype?: string
}

export type ProxmoxTask = {
	upid?: string
	id?: string
	type: string
	node: string
	user?: string
	status?: string
	starttime?: number
	endtime?: number
}

export class ProxmoxAPI {
  private readonly baseUrl: URL;
  private readonly authHeader: string;
  private readonly agent: https.Agent;

  constructor(private readonly config: ProxmoxConfig) {
    if (!config.baseUrl || !config.tokenId || !config.tokenSecret) {
      throw new Error("Missing Proxmox configuration");
    }

    const trimmedBase = config.baseUrl.trim();
    const normalizedBase = trimmedBase.startsWith("http://")
      ? trimmedBase.replace(/^http:\/\//i, "https://")
      : trimmedBase;

    if (trimmedBase.startsWith("http://")) {
      console.warn(
        "[Proxmox] Base URL used http://. Automatically upgrading to https:// to avoid redirecting away the Authorization header.",
      );
    }

    const parsedBase = new URL(
      normalizedBase.endsWith("/") ? normalizedBase : `${normalizedBase}/`,
    );
    this.baseUrl = new URL(`${parsedBase.protocol}//${parsedBase.host}/`);
    this.authHeader = `PVEAPIToken=${config.tokenId}=${config.tokenSecret}`;
    this.agent = new https.Agent({
      rejectUnauthorized: !config.allowInsecureTls,
    });
  }

  private encodeForm(
    data?: Record<string, string | number | boolean | undefined>,
  ): string {
    const params = new URLSearchParams();
    if (data) {
      for (const [key, value] of Object.entries(data)) {
        if (value === undefined) continue;
        params.append(key, String(value));
      }
    }
    return params.toString();
  }

  private async request<T>(
    path: string,
    method: "GET" | "POST" = "GET",
    formBody?: Record<string, string | number | boolean | undefined>,
  ): Promise<T> {
    const url = new URL(
      path.startsWith("/") ? path.slice(1) : path,
      this.baseUrl,
    );

    const body = formBody ? this.encodeForm(formBody) : undefined;

    const headers: Record<string, string> = {
      Accept: "application/json",
      Authorization: this.authHeader,
      Host: url.port ? `${url.hostname}:${url.port}` : url.hostname,
    };

    if (body) {
      headers["Content-Type"] = "application/x-www-form-urlencoded";
      headers["Content-Length"] = Buffer.byteLength(body).toString();
    }

    const options: https.RequestOptions = {
      method,
      protocol: url.protocol,
      hostname: url.hostname,
      port: url.port
        ? Number(url.port)
        : url.protocol === "https:"
          ? 443
          : 80,
      path: `${url.pathname}${url.search}`,
      headers,
      agent: this.agent,
    };

    if (process.env.PROXMOX_DEBUG === "true") {
      console.debug("[Proxmox] Request", {
        method,
        host: options.hostname,
        port: options.port,
        path: options.path,
        hasBody: Boolean(body),
      });
    }

    return new Promise<T>((resolve, reject) => {
      const req = https.request(options, (res) => {
        const chunks: Buffer[] = [];
        res.on("data", (chunk) => chunks.push(Buffer.from(chunk)));
        res.on("end", () => {
          const raw = Buffer.concat(chunks).toString("utf8") || "{}";
          if (!res.statusCode || res.statusCode < 200 || res.statusCode >= 300) {
            reject(
              new Error(
                `Proxmox API error ${res.statusCode ?? "unknown"} ${
                  res.statusMessage ?? ""
                }: ${raw}`,
              ),
            );
            return;
          }

          try {
            const payload = JSON.parse(raw) as ProxmoxResponse<T>;
            resolve(payload.data);
          } catch (error) {
            reject(
              new Error(
                `Failed to parse Proxmox response: ${
                  error instanceof Error ? error.message : String(error)
                }`,
              ),
            );
          }
        });
      });

      req.on("error", reject);

      if (body) {
        req.write(body);
      }

      req.end();
    });
  }

  getNodes(): Promise<ProxmoxNode[]> {
    return this.request("/api2/json/nodes");
  }

  getClusterResources(): Promise<ProxmoxResource[]> {
    return this.request("/api2/json/cluster/resources");
  }

  getRecentTasks(): Promise<ProxmoxTask[]> {
    return this.request("/api2/json/cluster/tasks");
  }

  startGuest(
    node: string,
    type: ProxmoxGuestType,
    vmId: number,
  ): Promise<string> {
    const path = `/api2/json/nodes/${node}/${type}/${vmId}/status/start`;
    return this.request(path, "POST");
  }

  stopGuest(
    node: string,
    type: ProxmoxGuestType,
    vmId: number,
  ): Promise<string> {
    const path = `/api2/json/nodes/${node}/${type}/${vmId}/status/stop`;
    return this.request(path, "POST");
  }
}
