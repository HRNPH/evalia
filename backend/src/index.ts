import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";
import { cookie } from "@elysiajs/cookie";
import openapi from "@elysiajs/openapi";

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
  .listen(3000);

console.log(
  `🦊 Evalia Chat API is running at http://${app.server?.hostname}:${app.server?.port}`,
);
