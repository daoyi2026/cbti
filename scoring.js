// Primary and secondary affinities describe each everyday reaction.
// Equal-choice calibration corrects unequal opportunities across the 40 options.
export const codes=['CTRL','VIP','MUSE','CHAOS','BUFF','AFK','PING','FOOD','GLAM','TANK','LOOK','NPC'];
export const affinities=[
 [['VIP','FOOD'],['AFK','NPC'],['PING','BUFF'],['CHAOS','LOOK'],['GLAM','VIP']],
 [['NPC','AFK'],['GLAM','NPC'],['PING','AFK'],['BUFF','PING'],['CTRL','TANK']],
 [['CTRL','TANK'],['TANK','CTRL'],['VIP','AFK'],['MUSE','CHAOS'],['LOOK','MUSE']],
 [['FOOD','VIP'],['MUSE','GLAM'],['NPC','CTRL'],['LOOK','CHAOS'],['AFK','VIP']],
 [['VIP','AFK'],['AFK','NPC'],['CHAOS','TANK'],['FOOD','VIP'],['GLAM','MUSE']],
 [['BUFF','FOOD'],['CTRL','TANK'],['BUFF','AFK'],['PING','BUFF'],['TANK','CHAOS']],
 [['CTRL','GLAM'],['PING','NPC'],['TANK','BUFF'],['VIP','AFK'],['MUSE','LOOK']],
 [['LOOK','NPC'],['MUSE','CHAOS'],['BUFF','PING'],['FOOD','CTRL'],['GLAM','LOOK']]
];
export const weights=affinities.map(question=>question.map(pair=>codes.map(code=>pair[0]===code?3:pair[1]===code?1:0)));
const moments=codes.map((_,c)=>{let mean=0,variance=0;for(const question of weights){const avg=question.reduce((sum,w)=>sum+w[c],0)/5;mean+=avg;variance+=question.reduce((sum,w)=>sum+(w[c]-avg)**2,0)/5;}return {mean,sd:Math.sqrt(variance)};});
export const calibration=[0.025547519999999286,0.07758207999999964,-0.07179929600000061,0.09509555199999926,-0.08588979200000076,-0.09165696000000048,-0.07028428800000046,-0.07235353600000073,-0.04514764800000066,0.08641484799999904,0.0057651199999994105,0.1467263999999998];
export function scoresFor(answers){if(answers.length!==8||answers.some(a=>!Number.isInteger(a)||a<0||a>4))throw Error('Eight valid choices are required');return codes.map((_,c)=>(answers.reduce((s,a,q)=>s+weights[q][a][c],0)-moments[c].mean)/moments[c].sd);}
export function tieNoise(path,c){let x=Math.imul(path+1,1597334677)^Math.imul(c+1,3812015801);x=Math.imul(x^(x>>>16),2246822507);return ((x^(x>>>13))>>>0)/4294967296*1e-6;}
export function scoreAnswers(answers){const scores=scoresFor(answers),path=answers.reduce((n,a)=>n*5+a,0);let best=0;for(let c=1;c<12;c++)if(scores[c]+calibration[c]+tieNoise(path,c)>scores[best]+calibration[best]+tieNoise(path,best))best=c;return {code:codes[best],scores:Object.fromEntries(codes.map((c,i)=>[c,scores[i]]))};}
