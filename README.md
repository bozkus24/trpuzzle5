# Harfle — Türkçe Kelime Oyunu

Her gün yeni bir Türkçe **5 harfli** kelimeyi **6 denemede** bulmaya çalıştığın,
tamamen Türkçe bir kelime oyunu. Kelimeler TDK sözlüğündeki gerçek kelimelerden
derlenmiştir.

## Özellikler
- 🎯 **Günlük Oyun** — her gün tek, herkese aynı ve öncekilerden benzersiz bir kelime.
- 📖 **Nasıl Oynanır?** — renk ipuçlarının anlatıldığı rehber.
- 🗄️ **Arşiv** — son ~3 ayın günleri ("3 Ağustos Pazartesi 2026" formatında); geçmiş günleri oynayabilirsin.
- ✨ Tahmin animasyonla açılır; oyun bitince önce küçük bir kutlama popup'ı (İnanılmaz / Çok iyi / Fena değil / ehh / maalesef başaramadın) çıkar.
- 📊 **İstatistik ekranı** — oynanan, galibiyet %, seri galibiyet, seri rekoru ve tahmin dağılımı grafiği.
- 📤 **Paylaş** — mobilde native paylaşım (WhatsApp vb. direkt açılır); sonucu 🟩🟨⬛ emojili görsel olarak paylaşır/kopyalar.
- Türkçe klavye ve doğru büyük/küçük harf (i/İ, ı/I) desteği.
- ~2250 kabul edilen kelime; çevrimiçiyken bilinmeyen tahminler için canlı **TDK** doğrulaması (engellenirse gömülü listeye düşer).

## Çalıştırma
Kurulum gerektirmez. `index.html` dosyasını tarayıcıda aç — ya da:

```bash
python3 -m http.server 8000
# tarayıcıda: http://localhost:8000
```

## Dosyalar
- `index.html` — ekranlar (ana menü, nasıl oynanır, arşiv, oyun, paylaş popup'ı)
- `style.css` — koyu tema arayüz
- `game.js` — oyun mantığı, günlük kelime seçimi, arşiv, paylaşım
- `words.js` — TDK'dan derlenmiş 5 harfli kelime listeleri (gizli havuz + kabul listesi)
