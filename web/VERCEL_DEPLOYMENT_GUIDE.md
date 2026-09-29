# 🚀 Vercel Frontend Deployment Guide (FarmShield)

This guide provides instructions to ensure seamless deployment of FarmShield Web to [Vercel](https://vercel.com).

---

## 🎯 Quick Configuration Summary

| Setting | Value |
| :--- | :--- |
| **Framework Preset** | `Next.js` |
| **Root Directory** | `web` *(or `web/`)* |
| **Build Command** | `npm run build` *(or `next build`)* |
| **Output Directory** | `.next` *(Automatically handled by Next.js preset)* |
| **Install Command** | `npm install` |

---

## 🛠️ Vercel Project Settings (Recommended - 2 Steps)

1. **Import Project into Vercel:**
   - Go to [https://vercel.com/new](https://vercel.com/new).
   - Select your `FarmShield` repository.

2. **Configure Project Settings:**
   - Under **Root Directory**, click **Edit** and set it to **`web`**.
   - Vercel automatically selects the **Next.js** framework preset.
   - Expand **Environment Variables** and add the variables listed below.
   - Click **Deploy**.

> **Note:** If you leave Root Directory as `./` (repo root), the root `vercel.json` will automatically direct the build to `web/` without breaking!

---

## ⚙️ Environment Variables on Vercel

In **Project Settings** ➔ **Environment Variables**, add:

| Variable | Description | Example / Recommended |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_API_URL` | Render Backend API URL | `https://farmshield-backend-api.onrender.com/api/` |
| `BACKEND_API_URL` | Render Backend Domain | `https://farmshield-backend-api.onrender.com` |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase Project URL | `https://dykjepfsrndzamkkzcxf.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase Anon Key | `your_supabase_anon_key` |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | Cloudinary Cloud Name (optional) | `dwfowhzwn` |
| `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET`| Cloudinary Preset (optional) | `dashsocial` |

