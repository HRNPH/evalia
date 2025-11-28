// Model define the data structure and validation for the request and response
import { t } from 'elysia'

export namespace AlertModel {
  // Body
	export const alertBody = t.Object({
		message: t.String(),
	})
	export type alertBody = typeof alertBody.static

	// Response
	export const alertResponseSuccess = t.Object({
	  success: t.Boolean(),
    message: t.String(),
	})
	export type alertResponseSuccess = typeof alertResponseSuccess.static
}
