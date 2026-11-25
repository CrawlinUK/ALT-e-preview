/* Independent LD-unit / TL-unit timing, with virtual time and no HTML rendering. */
"use strict";
const assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path"),vm=require("node:vm");
const read=p=>fs.readFileSync(path.join(__dirname,"..",p),"utf8"),scope={window:{}};
vm.createContext(scope);vm.runInContext(read("js/loading-intro.js"),scope);
const api=scope.window.ALTE_LOADING_INTRO;
assert.equal(api.formatTitle({bookId:"book1",unitNumber:1,unitTitle:"Hello!"}),"Unit 1 Hello!");
assert.equal(api.formatTitle({bookId:"categories",unitNumber:"",unitTitle:"Jobs"}),"Jobs");
function node(){const classes=new Set();return {classes,classList:{add:k=>classes.add(k)},remove(){this.removed=true}};}
function harness(){
 let now=0,nextId=1;const tasks=new Map(),screen=node(),overlay=node(),title={},introTitle={},label={};
 overlay.hidden=true;
 const document={getElementById:id=>({loadingScreen:screen,loadingTitle:title,titleOverlay:overlay,introTitle,loadingLabel:label})[id]};
 const intro=api.create({document,setTimer(fn,ms){const id=nextId++;tasks.set(id,{fn,time:now+ms});return id},clearTimer:id=>tasks.delete(id)});
 function advance(ms){const end=now+ms;while(true){const pending=[...tasks].filter(([,t])=>t.time<=end).sort((a,b)=>a[1].time-b[1].time)[0];if(!pending)break;now=pending[1].time;tasks.delete(pending[0]);pending[1].fn()}now=end;}
 return {intro,screen,overlay,title,introTitle,label,advance};
}
let h=harness();
h.intro.showTitle("Unit 1 Hello!");
assert.equal(h.title.textContent,h.introTitle.textContent);
assert.equal(h.overlay.hidden,false);
h.advance(500);h.intro.ready();
assert.equal(h.screen.removed,true,"fast load immediately reveals classroom");
assert.equal(h.overlay.removed,undefined);
h.advance(999);assert.equal(h.overlay.classes.has("title-fading"),false);
h.advance(1);assert.equal(h.overlay.classes.has("title-fading"),true);
h.advance(499);assert.equal(h.overlay.removed,undefined);
h.advance(1);assert.equal(h.overlay.removed,true);
h=harness();h.intro.showTitle("Jobs");h.advance(1500);
assert.equal(h.overlay.classes.has("title-fading"),true);
assert.equal(h.screen.removed,undefined,"slow load keeps loading screen visible");
h.advance(500);assert.equal(h.overlay.removed,true);assert.equal(h.title.textContent,"Jobs");
h.advance(3000);h.intro.ready();assert.equal(h.screen.removed,true);
h=harness();h.intro.showTitle("Unit 1 Hello!");h.advance(1750);h.intro.ready();
assert.equal(h.screen.removed,true);assert.equal(h.overlay.classes.has("title-fading"),true);
h.advance(250);assert.equal(h.overlay.removed,true);
h=harness();h.intro.showTitle("Unit 1 Hello!");h.advance(200);h.intro.error();h.advance(5000);h.intro.ready();
assert.equal(h.label.textContent,"Could not load");assert.equal(h.overlay.removed,true);assert.equal(h.screen.removed,undefined);
const html=read("unit.html");
assert.match(html,/transition: opacity \.5s ease/);assert.match(html,/#titleOverlay\s*\{[^}]*pointer-events: none;[^}]*transition: opacity \.5s ease/s);
assert.match(html,/id="loadingTitle" class="unit-intro-title"/);assert.match(html,/id="introTitle" class="unit-intro-title"/);
assert.match(read("css/classroom-corner-controls.css"),/--header-height: 0px/);
console.log("LD-unit and TL-unit: independent load, hold, fade and error checks passed.");
