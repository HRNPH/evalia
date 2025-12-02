# EvaliaAI

Let AI control the whole home.

## Quickstart (Zero Experience Required)

> Requires [Bun](https://bun.sh/) (which bundles Node.js). Install Bun first if you don’t have it.

1. **Clone the repo**
   ```bash
   git clone https://github.com/your-org/evalia.git
   cd evalia
   ```

2. **Install dependencies**
   ```bash
   bun install
   cd backend && bun install && cd ..
   cd frontend && bun install && cd ..
   ```

3. **Create `.env` (repo root)**
   ```ini
   NEXT_PUBLIC_OPENAI_API_KEY=sk-...
   PROXMOX_API_URL=https://192.168.1.100:8006/
   PROXMOX_API_TOKEN_ID=user@realm!token
   PROXMOX_API_TOKEN_SECRET=token-secret
   PROXMOX_ALLOW_INSECURE=true  # only if using self-signed certs
   ```

4. **Run everything**
   ```bash
   bun dev
   ```
   - Backend (Elysia) lives at http://localhost:3001
   - Frontend (Next.js) lives at http://localhost:3000

5. **Try it**
   - Open http://localhost:3000
   - Click “Connect to AI” to talk to Eva
   - Ask Eva to list/start/stop Proxmox VMs once your env vars are set

## Troubleshooting

- **401 / “No ticket”** → token ID/secret wrong or missing API perms.
- **501 “Method … not implemented”** → base URL still `http://`; use HTTPS.
- **Frontend can’t reach backend** → ensure `bun dev` is running; backend logs show `🦊 Evalia Chat API…` when ready.

That’s it—clone, install, set env, run `bun dev`, and Eva boots up.***
