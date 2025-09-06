// Portable HTTP(S) proxy for file download (Node.js)
// Core logic works for Netlify, Vercel, AWS Lambda, Alibaba Function Compute, Express, etc.
// Only the handler signature/exports need to be adapted per platform.

const fetch = require('node-fetch')

// --- Core proxy logic ---
async function proxyDownload(url, res) {
  if (!url) {
    // For Express-style res, or adapt for other platforms
    res.statusCode = 400
    res.end('Missing url parameter')
    return
  }
  try {
    const response = await fetch(url)
    if (!response.ok) {
      res.statusCode = response.status
      res.end('Failed to fetch file')
      return
    }
    const contentType = response.headers.get('content-type') || 'application/octet-stream'
    const contentDisposition = response.headers.get('content-disposition') || 'attachment; filename="MIS_Report.xlsx"'
    const buffer = await response.buffer()
    res.setHeader('Content-Type', contentType)
    res.setHeader('Content-Disposition', contentDisposition)
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.end(buffer)
  } catch (err) {
    res.statusCode = 500
    res.end('Proxy error: ' + err.message)
  }
}

// --- Netlify Function ---
// exports.handler = async function(event, context) {
//   const url = event.queryStringParameters && event.queryStringParameters.url
//   ... (see previous Netlify example) ...
// }

// --- Express/Node.js server ---
// app.get('/api/download-mis-report', (req, res) => {
//   proxyDownload(req.query.url, res)
// })

// --- Vercel/AWS Lambda/Alibaba Function Compute ---
// See platform docs for adapting the handler signature.

module.exports = { proxyDownload }
