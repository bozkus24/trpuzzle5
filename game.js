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

/* Oyunun başlangıç günü — 1. bulmaca bu gün. */
const EPOCH = new Date(2026, 0, 1);           // 1 Ocak 2026
const ARCHIVE_DAYS = 92;                       // ~3 ay

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
const screens = ["home","howto","archive","game"];
function show(id){
  screens.forEach(s=>document.getElementById(s).classList.toggle("hidden", s!==id));
  if(id==="archive") buildArchive();
  if(id==="home") refreshHomeDate();
}
document.addEventListener("click", e=>{
  const t = e.target.closest("[data-go]");
  if(!t) return;
  const dest = t.getAttribute("data-go");
  if(dest==="game"){ startGame(new Date()); }
  else { closeModal(); show(dest); }
});

function refreshHomeDate(){
  const today=new Date();
  document.getElementById("home-date").textContent =
    `${formatTR(today)} · Bulmaca #${puzzleNo(today)+1}`;
}

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

  document.getElementById("game-sub").textContent =
    `${formatTR(d)} · #${puzzleNo(d)+1}`;
  const isToday = dayDiff(d,new Date())===0;
  document.getElementById("game-title").textContent = isToday ? "Günlük Oyun" : "Arşiv Oyunu";

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
      btn.textContent = k==="SIL" ? "⌫" : (k==="ENTER"?"GİR":k);
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
  if(document.getElementById("game").classList.contains("hidden")) return;
  if(!document.getElementById("overlay").classList.contains("hidden")) return;
  if(e.key==="Enter") handleKey("ENTER");
  else if(e.key==="Backspace") handleKey("SIL");
  else{
    const ch=up(e.key);
    if(ch.length===1 && TR_ALPHABET.includes(ch)) handleKey(ch);
  }
});

async function submitGuess(){
  if(current.input.length<COLS){ shake(); msg("Yeterli harf yok"); return; }
  const guess=current.input;
  const lower=guess.toLocaleLowerCase("tr-TR");
  const ok = ACCEPTED.has(lower) || await tdkCheck(lower);
  if(!ok){ shake(); msg("Kelime listede yok"); return; }

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
    const delay = COLS*160 + 400 + (win?600:0);
    if(win){ setTimeout(()=>document.querySelector(`.row[data-r="${r}"]`).classList.add("win"), COLS*160+300); }
    setTimeout(()=>openModal(true), delay+300);
  }
}

/* canlı TDK doğrulaması (çevrimiçiyken; engellenirse sessizce atlar) */
async function tdkCheck(word){
  try{
    const ctrl=new AbortController();
    const t=setTimeout(()=>ctrl.abort(),3500);
    const r=await fetch("https://sozluk.gov.tr/gts?ara="+encodeURIComponent(word),{signal:ctrl.signal});
    clearTimeout(t);
    if(!r.ok) return false;
    const data=await r.json();
    return Array.isArray(data) && data.length>0 && data[0].madde;
  }catch(e){ return false; }
}

/* ---------- geri bildirim ---------- */
const WIN_MSG = {
  1:["Efsane!","🏆"],2:["Muhteşem!","🌟"],3:["Harika!","🎉"],
  4:["Güzel iş!","👏"],5:["İyi!","🙂"],6:["Ucuz kurtuldun!","😅"]
};
function feedback(win, tries){
  if(win){ const [t,e]=WIN_MSG[tries]; return {emoji:e, title:t, text:`Kelimeyi ${tries}/6 denemede buldun.`}; }
  return {emoji:"😔", title:"Olmadı", text:`Bugünkü kelime: ${current.word}`};
}

/* ---------- popup + paylaş ---------- */
function openModal(justFinished){
  const fb=feedback(current.win, current.guesses.length);
  document.getElementById("modal-emoji").textContent=fb.emoji;
  document.getElementById("modal-title").textContent=fb.title;
  document.getElementById("modal-text").textContent=fb.text;
  document.getElementById("share-preview").textContent=buildShareText();
  document.getElementById("copied-toast").classList.add("hidden");
  document.getElementById("overlay").classList.remove("hidden");
}
function closeModal(){ document.getElementById("overlay").classList.add("hidden"); }

function buildShareText(){
  const no=puzzleNo(current.date)+1;
  const tries=current.win?current.guesses.length:"X";
  let out=`TDK Wordle #${no} ${tries}/6\n${formatTR(current.date)}\n\n`;
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
    let status="▶️", pegs="";
    if(st && st.done){
      if(st.win){ status=""; pegs=`<span class="pegs">🟩 ${st.guesses.length}/6</span>`; }
      else { status=""; pegs=`<span class="pegs">❌ X/6</span>`; }
    }
    item.innerHTML=`
      <div>
        <div class="a-date">${formatTR(d)}${isToday?'<span class="badge-today">BUGÜN</span>':''}</div>
        <div class="a-num">Bulmaca #${puzzleNo(d)+1}</div>
      </div>
      <div class="a-status">${pegs||status}</div>`;
    item.addEventListener("click",()=>startGame(d));
    list.appendChild(item);
  }
}

/* ---------- başlat ---------- */
refreshHomeDate();
show("home");
