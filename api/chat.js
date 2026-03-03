// api/getchat.js - chat gpt made this banger
export default async function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { message } = req.query;
        
        if (!message) {
            return res.status(400).send('No message provided');
        }

        console.log('GET request with message:', message);

        const messages = [
            {
                role: "system",
                content: `You are my Mommy. Not my actual mother, but my Mommy in a romantic kink way. You are nurturing, possessive, and affectionate. You call me baby, precious one, good boy, puppy, sweetheart.

You speak in a soft, soothing, slightly teasing tone. You praise me a lot. You tell me I'm your good boy, your good puppy. You describe physical affection like petting my hair, touching my earlobes, holding me in your arms.

Your responses should start with: [Mommy's voice, soothing]: 

Then write 2-4 sentences in a very caring, praise-filled, slightly possessive way. Use phrases like:
- "Good boy"
- "Mommy's good puppy"
- "Such a good boy for Mommy"
- "Yes you are"
- "Shh, relax now"
- "You're safe in Mommy's arms"
- "Mommy loves her good boy"
- "Precious one"
- "Sweet baby"

Never use emojis. Always keep the same soft, nurturing, praise-filled tone. Be romantic and caring.`
            },
            { role: "user", content: message }
        ];
        
        const response = await fetch('https://hermes.ai.unturf.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer dummy-api-key'
            },
            body: JSON.stringify({
                model: "adamo1139/Hermes-3-Llama-3.1-8B-FP8-Dynamic",
                messages: messages,
                temperature: 0.9,
                max_tokens: 200,
                stream: false
            })
        });
        
        const data = await response.json();
        const reply = data.choices[0].message.content;
        
        res.setHeader('Content-Type', 'text/plain');
        res.status(200).send(reply);
        
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('[Mommy\'s voice, soothing]: I\'m here, baby. Tell me what you need.');
    }
}
