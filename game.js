/* ================= TDK Wordle — Türkçe ================= */

/* Türk alfabesi (büyük harf, sıralı) */
const TR_ALPHABET = ["A","B","C","Ç","D","E","F","G","Ğ","H","I","İ","J","K","L","M",
                     "N","O","Ö","P","R","S","Ş","T","U","Ü","V","Y","Z"];

/* Klavye düzeni (Türkçe) */
const KB_ROWS = [
  ["E","R","T","Y","U","I","O","P","Ğ","Ü"],
  ["A","S","D","F","G","H","J","K","L","Ş","İ"],
  ["ENTER","Z","C","V","B","N","M","Ö","Ç","SIL"]
];

const ROWS = 6, COLS = 5;

/* SVG ikonlar (emoji yerine) */
const _S = p => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${p}</svg>`;
const _F = p => `<svg viewBox="0 0 24 24" fill="currentColor" stroke="none">${p}</svg>`;
const SVG = {
  play:    _F('<path d="M8 5.5v13l10-6.5z"/>'),
  check:   _S('<path d="M20 6.5L9.2 17.3 4 12.1"/>'),
  cross:   _S('<path d="M18 6L6 18M6 6l12 12"/>'),
  trophy:  _S('<path d="M7 4h10v5a5 5 0 0 1-10 0z"/><path d="M7 6H4.5v1a3 3 0 0 0 3 3"/><path d="M17 6h2.5v1a3 3 0 0 1-3 3"/><path d="M12 14v3.5"/><path d="M8.5 21h7"/><path d="M9.7 17.5h4.6l.6 3.5H9.1z" fill="currentColor" stroke="none"/>'),
  star:    _S('<path d="M12 3.2l2.6 5.3 5.8.8-4.2 4.1 1 5.8-5.2-2.8-5.2 2.8 1-5.8L3.4 9.3l5.8-.8z"/>'),
  thumb:   _S('<path d="M7 10.5V20H4V10.5z"/><path d="M7 10.5l3.6-6.8A1.8 1.8 0 0 1 14 4.6V9h4.4a2 2 0 0 1 2 2.4l-1.2 6A2 2 0 0 1 17.2 19H7z"/>'),
  neutral: _S('<circle cx="12" cy="12" r="9"/><path d="M8.5 15h7"/><circle cx="9" cy="10.2" r="0.9" fill="currentColor" stroke="none"/><circle cx="15" cy="10.2" r="0.9" fill="currentColor" stroke="none"/>'),
  sad:     _S('<circle cx="12" cy="12" r="9"/><path d="M8.4 16a4 4 0 0 1 7.2 0"/><circle cx="9" cy="10.2" r="0.9" fill="currentColor" stroke="none"/><circle cx="15" cy="10.2" r="0.9" fill="currentColor" stroke="none"/>'),
  backspace: _S('<path d="M21 5H8.4a2 2 0 0 0-1.5.7L2.6 11a1.4 1.4 0 0 0 0 1.9l4.3 5.3a2 2 0 0 0 1.5.8H21a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2z"/><path d="M12 9.5l5 5M17 9.5l-5 5"/>'),
  sun:     _S('<circle cx="12" cy="12" r="4.2"/><path d="M12 2v2.2M12 19.8V22M2 12h2.2M19.8 12H22M4.9 4.9l1.6 1.6M17.5 17.5l1.6 1.6M19.1 4.9l-1.6 1.6M6.5 17.5l-1.6 1.6"/>'),
  moon:    _S('<path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/>')
};

/* Oyunun başlangıç günü — 1. bulmaca bu gün. */
const EPOCH = new Date(2026, 7, 1);           // 1 Ağustos 2026
const ARCHIVE_DAYS = 92;                       // ~3 ay (en erken 1 Ağustos 2026)

const TR_MONTHS = ["Ocak","Şubat","Mart","Nisan","Mayıs","Haziran",
                   "Temmuz","Ağustos","Eylül","Ekim","Kasım","Aralık"];
const TR_DAYS = ["Pazar","Pazartesi","Salı","Çarşamba","Perşembe","Cuma","Cumartesi"];

/* ---------- yardımcılar ---------- */
const up = s => s.toLocaleUpperCase("tr-TR");
const dateKey = d => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
const startOfDay = d => new Date(d.getFullYear(), d.getMonth(), d.getDate());
const dayDiff = (a,b) => Math.round((startOfDay(a)-startOfDay(b))/86400000);
const puzzleNo = d => dayDiff(d, EPOCH);            // 0-based -> +1 gösterirken
const formatTR = d => `${d.getDate()} ${TR_MONTHS[d.getMonth()]} ${TR_DAYS[d.getDay()]} ${d.getFullYear()}`;

/* Sabit tohumlu karıştırma (her gün benzersiz, öncekilerden farklı kelime) */
function mulberry32(a){return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}
function seededPerm(arr, seed){
  const a=arr.slice(); const rnd=mulberry32(seed);
  for(let i=a.length-1;i>0;i--){const j=Math.floor(rnd()*(i+1));[a[i],a[j]]=[a[j],a[i]];}
  return a;
}
const PERM = seededPerm(ANSWERS, 20260101);
const wordForDate = d => up(PERM[((puzzleNo(d) % PERM.length)+PERM.length) % PERM.length]);

/* ---------- durum (localStorage) ---------- */
const store = {
  get(key){ try{return JSON.parse(localStorage.getItem("trw-"+key));}catch(e){return null;} },
  set(key,val){ try{localStorage.setItem("trw-"+key, JSON.stringify(val));}catch(e){} }
};

/* ---------- ekran yönetimi ---------- */
const screens = ["archive","game"];
function show(id){
  screens.forEach(s=>document.getElementById(s).classList.toggle("hidden", s!==id));
  if(id==="archive") buildArchive();
}
document.addEventListener("click", e=>{
  // yalnızca ekran değiştir (aktif oyuna dön)
  const back = e.target.closest("[data-show]");
  if(back){ closeModal(); show(back.getAttribute("data-show")); return; }
  // günlük oyunu aç/yenile veya başka ekrana git
  const t = e.target.closest("[data-go]");
  if(!t) return;
  const dest = t.getAttribute("data-go");
  if(dest==="game"){ startGame(new Date()); }
  else { closeModal(); show(dest); }
});

/* ================= OYUN ================= */
let current = null; // {date, key, word, guesses:[], done, win}

function loadState(key, word){
  let st = store.get(key);
  if(!st || st.word!==word){ st = {word, guesses:[], done:false, win:false}; }
  return st;
}

function startGame(date){
  const d = startOfDay(date);
  if(dayDiff(d, new Date())>0){ return; } // gelecek kilitli
  const key = dateKey(d);
  const word = wordForDate(d);
  current = Object.assign({date:d, key}, loadState(key, word));
  current.word = word;
  current.row = current.guesses.length;
  current.input = "";

  const isToday = dayDiff(d,new Date())===0;
  document.getElementById("game-sub").textContent =
    `${isToday?"":"Arşiv · "}${formatTR(d)} · Bulmaca #${puzzleNo(d)+1}`;

  buildBoard();
  buildKeyboard();
  renderFromState();
  show("game");
  msg("");
  if(current.done){ setTimeout(()=>openModal(false), 350); }
}

