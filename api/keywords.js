export default async function handler(req, res) {
  const { seed, country } = req.query;

  const YT_KEY = process.env.AIzaSyBQMYbvAbmY7mDTsJtU-oDiSnetDDYVdmw;
  const GEMINI_KEY = process.env.AIzaSyDLMM3tos_wTvd1c-cBScDfosyRGRG9qN0;

  // 1. Get YouTube search results
  const yt = await fetch(
    `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&q=${seed}&regionCode=${country}&maxResults=10&key=${YT_KEY}`
  ).then(r => r.json());

  // Extract keywords
  const titles = yt.items.map(v => v.snippet.title);

  // 2. Ask Gemini to expand keywords
  const geminiPrompt = `
  From these YouTube titles:
  ${titles.join("\n")}

  Generate keyword ideas.
  Return JSON array with:
  keyword, niche, difficulty (Easy/Medium/Hard)
  `;

  const gemini = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: geminiPrompt }] }]
      })
    }
  ).then(r => r.json());

  let keywords;
  try {
    keywords = JSON.parse(
      gemini.candidates[0].content.parts[0].text
    );
  } catch {
    keywords = [];
  }

  res.status(200).json(keywords);
}
