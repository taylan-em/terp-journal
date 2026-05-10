export default async function handler(req, res) {
  const key = process.env.ANTHROPIC_API_KEY;
  res.json({ 
    hasKey: !!key, 
    keyStart: key ? key.substring(0,12) : 'missing'
  });
}
