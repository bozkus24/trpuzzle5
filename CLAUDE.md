# Harfle — proje notları

Türkçe Wordle. **Statik site, derleme adımı yok** — `index.html` tarayıcıda açılır ya da `python3 -m http.server` ile sunulur. Tamamen çevrimdışı çalışır (harici istek yok).

## Dosyalar
- `index.html` — tek sayfa; ekranlar overlay/section olarak (oyun, arşiv, nasıl-oynanır popup, ayarlar, sonuç modalı).
- `style.css` — koyu/açık tema (CSS değişkenleri: `:root` koyu, `body.light` açık, `body.cb` renk körü). Fredericka the Great fontu base64 `@font-face` ile **gömülü** (dosya bu yüzden büyük — normal).
- `game.js` — tüm oyun mantığı.
- `words.js` — **üretilen dosya, elle düzenleme.** `cevaplar.txt` + `kelimehavuzu.txt`'ten üretilir (aşağı bak).
- `cevaplar.txt` — ANSWERS: sorulabilecek gizli kelimeler.
- `kelimehavuzu.txt` — ACCEPTED: kabul edilen tahminler.
- `logo.png` — bar logosu (arka planı şeffaf).

## Kelime havuzu
`words.js` iki `.txt`'ten üretilir: `ANSWERS = cevaplar.txt`, `ACCEPTED = kelimehavuzu.txt ∪ cevaplar.txt` (her cevap tahmin edilebilir olsun diye birleşim). Tüm kelimeler **tam 5 harf, küçük harf, saf Türkçe alfabe**. Havuzu değiştirmek için `.txt`'leri düzenle, sonra ikisini oku → doğrula (5 harf/Türkçe/tekrarsız) → `const ANSWERS=[...]; const ACCEPTED=new Set([...])` olarak `words.js`'e yaz.

## Önemli davranışlar
- **Günlük kelime**: tarihe göre deterministik (ANSWERS'ın sabit tohumlu permütasyonu). `EPOCH = 2026-08-01` = Bulmaca #1; arşiv o günden başlar.
- **localStorage** (hepsi `trw-` önekli): `trw-<YYYY-MM-DD>` günlük durum `{word,guesses,done,win}`; `trw-stats`; `trw-theme`/`trw-cb`/`trw-osk`/`trw-hard`/`trw-howtoSeen`.
- **İstatistik yalnızca günlük oyunda güncellenir** (arşiv işlemez). İstatistik butonu her zaman **bugünün** ekranını gösterir; arşiv gününe girince **yalnızca o günün sonucu** (genel istatistik/paylaş yok). Modal render'ı `modalG` ile yapılır (`openStats` bugünü, `openResult` current'i gösterir).
- **Arayüzde emoji YOK; ikonlar inline SVG.** Tek istisna: paylaş metni klasik `🟩🟨⬜` kareleri içerir. **Sonuç/istatistik modalında hiç SVG olmamalı** (yalnızca metin).
- **Responsive**: kutucuk/tuş boyutları `min(px, vw, dvh)`; klavye tuşu `min-width:0` (11 harfli satır dar telefona sığsın). Değişiklikten sonra 360px (yatay taşma) ve 640px (kutucuk/klavye binmesi) kontrol et.

## Test (Playwright, kurulu)
`python3 -m http.server 8099` ile sun; Chromium: `/opt/pw-browsers/chromium-1194/chrome-linux/chrome` (`--no-sandbox`), `NODE_PATH=$(npm root -g)`. Oyun içi yardımcılar `page.evaluate` ile çağrılabilir: `handleKey('K')`, `current`, `scoreGuess(g,ans)`, `ACCEPTED`, `ANSWERS`.

## Artifact (canlı önizleme)
Tek dosya, kendi kendine yeten HTML: `<style>`+style.css+`</style>` → index.html (baştaki `<meta`/`<title`/`<link`/`<script src=` satırları çıkarılır, `src="logo.png"` base64 data URI ile değiştirilir) → `<script>`+words.js+game.js+`</script>`. Sabit artifact URL'sine yeniden yayınlanır.

## Git
Geliştirme dalı: `claude/turkish-wordle-game-76vyq2`. Değişiklikler PR ile `main`'e merge edilir.
