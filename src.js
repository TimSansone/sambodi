const stadiums = {
  "Newcastle United": "St. James’ Park", "Nottingham Forest": "The City Ground",
  "Ipswich Town": "Portman Road", Fulham: "Craven Cottage",
  "AFC Bournemouth": "Vitality Stadium", "Manchester City": "Etihad Stadium",
  Brentford: "Gtech Community Stadium", "Brighton & Hove Albion": "Amex Stadium",
  Arsenal: "Emirates Stadium", "Crystal Palace": "Selhurst Park",
  "Manchester United": "Old Trafford", Everton: "Hill Dickinson Stadium",
  Sunderland: "Stadium of Light", Chelsea: "Stamford Bridge",
  "Leeds United": "Elland Road", "Tottenham Hotspur": "Tottenham Hotspur Stadium",
  "Hull City": "MKM Stadium", "Aston Villa": "Villa Park", "Coventry City": "Coventry Building Society Arena"
};

const rawFixtures = [
  ["2026-08-23","16:30","Newcastle United","A",true],["2026-08-29","15:00","Nottingham Forest","H"],
  ["2026-09-05","15:00","Ipswich Town","A"],["2026-09-12","15:00","Fulham","H"],["2026-09-19","15:00","AFC Bournemouth","A"],
  ["2026-10-10","15:00","Manchester City","H"],["2026-10-17","15:00","Brentford","A"],["2026-10-24","15:00","Brighton & Hove Albion","H"],["2026-10-31","15:00","Arsenal","H"],
  ["2026-11-07","15:00","Crystal Palace","A"],["2026-11-21","15:00","Manchester United","H"],["2026-11-28","15:00","Everton","A"],
  ["2026-12-02","20:00","Sunderland","H"],["2026-12-05","15:00","Chelsea","A"],["2026-12-12","15:00","Leeds United","H"],["2026-12-19","15:00","Tottenham Hotspur","H"],["2026-12-26","15:00","Hull City","A"],["2026-12-30","20:00","Aston Villa","A"],
  ["2027-01-02","15:00","Coventry City","H"],["2027-01-06","20:00","Sunderland","A"],["2027-01-16","15:00","Crystal Palace","H"],["2027-01-23","15:00","Manchester United","A"],["2027-01-30","15:00","Everton","H"],
  ["2027-02-06","15:00","Arsenal","A"],["2027-02-10","20:00","Coventry City","A"],["2027-02-20","15:00","Hull City","H"],["2027-02-27","15:00","Tottenham Hotspur","A"],
  ["2027-03-03","20:00","Aston Villa","H"],["2027-03-13","15:00","Ipswich Town","H"],["2027-03-20","15:00","Fulham","A"],
  ["2027-04-10","15:00","Newcastle United","H"],["2027-04-17","15:00","Nottingham Forest","A"],["2027-04-24","15:00","Leeds United","A"],
  ["2027-05-01","15:00","Chelsea","H"],["2027-05-08","15:00","Manchester City","A"],["2027-05-15","15:00","Brentford","H"],["2027-05-23","15:00","Brighton & Hove Albion","A"],["2027-05-30","16:00","AFC Bournemouth","H"]
];

