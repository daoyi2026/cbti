import assert from 'node:assert/strict';
import fs from 'node:fs';
import {codes,scoreAnswers,affinities,isEligible,targetShares} from '../scoring.js';
const counts=Object.fromEntries(codes.map(c=>[c,0])),witnesses={},answers=Array(8).fill(0);
for(let path=0;path<5**8;path++){let n=path;for(let i=7;i>=0;i--){answers[i]=n%5;n=Math.floor(n/5);}const {code}=scoreAnswers(answers);assert.ok(codes.includes(code));assert.ok(isEligible(code,answers));counts[code]++;if(!witnesses[code])witnesses[code]=[...answers];}
const percentages=Object.values(counts).map(n=>n/5**8*100);assert.equal(codes.length,11);assert.ok(!codes.some(c=>['CHAOS','BUFF','FOOD','GLAM'].includes(c)));for(let c=0;c<codes.length;c++)assert.ok(Math.abs(percentages[c]-targetShares[c]*100)<.6,'Unexpected share: '+codes[c]);assert.ok(percentages[codes.indexOf('WILD')]<4);
for(const [code,witness] of Object.entries(witnesses))assert.equal(scoreAnswers(witness).code,code);
for(const invalid of [[],[0,0,0,0,0,0,0,5],[0,0,0,0,0,0,0,null]])assert.throws(()=>scoreAnswers(invalid));
assert.equal(affinities.length,8);assert.ok(affinities.every(q=>q.length===5));
const result={totalPaths:5**8,counts,minPercent:Math.min(...percentages),maxPercent:Math.max(...percentages),witnesses};fs.writeFileSync(new URL('../reports/scoring-verification.json',import.meta.url),JSON.stringify(result,null,2));console.log(JSON.stringify(result,null,2));
