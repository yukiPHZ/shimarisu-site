const PRODUCTION_ORIGIN = 'https://shimarisu-fudosan.com';
const ACTION = 'kaitori_email';
function json(data, status = 200, extra = {}) {
  return new Response(JSON.stringify(data), {status, headers: {
    'Content-Type':'application/json; charset=utf-8', 'Cache-Control':'no-store',
    'X-Robots-Tag':'noindex', 'X-Content-Type-Options':'nosniff', ...extra
  }});
}
async function readSmallBody(request) {
  if (!request.body) return null;
  const reader = request.body.getReader();
  const chunks = []; let size = 0;
  try {
    for (;;) {
      const {done,value} = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > 8192) { await reader.cancel(); return null; }
      chunks.push(value);
    }
    const bytes = new Uint8Array(size); let offset = 0;
    for (const chunk of chunks) { bytes.set(chunk,offset); offset += chunk.length; }
    return JSON.parse(new TextDecoder().decode(bytes));
  } catch { return null; }
}
export async function onRequest({request,env}) {
  if (request.method !== 'POST') return json({error:'method_not_allowed'},405,{Allow:'POST'});
  // Preview uses a separate, exact configured origin and separate environment secrets.
  const expectedOrigin = env.KAITORI_ORIGIN || PRODUCTION_ORIGIN;
  let expected;
  try { expected = new URL(expectedOrigin); } catch { return json({error:'unavailable'},503); }
  if (expected.origin !== expectedOrigin || expected.protocol !== 'https:' ||
      (expectedOrigin !== PRODUCTION_ORIGIN && !expected.hostname.endsWith('.shimarisu-site.pages.dev'))) {
    return json({error:'unavailable'},503);
  }
  if (request.headers.get('Origin') !== expectedOrigin || new URL(request.url).origin !== expectedOrigin ||
      request.headers.get('Sec-Fetch-Site') === 'cross-site') return json({error:'forbidden'},403);
  if (!(request.headers.get('Content-Type') || '').toLowerCase().startsWith('application/json')) return json({error:'forbidden'},403);
  const body = await readSmallBody(request);
  if (!body || typeof body.token !== 'string' || !body.token.trim() || body.token.length > 2048) return json({error:'forbidden'},403);
  if (!env.TURNSTILE_SECRET || !env.KAITORI_EMAIL) return json({error:'unavailable'},503);
  let verification;
  try {
    const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method:'POST', headers:{'Content-Type':'application/json'},
      body:JSON.stringify({secret:env.TURNSTILE_SECRET,response:body.token}),
      signal:AbortSignal.timeout(10000)
    });
    if (!response.ok) return json({error:'unavailable'},503);
    verification = await response.json();
  } catch { return json({error:'unavailable'},503); }
  if (!verification || verification.success !== true || verification.hostname !== expected.hostname || verification.action !== ACTION) {
    return json({error:'forbidden'},403);
  }
  if (typeof env.KAITORI_EMAIL !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(env.KAITORI_EMAIL)) return json({error:'unavailable'},503);
  return json({email:env.KAITORI_EMAIL});
}
