const Resend = require('resend');

const FILE_FIELDS = ['image-1', 'image-2', 'image-3', 'image-4'];

function escapeHtml(s) {
  if (s == null) return '';
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

async function handler(request) {
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...CORS_HEADERS, Allow: 'POST', 'Content-Type': 'application/json' },
    });
  }

  const apiKey = process.env.RESEND_API_KEY;
  const toEmail = process.env.ESTIMATE_EMAIL || process.env.RECIPIENT_EMAIL;
  if (!apiKey || !toEmail) {
    console.error('Missing RESEND_API_KEY or ESTIMATE_EMAIL/RECIPIENT_EMAIL');
    return new Response(JSON.stringify({ error: 'Server configuration error' }), { status: 500, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } });
  }

  try {
    const formData = await request.formData();
    const name = (formData.get('name') || '').trim();
    const email = (formData.get('email') || '').trim();
    const vin = (formData.get('vin') || '').trim();
    const message = (formData.get('message') || '').trim();

    const attachments = [];
    for (const fieldName of FILE_FIELDS) {
      const file = formData.get(fieldName);
      if (file && file.size > 0) {
        const buffer = Buffer.from(await file.arrayBuffer());
        attachments.push({
          filename: file.name || fieldName + '.bin',
          content: buffer,
        });
      }
    }

    const html = [
      '<h2>New estimate request – Peters Body Shop</h2>',
      '<p><strong>Name:</strong> ' + escapeHtml(name) + '</p>',
      '<p><strong>Email:</strong> ' + escapeHtml(email) + '</p>',
      '<p><strong>VIN:</strong> ' + escapeHtml(vin) + '</p>',
      '<p><strong>When they can come in:</strong></p>',
      '<p>' + escapeHtml(message || '(not provided)') + '</p>',
      attachments.length ? '<p><strong>Attachments:</strong> ' + attachments.length + ' file(s)</p>' : '',
    ].join('');

    const resend = new Resend(apiKey);
    const { data, error } = await resend.emails.send({
      from: process.env.FROM_EMAIL || 'Peters Body Shop <onboarding@resend.dev>',
      to: [toEmail],
      replyTo: email || undefined,
      subject: 'New estimate request – Peters Body Shop',
      html,
      attachments: attachments.length ? attachments : undefined,
    });

    if (error) {
      console.error('Resend error:', error);
      return new Response(JSON.stringify({ error: 'Failed to send email' }), { status: 500, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } });
    }
    return new Response(JSON.stringify({ success: true, id: data?.id }), { status: 200, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } });
  } catch (e) {
    console.error('send-estimate error:', e);
    return new Response(JSON.stringify({ error: 'Something went wrong' }), { status: 500, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } });
  }
}

module.exports = async (req, res) => {
  const request = req instanceof Request ? req : await toWebRequest(req);
  const response = await handler(request);
  res.status(response.status);
  response.headers.forEach((v, k) => res.setHeader(k, v));
  res.end(await response.text());
};

function toWebRequest(nodeReq) {
  // Build a Web API Request from Node IncomingMessage for formData()
  return new Promise((resolve, reject) => {
    const chunks = [];
    nodeReq.on('data', (c) => chunks.push(c));
    nodeReq.on('end', () => {
      const body = Buffer.concat(chunks);
      const contentType = nodeReq.headers['content-type'] || '';
      const url = `https://${nodeReq.headers.host || 'localhost'}${nodeReq.url}`;
      resolve(
        new Request(url, {
          method: nodeReq.method,
          headers: nodeReq.headers,
          body: body.length ? body : undefined,
        })
      );
    });
    nodeReq.on('error', reject);
  });
}