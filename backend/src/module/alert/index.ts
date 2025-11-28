// Controller handle HTTP related eg. routing, request validation
import { Elysia } from 'elysia'

import { AlertService } from './service'
import { AlertModel } from './model'

export const alertController = new Elysia({ prefix: '/alert' })
	.post(
		'/',
		async ({ body }) => {
			const response = await AlertService.logAlert(body)
			return response
		}, {
			body: AlertModel.alertBody,
			response: {
				200: AlertModel.alertResponseSuccess,
			}
		}
	)