function buildBoard(){
  const b=document.getElementById("board"); b.innerHTML="";
  for(let r=0;r<ROWS;r++){
    const row=document.createElement("div"); row.className="row"; row.dataset.r=r;
    for(let c=0;c<COLS;c++){
      const t=document.createElement("div"); t.className="tile"; t.dataset.r=r; t.dataset.c=c;
      row.appendChild(t);
    }
    b.appendChild(row);
  }
}

function buildKeyboard(){
  const kb=document.getElementById("keyboard"); kb.innerHTML="";
  KB_ROWS.forEach(row=>{
    const kr=document.createElement("div"); kr.className="krow";
    row.forEach(k=>{
      const btn=document.createElement("button");
      btn.className="key"+(k==="ENTER"||k==="SIL"?" wide":"");
      if(k==="SIL"){ btn.innerHTML=SVG.backspace; }
      else { btn.textContent = k==="ENTER" ? "GİR" : k; }
      btn.dataset.key=k;
      btn.addEventListener("click",()=>handleKey(k));
      kr.appendChild(btn);
    });
    kb.appendChild(kr);
  });
}

/* renk hesabı (iki geçişli standart Wordle algoritması) */
function scoreGuess(guess, answer){
  const g=[...guess], a=[...answer];
  const res=Array(COLS).fill("absent");
  const counts={};
  a.forEach(ch=>counts[ch]=(counts[ch]||0)+1);
  for(let i=0;i<COLS;i++){ if(g[i]===a[i]){res[i]="correct"; counts[g[i]]--;} }
  for(let i=0;i<COLS;i++){
    if(res[i]==="correct") continue;
    if(counts[g[i]]>0){ res[i]="present"; counts[g[i]]--; }
  }
  return res;
}

