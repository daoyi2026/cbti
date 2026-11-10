import * as THREE from './assets/vendor/three.module.js';
import {GLTFLoader} from './assets/vendor/GLTFLoader.js';
import {DRACOLoader} from './assets/vendor/DRACOLoader.js';
import {createCharacterEffects} from './effects.js';
import {byCode, modelConfig} from './data.js';

export function createViewer(stage, holder, onState){
 const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
 const renderer=new THREE.WebGLRenderer({antialias:true,alpha:true,preserveDrawingBuffer:true,powerPreference:'high-performance'});
 renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.5));renderer.setClearColor(0,0);renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;
 const canvas=renderer.domElement;canvas.tabIndex=0;canvas.setAttribute('role','img');holder.append(canvas);
 const scene=new THREE.Scene(),camera=new THREE.OrthographicCamera(-1,1,1,-1,.01,40),turntable=new THREE.Group();scene.add(turntable);
 scene.add(new THREE.HemisphereLight(0xfff8ed,0x86918b,2));const key=new THREE.DirectionalLight(0xfff1de,2.6);key.position.set(-3,5,6);scene.add(key);const fill=new THREE.DirectionalLight(0xc9ddec,1.2);fill.position.set(4,3,2);scene.add(fill);
 const effects=createCharacterEffects(scene,camera),draco=new DRACOLoader();draco.setDecoderPath(new URL('./assets/vendor/draco/',import.meta.url).href);draco.setWorkerLimit(1);const loader=new GLTFLoader();loader.setDRACOLoader(draco);
 const idleActions=[];let model=null,mixer=null,gestures=[],active=null,activeIndex=-1,code=null,paused=reduced,chain=Promise.resolve(),requestId=0,visible=true,yaw=0,dragging=false,moved=false,horizontal=false,startX=0,startY=0,lastX=0,nextAction=0,last=performance.now();
 function cameraSize(){const h=2.4,w=h*holder.clientWidth/(holder.clientHeight||1);Object.assign(camera,{left:-w/2,right:w/2,top:h*.905,bottom:-h*.095});camera.position.set(-3.6,0,9.9);camera.lookAt(0,0,0);camera.updateProjectionMatrix();}
 function resize(){if(!holder.clientWidth||!holder.clientHeight)return;renderer.setSize(holder.clientWidth,holder.clientHeight,false);cameraSize();}
 function dispose(object){const textures=new Set(),materials=new Set(),skeletons=new Set();object.traverse(c=>{if(!c.isMesh)return;c.geometry.dispose();if(c.skeleton)skeletons.add(c.skeleton);for(const material of Array.isArray(c.material)?c.material:[c.material]){materials.add(material);for(const v of Object.values(material))if(v?.isTexture)textures.add(v);}});for(const s of skeletons)s.dispose();for(const t of textures){t.dispose();t.source?.data?.close?.();}for(const m of materials)m.dispose();}
 function unload(){if(mixer){mixer.stopAllAction();if(model)mixer.uncacheRoot(model);}mixer=null;active=null;activeIndex=-1;gestures=[];idleActions.length=0;effects.bind(null,null);if(model){turntable.remove(model);dispose(model);model=null;renderer.renderLists.dispose();}stage.dataset.motion='none';}
 function clear(mode='mystery'){requestId++;unload();code=null;stage.dataset.ready=mode;stage.dataset.mode=mode;onState({state:mode,actions:[],paused});}
 function configure(gltf,config){
  mixer=new THREE.AnimationMixer(model);
  for(const name of ['Breathe','Living','SmokeLoop']){const clip=THREE.AnimationClip.findByName(gltf.animations,name);if(name==='Living'&&!clip)throw Error('Missing continuous feature animation');if(clip){const action=mixer.clipAction(clip);action.play();action.paused=paused;idleActions.push(action);}}
  const names=config.clips||['Gesture','Gesture2','Gesture3'];
  gestures=names.map(name=>{const clip=THREE.AnimationClip.findByName(gltf.animations,name);if(!clip)throw Error('Missing character action');const action=mixer.clipAction(THREE.AnimationUtils.makeClipAdditive(clip.clone()));action.setLoop(THREE.LoopOnce,1);action.clampWhenFinished=true;return action;});
  mixer.addEventListener('finished',event=>{if(event.action!==active)return;active.stop();active=null;activeIndex=-1;stage.dataset.motion=paused?'paused':'living';});
  stage.dataset.motion=paused?'paused':'living';
 }
 async function show(nextCode){
  const person=byCode[nextCode];if(!person)throw Error('Unknown persona');
  const id=++requestId;
  chain=chain.catch(()=>{}).then(async()=>{
   if(id!==requestId)return false;
   unload();code=nextCode;nextAction=0;yaw=0;turntable.rotation.y=0;stage.dataset.mode='character';stage.dataset.code=nextCode;stage.style.setProperty('--stage-color',person.color);
   if(!person.model){stage.dataset.ready='missing';onState({state:'missing',person,actions:[],paused});return true;}
   stage.dataset.ready='loading';onState({state:'loading',person,actions:[],paused});
   try{
    const gltf=await loader.loadAsync(new URL(`./assets/models/${person.model}-motion.glb?v=5`,import.meta.url).href);
    if(id!==requestId){dispose(gltf.scene);return false;}
    model=gltf.scene;const box=new THREE.Box3().setFromObject(model),size=box.getSize(new THREE.Vector3()),center=box.getCenter(new THREE.Vector3()),config=modelConfig[person.model],direction=Math.hypot(-1.2,3.3),projected=(3.3*size.x+1.2*size.z)/direction;
    const scale=Math.min(2.4*holder.clientWidth/(holder.clientHeight||1)*.65/projected,2.4*.60/size.y)*(config.scale||1);
    model.scale.setScalar(scale);model.position.set(-center.x*scale,-box.min.y*scale,-center.z*scale);turntable.position.set((config.offset||0)*3.3/direction,0,(config.offset||0)*1.2/direction);turntable.add(model);
    configure(gltf,config);effects.bind(model,person.model);resize();stage.dataset.ready='true';canvas.setAttribute('aria-label',`${person.name}三维角色，拖动旋转，轻触互动`);onState({state:'ready',person,actions:config.actions,paused});return true;
   }catch(error){console.error('Character loading failed',error);unload();stage.dataset.ready='error';onState({state:'error',person,actions:[],paused});return false;}
  });return chain;
 }
 function act(index=nextAction){if(!gestures[index]||stage.dataset.ready!=='true')return;if(active&&active!==gestures[index])active.fadeOut(.15);active=gestures[index];activeIndex=index;nextAction=(index+1)%gestures.length;active.reset().fadeIn(.15).play();stage.dataset.motion=`gesture${index+1}`;}
 function pause(){paused=!paused;for(const a of idleActions)a.paused=paused;stage.dataset.motion=paused?'paused':'living';return paused;}
 new ResizeObserver(resize).observe(holder);new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;}).observe(stage);
 canvas.addEventListener('pointerdown',e=>{if(e.isPrimary===false)return;dragging=true;moved=false;horizontal=e.pointerType==='mouse';startX=lastX=e.clientX;startY=e.clientY;if(horizontal)canvas.setPointerCapture(e.pointerId);});
 canvas.addEventListener('pointermove',e=>{if(!dragging)return;if(Math.hypot(e.clientX-startX,e.clientY-startY)>7)moved=true;if(!horizontal&&Math.abs(e.clientX-startX)>Math.abs(e.clientY-startY)+5){horizontal=true;canvas.setPointerCapture(e.pointerId);}if(horizontal)yaw+=(e.clientX-lastX)*.012;lastX=e.clientX;});
 canvas.addEventListener('pointerup',()=>{if(dragging&&!moved)act();dragging=false;});const cancel=()=>{dragging=false;};canvas.addEventListener('pointercancel',cancel);canvas.addEventListener('lostpointercapture',cancel);window.addEventListener('pointerup',cancel);
 canvas.addEventListener('keydown',e=>{if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();yaw+=e.key==='ArrowLeft'?-.4:.4;}if(e.key==='Enter'||e.key===' '){e.preventDefault();act();}if(e.key==='Home')yaw=0;});
 canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();stage.dataset.ready='error';onState({state:'error',person:byCode[code],actions:[],paused});});
 function frame(now){requestAnimationFrame(frame);const dt=Math.min((now-last)/1000,.1);last=now;if(document.hidden||!visible)return;turntable.rotation.y=THREE.MathUtils.damp(turntable.rotation.y,yaw,9,dt);mixer?.update(dt);effects.update(now/1000,active,activeIndex);stage.dataset.yaw=turntable.rotation.y.toFixed(3);renderer.render(scene,camera);}
 resize();requestAnimationFrame(frame);
 function snapshot(width,height){const out=document.createElement('canvas');out.width=width;out.height=height;const ctx=out.getContext('2d'),ratio=renderer.getPixelRatio();try{renderer.setPixelRatio(1);renderer.setSize(width,height,false);renderer.render(scene,camera);ctx.drawImage(canvas,0,0,width,height);}finally{renderer.setPixelRatio(ratio);resize();renderer.render(scene,camera);}return out;}
 return {show,clear,act,pause,rotate:amount=>{yaw+=amount;},reset:()=>{yaw=0;},snapshot,isReady:()=>Boolean(model&&stage.dataset.ready==='true')};
}
