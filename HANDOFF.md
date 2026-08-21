# HANDOFF — Harfle

Ayrıntılı mimari için `CLAUDE.md`'ye bak. Bu dosya oturum devri içindir.

## Mevcut durum
- Çalışan, tamamlanmış statik oyun. Dal: `claude/turkish-wordle-game-76vyq2`.
- `main`'e **son merge PR #4** (`804d158`). Sonrasında dalda **3 commit merge edilmedi**:
  `b2a8906` (Nasıl Oynanır "?" kaldırma + "6 deneme içinde" + arşiv renkleri),
  `2256f5a` (bar sırası), `1daa7c4` (CLAUDE.md). → İstenirse yeni PR ile merge edilecek.
- Canlı önizleme (artifact) tek URL'de güncel tutuluyor.

## Tamamlanan işler (özet)
- Türkçe Wordle: günlük oyun + ~3 aylık arşiv (1 Ağustos 2026'dan).
- Kelime havuzu kullanıcının dosyalarından: `cevaplar.txt` (2788 gizli) + `kelimehavuzu.txt` (5586 kabul); `words.js` bunlardan üretildi.
- Açılışta "Nasıl Oynanır" popup ("Bir daha gösterme" + localStorage `howtoSeen`); YAKIT/TAKIM örneği.
- Ayarlar: Tema (Koyu/Açık dropdown), Zor mod, Renk körü modu, Ekran klavyesi — hepsi kalıcı.
- İstatistik: günün sonucu grid'i + genel istatistik + paylaş; arşiv oyunları istatistiğe işlemez; istatistik butonu hep bugünü gösterir.
- Arşiv: kazanan skor yeşil, kaybeden `X/6` kırmızı, ≥1 tahminli bitmemiş "Devam ediyor" (gri), girilmemiş boş.
- Görsel: "HARFLE" (gömülü Fredericka the Great, uppercase); büyük/responsive kutucuk+klavye; canlı sarı + koyu klavye; köşesiz kutucuklar; bar sırası Arşiv·İstatistikler·Nasıl Oynanır·Ayarlar.
- Emoji yok (ikonlar SVG); sonuç modalında SVG yok; paylaşımda `🟩🟨⬜`.

## Önemli kararlar
- **Çevrimdışı**: canlı TDK doğrulaması kaldırıldı; tahminler yalnızca yerel `ACCEPTED`'a göre.
- ANSWERS = cevaplar; ACCEPTED = kelimehavuzu ∪ cevaplar.
- Fredericka the Great fontu ve `logo.png` gömülü (CSP/çevrimdışı uyumu).
- Uzun ekranlarda blok üstte sıkışık, boşluk klavyenin altında (kullanıcı isteği).

## İlgili dosyalar
`index.html`, `style.css`, `game.js`, `words.js` (üretilen), `cevaplar.txt`, `kelimehavuzu.txt`, `logo.png`, `CLAUDE.md`.

## Bitmemiş / bilinen konular
- **Zaman dilimi**: günlük kelime cihazın *yerel* tarihine göre değişir; popup "Türkiye saati 00.00" diyor. TR dışı saat diliminde gün farklı başlar. Gerekirse Europe/Istanbul'a sabitlenmeli.
- **Zor mod** oyun ortasında açılıp kapanabiliyor (klasik Wordle ilk tahminden sonra kilitler). İstenirse kilitlenebilir.
- Kısa ekranlarda kontrol edildi (360/640); yine de yeni boyut değişikliklerinden sonra yatay taşma ve kutucuk/klavye binmesi tekrar test edilmeli.
- Bekleyen kullanıcı isteği yok.
