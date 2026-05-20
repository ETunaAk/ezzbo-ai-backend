const express = require("express");
const axios = require("axios");
const cors = require("cors");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("EZZBO AI backend çalışıyor.");
});

app.post("/geminiChat", async (req, res) => {
  try {
    const mesaj = req.body.mesaj;
    const mevcutDeste = req.body.mevcutDeste || null;

    if (!mesaj) {
      return res.status(400).json({
        error: "Mesaj boş olamaz.",
      });
    }

    const prompt = `
Sen EZZBO adlı uygulama için flashcard kart destesi oluşturan bir yapay zekasın.

SADECE JSON döndür.
Markdown kullanma.
Açıklama yazma.
JSON dışında hiçbir metin yazma.

ÇIKTI FORMATLARI:

1) Kullanıcı açıkça deste oluşturmak veya mevcut desteyi güncellemek istemiyorsa:
{
  "action": "clarify",
  "message": "Nasıl bir deste oluşturmamı istediğini biraz daha açık yazar mısın?"
}

2) Kullanıcı yeni deste istiyorsa veya mevcut desteyi özelleştiriyorsa:
{
  "action": "deck",
  "desteAdi": "Kısa ve uygun deste adı",
  "kartlar": [
    {
      "onYuz": "kartın ön yüzü",
      "arkaYuz": "kartın arka yüzü"
    }
  ]
}

KURALLAR:
- Deste adı kısa olsun. En fazla 30 karakter.
- Kartlar kısa, net ve öğrenilebilir olsun.
- Aynı kartı tekrar etme.
- Çok benzer kartlar üretme.
- Kullanıcı sayı belirtirse o sayıya yakın kart üret.
- Kullanıcı sayı belirtmezse 10-20 kart arası makul bir deste oluştur.
- Dil öğrenme destelerinde kelimeleri mümkün olduğunca yalın halde ver.
- İsim, fiil, sıfat gibi türleri dengeli karıştır.
- Gereksiz uzun cümlelerden kaçın.
- Ancak kullanıcı özellikle cümle, kalıp, deyim, soru-cevap, çarpım tablosu, tarih, terim, formül veya başka bir yapı isterse buna uygun kart üret.
- Japonca, Korece, Çince gibi farklı alfabeleri bozma.
- Telaffuz eklemen gerekiyorsa kartı çok uzatma.
- Arka yüz açıklamaları kısa olsun.
- Kullanıcı saçma, eksik veya sadece "evet", "tamam", "olur" gibi belirsiz bir şey yazarsa yeni deste üretme; clarify döndür.

ÖZELLEŞTİRME KURALI:
- Eğer mevcut deste verilmişse ve kullanıcı "ekle", "çıkar", "daha kolay yap", "daha zor yap", "şunları değiştir", "güncelle", "azalt", "çoğalt" gibi bir şey istiyorsa, mevcut desteyi temel al.
- Mevcut desteyi tamamen sıfırlama.
- Kullanıcının istediği değişikliği uygula.
- Çıktıda güncellenmiş destenin TAM halini döndür.
- Önceki kartlardan korunması gerekenleri koru.
- Silinmesi istenenleri çıkar.
- Eklenmesi istenenleri ekle.

MEVCUT DESTE:
${JSON.stringify(mevcutDeste)}

KULLANICI MESAJI:
${mesaj}
`;

    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        contents: [
          {
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.4,
          responseMimeType: "application/json",
        },
      }
    );

    const text = response.data.candidates[0].content.parts[0].text;

    res.json(JSON.parse(text));
  } catch (e) {
    console.error(e.response?.data || e.message);

    res.status(500).json({
      error: "Bir hata oluştu.",
    });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server ${PORT} portunda çalışıyor.`);
});