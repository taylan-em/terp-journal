// Terp Journal — AI Proxy (DeepSeek via OpenAI-compatible format)
// Translates Anthropic-format requests from the app into DeepSeek API calls
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).end();

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    
    // Translate Anthropic format → OpenAI chat format
    const systemMsg = body.system || "You are a helpful assistant.";
    const userMessages = (body.messages || []).filter(m => m.role === "user").map(m => m.content).join("\n\n");
    
    const messages = [
      { role: "system", content: systemMsg },
      { role: "user", content: userMessages }
    ];

    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`,
      },
      body: JSON.stringify({
        model: body.model === "claude-haiku-4-5-20251001" ? "deepseek-chat" : "deepseek-chat",
        max_tokens: body.max_tokens || 600,
        messages: messages,
        temperature: body.temperature || 0.7,
      })
    });

    const data = await response.json();
    
    // Translate OpenAI response back to Anthropic format that the app expects
    const content = data.choices?.[0]?.message?.content || "";
    res.status(response.status).json({
      content: [{ type: "text", text: content }],
      model: data.model,
      usage: data.usage,
    });
  } catch(err) {
    res.status(500).json({ error: err.message });
  }
}
