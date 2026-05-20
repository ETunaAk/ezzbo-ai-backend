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

    if (!mesaj) {
      return res.status(400).json({
        error: "Mesaj boş olamaz.",
      });
    }

    const prompt = `
Sen bir flashcard deste oluşturucususun.

SADECE JSON döndür.
Markdown kullanma.
Açıklama yazma.

Kullanıcı açıkça yeni bir deste istemiyorsa:
{
  "action": "clarify",
  "message": "Nasıl bir deste oluşturmamı istediğini biraz daha açık yazar mısın?"
}

Kullanıcı deste istiyorsa:
{
  "action": "deck",
  "desteAdi": "Kısa ve uygun deste adı",
  "kartlar": [
    {
      "onYuz": "kelime veya terim",
      "arkaYuz": "anlamı"
    }
  ]
}

Kullanıcı mesajı:
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