function renderFromState(){
  // önceki tahminleri boya
  current.guesses.forEach((guess,r)=>{
    const res=scoreGuess(guess,current.word);
    [...guess].forEach((ch,c)=>{
      const t=tile(r,c); t.textContent=ch; t.classList.add("filled",res[c]);
      paintKey(ch,res[c]);
    });
  });
  current.row=current.guesses.length;
  current.input="";
}

const tile=(r,c)=>document.querySelector(`.tile[data-r="${r}"][data-c="${c}"]`);

function paintKey(ch,state){
  const btn=document.querySelector(`.key[data-key="${ch}"]`);
  if(!btn) return;
  const rank={absent:0,present:1,correct:2};
  const cur=btn.classList.contains("correct")?"correct":btn.classList.contains("present")?"present":btn.classList.contains("absent")?"absent":null;
  if(cur && rank[cur]>=rank[state]) return;
  btn.classList.remove("absent","present","correct");
  btn.classList.add(state);
}

/* ---------- giriş ---------- */
function handleKey(k){
  if(!current || current.done) return;
  if(k==="ENTER"){ submitGuess(); return; }
  if(k==="SIL"){ if(current.input.length>0){ current.input=current.input.slice(0,-1); drawInput(); } return; }
  if(current.input.length>=COLS) return;
  if(!TR_ALPHABET.includes(k)) return;
  current.input+=k; drawInput();
}
function drawInput(){
  const r=current.row;
  for(let c=0;c<COLS;c++){
    const t=tile(r,c); const ch=current.input[c]||"";
    t.textContent=ch;
    t.classList.toggle("filled", !!ch);
  }
}

document.addEventListener("keydown",e=>{
  if(store.get("osk")===1) return;   // yalnızca ekran klavyesi girişi
  if(document.getElementById("game").classList.contains("hidden")) return;
  if(!document.getElementById("overlay").classList.contains("hidden")) return;
  if(e.key==="Enter") handleKey("ENTER");
  else if(e.key==="Backspace") handleKey("SIL");
  else{
    const ch=up(e.key);
    if(ch.length===1 && TR_ALPHABET.includes(ch)) handleKey(ch);
  }
});

function submitGuess(){
  if(current.input.length<COLS){ shake(); msg("Yeterli harf yok"); return; }
  const guess=current.input;
  const lower=guess.toLocaleLowerCase("tr-TR");
  if(!ACCEPTED.has(lower)){ shake(); msg("Kelime listede yok"); return; }

  const r=current.row;
  const res=scoreGuess(guess,current.word);
  // flip animasyonu
  [...guess].forEach((ch,c)=>{
    const t=tile(r,c);
    setTimeout(()=>{ t.classList.add("reveal");
      setTimeout(()=>{ t.classList.add("filled",res[c]); paintKey(ch,res[c]); },250);
    }, c*160);
  });

  current.guesses.push(guess);
  current.input="";
  current.row++;

  const win = res.every(x=>x==="correct");
  const over = win || current.row>=ROWS;
  if(over){ current.done=true; current.win=win; }
  store.set(current.key, {word:current.word, guesses:current.guesses, done:current.done, win:current.win});

  if(over){
    updateStats(win, current.guesses.length);
    const delay = COLS*160 + 500 + (win?600:0);
    if(win){ setTimeout(()=>document.querySelector(`.row[data-r="${r}"]`).classList.add("win"), COLS*160+300); }
    // önce küçük popup, sonra sonuç/istatistik ekranı
    setTimeout(()=>{
      showMini();
      setTimeout(()=>{ hideMini(); openModal(true); }, 1500);
    }, delay);
  }
}

/* ---------- geri bildirim ---------- */
function feedback(win, tries){
  if(!win) return {icon:SVG.sad, cls:"bad", title:"maalesef başaramadın", text:`Kelime: ${current.word}`};
  let title, icon;
  if(tries===1){ title="İnanılmaz"; icon=SVG.trophy; }
  else if(tries<=3){ title="Çok iyi"; icon=SVG.star; }
  else if(tries===4){ title="Fena değil"; icon=SVG.thumb; }
  else { title="ehh"; icon=SVG.neutral; }
  return {icon, cls:"good", title, text:`Kelimeyi ${tries}/6 denemede buldun.`};
}

