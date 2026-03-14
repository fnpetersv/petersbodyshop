const Resend = require('resend');

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

function setCors(res) {
  Object.entries(CORS_HEADERS).forEach(([k, v]) => res.setHeader(k, v));
}

module.exports = async (req, res) => {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.RESEND_API_KEY;
  const toEmail = process.env.CONTACT_EMAIL || process.env.RECIPIENT_EMAIL;
  if (!apiKey || !toEmail) {
    console.error('Missing RESEND_API_KEY or CONTACT_EMAIL/RECIPIENT_EMAIL');
    return res.status(500).json({ error: 'Server configuration error' });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    const name = (body.name || '').trim();
    const email = (body.email || '').trim();
    const message = (body.message || '').trim();

    const html = [
      '<h2>New contact message – Peters Body Shop</h2>',
      '<p><strong>Name:</strong> ' + escapeHtml(name) + '</p>',
      '<p><strong>Email:</strong> ' + escapeHtml(email) + '</p>',
      '<p><strong>Message:</strong></p>',
      '<p>' + escapeHtml(message || '(none)') + '</p>',
    ].join('');

    const resend = new Resend(apiKey);
    const { data, error } = await resend.emails.send({
      from: process.env.FROM_EMAIL || 'Peters Body Shop <onboarding@resend.dev>',
      to: [toEmail],
      replyTo: email || undefined,
      subject: 'New contact message – Peters Body Shop',
      html,
    });

    if (error) {
      console.error('Resend error:', error);
      return res.status(500).json({ error: 'Failed to send email' });
    }
    return res.status(200).json({ success: true, id: data?.id });
  } catch (e) {
    console.error('send-contact error:', e);
    return res.status(500).json({ error: 'Something went wrong' });
  }
};

function escapeHtml(s) {
  if (s == null) return '';
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
