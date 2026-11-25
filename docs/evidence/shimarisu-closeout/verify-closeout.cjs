const fs=require('node:fs');const {spawnSync}=require('node:child_process');
const cli='C:/Users/yukiz/devlop/_support-shimarisu-cli/node_modules/wrangler/bin/wrangler.js';
(async()=>{
const report={sites:[],searchConsole:'NOT VERIFIED: no connected Search Console tool, configured service credential environment, or gcloud CLI',cleanupWorkerRedeployed:false,publisherMutated:false};
for(const [project,url,link,commit] of [
 ['dake-send-site','https://send.dakeapp.com/','https://shimarisu-fudosan.com/work/large-files-send/','704ea9da6a10ce21b4c69b12c72e5ec1006a7d23'],
 ['dake-typing-site','https://typing.dakeapp.com/real-estate/','https://shimarisu-fudosan.com/work/real-estate-typing/','9d482f89e13fd4f551857b21861261bb32776407']]){
 const r=await fetch(url);const h=await r.text();const found=h.includes(`href="${link}"`);const target=await fetch(link);
 const result=spawnSync(process.execPath,[cli,'pages','deployment','list','--project-name',project,'--json'],{env:{...process.env,WRANGLER_WRITE_LOGS:'false'},encoding:'utf8',windowsHide:true});
 if(result.status!==0)throw Error('Deployment list failed');
 const deployments=JSON.parse(result.stdout);const d=deployments.find(x=>x.Environment==='Production'&&x.Branch==='main'&&x.Source===commit.slice(0,7));
 if(!d)throw Error('Expected Production commit missing');
 const item={project,url,httpStatus:r.status,backlink:link,backlinkFound:found,targetStatus:target.status,deploymentId:d.Id,deploymentURL:d.Deployment,listingStatus:d.Status,commit};
 report.sites.push(item);if(r.status!==200||!found||target.status!==200)throw Error('Production verification failed');
}
const sitemap=await fetch('https://shimarisu-fudosan.com/sitemap.xml');const xml=await sitemap.text();report.publicSitemap={status:sitemap.status,workURLs:(xml.match(/<loc>https:\/\/shimarisu-fudosan.com\/work\//g)||[]).length};
fs.writeFileSync(__dirname+'/closeout-evidence.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));
})().catch(e=>{console.error(e.message);process.exit(1);});
