const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function getGeminiRecommendation(prompt, apiKey) {
  const url =
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=" +
    ("AIzaSyAUkZrMfoQdvKl-GlebcOEEnvWemEiKE7Y" || process.env.GEMINI_API_KEY);
  const body = {
    contents: [{ parts: [{ text: prompt }] }],
  };

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error("Gemini API error: " + errText);
  }
  const data = await response.json();
  return (
    data.candidates?.[0]?.content?.parts?.[0]?.text || "Tidak ada rekomendasi"
  );
}

module.exports = { getGeminiRecommendation };
