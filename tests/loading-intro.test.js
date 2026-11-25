/* Loading intro: virtual time, fast and slow loads, failure and category titles. */
"use strict";
const assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path"),vm=require("node:vm");
const read=p=>fs.readFileSync(path.join(__dirname,"..",p),"utf8"),scope={window:{}};
vm.createContext(scope);vm.runInContext(read("js/loading-intro.js"),scope);
const api=scope.window.ALTE_LOADING_INTRO;
assert.equal(api.formatTitle({bookId:"book1",unitNumber:1,unitTitle:"Hello!"}),"Unit 1 Hello!");
assert.equal(api.formatTitle({bookId:"categories",unitNumber:"",unitTitle:"Jobs"}),"Jobs");
function harness(){
 let now=0,nextId=1;const tasks=new Map(),classes=new Set(),screen={classList:{add:k=>classes.add(k)},remove(){this.removed=true}},title={},label={};
 const document={getElementById:id=>({loadingScreen:screen,loadingTitle:title,loadingLabel:label})[id]};
 const intro=api.create({document,setTimer(fn,ms){const id=nextId++;tasks.set(id,{fn,time:now+ms});return id},clearTimer:id=>tasks.delete(id)});
 function advance(ms){const end=now+ms;while(true){const pending=[...tasks].filter(([,t])=>t.time<=end).sort((a,b)=>a[1].time-b[1].time)[0];if(!pending)break;now=pending[1].time;tasks.delete(pending[0]);pending[1].fn()}now=end;}
 return {intro,classes,screen,title,label,advance};
}
let h=harness();h.intro.showTitle("Unit 1 Hello!");h.advance(250);h.intro.ready();assert.equal(h.classes.has("loading-ready"),true);h.advance(1249);assert.equal(h.classes.has("loading-complete"),false);h.advance(1);assert.equal(h.classes.has("loading-complete"),true);h.advance(499);assert.equal(h.screen.removed,undefined);h.advance(1);assert.equal(h.screen.removed,true);
h=harness();h.intro.showTitle("Jobs");h.advance(3000);assert.equal(h.title.textContent,"Jobs");assert.equal(h.classes.has("loading-complete"),false);h.intro.ready();assert.equal(h.classes.has("loading-complete"),true);h.advance(500);assert.equal(h.screen.removed,true);
h=harness();h.intro.showTitle("Unit 1 Hello!");h.advance(200);h.intro.error();h.advance(5000);h.intro.ready();assert.equal(h.label.textContent,"Could not load");assert.equal(h.screen.removed,undefined);
assert.match(read("unit.html"),/transition: opacity \.5s ease/);assert.match(read("css/classroom-corner-controls.css"),/--header-height: 0px/);
console.log("Loading intro: title formatting, minimum hold, slow load, fade and errors passed.");