const colors = ["#196f3d","#d9a52e","#1f5aa6","#621b82","#d34b31","#2d6374"];
const initials = name => name.split(/\s|&/).filter(Boolean).map(x=>x[0]).slice(0,2).join("");
const crestFiles = {
  "Liverpool":"Liverpool", "Arsenal":"Arsenal", "Aston Villa":"Aston-Villa",
  "AFC Bournemouth":"AFC-Bournemouth", "Brentford":"Brentford",
  "Brighton & Hove Albion":"Brighton", "Chelsea":"Chelsea",
  "Crystal Palace":"Crystal-Palace", "Everton":"Everton", "Fulham":"Fulham",
  "Leeds United":"Leeds-United", "Manchester City":"Manchester-City",
  "Manchester United":"Manchester-United", "Newcastle United":"Newcastle-United",
  "Nottingham Forest":"Nottingham-Forest", "Tottenham Hotspur":"Tottenham-Hotspur",
  "Sunderland":"Sunderland", "Ipswich Town":"Ipswich-Town",
  "Hull City":"Hull-City", "Coventry City":"Coventry-City"
};
const leagueFixtures = rawFixtures.map((f,i)=>({
  id:i+1,date:f[0],time:f[1],opponent:f[2],home:f[3]==="H",confirmed:!!f[4],competition:"Premier League",
  venue:f[3]==="H"?"Anfield":stadiums[f[2]]
}));
const extraFixtures = [
  ["2026-07-25","22:00","Sunderland",false,"Friendly","Geodis Park",true,"Pre-season"],
  ["2026-07-29","23:30","Wrexham",false,"Friendly","Yankee Stadium",true,"Pre-season"],
  ["2026-08-02","20:00","Leeds United",false,"Friendly","Soldier Field",true,"Pre-season"],
  ["2026-08-09","13:30","Monaco",true,"Friendly","Anfield",true,"Pre-season"],
  ["2026-08-16","17:00","Como",true,"Friendly","Anfield",true,"Pre-season"],
  ["2026-09-08","TBC","Opponent TBD",false,"Champions League","Venue TBC",false,"League phase • Matchday 1"],
  ["2026-10-13","TBC","Opponent TBD",false,"Champions League","Venue TBC",false,"League phase • Matchday 2"],
  ["2026-10-20","TBC","Opponent TBD",false,"Champions League","Venue TBC",false,"League phase • Matchday 3"],
  ["2026-11-03","TBC","Opponent TBD",false,"Champions League","Venue TBC",false,"League phase • Matchday 4"],
  ["2026-11-24","TBC","Opponent TBD",false,"Champions League","Venue TBC",false,"League phase • Matchday 5"],
  ["2026-12-08","TBC","Opponent TBD",false,"Champions League","Venue TBC",false,"League phase • Matchday 6"],
  ["2027-01-19","TBC","Opponent TBD",false,"Champions League","Venue TBC",false,"League phase • Matchday 7"],
  ["2027-01-27","TBC","Opponent TBD",false,"Champions League","Venue TBC",false,"League phase • Matchday 8"],
  ["2026-09-14","TBC","Opponent TBD",false,"Carabao Cup","Venue TBC",false,"Round three • Week commencing 14 Sep"],
  ["2027-01-09","TBC","Opponent TBD",false,"FA Cup","Venue TBC",false,"Third round • 9/10 Jan"]
].map((f,i)=>({id:39+i,date:f[0],time:f[1],opponent:f[2],home:f[3],competition:f[4],venue:f[5],confirmed:f[6],round:f[7]}));
const fixtures = [...leagueFixtures,...extraFixtures].sort((a,b)=>a.date.localeCompare(b.date));
const dateFmt = d => new Intl.DateTimeFormat("en-GB",{weekday:"short",day:"numeric",month:"short"}).format(new Date(`${d}T12:00:00`));
const monthFmt = d => new Intl.DateTimeFormat("en-GB",{month:"long",year:"numeric"}).format(new Date(`${d}T12:00:00`));

let state={view:"fixtures",scope:"all",competition:"all",query:"",selected:null,month:"all"};

function crest(name, big=false){
  const c=colors[[...name].reduce((a,x)=>a+x.charCodeAt(0),0)%colors.length];
  const file=crestFiles[name];
  return `<span class="crest ${big?"big":""}" style="--club:${c}" title="${name}">
    <span class="crest-fallback">${initials(name)}</span>
    ${file?`<img src="./assets/crests/${file}.png" alt="${name} crest" onerror="this.style.display='none'">`:""}
  </span>`;
}

function header(){
  return `<header>
    <a class="brand" href="#" aria-label="Red Calendar home"><span class="mark">RC</span><span>RED CALENDAR<small>LIVERPOOL • 2026/27</small></span></a>
    <nav><button data-view="fixtures" class="${state.view==="fixtures"?"active":""}">Fixtures</button><button data-view="players" class="${state.view==="players"?"active":""}">Players</button></nav>
    <div class="head-actions"><button class="icon-btn" aria-label="Search" id="focusSearch">⌕</button><span class="avatar">JM</span></div>
  </header>`;
}

