import * as THREE from './assets/vendor/three.module.js';

function sparkleTexture(){
 const canvas=document.createElement('canvas');canvas.width=128;canvas.height=128;
 const context=canvas.getContext('2d'),glow=context.createRadialGradient(64,64,0,64,64,62);
 glow.addColorStop(0,'rgba(255,255,255,1)');glow.addColorStop(.16,'rgba(255,255,255,.9)');glow.addColorStop(.5,'rgba(255,255,255,.20)');glow.addColorStop(1,'rgba(255,255,255,0)');
 context.fillStyle=glow;context.fillRect(0,0,128,128);context.fillStyle='rgba(255,255,255,.95)';context.beginPath();
 for(const [x,y] of [[64,6],[70,57],[122,64],[70,71],[64,122],[58,71],[6,64],[58,57]])context.lineTo(x,y);
 context.closePath();context.fill();const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;return texture;
}
const clamp=x=>Math.max(0,Math.min(1,x));

export function createCharacterEffects(scene,camera){
 const texture=sparkleTexture(),group=new THREE.Group();group.visible=false;scene.add(group);
 const colors=[0xf2a827,0xa66add,0xfbe5a1,0x55a4cc,0xe87bb0],sprites=[];
 for(let i=0;i<22;i++){
  const material=new THREE.SpriteMaterial({map:texture,color:colors[i%colors.length],transparent:true,opacity:0,depthWrite:false,depthTest:false,toneMapped:false});
  const sprite=new THREE.Sprite(material);sprite.renderOrder=50;group.add(sprite);sprites.push(sprite);
 }
 const anchor=new THREE.Vector3(),right=new THREE.Vector3(),up=new THREE.Vector3();
 let model=null,cat=null,bone=null;
 function bind(nextModel,nextCat){model=nextModel;cat=nextCat;bone=model?.getObjectByName('PropArm')||null;group.visible=false;}
 function pointOnBone(point,pivot){
  anchor.set(point[0]-pivot[0],point[1]-pivot[1],-(point[2]-pivot[2]));return bone.localToWorld(anchor);
 }
 function update(clock,action,index){
  group.visible=false;if(!bone||!model)return;
  const motion=action?.time??0,active=Boolean(action);
  right.setFromMatrixColumn(camera.matrixWorld,0).normalize();up.setFromMatrixColumn(camera.matrixWorld,1).normalize();
  if(cat==='npc'){
   const origin=pointOnBone([.2475,.2787,.7281],[.069,.141,.519]).clone();
   const strength=active ? .95 : .25,phase=active?motion:clock*.4;
   group.visible=true;
   sprites.forEach((sprite,i)=>{
    const age=(phase*.38+i*.173)%1,angle=i*2.399+phase*(1+i%3*.12),radius=(.025+.14*age)*(.65+strength*.45);
    sprite.position.copy(origin).addScaledVector(right,Math.cos(angle)*radius).addScaledVector(up,Math.sin(angle)*radius+.035*age);
    const size=(.050+(i%4)*.014)*(.6+strength*.65)*(1-.35*age);sprite.scale.set(size,size,1);
    sprite.material.opacity=clamp(Math.sin(Math.PI*age)*strength*.9);sprite.material.color.setHex(colors[i%colors.length]);
   });
  }else if(cat==='ctrl'&&active&&index===0){
   const elapsed=motion-1.36,progress=elapsed/1.15;if(progress<0||progress>1)return;
   const origin=pointOnBone([.23,.14,.018],[.258,.22,.46]).clone(),fade=clamp((1-progress)/.5);
   group.visible=true;
   sprites.forEach((sprite,i)=>{
    const angle=i*2.39996,t=Math.max(0,elapsed-(i%4)*.012),velocity=.85+(i%5)*.13,travel=t*(.12+(i%4)*.065),height=Math.max(0,velocity*t-.78*t*t);
    sprite.position.copy(origin).addScaledVector(right,Math.cos(angle)*travel).addScaledVector(up,height);
    const sparkle=(.055+(i%3)*.014)*(1-.35*progress);sprite.scale.set(sparkle,sparkle,1);
    sprite.material.color.setHex(i%3===0?0xf5b528:0xc98216);sprite.material.opacity=fade*.95;
   });
  }
 }
 function dispose(){scene.remove(group);for(const sprite of sprites)sprite.material.dispose();texture.dispose();}
 return {bind,update,dispose};
}
