import {personas,byCode} from './data.js?v=6';
import {questions} from './questions.js';
import {createViewer} from './viewer.js?v=5';
import {scoreAnswers,affinities} from './scoring.js';
import {adoptionCards,drawAdoption,drawnCatCard} from './adoptions.js?v=6';
const $=s=>document.querySelector(s),panel=$('#copy-panel'),experience=$('#experience'),stage=$('#portrait');
const answers=Array(questions.length).fill(null);
let mode='home',question=0,viewCode='MUSE',sampleResult='MUSE',viewer=null,posterUrl=null,posterFile=null,toastTimer=null,flipTimer=null,flipping=false;
let isSample=false;
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
function toast(text){$('#toast').textContent=text;$('#toast').classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('#toast').classList.remove('show'),3200);}
function closeModal(dialog){dialog.close();}
for(const button of document.querySelectorAll('[data-close]'))button.addEventListener('click',()=>closeModal(button.closest('dialog')));
for(const dialog of document.querySelectorAll('dialog'))dialog.addEventListener('click',event=>{if(event.target===dialog){const box=dialog.getBoundingClientRect();if(event.clientX<box.left||event.clientX>box.right||event.clientY<box.top||event.clientY>box.bottom)dialog.close();}});
function scrollMain(){experience.scrollIntoView({block:'start',behavior:reduced?'auto':'smooth'});}
function focusTitle(){const title=panel.querySelector('h1,h2');if(title){title.tabIndex=-1;title.focus({preventScroll:true});}}
function stateChanged({state,person,actions,paused}){
 const ready=state==='ready',missing=state==='missing';
 $('#stage-loading').hidden=!['loading','error'].includes(state);$('#retry-model').hidden=state!=='error';$('#loading-label').textContent=state==='error'?'小猫暂时没能出场':'小猫正在梳理毛发…';
 $('#missing-character').hidden=!missing;$('#mystery').hidden=state!=='mystery';if(missing)$('#missing-code').textContent=person.code;
 $('#stage-controls').hidden=!ready;
 if(ready||missing)updateAnswerImage();
 if(state==='error'&&$('#answer-dialog').open)$('#answer-pending').textContent='形象暂时没能加载，仍可查看你的咪格。';
 for(const button of document.querySelectorAll('[data-save]'))button.disabled=state==='loading'||state==='error';
}
function stageMetadata(code){const p=byCode[code];viewCode=code;$('#caption-name').textContent=`${code} · ${p.name}`;}
async function showCharacter(code){stageMetadata(code);if(viewer)await viewer.show(code);}
function showMystery(){if(viewer)viewer.clear('mystery');else stateChanged({state:'mystery',actions:[],paused:false});$('#caption-name').textContent='你的咪格 · 待揭晓';$('#mystery-dots').innerHTML=answers.map(a=>`<i class="${a!==null?'done':''}"></i>`).join('');stage.style.setProperty('--stage-color','#dfe7d6');}
function renderHome(){
 panel.innerHTML=`<h1 class="hero-title">人类，<br>请交出你的<em>咪格。</em></h1><button class="primary home-primary" id="begin">${answers.some(a=>a!==null)?'继续咪格鉴定':'开始咪格鉴定'} <span>↗</span></button><button class="text-button" data-atlas>先翻翻十二咪格图鉴 →</button><button class="text-button sample-shortcut" id="preview-sample">先看咪格卡 →</button>`;
 $('#begin').addEventListener('click',()=>{const index=answers.findIndex(a=>a===null);question=index<0?7:index;if(index<0){sampleResult=scoreAnswers(answers).code;isSample=false;go('result');}else go('quiz');});panel.querySelector('[data-atlas]').addEventListener('click',openAtlas);$('#preview-sample').addEventListener('click',()=>{sampleResult='MUSE';isSample=true;go('result');});
 showCharacter(viewCode);
}
function renderQuiz(){
 const q=questions[question],choice=answers[question];
 panel.innerHTML=`<div class="question-meta"><span>选最近比较像你的那个</span><b>${String(question+1).padStart(2,'0')} <small>/ 08</small></b></div><div class="progress-line" aria-label="第${question+1}题，共8题"><i style="width:${(question+1)/8*100}%"></i></div><h1 class="question-title">${q.title}</h1><div class="options" role="group" aria-label="选择最像你的反应">${q.options.map((text,i)=>`<button type="button" class="option" data-answer="${i}" aria-pressed="${choice===i}"><span class="option-letter">${'ABCDE'[i]}</span><span>${text}</span></button>`).join('')}</div><div class="quiz-nav"><button type="button" class="quiz-back" id="previous">← ${question===0?'回到首页':'上一题'}</button><button type="button" class="primary" id="next" ${choice===null?'disabled':''}>${question===7?'写完啦':'下一题'} <span>→</span></button></div><p class="quiz-note">不用选“理想中的自己”，选最近比较像你的那个。</p>`;
 for(const button of panel.querySelectorAll('[data-answer]'))button.addEventListener('click',()=>{answers[question]=Number(button.dataset.answer);for(const b of panel.querySelectorAll('[data-answer]'))b.setAttribute('aria-pressed',String(b===button));$('#next').disabled=false;$('#mystery-dots').innerHTML=answers.map(a=>`<i class="${a!==null?'done':''}"></i>`).join('');});
 $('#previous').addEventListener('click',()=>{if(question===0)go('home');else{question--;go('quiz');}});$('#next').addEventListener('click',()=>{if(answers[question]===null)return;if(question===7){sampleResult=scoreAnswers(answers).code;isSample=false;go('result');showAnswer();}else{question++;go('quiz');}});
 showMystery();
}
function renderReview(){
 panel.innerHTML=`<h1 class="question-title">再看看你的八个选择。</h1><ol class="answer-list">${questions.map((q,i)=>`<li><b>${q.title}</b><p>${q.options[answers[i]]||'还没选'}</p></li>`).join('')}</ol><button class="primary" id="return-result">回到我的咪格 <span>↗</span></button><button class="text-button" id="edit-answers">← 改改主意</button>`;
 $('#return-result').addEventListener('click',()=>go('result'));$('#edit-answers').addEventListener('click',()=>{question=7;go('quiz');});showMystery();
}
function renderResult(){
 const p=byCode[sampleResult];panel.innerHTML=`<p class="card-overline">${isSample?'咪格卡 · 样卡预览':'你的咪格'}</p><h1 class="code-title">${p.code}</h1><h2 class="card-name">${p.name}</h2><blockquote class="card-quote">“${p.quote}”</blockquote><p class="card-copy">${p.copy}</p><div class="card-actions dual"><button type="button" class="primary" id="draw">抽一只猫搭子 <span>✦</span></button><button type="button" class="secondary" data-save>保存咪格卡 <span>↓</span></button></div><details class="result-reasons" ${isSample?'hidden':''}><summary>从哪看出来的？</summary><ul>${questions.map((q,i)=>answers[i]!==null&&affinities[i][answers[i]].includes(p.code)?`<li>${q.options[answers[i]]}</li>`:'').filter(Boolean).slice(0,3).join('')}</ul><p>根据日常反应与咪格的关联计分，并校正各咪格在题目中的出现次数；相同作答得到相同结果。</p></details><p class="rule-note">${isSample?'这是手动选择的样卡，不是答题结果。':'咪格是趣味角色设定，不是心理诊断。'}</p><button class="text-button" id="back-to-answers">← ${answers.every(a=>a!==null)?'回看作答':'回到首页'}</button>`;
 $('#draw').addEventListener('click',openDraw);$('#back-to-answers').addEventListener('click',()=>go(answers.every(a=>a!==null)?'review':'home'));attachSave();showCharacter(p.code);
}
function renderAtlasPerson(){
 const p=byCode[viewCode];panel.innerHTML=`<p class="card-overline">咪格图鉴 · ${p.cat}代表形象</p><h1 class="code-title">${p.code}</h1><h2 class="card-name">${p.name}</h2><blockquote class="card-quote">“${p.quote}”</blockquote><p class="card-copy">${p.copy}</p><div class="card-actions dual"><button type="button" class="primary" id="atlas-begin">开始咪格鉴定 <span>↗</span></button><button type="button" class="secondary" data-atlas>换只猫看看 <span>↶</span></button></div><p class="preview-note">这是角色设定介绍；真实猫咪的性格不能只凭品种或花色判断。</p>`;
 $('#atlas-begin').addEventListener('click',()=>{question=0;go('quiz');});panel.querySelector('[data-atlas]').addEventListener('click',openAtlas);showCharacter(p.code);
}
function go(next,scroll=true){mode=next;experience.dataset.screen=next;$('#adoption-section').hidden=['quiz','review'].includes(next);({home:renderHome,quiz:renderQuiz,review:renderReview,result:renderResult,atlas:renderAtlasPerson})[next]();focusTitle();if(scroll)scrollMain();}
function openAtlas(){const grid=$('#atlas-grid');grid.innerHTML=personas.map(p=>`<button type="button" class="atlas-card" style="--tint:${p.color}" data-persona="${p.code}"><span>${p.code}</span><b>${p.name}</b><p>${p.quote}</p><small>${p.cat}${p.model?' · 轻触认识一下':' · 形象准备中'}</small><i>↗</i></button>`).join('');for(const b of grid.querySelectorAll('[data-persona]'))b.addEventListener('click',()=>{$('#atlas-dialog').close();viewCode=b.dataset.persona;go('atlas');});$('#atlas-dialog').showModal();}
function openAdopt(){const section=$('#adoption-section');section.hidden=false;section.scrollIntoView({behavior:reduced?'auto':'smooth',block:'start'});section.querySelector('h2').focus({preventScroll:true});}
function openDraw(){
 if(flipping)return;$('#deck').classList.remove('flipping');$('#drawn-cat').hidden=true;$('#draw-links').hidden=true;$('#draw-again').hidden=true;$('#reveal-card').hidden=false;$('#reveal-card').disabled=false;$('#draw-title').textContent='有只真猫，想和你认识一下。';$('#draw-note').textContent='从公开领养档案中随机遇见一只。每只猫都有自己的性格，不按咪格或品种筛选。';if(!$('#draw-dialog').open)$('#draw-dialog').showModal();
}
$('#reveal-card').addEventListener('click',()=>{
 if(flipping)return;const cat=drawAdoption();if(!cat){$('#draw-note').textContent='暂时没有可展示的待领养档案，晚点再来看看。';return;}
 flipping=true;$('#reveal-card').disabled=true;$('#drawn-cat').innerHTML=drawnCatCard(cat);$('#drawn-cat').dataset.catId=cat.id;$('#drawn-cat').hidden=false;$('#deck').classList.add('flipping');
 flipTimer=setTimeout(()=>{flipping=false;$('#draw-title').textContent=`原来是你，${cat.name}。`;$('#draw-note').textContent='原站标注待领养 · 实际状态请联系发布者确认。抽中只是一次相遇，不代表预约或领养成功。';$('#draw-source').textContent=`来源：${cat.source} · 公开列表检索 ${'2026-11-10'}`;$('#draw-detail').href=cat.url;$('#reveal-card').hidden=true;$('#draw-links').hidden=false;$('#draw-again').hidden=false;},reduced?0:850);
});
$('#draw-again').addEventListener('click',openDraw);
$('#draw-dialog').addEventListener('close',()=>{clearTimeout(flipTimer);flipping=false;});
$('#drawn-cat').addEventListener('error',event=>{if(event.target.tagName==='IMG')event.target.hidden=true;},true);
$('#home-link').addEventListener('click',event=>{event.preventDefault();go('home');});for(const b of document.querySelectorAll('.site-header [data-atlas]'))b.addEventListener('click',openAtlas);for(const b of document.querySelectorAll('.site-header [data-adopt]'))b.addEventListener('click',openAdopt);
$('#rotate-left').addEventListener('click',()=>viewer?.rotate(-.5));$('#rotate-right').addEventListener('click',()=>viewer?.rotate(.5));$('#reset-view').addEventListener('click',()=>viewer?.reset());$('#retry-model').addEventListener('click',()=>showCharacter(viewCode));