function fixtureCard(f){
 return `<article class="fixture-card" data-id="${f.id}">
   <div class="match-no">${f.round||f.competition}<span class="${f.confirmed?"confirmed":""}">${f.confirmed?"CONFIRMED":"DRAW PENDING"}</span></div>
   <div class="match-main">
    <div class="date-block"><strong>${dateFmt(f.date).split(" ")[1]}</strong><span>${dateFmt(f.date).split(" ").slice(2).join(" ")}</span><small>${dateFmt(f.date).split(" ")[0].toUpperCase()}</small></div>
    <div class="teams">
      <div class="team"><span>Liverpool</span>${crest("Liverpool")}</div>
      <div class="versus"><strong>${f.time}</strong><span>UK TIME</span></div>
      <div class="team away">${crest(f.opponent)}<span>${f.opponent}</span></div>
    </div>
    <div class="venue"><span class="pin">⌖</span><div><strong>${f.venue==="Venue TBC"?"TBC":f.home?"HOME":"AWAY"}</strong><span>${f.venue}</span></div></div>
    <button class="arrow" aria-label="Open match details">→</button>
   </div>
 </article>`;
}

function fixturesView(){
 const months=[...new Set(fixtures.map(f=>monthFmt(f.date)))];
 const competitions=["Premier League","Friendly","Champions League","FA Cup","Carabao Cup"];
 let list=fixtures.filter(f=>(state.scope==="all"||(state.scope==="home"&&f.home)||(state.scope==="away"&&!f.home))&&(state.competition==="all"||f.competition===state.competition)&&(state.month==="all"||monthFmt(f.date)===state.month)&&f.opponent.toLowerCase().includes(state.query.toLowerCase()));
 const groups=Object.groupBy?Object.groupBy(list,f=>monthFmt(f.date)):list.reduce((a,f)=>((a[monthFmt(f.date)]??=[]).push(f),a),{});
 return `<main>
   <section class="hero"><div><p class="eyebrow">PREMIER LEAGUE • 2026/27</p><h1>Every match.<br><em>One season.</em></h1><p class="intro">Follow Liverpool through all 38 league fixtures — from the first whistle at St. James’ Park to the final day at Anfield.</p></div>
   <div class="season-card"><span>SEASON OPENER</span><div class="opener-crests">${crest("Newcastle United",true)}<i></i>${crest("Liverpool",true)}</div><strong>NEWCASTLE <b>vs</b> LIVERPOOL</strong><p>23 AUG • 16:30 • ST. JAMES’ PARK</p><small>54 DAYS TO GO</small></div></section>
   <section class="competition-bar"><button data-competition="all" class="${state.competition==="all"?"active":""}">All competitions</button>${competitions.map(x=>`<button data-competition="${x}" class="${state.competition===x?"active":""}">${x==="Friendly"?"Pre-season":x}</button>`).join("")}<a href="https://www.premierleague.com/en/tables/premier-league" target="_blank" rel="noreferrer">League table ↗</a></section>
   <section class="toolbar"><div class="tabs">${["all","home","away"].map(x=>`<button data-scope="${x}" class="${state.scope===x?"active":""}">${x}</button>`).join("")}</div>
   <div class="filters"><label class="search">⌕<input id="search" value="${state.query}" placeholder="Search opponent"></label><select id="month"><option value="all">All months</option>${months.map(m=>`<option ${state.month===m?"selected":""}>${m}</option>`).join("")}</select></div></section>
   <div class="list-head"><span>${list.length} FIXTURES & SCHEDULED ROUNDS</span><span>All confirmed times shown in UK time</span></div>
   <section class="fixture-list">${Object.entries(groups).map(([m,fs])=>`<div class="month-label"><span>${m}</span><i></i></div>${fs.map(fixtureCard).join("")}`).join("")||`<div class="empty">No fixtures match those filters.</div>`}</section>
 </main>`;
}