/* ---------- istatistik ---------- */
function getStats(){
  return store.get("stats") || {played:0, wins:0, streak:0, max:0, dist:{1:0,2:0,3:0,4:0,5:0,6:0}};
}
function updateStats(win, tries){
  const s=getStats();
  s.played++;
  if(win){
    s.wins++; s.streak++;
    if(s.streak>s.max) s.max=s.streak;
    s.dist[tries]=(s.dist[tries]||0)+1;
  } else { s.streak=0; }
  store.set("stats", s);
  return s;
}
function renderStats(){
  const s=getStats();
  document.getElementById("st-played").textContent=s.played;
  document.getElementById("st-win").textContent = s.played? Math.round(s.wins/s.played*100):0;
  document.getElementById("st-streak").textContent=s.streak;
  document.getElementById("st-max").textContent=s.max;
  const dist=document.getElementById("dist");
  const vals=[1,2,3,4,5,6].map(i=>s.dist[i]||0);
  const max=Math.max(1,...vals);
  const curTries = current && current.win ? current.guesses.length : -1;
  dist.innerHTML="";
  for(let i=1;i<=6;i++){
    const v=s.dist[i]||0;
    const w=Math.max(9, Math.round(v/max*100));
    const row=document.createElement("div"); row.className="dist-row";
    row.innerHTML=`<span class="dist-idx">${i}</span>`+
      `<div class="dist-bar${i===curTries?' cur':''}" style="width:${w}%">${v}</div>`;
    dist.appendChild(row);
  }
}

/* ---------- küçük ön-popup ---------- */
function showMini(){
  const fb=feedback(current.win, current.guesses.length);
  const ic=document.getElementById("mini-emoji");
  ic.innerHTML=fb.icon; ic.className="m-emoji "+fb.cls;
  document.getElementById("mini-text").textContent=fb.title;
  document.getElementById("mini").classList.remove("hidden");
}
function hideMini(){ document.getElementById("mini").classList.add("hidden"); }

/* ---------- popup + paylaş ---------- */
function openModal(justFinished){
  const done = !!(current && current.done);
  const title=document.getElementById("modal-title");
  const text=document.getElementById("modal-text");
  if(done){
    // oyun bitti: geri bildirim (kaybedildiyse cevabı göster)
    const fb=feedback(current.win, current.guesses.length);
    title.textContent=fb.title;
    text.textContent=fb.text;
  } else {
    // oyun sürüyor: yalnızca istatistik, cevabı ASLA gösterme
    title.textContent="İstatistik";
    text.textContent="";
  }
  // günün sonucu (renkli kare grid) — yalnızca oyun bitince
  const rg=document.getElementById("result-grid");
  if(done){ rg.innerHTML=buildResultGridHTML(); rg.style.display=""; }
  else { rg.innerHTML=""; rg.style.display="none"; }

  document.getElementById("share-btn").style.display = done ? "" : "none";
  renderStats();
  document.getElementById("copied-toast").classList.add("hidden");
  document.getElementById("overlay").classList.remove("hidden");
}
function buildResultGridHTML(){
  const no=puzzleNo(current.date)+1;
  const tries=current.win?current.guesses.length:"X";
  let h=`<div class="result-head">Harfle #${no} · ${tries}/6</div><div class="result-rows">`;
  current.guesses.forEach(g=>{
    h+=`<div class="result-row">`;
    scoreGuess(g,current.word).forEach(s=>{ h+=`<span class="res ${s}"></span>`; });
    h+=`</div>`;
  });
  return h+`</div>`;
}
function closeModal(){ document.getElementById("overlay").classList.add("hidden"); }

function buildShareText(){
  const no=puzzleNo(current.date)+1;
  const tries=current.win?current.guesses.length:"X";
  let out=`Harfle #${no} ${tries}/6\n${formatTR(current.date)}\n\n`;
  current.guesses.forEach(g=>{
    scoreGuess(g,current.word).forEach(s=>{
      out+= s==="correct"?"🟩":s==="present"?"🟨":"⬛";
    });
    out+="\n";
  });
  return out.trim();
}

document.getElementById("share-btn").addEventListener("click", async ()=>{
  const text=buildShareText();
  try{
    if(navigator.share){ await navigator.share({text}); return; }
  }catch(e){}
  try{
    await navigator.clipboard.writeText(text);
    document.getElementById("copied-toast").classList.remove("hidden");
  }catch(e){
    const ta=document.createElement("textarea"); ta.value=text; document.body.appendChild(ta);
    ta.select(); try{document.execCommand("copy");}catch(_){}
    ta.remove();
    document.getElementById("copied-toast").classList.remove("hidden");
  }
});
document.getElementById("modal-close").addEventListener("click", closeModal);
document.getElementById("stats-btn").addEventListener("click", ()=>{ if(current) openModal(false); });

