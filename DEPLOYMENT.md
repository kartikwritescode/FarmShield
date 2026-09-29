# 🚀 FarmShield Deployment Quick-Guide (Render & Vercel)

This repository is configured for one-click deployment of the **Backend API** to **Render** and the **Web Portal (Next.js)** to **Vercel**.

---

## 🟣 1. Render Deployment (Backend API)

- **Target Service:** Web Service
- **Repository:** Connect your GitHub repository (`FarmShield`)
- **Root Directory:** `web/backend` *(or `web/backend/`)*

### Quick Settings in Render Dashboard:

| Configuration | Setting |
| :--- | :--- |
| **Name** | `farmshield-backend-api` |
| **Environment / Runtime** | `Node` |
| **Root Directory** | `web/backend` |
| **Build Command** | `npm install && npm run build` |
| **Start Command** | `npm start` |
| **Health Check Path** | `/api/health` |
| **Auto-Deploy** | `Yes` |

### Environment Variables on Render:

| Key | Value | Description |
| :--- | :--- | :--- |
| `NODE_ENV` | `production` | Production mode |
| `PORT` | `10000` | Render default port |
| `CORS_ORIGIN` | `*` | Or your Vercel URL (`https://your-app.vercel.app`) |
| `SUPABASE_URL` | `https://dykjepfsrndzamkkzcxf.supabase.co` | Supabase Project URL |
| `SUPABASE_ANON_KEY` | *(your Supabase anon key)* | Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | *(your Supabase service role key)* | Supabase admin key |
| `FRONTEND_URL` | `https://your-app.vercel.app` | Vercel production URL |

> **Blueprint Option:** You can also deploy with **Render Blueprints** using the included [render.yaml](file:///render.yaml).

---

## ▲ 2. Vercel Deployment (Web Portal - Next.js)

- **Target Platform:** [Vercel](https://vercel.com)
- **Repository:** Connect your GitHub repository (`FarmShield`)
- **Root Directory:** `web` *(or `web/`)*

### Quick Settings in Vercel Dashboard:

1. Click **Import** on the `FarmShield` repository.
2. In **Configure Project**, click **Edit** beside **Root Directory** and select `web`.
3. Framework Preset will auto-detect as **Next.js**.
4. Click **Deploy**.

> **Note:** Even if you keep the default root directory (`./`), the root `vercel.json` will automatically direct Vercel to build the Next.js app in `web/`.

### Environment Variables on Vercel:

| Key | Example Value | Description |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_API_URL` | `https://farmshield-backend-api.onrender.com/api/` | URL of your live Render backend API |
| `BACKEND_API_URL` | `https://farmshield-backend-api.onrender.com` | Base URL of your Render backend |
| `NEXT_PUBLIC_SUPABASE_URL` | `https://dykjepfsrndzamkkzcxf.supabase.co` | Supabase URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | *(your Supabase anon key)* | Supabase public anon key |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | `dwfowhzwn` | Cloudinary cloud name (optional) |
| `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET`| `dashsocial` | Cloudinary upload preset (optional) |

---

## 📁 Repository Configuration Files Summary

- Root Render Blueprint: [`render.yaml`](file:///render.yaml) (points `rootDir: web/backend`)
- Backend Render Blueprint: [`web/backend/render.yaml`](file:///web/backend/render.yaml)
- Backend Environment Template: [`web/backend/.env.example`](file:///web/backend/.env.example)
- Root Vercel Config: [`vercel.json`](file:///vercel.json) (redirects build to `web/`)
- Web Vercel Config: [`web/vercel.json`](file:///web/vercel.json) (Next.js preset for `web/`)
- Web Environment Template: [`web/.env.example`](file:///web/.env.example)
- Next.js Proxy & Build Config: [`web/next.config.ts`](file:///web/next.config.ts) (dynamic API proxying & build resilience)
