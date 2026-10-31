// Atomically publish a gallery entry and optional JPEG using the existing admin credentials.
const crypto = require('node:crypto');
const OWNER = 'Karieo', REPO = 'miniforgedad-website', BRANCH = 'main';
const MAX_BYTES = 2 * 1024 * 1024;
const reply = (statusCode, body) => ({ statusCode, headers: {'Content-Type':'application/json','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}, body:JSON.stringify(body) });
function validSource(value) {
  if (!value) return '';
  try { const u = new URL(value); if(u.protocol !== 'https:' || u.username || u.password || !['instagram.com','www.instagram.com','youtube.com','www.youtube.com','youtu.be'].includes(u.hostname)) return null; return u.href; } catch { return null; }
}
function validate(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) return 'Invalid request.';
  if (!['add','update'].includes(body.action)) return 'Choose add or update.';
  if (body.action === 'update' && (typeof body.id !== 'string' || !/^[a-z0-9-]{1,80}$/.test(body.id))) return 'Choose an existing project.';
  for (const [key,max,required] of [['title',100,true],['description',800,false],['alt',200,true],['faction',80,false],['sourceUrl',500,false]]) {
    if (typeof body[key] !== 'string' || body[key].length > max || (required && !body[key].trim())) return `Check ${key}.`;
  }
  if(!['dad','son','together','brand'].includes(body.painter)) return 'Choose a painter credit.';
  if(!['finished','in-progress','workbench'].includes(body.status)) return 'Choose a project status.';
  if(typeof body.featured !== 'boolean') return 'Choose whether to feature this photo.';
  if(validSource(body.sourceUrl) === null) return 'Use an Instagram or YouTube HTTPS source link, or leave it blank.';
  if(body.year !== '' && (!Number.isInteger(body.year) || body.year < 2000 || body.year > new Date().getUTCFullYear()+1)) return 'Check the year, or leave it blank.';
  if(body.image != null && typeof body.image !== 'string') return 'Invalid photo.';
  if(body.action === 'add' && !body.image) return 'Attach a photo.';
  if(body.image) {
    if(!/^data:image\/jpeg;base64,[A-Za-z0-9+/]+={0,2}$/.test(body.image)) return 'Use a JPEG photo prepared by the upload form.';
    const b64=body.image.split(',')[1];
    if(b64.length%4) return 'Incomplete photo.';
    const b=Buffer.from(b64,'base64');
    if(b.length > MAX_BYTES) return 'Photo is too large. Choose a smaller image.';
    if(b.length < 4 || b[0]!==255 || b[1]!==216 || b[2]!==255 || b[b.length-2]!==255 || b[b.length-1]!==217) return 'The photo is not a complete JPEG.';
  }
  return null;
}
exports.handler = async event => {
  if(event.httpMethod !== 'POST') return reply(405,{ok:false,error:'Use POST.'});
  if(!process.env.UPLOAD_PASSWORD || !process.env.GITHUB_TOKEN) return reply(503,{ok:false,error:'Gallery publishing needs the existing admin password and GitHub connection configured on the host.'});
  if(event.isBase64Encoded || typeof event.body !== 'string' || Buffer.byteLength(event.body)>3*1024*1024) return reply(413,{ok:false,error:'Request is too large or unsupported.'});
  let body;try{body=JSON.parse(event.body)}catch{return reply(400,{ok:false,error:'Could not read the request.'})}
  const given=typeof body?.password==='string'?body.password:'';
  const hash=s=>crypto.createHash('sha256').update(s).digest();
  if(!given || given.length>512 || !crypto.timingSafeEqual(hash(given),hash(process.env.UPLOAD_PASSWORD))) return reply(401,{ok:false,error:'Wrong password.'});
  const error=validate(body);if(error)return reply(400,{ok:false,error});
  const gh=async(path,options={})=>{
    const res=await fetch(`https://api.github.com/repos/${OWNER}/${REPO}${path}`,{...options,signal:AbortSignal.timeout(12000),headers:{Authorization:`Bearer ${process.env.GITHUB_TOKEN}`,Accept:'application/vnd.github+json','Content-Type':'application/json','User-Agent':'miniforgedad-gallery',...(options.headers||{})}});
    if(!res.ok){const e=new Error('GitHub request failed');e.status=res.status;throw e;}return res.json();
  };
  try {
    const ref=await gh(`/git/ref/heads/${BRANCH}`), head=ref.object.sha;
    const commit=await gh(`/git/commits/${head}`);
    // Read against the exact commit, not a moving branch, to prevent lost updates.
    const file=await gh(`/contents/gallery-data.js?ref=${head}`);
    const source=Buffer.from(file.content,'base64').toString('utf8');
    const match=source.match(/^\s*(?:\/\/[^\n]*\n)*\s*const GALLERY = (\[[\s\S]*\]);\s*$/);
    if(!match)return reply(409,{ok:false,error:'The gallery format changed. Refresh the page before trying again.'});
    const gallery=JSON.parse(match[1]);if(!Array.isArray(gallery)||(gallery.length>500||(body.action==='add'&&gallery.length>=500)))return reply(409,{ok:false,error:'The gallery needs a maintenance check before adding more photos.'});
    const index=body.action==='update'?gallery.findIndex(x=>x.id===body.id):-1;
    if(body.action==='update'&&index<0)return reply(404,{ok:false,error:'That project was not found. Refresh the editor.'});
    // Avoid overwriting another edit to the same entry made since the form loaded.
    if(body.action==='update' && body.expectedEntry !== JSON.stringify(gallery[index])) return reply(409,{ok:false,error:'This project changed since you opened it. Refresh before editing again.'});
    const id=body.action==='update'?gallery[index].id:`project-${crypto.randomUUID()}`;
    const old=index>=0?gallery[index]:{};
    const src=body.image?`images/gallery/uploads/${id}-${crypto.randomUUID().slice(0,8)}.jpg`:old.src;
    const labels={dad:'Dad',son:'Son',together:'Together',brand:'Miniforgedad'};
    const entry={...old,id,src,thumbnail:body.image?src:(old.thumbnail||old.src),painter:body.painter,credit:labels[body.painter],title:body.title.trim(),caption:body.title.trim(),description:body.description.trim(),alt:body.alt.trim(),faction:body.faction.trim(),status:body.status,featured:body.featured,sourceUrl:validSource(body.sourceUrl),year:body.year};
    if(index>=0)gallery[index]=entry;else gallery.unshift(entry);
    const content='// Gallery entries are managed from /upload. Keep this array valid JSON.\nconst GALLERY = '+JSON.stringify(gallery,null,2)+';\n';
    const tree=[{path:'gallery-data.js',mode:'100644',type:'blob',content}];
    if(body.image){const blob=await gh('/git/blobs',{method:'POST',body:JSON.stringify({content:body.image.split(',')[1],encoding:'base64'})});tree.push({path:src,mode:'100644',type:'blob',sha:blob.sha})}
    const nextTree=await gh('/git/trees',{method:'POST',body:JSON.stringify({base_tree:commit.tree.sha,tree})});
    const next=await gh('/git/commits',{method:'POST',body:JSON.stringify({message:`${body.action==='add'?'Add':'Update'} gallery project: ${entry.title}`,tree:nextTree.sha,parents:[head]})});
    await gh(`/git/refs/heads/${BRANCH}`,{method:'PATCH',body:JSON.stringify({sha:next.sha,force:false})});
    return reply(200,{ok:true,id,commit:next.sha,message:'Saved. The website will update after publishing finishes.'});
  } catch(e) {
    if([409,422].includes(e.status))return reply(409,{ok:false,error:'The site changed during this save. Your photo was not published. Refresh and try again.'});
    return reply(502,{ok:false,error:'Publishing could not finish. Your form is still here; try again in a moment.'});
  }
};
exports.validate=validate;
exports.validSource=validSource;
