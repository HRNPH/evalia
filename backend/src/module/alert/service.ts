// Service handle business logic, decoupled from Elysia controller
import { status } from 'elysia'
import type { AlertModel } from './model'

// If the class doesn't need to store a property,
// you may use `abstract class` to avoid class allocation
export abstract class AlertService {
	static async logAlert({ message }: AlertModel.alertBody) {
	  console.log("🚨 Alert received:", { message});
		return {
		  success: true,
      message: "Alert logged"
		}
	}
}
