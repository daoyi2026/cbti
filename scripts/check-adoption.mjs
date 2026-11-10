import assert from 'node:assert/strict';
import fs from 'node:fs';
import {adoptionCats,drawAdoption,drawnCatCard} from '../adoptions.js';
const pool=adoptionCats.filter(c=>c.singleCat&&c.listingStatus==='listed-awaiting');assert.equal(pool.length,5);
for(let i=0;i<pool.length;i++){assert.equal(drawAdoption(()=>(i+.5)/pool.length).id,pool[i].id);assert.ok(drawnCatCard(pool[i]).includes(pool[i].image));assert.ok(pool[i].url.endsWith(pool[i].id+'.html'));}
assert.ok(!pool.some(c=>c.id==='3732270'),'A multi-cat record cannot be treated as one cat');
for(const value of [-.1,1,NaN])assert.throws(()=>drawAdoption(()=>value));
const states=adoptionCats.map(c=>c.listingStatus);adoptionCats.forEach(c=>c.listingStatus='adopted');assert.equal(drawAdoption(()=>0),null);adoptionCats.forEach((c,i)=>c.listingStatus=states[i]);
const report={eligibleSingleCatRecords:pool.map(c=>({id:c.id,name:c.name,url:c.url})),uniformPool:true,adoptedRecordsExcluded:true,emptyPoolReturnsNull:true,realTimeAvailabilityConfirmed:false};fs.writeFileSync(new URL('../reports/adoption-check.json',import.meta.url),JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));
