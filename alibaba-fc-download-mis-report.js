// Alibaba Function Compute handler for file download proxy
// Place this file in your Alibaba Function Compute project
// Requires 'node-fetch' (npm install node-fetch@2)

const fetch = require('node-fetch')

exports.handler = async (event, context, callback) => {
  // Parse query string for 'url' param
  let url = null
  if (event.queries && event.queries.url) {
    url = Array.isArray(event.queries.url) ? event.queries.url[0] : event.queries.url
  } else if (event.queryStringParameters && event.queryStringParameters.url) {
    url = event.queryStringParameters.url
  }
  if (!url) {
    callback(null, {
      statusCode: 400,
      headers: { 'Content-Type': 'text/plain' },
      body: 'Missing url parameter',
    })
    return
  }
  try {
    const response = await fetch(url)
    if (!response.ok) {
      callback(null, {
        statusCode: response.status,
        headers: { 'Content-Type': 'text/plain' },
        body: 'Failed to fetch file',
      })
      return
    }
    const contentType = response.headers.get('content-type') || 'application/octet-stream'
    const contentDisposition = response.headers.get('content-disposition') || 'attachment; filename="MIS_Report.xlsx"'
    const buffer = await response.buffer()
    callback(null, {
      statusCode: 200,
      isBase64Encoded: true,
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': contentDisposition,
        'Access-Control-Allow-Origin': '*',
      },
      body: buffer.toString('base64'),
    })
  } catch (err) {
    callback(null, {
      statusCode: 500,
      headers: { 'Content-Type': 'text/plain' },
      body: 'Proxy error: ' + err.message,
    })
  }
}