function playersView(){
 const metrics=[["Appearances","0"],["Goals","0"],["Assists","0"],["Minutes","0"]];
 return `<main><section class="player-hero"><p class="eyebrow">SQUAD PERFORMANCE</p><h1>Player <em>statistics.</em></h1><p class="intro">Season totals and match-by-match contributions will appear here as the campaign unfolds.</p></section>
  <section class="stat-strip">${metrics.map(([a,b])=>`<div><span>${a}</span><strong>${b}</strong></div>`).join("")}</section>
  <section class="player-table"><div class="table-title"><div><p class="eyebrow">2026/27 PREMIER LEAGUE</p><h2>Individual stats</h2></div><span class="live-pill">PRE-SEASON</span></div>
  <div class="table-head"><span>PLAYER</span><span>APP</span><span>MIN</span><span>G</span><span>A</span><span>RATING</span></div>
  <div class="blank-state"><div class="ball">◉</div><h3>The numbers start at kickoff</h3><p>The registered squad and individual match stats will populate when official 2026/27 Premier League data becomes available.</p></div></section>
 </main>`;
}

function drawer(f){
 if(!f)return "";
 return `<div class="scrim" data-close><aside class="drawer">
  <button class="close" data-close>×</button><p class="eyebrow">${f.competition} • ${f.confirmed?"CONFIRMED":"DRAW PENDING"}</p>
  <div class="drawer-date">${dateFmt(f.date)} • ${f.time} UK</div>
  <div class="scoreboard"><div>${crest("Liverpool",true)}<strong>Liverpool</strong></div><span>VS<small>NOT STARTED</small></span><div>${crest(f.opponent,true)}<strong>${f.opponent}</strong></div></div>
  <div class="location"><span>⌖</span><div><small>${f.home?"HOME":"AWAY"} VENUE</small><strong>${f.venue}</strong></div></div>
  <div class="detail-tabs"><button class="active">Overview</button><button>Match stats</button><button>Players</button></div>
  <div class="waiting"><div class="pulse">↗</div><h3>Match centre opens on the day</h3><p>Live score, possession, shots, xG, lineups and individual player performance will all live here.</p></div>
  ${f.time==="TBC"?`<div class="draw-note">Fixture details will update after the draw.</div>`:`<button class="calendar-btn" id="downloadIcs">＋ Add to calendar</button>`}
 </aside></div>`;
}

function render(){
 document.querySelector("#app").innerHTML=header()+(state.view==="fixtures"?fixturesView():playersView())+drawer(state.selected)+`<footer><span>RED CALENDAR</span><p>Built for the season ahead. YNWA.</p><small>Fixture dates and kick-off times may change.</small></footer>`;
 bind();
}

function bind(){
 document.querySelectorAll("[data-view]").forEach(b=>b.onclick=()=>{state.view=b.dataset.view;state.selected=null;render()});
  document.querySelectorAll("[data-scope]").forEach(b=>b.onclick=()=>{state.scope=b.dataset.scope;render()});
 document.querySelectorAll("[data-competition]").forEach(b=>b.onclick=()=>{state.competition=b.dataset.competition;render()});
 document.querySelectorAll(".fixture-card").forEach(c=>c.onclick=()=>{state.selected=fixtures.find(f=>f.id==c.dataset.id);render()});
 document.querySelectorAll("[data-close]").forEach(x=>x.onclick=e=>{if(e.target===x){state.selected=null;render()}});
 document.querySelector("#search")?.addEventListener("input",e=>{
   state.query=e.target.value;
   render();
   const search=document.querySelector("#search");
   search?.focus();
   search?.setSelectionRange(state.query.length,state.query.length);
 });
 document.querySelector("#month")?.addEventListener("change",e=>{state.month=e.target.value;render()});
 document.querySelector("#focusSearch")?.addEventListener("click",()=>document.querySelector("#search")?.focus());
 document.querySelector("#downloadIcs")?.addEventListener("click",()=>{
   const f=state.selected, dt=f.date.replaceAll("-","")+`T${f.time.replace(":","")}00`;
   const ics=`BEGIN:VCALENDAR\nVERSION:2.0\nBEGIN:VEVENT\nDTSTART:${dt}\nSUMMARY:Liverpool vs ${f.opponent}\nLOCATION:${f.venue}\nEND:VEVENT\nEND:VCALENDAR`;
   const a=document.createElement("a");a.href=URL.createObjectURL(new Blob([ics],{type:"text/calendar"}));a.download=`liverpool-${f.opponent.toLowerCase().replaceAll(" ","-")}.ics`;a.click();
 });
}
render();
