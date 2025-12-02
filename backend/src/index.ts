import { config as loadEnv } from "dotenv";
import path from "path";

loadEnv();
loadEnv({
  path: path.resolve(process.cwd(), "..", ".env"),
  override: false,
});
import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";
import { cookie } from "@elysiajs/cookie";
import openapi from "@elysiajs/openapi";
import { alertController } from "./module/alert";
import { proxmoxController } from "./module/proxmox";

const apiV1 = new Elysia({ prefix: "/api/v1" })
  .use(alertController)
  .use(proxmoxController);

const app = new Elysia()
  .use(
    cors({
      origin: [
        "http://localhost:3000",
        "http://localhost:5173",
        "http://localhost:4173",
      ],
      credentials: true,
    }),
  )
  .use(
    openapi({
      path: "/docs",
    }),
  )
  .use(cookie())
  .get("/", () => "Evalia API Server")
  .get("/health", () => ({ status: "ok", timestamp: new Date().toISOString() }))
  .use(apiV1)
  .listen(3001);

console.log(
  `🦊 Evalia Chat API is running at http://${app.server?.hostname}:${app.server?.port}`,
);

export type App = typeof app;
