const path = require("path");
const express = require("express");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: "2mb" }));
app.use(express.static(path.join(__dirname)));

app.post("/api/analyze-images", async (req, res) => {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return res.status(500).json({
      error: "Server missing OPENAI_API_KEY environment variable."
    });
  }

  const { prompt, images } = req.body || {};

  if (!prompt || !Array.isArray(images) || images.length === 0) {
    return res.status(400).json({
      error: "Request body must include prompt and non-empty images array."
    });
  }

  try {
    const input = [
      {
        role: "user",
        content: [
          {
            type: "input_text",
            text:
              "You are judging team-submitted images. Return the best matching team and concise reason. Prompt: " +
              String(prompt)
          },
          ...images.flatMap((item, idx) => {
            const chunks = [
              {
                type: "input_text",
                text: `Image ${idx + 1} team: ${item.team || `Team ${idx + 1}`}`
              }
            ];

            if (item.imageUrl) {
              chunks.push({
                type: "input_image",
                image_url: item.imageUrl
              });
            }

            return chunks;
          })
        ]
      }
    ];

    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || "gpt-4.1-mini",
        input
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      return res.status(502).json({ error: `OpenAI API error: ${errorText}` });
    }

    const data = await response.json();
    const analysis = data.output_text || "No analysis text returned.";

    return res.json({ analysis });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

app.get("*", (_req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
