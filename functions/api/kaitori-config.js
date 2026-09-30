export function onRequest({request,env}) {
  const headers = {'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Robots-Tag':'noindex','X-Content-Type-Options':'nosniff'};
  if (request.method !== 'GET') return new Response(JSON.stringify({error:'method_not_allowed'}),{status:405,headers:{...headers,Allow:'GET'}});
  // The sitekey is public. No private environment values are ever returned here.
  if (!env.TURNSTILE_SITE_KEY) return new Response(JSON.stringify({error:'unavailable'}),{status:503,headers});
  return new Response(JSON.stringify({sitekey:env.TURNSTILE_SITE_KEY}),{headers});
}
