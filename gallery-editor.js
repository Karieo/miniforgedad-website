(()=>{
  const $=id=>document.getElementById(id), entries=typeof GALLERY!=='undefined'?GALLERY:[];
  const fields=['title','alt','painter','status-field','faction','year','description','source','featured'];
  let image='',photoVersion=0,loading=false,current=null,baseEntries=entries;
  const say=(text,bad=false)=>{$('status').textContent=text;$('status').style.color=bad?'#ffd0c7':'#f4eadd'};
  for(const item of entries){const o=document.createElement('option');o.value=item.id;o.textContent=item.title;$('project').append(o)}
  for(const faction of [...new Set(entries.map(x=>x.faction).filter(Boolean))]){const o=document.createElement('option');o.value=faction;$('factions').append(o)}
  $('year').max=String(new Date().getFullYear()+1);
  const count=()=>{$('note-count').textContent=`${$('description').value.length} / 800`};$('description').addEventListener('input',count);
  $('project').addEventListener('change',()=>{
    photoVersion++;image='';loading=false;$('publish').disabled=false;$('photo').value='';$('photo-size').textContent='';current=baseEntries.find(x=>x.id===$('project').value)||null;
    if(!current){$('gallery-form').reset();$('photo-preview').hidden=true;}else{
      $('title').value=current.title||'';$('alt').value=current.alt||'';$('painter').value=['dad','son','together','brand'].includes(current.painter)?current.painter:'brand';$('status-field').value=current.status||'finished';$('faction').value=current.faction||'';$('year').value=current.year||'';$('description').value=current.description||'';$('source').value=current.sourceUrl||'';$('featured').checked=!!current.featured;$('photo-preview').src=current.src;$('photo-preview').hidden=false;
    }
    $('publish').textContent=current?'Save project changes':'Publish gallery entry';count();say('');
  });
  $('toggle-password').addEventListener('click',()=>{const show=$('admin-password').type==='password';$('admin-password').type=show?'text':'password';$('toggle-password').textContent=show?'Hide':'Show';$('toggle-password').setAttribute('aria-pressed',String(show))});
  async function prepare(file){
    const url=URL.createObjectURL(file);try{const img=new Image();img.src=url;await img.decode();let scale=Math.min(1,1280/Math.max(img.width,img.height));let canvas=document.createElement('canvas');canvas.width=Math.max(1,Math.round(img.width*scale));canvas.height=Math.max(1,Math.round(img.height*scale));const ctx=canvas.getContext('2d');ctx.fillStyle='#fff';ctx.fillRect(0,0,canvas.width,canvas.height);ctx.drawImage(img,0,0,canvas.width,canvas.height);const value=canvas.toDataURL('image/jpeg',.82);if(value.length>2.6*1024*1024)throw Error('The prepared photo is too large. Choose a smaller photo.');return{value,w:canvas.width,h:canvas.height}}finally{URL.revokeObjectURL(url)}
  }
  $('photo').addEventListener('change',async()=>{const version=++photoVersion;image='';const file=$('photo').files[0];if(!file){loading=false;$('publish').disabled=false;$('photo-preview').hidden=!current;if(current)$('photo-preview').src=current.src;return}loading=true;$('publish').disabled=true;say('Preparing photo…');try{const out=await prepare(file);if(version!==photoVersion)return;image=out.value;$('photo-preview').src=image;$('photo-preview').hidden=false;$('photo-size').textContent=`${out.w} × ${out.h} · ${Math.round(image.length*.75/1024)} KB`;say('Photo ready.')}catch(e){if(version!==photoVersion)return;say(e.message||'This photo could not be opened. Try JPEG or PNG.',true)}finally{if(version===photoVersion){loading=false;$('publish').disabled=false}}});
  const getDraft=()=>Object.fromEntries(fields.map(k=>[k,k==='featured'?$(k).checked:$(k).value]));
  $('save-draft').addEventListener('click',()=>{try{localStorage.setItem('mfd-gallery-draft-v1',JSON.stringify({project:$('project').value,fields:getDraft()}));say('Text draft saved on this device.')}catch{say('This browser could not save a draft.',true)}});
  $('restore-draft').addEventListener('click',()=>{try{const d=JSON.parse(localStorage.getItem('mfd-gallery-draft-v1'));if(!d?.fields){say('No saved text draft on this device.');return}if(d.project&&!baseEntries.some(x=>x.id===d.project))throw Error('The saved project no longer exists.');$('project').value=d.project||'';$('project').dispatchEvent(new Event('change'));for(const k of fields){if(k==='featured')$(k).checked=!!d.fields[k];else if(typeof d.fields[k]==='string')$(k).value=d.fields[k]}count();say('Text restored. Choose a photo if needed, then enter the password.')}catch(e){say(e.message||'That draft could not be opened.',true)}});
  $('gallery-form').addEventListener('submit',async e=>{e.preventDefault();if(loading)return;if(!current&&!image){say('Choose a photo for the new project.',true);$('photo').focus();return}if(!confirm('Publish this gallery entry to miniforgedad.com?'))return;
    const payload={action:current?'update':'add',id:current?.id,expectedEntry:current?JSON.stringify(current):undefined,password:$('admin-password').value,title:$('title').value,alt:$('alt').value,painter:$('painter').value,status:$('status-field').value,faction:$('faction').value,year:$('year').value===''?'':Number($('year').value),description:$('description').value,sourceUrl:$('source').value,featured:$('featured').checked,image};
    $('publish').disabled=true;say('Publishing photo and notes…');try{const response=await fetch('/.netlify/functions/gallery-project',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload),signal:AbortSignal.timeout(60000)});const result=await response.json().catch(()=>null);if(!response.ok||!result?.ok)throw Error(result?.error||'Publishing could not finish.');$('admin-password').value='';say(result.message+' Reload this page before making another edit.');$('publish').disabled=true;
    }catch(error){say(error.name==='TimeoutError'?'The save timed out. Check the gallery before trying again; the publish may still have completed.':error.message,true);$('publish').disabled=false}
  });
})();
