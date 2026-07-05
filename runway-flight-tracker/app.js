const airports = [
  ["ATL","Hartsfield–Jackson Atlanta International","Atlanta, GA"],["AUS","Austin–Bergstrom International","Austin, TX"],
  ["BOS","Boston Logan International","Boston, MA"],["BWI","Baltimore/Washington International","Baltimore, MD"],
  ["CLT","Charlotte Douglas International","Charlotte, NC"],["DCA","Ronald Reagan Washington National","Washington, DC"],
  ["DEN","Denver International","Denver, CO"],["DFW","Dallas Fort Worth International","Dallas, TX"],
  ["DTW","Detroit Metropolitan Wayne County","Detroit, MI"],["EWR","Newark Liberty International","Newark, NJ"],
  ["FLL","Fort Lauderdale–Hollywood International","Fort Lauderdale, FL"],["HNL","Daniel K. Inouye International","Honolulu, HI"],
  ["IAD","Washington Dulles International","Washington, DC"],["IAH","George Bush Intercontinental","Houston, TX"],
  ["JFK","John F. Kennedy International","New York, NY"],["LAS","Harry Reid International","Las Vegas, NV"],
  ["LAX","Los Angeles International","Los Angeles, CA"],["LGA","LaGuardia Airport","New York, NY"],
  ["MCO","Orlando International","Orlando, FL"],["MIA","Miami International","Miami, FL"],
  ["MSP","Minneapolis–Saint Paul International","Minneapolis, MN"],["ORD","O’Hare International","Chicago, IL"],
  ["PDX","Portland International","Portland, OR"],["PHL","Philadelphia International","Philadelphia, PA"],
  ["PHX","Phoenix Sky Harbor International","Phoenix, AZ"],["SAN","San Diego International","San Diego, CA"],
  ["SEA","Seattle–Tacoma International","Seattle, WA"],["SFO","San Francisco International","San Francisco, CA"],
  ["SLC","Salt Lake City International","Salt Lake City, UT"],["TPA","Tampa International","Tampa, FL"]
].map(([code,name,place]) => ({code,name,place}));

const destinations = [
  ["Los Angeles","LAX"],["Chicago","ORD"],["Miami","MIA"],["Seattle","SEA"],["Denver","DEN"],["Boston","BOS"],
  ["San Francisco","SFO"],["Atlanta","ATL"],["Dallas","DFW"],["Phoenix","PHX"],["Washington","DCA"],["Orlando","MCO"]
];
const airlines = [["Delta","DL"],["United","UA"],["American","AA"],["JetBlue","B6"],["Alaska","AS"],["Southwest","WN"],["Spirit","NK"]];
const airlineLogos = {
  DL: ["delta", "#e31837"],
  UA: ["unitedairlines", "#005daa"],
  AA: ["americanairlines", "#0078d2"],
  B6: ["jetblue", "#003876"],
  AS: ["alaskaairlines", "#01426a"],
  WN: ["southwestairlines", "#304cb2"],
  NK: ["spirit", "#231f20"],
  F9: ["frontierairlines", "#008c44"],
  HA: ["hawaiianairlines", "#5c2d91"],
  AC: ["aircanada", "#d8292f"]
};
const state = { airport: localStorage.getItem("runway-airport") || "JFK", direction: "departures", filter: "all", flights: {departures:[],arrivals:[]} };
const $ = (id) => document.getElementById(id);
const API_BASE = (window.RUNWAY_CONFIG?.apiBaseUrl || "").replace(/\/$/, "");