function wrap(ctx,text,x,y,width,lineHeight){let line='';for(const char of text){const next=line+char;if(ctx.measureText(next).width>width&&line){ctx.fillText(line,x,y);y+=lineHeight;line=char;}else line=next;}if(line)ctx.fillText(line,x,y);return y+lineHeight;}
async function poster(){
 const person=byCode[viewCode];await document.fonts.ready;const portal=$('#portal');if(!portal.complete||!portal.naturalWidth)await portal.decode();
 const out=document.createElement('canvas');out.width=1080;out.height=1920;const ctx=out.getContext('2d');ctx.textBaseline='top';ctx.fillStyle='#f8f4eb';ctx.fillRect(0,0,1080,1920);ctx.strokeStyle='#d8cfb7';ctx.lineWidth=2;ctx.strokeRect(38,38,1004,1844);ctx.fillStyle='#476046';ctx.font='500 45px "Songti SC",serif';ctx.fillText('咪格局',82,75);ctx.fillStyle='#b29760';ctx.font='20px Georgia,serif';ctx.fillText('P A W S O N A  /  THE FELINE AFFAIRS',82,139);
 const x=155,y=208,w=770,h=w*4/3;ctx.fillStyle=person.color;ctx.fillRect(x,y,w,h);
 if(viewer?.isReady())ctx.drawImage(viewer.snapshot(w,h),x,y,w,h);else{ctx.fillStyle='#7c9270';ctx.font='60px Georgia,serif';ctx.textAlign='center';ctx.fillText(person.code,540,620);ctx.font='25px "PingFang SC",sans-serif';ctx.fillText('角色形象准备中',540,710);ctx.textAlign='left';}
 ctx.drawImage(portal,x,y,w,h);const detailY=y+h+50;ctx.fillStyle='#476646';ctx.font='60px Georgia,serif';ctx.fillText(person.code,91,detailY);ctx.fillStyle='#ad7852';ctx.font='500 43px "Songti SC",serif';ctx.fillText(person.name,91,detailY+78);ctx.fillStyle='#91a085';ctx.font='21px "PingFang SC",sans-serif';ctx.fillText(isSample?'咪格卡 · 产品样卡':'你的咪格',91,detailY+145);ctx.strokeStyle='#d9d7c6';ctx.beginPath();ctx.moveTo(91,detailY+190);ctx.lineTo(989,detailY+190);ctx.stroke();ctx.fillStyle='#6d8162';ctx.font='27px "PingFang SC",sans-serif';wrap(ctx,`“${person.quote}” ${person.copy}`,91,detailY+223,898,45);ctx.fillStyle='#a2ab95';ctx.font='19px "PingFang SC",sans-serif';ctx.fillText((isSample?'产品样卡预览 · ':'')+'咪格角色设定纯属趣味创作。',91,1819);
 return new Promise((resolve,reject)=>out.toBlob(blob=>blob?resolve(blob):reject(Error('Image encoding failed')),'image/png'));
}
function attachSave(){for(const b of panel.querySelectorAll('[data-save]'))b.addEventListener('click',async()=>{b.disabled=true;try{const blob=await poster();if(posterUrl)URL.revokeObjectURL(posterUrl);posterUrl=URL.createObjectURL(blob);const filename=`pawsona-${mode}-${viewCode.toLowerCase()}${isSample?'-sample':''}.png`;posterFile=new File([blob],filename,{type:'image/png'});$('#save-preview').src=posterUrl;$('#download-card').href=posterUrl;$('#download-card').download=filename;$('#share-card').hidden=!navigator.canShare?.({files:[posterFile]});$('#save-dialog').showModal();}catch(error){console.error('Poster export failed',error);toast('图片暂时没能生成，可以稍后再试。');}finally{b.disabled=false;}});}
$('#share-card').addEventListener('click',async()=>{if(!posterFile)return;try{await navigator.share({files:[posterFile],title:isSample?'咪格局 · 猫猫样卡':'咪格局 · 我的咪格'});}catch(error){if(error.name!=='AbortError')toast('可以先保存图片，再发给朋友。');}});
$('#save-dialog').addEventListener('close',()=>{if(posterUrl)URL.revokeObjectURL(posterUrl);posterUrl=null;posterFile=null;$('#save-preview').removeAttribute('src');});
try{viewer=createViewer(stage,$('#model-canvas'),stateChanged);}catch(error){console.error('Viewer setup failed',error);stateChanged({state:'error',person:byCode[viewCode],actions:[],paused:false});}
$('#adoption-section').innerHTML=adoptionCards();$('#adoption-title').tabIndex=-1;
$('#adoption-section').addEventListener('error',event=>{if(event.target.tagName==='IMG')event.target.hidden=true;},true);
function showAnswer(){const p=byCode[sampleResult];$('#answer-title').textContent=`${p.code} · ${p.name}`;$('#answer-quote').textContent=`“${p.quote}”`;$('#answer-image').hidden=true;$('#answer-pending').hidden=false;$('#answer-pending').textContent=p.model?'小猫正在出场…':'这个咪格的 3D 形象还在准备中';$('#answer-dialog').showModal();if(viewer?.isReady())updateAnswerImage();}
function updateAnswerImage(){if(!$('#answer-dialog').open||!viewer?.isReady()||stage.dataset.code!==sampleResult)return;const canvas=document.createElement('canvas');canvas.width=420;canvas.height=560;const ctx=canvas.getContext('2d');ctx.fillStyle=byCode[sampleResult].color;ctx.fillRect(0,0,420,560);ctx.drawImage(viewer.snapshot(420,560),0,0,420,560);const portal=$('#portal');if(portal.complete&&portal.naturalWidth)ctx.drawImage(portal,0,0,420,560);$('#answer-image').src=canvas.toDataURL('image/png');$('#answer-image').hidden=false;$('#answer-pending').hidden=true;}
$('#answer-continue').addEventListener('click',()=>$('#answer-dialog').close());
const requestedSample=new URLSearchParams(location.search).get('sample');if(['MUSE','VIP'].includes(requestedSample)){sampleResult=requestedSample;isSample=true;go('result',false);}else go('home',false);
