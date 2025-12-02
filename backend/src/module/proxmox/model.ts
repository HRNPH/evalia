import { t } from 'elysia'

export namespace ProxmoxModel {
	const nodeSummary = t.Object({
		name: t.String(),
		status: t.String(),
		health: t.String(),
		cpuCores: t.Number(),
		cpuLoadPercent: t.Number(),
		memoryUsed: t.Number(),
		memoryTotal: t.Number(),
		memoryPercent: t.Number(),
		diskUsed: t.Number(),
		diskTotal: t.Number(),
		diskPercent: t.Number(),
		uptimeSeconds: t.Number(),
	})

	const guestSummary = t.Object({
		id: t.String(),
		name: t.String(),
		type: t.String(),
		node: t.String(),
		status: t.String(),
		cpuPercent: t.Number(),
		memoryPercent: t.Number(),
		uptimeSeconds: t.Number(),
	})

	const storageSummary = t.Object({
		id: t.String(),
		node: t.String(),
		storage: t.String(),
		type: t.String(),
		used: t.Number(),
		total: t.Number(),
		usagePercent: t.Number(),
	})

	const recentTask = t.Object({
		id: t.String(),
		node: t.String(),
		type: t.String(),
		status: t.String(),
		user: t.String(),
		startedAt: t.Nullable(t.String()),
		endedAt: t.Nullable(t.String()),
		durationSeconds: t.Nullable(t.Number()),
	})

	export const homelabOverviewResponse = t.Object({
		fetchedAt: t.String(),
		cluster: t.Object({
			nodesOnline: t.Number(),
			nodesOffline: t.Number(),
			totalCpuPercent: t.Number(),
			totalMemoryPercent: t.Number(),
			totalStoragePercent: t.Number(),
		}),
		nodes: t.Array(nodeSummary),
		topGuests: t.Array(guestSummary),
		storage: t.Array(storageSummary),
		recentTasks: t.Array(recentTask),
	})
	export type homelabOverviewResponse = typeof homelabOverviewResponse.static

	const serverType = t.Union([t.Literal('qemu'), t.Literal('lxc')])

	export const serverListResponse = t.Object({
		servers: t.Array(guestSummary),
	})
	export type serverListResponse = typeof serverListResponse.static

	export const serverCommandBody = t.Object({
		node: t.String(),
		vmId: t.Union([t.String(), t.Number()]),
		type: serverType,
	})
	export type serverCommandBody = typeof serverCommandBody.static

	export const serverCommandResponse = t.Object({
		success: t.Boolean(),
		action: t.Union([t.Literal('start'), t.Literal('stop')]),
		taskId: t.String(),
		message: t.String(),
	})
	export type serverCommandResponse = typeof serverCommandResponse.static
}