function seeded(text) {
  let n = [...text].reduce((a,c) => ((a << 5) - a + c.charCodeAt(0)) | 0, 0);
  return () => ((n = Math.imul(48271, n) | 0) >>> 0) / 4294967296;
}
function mockFlights(direction) {
  const rand = seeded(`${state.airport}${direction}${new Date().toDateString()}`);
  const now = Date.now();
  return Array.from({length: 18}, (_,i) => {
    const [city,code] = destinations[(i + Math.floor(rand()*destinations.length)) % destinations.length];
    const [airline,prefix] = airlines[Math.floor(rand()*airlines.length)];
    const scheduled = new Date(now + (i - 5) * 22 * 60000 + rand()*8*60000);
    const delay = rand() > .72 ? Math.floor(12 + rand()*55) : 0;
    const status = scheduled < new Date(now - 20*60000) ? "airborne" : delay ? "delayed" : "on-time";
    return { id: `${prefix}${100+Math.floor(rand()*8900)}${i}`, flight: `${prefix} ${100+Math.floor(rand()*8900)}`, airline, city, code,
      scheduled: scheduled.toISOString(), estimated: delay ? new Date(scheduled.getTime()+delay*60000).toISOString() : scheduled.toISOString(),
      terminal: String(1+Math.floor(rand()*8)), gate: `${["A","B","C","D"][Math.floor(rand()*4)]}${1+Math.floor(rand()*38)}`, status };
  }).sort((a,b) => new Date(a.scheduled)-new Date(b.scheduled));
}
function normalizeStatus(f) {
  const s = (f.status || "").toLowerCase();
  if (s.includes("cancel")) return "cancelled";
  if (s === "active" || s === "landed" || s === "airborne") return "airborne";
  if (s.includes("delay")) return "delayed";
  const planned = new Date(f.scheduled), expected = new Date(f.estimated || f.actual || f.scheduled);
  return expected - planned > 10*60000 ? "delayed" : "on-time";
}
async function loadFlights() {
  $("loading").hidden = false; $("flightList").innerHTML = "";
  let live = true;
  try {
    const responses = await Promise.all(["departures","arrivals"].map(d => fetch(`${API_BASE}/api/flights?airport=${state.airport}&direction=${d}`)));
    if (responses.some(r => !r.ok)) throw new Error();
    const data = await Promise.all(responses.map(r => r.json()));
    state.flights.departures = data[0].flights; state.flights.arrivals = data[1].flights;
  } catch {
    live = false;
    state.flights.departures = mockFlights("departures"); state.flights.arrivals = mockFlights("arrivals");
  }
  $("sourceLabel").textContent = live ? "Live flight data" : "Demo data";
  document.querySelector(".pulse").style.background = live ? "#79c789" : "#ed8b68";
  $("updated").textContent = `Updated ${new Date().toLocaleTimeString([], {hour:"numeric",minute:"2-digit"})}`;
  $("departureCount").textContent = state.flights.departures.length;
  $("arrivalCount").textContent = state.flights.arrivals.length;
  $("loading").hidden = true; renderFlights();
}
function formatTime(value) {
  if (!value) return "—";
  return new Date(value).toLocaleTimeString([], {hour:"2-digit",minute:"2-digit",hour12:false});
}
function renderFlights() {
  const list = state.flights[state.direction].filter(f => state.filter === "all" || normalizeStatus(f) === state.filter);
  $("empty").hidden = list.length > 0;
  $("flightList").innerHTML = list.map((f,i) => {
    const status = normalizeStatus(f), directionWord = state.direction === "departures" ? "To" : "From";
    const displayStatus = {"on-time":"On time","delayed":"Delayed","airborne": state.direction === "departures" ? "Departed" : "Arrived","cancelled":"Cancelled"}[status];
    const airlineCode = (f.flight || "").replace(/\s/g,"").match(/^[A-Z0-9]{2}/)?.[0] || "";
    const logo = airlineLogos[airlineCode];
    const logoHtml = logo
      ? `<span class="airline-logo" style="--brand:${logo[1]}"><img src="https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/${logo[0]}.svg" alt="${f.airline} logo" loading="lazy" onerror="this.parentElement.classList.add('logo-error')"><b>${airlineCode}</b></span>`
      : `<span class="airline-logo fallback"><b>${airlineCode || "✈"}</b></span>`;
    return `<article class="flight" style="animation-delay:${Math.min(i*25,250)}ms">
      <div class="time"><strong>${formatTime(f.estimated || f.actual || f.scheduled)}</strong><small>Sched. ${formatTime(f.scheduled)}</small></div>
      <div class="route"><strong>${f.city || "Destination unavailable"}</strong><small>${directionWord} · ${f.code || "—"}</small></div>
      <div class="flight-no">${logoHtml}<span>${f.flight}<small>${f.airline}</small></span></div>
      <div class="meta"><strong>${f.terminal || "—"} / ${f.gate || "—"}</strong><small>Terminal / Gate</small></div>
      <div class="status ${status}">${displayStatus}</div>
    </article>`;
  }).join("");
}
function selectAirport(code) {
  state.airport = code; localStorage.setItem("runway-airport", code);
  const airport = airports.find(a => a.code === code);
  $("iata").textContent = airport.code; $("airportName").textContent = airport.name; $("airportPlace").textContent = airport.place;
  $("airportSearch").value = ""; $("airportResults").classList.remove("open");
  loadFlights();
}
function searchAirports(query = "") {
  const q = query.trim().toLowerCase();
  const results = airports.filter(a => !q || `${a.code} ${a.name} ${a.place}`.toLowerCase().includes(q)).slice(0,8);
  $("airportResults").innerHTML = results.map(a => `<button class="airport-option" data-code="${a.code}" role="option"><b>${a.code}</b><span>${a.name}<small>${a.place}</small></span></button>`).join("");
  $("airportResults").classList.toggle("open", document.activeElement === $("airportSearch"));
}

$("airportSearch").addEventListener("input", e => searchAirports(e.target.value));
$("airportSearch").addEventListener("focus", e => searchAirports(e.target.value));
$("airportResults").addEventListener("click", e => { const b=e.target.closest("[data-code]"); if(b) selectAirport(b.dataset.code); });
$("clearSearch").addEventListener("click", () => { $("airportSearch").value=""; $("airportSearch").focus(); searchAirports(); });
document.addEventListener("click", e => { if(!e.target.closest(".airport-picker")) $("airportResults").classList.remove("open"); });
document.querySelectorAll(".tab").forEach(b => b.addEventListener("click", () => {
  document.querySelectorAll(".tab").forEach(x=>x.classList.remove("active")); b.classList.add("active"); state.direction=b.dataset.direction; renderFlights();
}));
document.querySelectorAll(".filter").forEach(b => b.addEventListener("click", () => {
  document.querySelectorAll(".filter").forEach(x=>x.classList.remove("active")); b.classList.add("active"); state.filter=b.dataset.filter; renderFlights();
}));
$("refresh").addEventListener("click", loadFlights);
setInterval(() => { $("clock").textContent = new Date().toLocaleString([], {weekday:"short",month:"short",day:"numeric",hour:"2-digit",minute:"2-digit",second:"2-digit"}); }, 1000);
selectAirport(state.airport);
