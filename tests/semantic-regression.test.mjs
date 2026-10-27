import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const html=fs.readFileSync(process.argv[2]||new URL('../index.html',import.meta.url),'utf8');
let js=html.match(/<script>([\s\S]*?)<\/script>/)[1].split("'use strict';\nconst UI=")[0];
js+='\nglobalThis.Engine=Engine;';
const sandbox={console,Intl,TextDecoder,TextEncoder,Date,Map,Set,ArrayBuffer,Uint8Array,DataView,structuredClone};vm.createContext(sandbox);vm.runInContext(js,sandbox,{timeout:15000});const E=sandbox.Engine;
const table=(name,columns,entries)=>({name,rows:[columns,...entries]});
const model=[
 table('Processen',['Procescode','Procesnaam','Categorie'],[
 ['A01','Hoogtemelding','Incidentafhandeling'],['A02','Verloren lading','Incidentafhandeling'],['B01','Object- en tunnelbediening','Objectbediening'],['C01','Brand in tunnel','Incidentafhandeling'],['E01','Onderhoud','Technisch beheer']]),
 table('Contextactiviteiten',['Procescode','Activiteit-ID','Activiteit','Actor','Systemen','Fase','Volgende activiteit-ID'],[
 ['A01',1,'detecteer te hoog voertuig','WVL','Tunnelsysteem','aanmelding',2],
 ['A01',2,'presenteer alarm op videowand en geef akoestisch signaal','WVL','Videowand','aanmelding',3],
 ['A01',3,'sluit slagboom op aanwijzing van de melding hoog voertuig','WVL','Tunnelsysteem','afhandeling',''],
 ['A02',4,'detecteer verloren lading','WVL','CCTV','aanmelding',5],
 ['A02',5,'presenteer akoestisch alarm voor verloren lading','WVL','Videowand','aanmelding',''],
 ['B01',6,'pas de beelden op de videowand aan tijdens objectbediening','WVL','Videowand','afhandeling',7],
 ['B01',7,'open slagboom nadat het object is vrijgegeven','WVL','Tunnelsysteem','afhandeling',''],
 ['C01',8,'start ontruimen bij brand in de tunnel','WVL','Tunnelsysteem','afhandeling',9],
 ['C01',9,'sluit de slagboom na geverifieerde brandmelding','cWVL','Tunnelsysteem','afhandeling',''],
 ['E01',10,'informeer WVL wanneer onderhoud gereed is','Onderhoudsaannemer','Tunnelsysteem','afhandeling','']]),
 table('Assetallocatie',['Procescode','Activiteit-ID','Middel','Primair/Secundair'],[
 ['A01',2,'Videowand 2x3 46-inch monitoren','primair'],['B01',6,'Videowand 2x3 46-inch monitoren','primair'],
 ['A01',3,'Tunnelsysteem','primair'],['B01',7,'Tunnelsysteem','primair'],['C01',8,'Tunnelsysteem','primair'],['C01',9,'Tunnelsysteem','primair'],
 ['C01',8,'Muis','secundair'],['C01',9,'Muis','secundair'],['A01',2,'Muis','secundair'],['A02',5,'Muis','secundair'],['B01',6,'Muis','secundair']]),
 table('Chatbot Beslisregels',['Procescode','Activiteit-ID','ALS / conditie','DAN / vervolg-ID'],[
 ['A01',3,'Bij een hoog voertuig in roodfase',3],['B01',7,'Wanneer alle rijstroken vrij zijn',7],['C01',9,'Na geverifieerde brandmelding',9]])
];
E.init(model);
let a=E.ask('bij welke processen klinkt een alarm');
assert.equal(a.kind,'semanticAlarm');assert.equal(a.items.length,2);assert.ok(a.items.every(i=>/A01|A02/.test(i.title)));
console.log('1 PASS alarmprocessen',a.lead);
a=E.ask('en welke stappen?');assert.equal(a.kind,'semanticAlarmSteps');assert.equal(a.rows.length,2);assert.ok(a.items.every(x=>/alarm/.test(x.body)));console.log('2 PASS context',a.lead);
a=E.ask('welke asset is meest kritiek?');assert.equal(a.kind,'semanticCriticalAssets');assert.ok(!a.items.length||!a.items[0].title.toLowerCase().includes('muis'));assert.ok(a.warnings.length);console.log('3 PASS kriticiteit',a.items?.map(x=>x.title),a.warnings);
a=E.ask('fout ik zou verwachten dat de asset die op de meest veiligheid kritisch delen zit wordt getoond');assert.equal(a.kind,'feedback');console.log('4 PASS feedback intent');
a=E.ask('wanneer moet de wvl een slagboom bedienen');assert.equal(a.kind,'semanticBarrier');assert.ok(a.items.length>=2);assert.ok(a.items.every(x=>/slagboom/.test(x.body)));assert.ok(!a.items.some(x=>x.body.includes('onderhoud gereed')));console.log('5 PASS actor-action-object',a.lead);
a=E.ask('fout. de antwoorden lijken los te staan van vraag. Ik had verwacht dat hij zou opsommen in welk proces op welk moment de slagboom bediend moet worden,');assert.equal(a.kind,'feedback');console.log('6 PASS feedback 2');
a=E.ask('Als ik de videowand moet aanpassen. welke hoofd processen raak ik');assert.equal(a.kind,'semanticVideoImpact');assert.ok(a.items.some(x=>x.title.startsWith('A01')));assert.ok(a.items.some(x=>x.title.startsWith('B01')));assert.ok(a.kv[0][1].includes('Objectbediening'));console.log('7 PASS video impact',a.lead,a.kv);
a=E.ask('Ik had hier Incident management en objectbediening verwacht.');assert.equal(a.kind,'feedback');console.log('8 PASS feedback 3');
E.reset();a=E.ask('Wat is de eerste activiteit van A01?');assert.ok(a.items.length);let before=E.ctxInfo();let dry=E.ask('Welke activiteiten in A02?',{dry:true});assert.deepEqual(JSON.parse(JSON.stringify(E.ctxInfo())),JSON.parse(JSON.stringify(before)));console.log('9 PASS bestaande functionaliteit en dry-run');
console.log('9/9 tests PASS');