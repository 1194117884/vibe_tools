export default async function handler(req, res) {
  try {
    const response = await fetch('https://zenquotes.io/api/random');
    const data = await response.json();
    res.status(200).json({ quote: data[0].q, author: data[0].a });
  } catch (e) {
    const fallbacks = [
      'The only way to do great work is to love what you do.',
      'Stay hungry, stay foolish.',
      'Less is more.',
      'Do one thing every day that scares you.',
      'Make it simple, but significant.',
      'Simplicity is the ultimate sophistication.',
      'Think different.',
      'Done is better than perfect.',
      'Believe you can and you are halfway there.',
      'It does not matter how slowly you go as long as you do not stop.',
    ];
    const pick = fallbacks[Math.floor(Math.random() * fallbacks.length)];
    res.status(200).json({ quote: pick, author: '' });
  }
}
