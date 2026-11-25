// No credential-file access. Official, pinned Wrangler handles authentication.
const {spawnSync}=require('node:child_process');
const readline=require('node:readline');
const fs=require('node:fs');const path=require('node:path');
const cli='C:/Users/yukiz/devlop/_support-shimarisu-cli/node_modules/wrangler/bin/wrangler.js';
const env={...process.env,WRANGLER_WRITE_LOGS:'false',WRANGLER_LOG:'log',WRANGLER_LOG_SANITIZE:'true',CLOUDFLARE_ACCOUNT_ID:'a11fc05670b982d320a086daf553784d'};
function run(args,input){const r=spawnSync(process.execPath,[cli,...args],{env,input,encoding:'utf8',windowsHide:true,timeout:120000});if(r.status!==0)throw new Error('Official CLI failed; output suppressed to protect secrets');return r.stdout;}
if(!process.stdin.isTTY)throw new Error('Protected interactive stdin required');
process.stdin.setRawMode(true);
console.log('Protected stdin ready; echo disabled.');
const rl=readline.createInterface({input:process.stdin,terminal:false});
rl.once('line',email=>{
 rl.close();
 process.stdin.pause();
 try {
  if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))throw new Error('Invalid contact');
  const publicConfig={};
  for(const [environment,domain,name] of [['production','shimarisu-fudosan.com','Shimarisu Kaitori Production'],['preview','work-notes.shimarisu-site.pages.dev','Shimarisu Kaitori Preview']]) {
   const widgets=JSON.parse(run(['turnstile','widget','list','--json']));
   if(widgets.some(w=>w.name===name))throw new Error('Widget already exists; stop for explicit inspection');
   const widget=JSON.parse(run(['turnstile','widget','create',name,'--domain',domain,'--mode','managed','--clearance-level','no_clearance','--json']));
   if(!widget.sitekey||!widget.secret||widget.domains?.length!==1||widget.domains[0]!==domain||widget.mode!=='managed')throw new Error('Unexpected widget contract');
   const input=JSON.stringify({KAITORI_EMAIL:email,TURNSTILE_SECRET:widget.secret});
   run(['pages','secret','bulk','--project-name','shimarisu-site','--env',environment],input);
   publicConfig[environment]={TURNSTILE_SITE_KEY:widget.sitekey,KAITORI_ORIGIN:'https://'+domain};
   fs.writeFileSync(path.join(__dirname,'turnstile-public-config.json'),JSON.stringify(publicConfig,null,2));
   console.log(JSON.stringify({environment,domain,sitekey:widget.sitekey,configuredSecrets:['KAITORI_EMAIL','TURNSTILE_SECRET']}));
  }
 }catch(e){console.log(e.message);process.exitCode=1;}
});
