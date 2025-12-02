import { Elysia } from 'elysia'
import { ProxmoxService } from './service'
import { ProxmoxModel } from './model'

const withLogging = async <T>(label: string, handler: () => Promise<T>) => {
	console.log(`[Proxmox] ${label} - start`)
	try {
		const result = await handler()
		console.log(`[Proxmox] ${label} - success`)
		return result
	}
	catch (error) {
		console.error(`[Proxmox] ${label} - error`, error)
		throw error
	}
}

export const proxmoxController = new Elysia({ prefix: '/proxmox' })
	.get(
		'/homelab',
		async () => withLogging('GET /homelab overview', () => ProxmoxService.getHomelabOverview()),
		{
			response: {
				200: ProxmoxModel.homelabOverviewResponse,
			},
			detail: {
				summary: 'Returns a live snapshot of nodes, guests, storage and tasks',
				tags: ['proxmox'],
			},
		},
	)
	.get(
		'/servers',
		async () => withLogging('GET /servers list', () => ProxmoxService.listServers()),
		{
			response: {
				200: ProxmoxModel.serverListResponse,
			},
			detail: {
				summary: 'List all QEMU/LXC guests in the cluster',
				tags: ['proxmox'],
			},
		},
	)
	.post(
		'/servers/start',
		async ({ body }) => withLogging(
			`POST /servers/start node=${body.node} vmId=${body.vmId} type=${body.type}`,
			() => ProxmoxService.startServer(body),
		),
		{
			body: ProxmoxModel.serverCommandBody,
			response: {
				200: ProxmoxModel.serverCommandResponse,
			},
			detail: {
				summary: 'Start a VM or container instance',
				tags: ['proxmox'],
			},
		},
	)
	.post(
		'/servers/stop',
		async ({ body }) => withLogging(
			`POST /servers/stop node=${body.node} vmId=${body.vmId} type=${body.type}`,
			() => ProxmoxService.stopServer(body),
		),
		{
			body: ProxmoxModel.serverCommandBody,
			response: {
				200: ProxmoxModel.serverCommandResponse,
			},
			detail: {
				summary: 'Stop a VM or container instance',
				tags: ['proxmox'],
			},
		},
	)