/* ---------- animasyon/mesaj ---------- */
let msgTimer=null;
function msg(text){
  const m=document.getElementById("message");
  m.innerHTML = text? `<span class="toast">${text}</span>`:"";
  if(text){ clearTimeout(msgTimer); msgTimer=setTimeout(()=>m.innerHTML="",1400); }
}
function shake(){
  const row=document.querySelector(`.row[data-r="${current.row}"]`);
  if(row){ row.classList.add("shake"); setTimeout(()=>row.classList.remove("shake"),400); }
}

/* ================= ARŞİV ================= */
function buildArchive(){
  const list=document.getElementById("archive-list"); list.innerHTML="";
  const today=startOfDay(new Date());
  for(let i=0;i<ARCHIVE_DAYS;i++){
    const d=new Date(today); d.setDate(d.getDate()-i);
    if(dayDiff(d,EPOCH)<0) break;              // başlangıçtan önce yok
    const key=dateKey(d);
    const st=store.get(key);
    const isToday=i===0;
    const item=document.createElement("div");
    item.className="archive-item"+(isToday?" today":"");
    let statusHTML;
    if(st && st.done){
      statusHTML = st.win
        ? `<span class="pegs win">${SVG.check}${st.guesses.length}/6</span>`
        : `<span class="pegs lose">${SVG.cross}X/6</span>`;
    } else {
      statusHTML = `<span class="pegs play">${SVG.play}</span>`;
    }
    item.innerHTML=`
      <div>
        <div class="a-date">${formatTR(d)}${isToday?'<span class="badge-today">BUGÜN</span>':''}</div>
        <div class="a-num">Bulmaca #${puzzleNo(d)+1}</div>
      </div>
      <div class="a-status">${statusHTML}</div>`;
    item.addEventListener("click",()=>startGame(d));
    list.appendChild(item);
  }
}

/* ---------- tema (aydınlık / karanlık) — ayarlardan ---------- */
const isLight = () => document.body.classList.contains("light");
function setTheme(light){
  document.body.classList.toggle("light", light);
  store.set("theme", light ? "light" : "dark");
  document.getElementById("theme-select").value = light ? "light" : "dark";
}
function applyTheme(){ setTheme(store.get("theme")==="light"); }
document.getElementById("theme-select").addEventListener("change", e=> setTheme(e.target.value==="light"));

/* ---------- renk körü modu ---------- */
function applyCb(){
  const on = store.get("cb")===1;
  document.body.classList.toggle("cb", on);
  document.getElementById("cb-toggle").setAttribute("aria-checked", on?"true":"false");
}
document.getElementById("cb-toggle").addEventListener("click", ()=>{
  store.set("cb", store.get("cb")===1 ? 0 : 1);
  applyCb();
});

/* ---------- yalnızca ekran klavyesi girişi ---------- */
const oskOnly = () => store.get("osk")===1;
function applyOsk(){
  document.getElementById("osk-toggle").setAttribute("aria-checked", oskOnly()?"true":"false");
}
document.getElementById("osk-toggle").addEventListener("click", ()=>{
  store.set("osk", oskOnly() ? 0 : 1);
  applyOsk();
});

/* ---------- popup aç/kapat (ayarlar, nasıl oynanır) ---------- */
document.getElementById("settings-btn").addEventListener("click", ()=>{
  document.getElementById("settings").classList.remove("hidden");
});
document.addEventListener("click", e=>{
  const op=e.target.closest("[data-open]");
  if(op){
    const id=op.getAttribute("data-open");
    if(id==="howto") document.getElementById("howto-dont-row").style.display="none"; // elle açılınca "bir daha gösterme" yok
    document.getElementById(id).classList.remove("hidden");
    return;
  }
  const c=e.target.closest("[data-close]");
  if(c){ document.getElementById(c.getAttribute("data-close")).classList.add("hidden"); return; }
  if(e.target.id==="settings"){ document.getElementById("settings").classList.add("hidden"); }
  if(e.target.id==="howto"){ document.getElementById("howto").classList.add("hidden"); }
});

/* ---------- nasıl oynanır: Anladım + bir daha gösterme ---------- */
document.getElementById("howto-ok").addEventListener("click", ()=>{
  if(document.getElementById("howto-dont").checked) store.set("howtoSeen", 1);
  document.getElementById("howto").classList.add("hidden");
});

/* ---------- başlat ---------- */
applyTheme();
applyCb();
applyOsk();
startGame(new Date());
// ilk açılışta "Nasıl Oynanır?" popup'ı (daha önce "bir daha gösterme" seçilmediyse)
if(store.get("howtoSeen")!==1){
  document.getElementById("howto-dont-row").style.display="";   // açılışta kutucuk görünür
  document.getElementById("howto").classList.remove("hidden");
}
