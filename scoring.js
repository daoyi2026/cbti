// Primary and secondary affinities describe each everyday reaction.
// Equal-choice calibration corrects unequal opportunities across the 40 options.
export const codes=['CTRL','VIP','MUSE','AFK','PING','TANK','LOOK','NPC','SCOUT','BOSS','WILD'];
export const affinities=[
 [['VIP','AFK'],['AFK','NPC'],['PING','SCOUT'],['SCOUT','LOOK'],['WILD','MUSE']],
 [['NPC','AFK'],['BOSS','NPC'],['PING','AFK'],['SCOUT','MUSE'],['CTRL','BOSS']],
 [['CTRL','BOSS'],['TANK','CTRL'],['VIP','AFK'],['MUSE','SCOUT'],['WILD','LOOK']],
 [['SCOUT','PING'],['MUSE','LOOK'],['NPC','CTRL'],['LOOK','SCOUT'],['AFK','VIP']],
 [['VIP','AFK'],['AFK','NPC'],['TANK','WILD'],['PING','SCOUT'],['MUSE','LOOK']],
 [['TANK','PING'],['CTRL','NPC'],['AFK','BOSS'],['PING','MUSE'],['SCOUT','VIP']],
 [['CTRL','BOSS'],['PING','NPC'],['TANK','PING'],['VIP','AFK'],['WILD','MUSE']],
 [['LOOK','NPC'],['MUSE','SCOUT'],['TANK','PING'],['VIP','AFK'],['BOSS','CTRL']]
];
// A hidden explorer needs repeated outdoor/independent choices, not a random roll.
export function isEligible(code,answers){return code!=='WILD'||answers.reduce((n,a,q)=>n+Number(affinities[q][a][0]==='WILD'),0)>=2;}
export const targetShares=codes.map(code=>code==='WILD'?.03:.097);
export const weights=affinities.map(question=>question.map(pair=>codes.map(code=>pair[0]===code?3:pair[1]===code?1:0)));
const moments=codes.map((_,c)=>{let mean=0,variance=0;for(const question of weights){const avg=question.reduce((sum,w)=>sum+w[c],0)/5;mean+=avg;variance+=question.reduce((sum,w)=>sum+(w[c]-avg)**2,0)/5;}return {mean,sd:Math.sqrt(variance)};});
export const calibration=[0.0007022400000002635,0.10085328000000028,0.06116304000000012,0.06982992000000043,0.00928080000000013,0.05269200000000006,0.06915024000000006,0.19641552000000032,0.09853392000000022,0.07206480000000026,-0.7306857599999987];
export function scoresFor(answers){if(answers.length!==8||answers.some(a=>!Number.isInteger(a)||a<0||a>4))throw Error('Eight valid choices are required');return codes.map((_,c)=>(answers.reduce((s,a,q)=>s+weights[q][a][c],0)-moments[c].mean)/moments[c].sd);}
export function tieNoise(path,c){let x=Math.imul(path+1,1597334677)^Math.imul(c+1,3812015801);x=Math.imul(x^(x>>>16),2246822507);return ((x^(x>>>13))>>>0)/4294967296*1e-6;}
export function scoreAnswers(answers){const scores=scoresFor(answers),path=answers.reduce((n,a)=>n*5+a,0);let best=0;for(let c=1;c<codes.length;c++)if(isEligible(codes[c],answers)&&scores[c]+calibration[c]+tieNoise(path,c)>scores[best]+calibration[best]+tieNoise(path,best))best=c;return {code:codes[best],scores:Object.fromEntries(codes.map((c,i)=>[c,scores[i]]))};}
