(()=>{
 const $=id=>document.getElementById(id),rows=typeof GALLERY!=='undefined'?GALLERY:[],labels={dad:'Dad',son:'Son',together:'Together',brand:'Miniforgedad'},statusLabels={'finished':'Finished','in-progress':'In progress','workbench':'Workbench'};
 const preset=document.body.dataset.painter||'';
 const imagePath=s=>typeof s==='string'&&/^images\/[a-z0-9_./-]+\.(jpe?g|png|webp)$/i.test(s)&&!s.includes('..')?s:'';
 const sourcePath=s=>{try{const u=new URL(s);return u.protocol==='https:'&&!u.username&&!u.password&&['instagram.com','www.instagram.com','youtube.com','www.youtube.com','youtu.be'].includes(u.hostname)?u.href:''}catch{return''}};
 const node=(tag,text,cls)=>{const x=document.createElement(tag);if(text)x.textContent=text;if(cls)x.className=cls;return x};
 const addOptions=(el,values)=>{for(const [v,label]of values){const o=node('option',label);o.value=v;el.append(o)}};
 addOptions($('painter-filter'),Object.entries(labels).filter(([k])=>rows.some(x=>x.painter===k||(k==='together'&&x.credit==='Together'))));
 addOptions($('collection-filter'),[...new Set(rows.map(x=>x.faction).filter(Boolean))].sort().map(x=>[x,x]));
 if(preset){$('painter-filter').value=preset;$('painter-control').hidden=true}
 const d=$('photo-dialog');let opener=null;
 function open(item,button){opener=button;$('dialog-photo').src=imagePath(item.src);$('dialog-photo').alt=item.alt||item.title;$('dialog-title').textContent=item.title;$('dialog-notes').textContent=item.description||'';const u=sourcePath(item.sourceUrl);$('dialog-source').hidden=!u;$('dialog-source').href=u||'#';d.showModal()}
 d.addEventListener('close',()=>{if(opener?.isConnected)opener.focus()});
 function render(){const painter=preset||$('painter-filter').value,collection=$('collection-filter').value,status=$('status-filter').value;const visible=rows.filter(x=>(!painter||x.painter===painter||painter==='together'&&x.credit==='Together')&&(!collection||x.faction===collection)&&(!status||(x.status||'finished')===status));const grid=$('project-grid');grid.replaceChildren();
 for(const item of visible){const article=node('article','','project'),button=node('button','','project-open');button.type='button';button.setAttribute('aria-label',`View ${item.title}`);const img=node('img');img.src=imagePath(item.thumbnail)||imagePath(item.src);img.alt=item.alt||item.title;img.loading='lazy';img.width=960;img.height=960;button.append(img,node('h2',item.title));button.addEventListener('click',()=>open(item,button));article.append(button,node('p',[labels[item.painter]||item.credit||'',item.faction,item.year,statusLabels[item.status||'finished']].filter(Boolean).join(' · '),'project-meta'));if(item.description)article.append(node('p',item.description,'project-notes'));const u=sourcePath(item.sourceUrl);if(u){const a=node('a','View original post ↗','project-source');a.href=u;a.target='_blank';a.rel='noopener noreferrer';article.append(a)}grid.append(article)}
 $('project-count').textContent=`${visible.length} ${visible.length===1?'photo':'photos'}`;$('gallery-empty').hidden=visible.length>0;
 }
 for(const id of ['painter-filter','collection-filter','status-filter'])$(id).addEventListener('change',render);
 function applyHash(){const hash=location.hash.slice(1);if(['dad','son','together','brand'].includes(hash)&&!preset)$('painter-filter').value=hash;else if(hash==='workbench')$('status-filter').value='workbench';render()}
 addEventListener('hashchange',applyHash);applyHash();
})();
