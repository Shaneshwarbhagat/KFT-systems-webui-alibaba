# Switching Proxy Platforms: What to Change

## If you keep all proxy files (Netlify, Alibaba, Vite) in your repo:
- There is NO issue as long as only the correct proxy endpoint is used in your frontend code for the current deployment.
- You can keep all files for reference and future use.
- Only one proxy will be active in production, depending on your deployment.

## What to change in `mis-report-section.tsx` when switching platforms:

1. **Netlify:**
   - Use:
     ```js
     fetch(`/.netlify/functions/download-mis-report?url=${encodeURIComponent(data.url)}`)
     ```
   - No other code changes needed.

2. **Alibaba Function Compute:**
   - Deploy `alibaba-fc-download-mis-report.js` as a function.
   - Change the fetch URL in `mis-report-section.tsx` to:
     ```js
     fetch(`https://<your-fc-domain>/<path>?url=${encodeURIComponent(data.url)}`)
     ```
     Replace `<your-fc-domain>/<path>` with your actual Alibaba Function Compute endpoint.

3. **Local Development (Vite):**
   - Use:
     ```js
     fetch(`/api/download-mis-report?url=${encodeURIComponent(data.url)}`)
     ```
   - Make sure `vite-mis-report-proxy.ts` is active in your Vite config.

## How to switch:
- Only change the fetch URL in your frontend code (`mis-report-section.tsx`).
- No need to delete or comment out proxy files for other platforms; just ensure the correct endpoint is used for the current environment.

## Deployment Steps (CI/CD):
- For Netlify: Push to GitHub, Netlify CI/CD will deploy and pick up the Netlify Function automatically.
- For Alibaba: Pull code on your Alibaba server, deploy the function, and update the fetch URL in your frontend. Rebuild/redeploy your frontend if needed.

## Summary Table (with code change):
| Environment      | Proxy File Needed                        | Frontend Fetch URL Example                                      | Code to Change in mis-report-section.tsx |
|------------------|------------------------------------------|-----------------------------------------------------------------|------------------------------------------|
| Netlify          | netlify/functions/download-mis-report.js | /.netlify/functions/download-mis-report?url=...                  | fetch URL only                          |
| Alibaba FC       | alibaba-fc-download-mis-report.js        | https://<your-fc-domain>/<path>?url=...                          | fetch URL only                          |
| Local Dev (Vite) | vite-mis-report-proxy.ts                 | /api/download-mis-report?url=...                                 | fetch URL only                          |

---
**You do NOT need to delete any proxy files when switching platforms. Just update the fetch URL in your frontend code to match the current backend.**
# Deployment Notes: MIS Report Proxy for Netlify and Alibaba Cloud

## 1. Netlify Deployment (Current)
- **Required file:**
  - `netlify/functions/download-mis-report.js` (Netlify Function for proxying downloads)
- **Frontend usage:**
  - Your frontend should fetch from `/.netlify/functions/download-mis-report?url=...`
- **Can be deleted/commented:**
  - `alibaba-fc-download-mis-report.js` (not needed for Netlify)
  - `vite-mis-report-proxy.ts` (only for local dev, not needed in production)
  - `proxy-download-template.js` (for reference only)

## 2. Alibaba Cloud Function Compute Deployment (Future)
- **Required file:**
  - `alibaba-fc-download-mis-report.js` (Handler for Alibaba Function Compute)
- **Frontend usage:**
  - Update your frontend to fetch from your Alibaba Function Compute endpoint, e.g.:
    `https://<your-fc-domain>/<path>?url=...`
- **Can be deleted/commented:**
  - `netlify/functions/download-mis-report.js` (not needed for Alibaba)
  - `vite-mis-report-proxy.ts` (only for local dev, not needed in production)
  - `proxy-download-template.js` (for reference only)

## 3. Local Development
- **Required file:**
  - `vite-mis-report-proxy.ts` (Vite middleware for local proxying)
- **Frontend usage:**
  - Your frontend fetches from `/api/download-mis-report?url=...`
- **Can be deleted/commented:**
  - Not needed in production

## 4. General Notes
- `proxy-download-template.js` is a portable template for reference and can be used to create new proxy handlers for other platforms (Vercel, AWS Lambda, etc.).
- Always ensure your frontend fetches from the correct proxy endpoint for the current environment.
- Only one proxy implementation is needed in production at a time (Netlify or Alibaba, not both).

---
**Summary Table:**
| Environment      | Proxy File Needed                        | Frontend Endpoint Example                        |
|------------------|------------------------------------------|-------------------------------------------------|
| Netlify          | netlify/functions/download-mis-report.js | /.netlify/functions/download-mis-report?url=...  |
| Alibaba FC       | alibaba-fc-download-mis-report.js        | https://<your-fc-domain>/<path>?url=...          |
| Local Dev (Vite) | vite-mis-report-proxy.ts                 | /api/download-mis-report?url=...                 |

