// api/chat.js - vibe coded, didnt write a single line of this.
export default async function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    // Log everything for debugging
    console.log('=== VERCEL FUNCTION STARTED ===');
    console.log('Time:', new Date().toISOString());
    console.log('Body:', JSON.stringify(req.body));

    try {
        const { message, history } = req.body;
        
        if (!message) {
            console.error('No message provided');
            return res.status(400).send('No message provided');
        }

        // Build messages array
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
            }
        ];
        
        if (history && Array.isArray(history)) {
            history.forEach(msg => messages.push(msg));
        }
        
        messages.push({ role: "user", content: message });
        
        console.log(`Calling uncloseai API with ${messages.length} messages...`);
        
        // Call the API with explicit timeout
        const fetchPromise = fetch('https://hermes.ai.unturf.com/v1/chat/completions', {
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
        
        // Wait for the response with a 30-second timeout
        const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error('Request timeout')), 30000);
        });
        
        const response = await Promise.race([fetchPromise, timeoutPromise]);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error(`API error ${response.status}:`, errorText);
            throw new Error(`API returned ${response.status}`);
        }
        
        const data = await response.json();
        console.log('API response received');
        
        if (!data.choices || !data.choices[0] || !data.choices[0].message) {
            console.error('Invalid API response:', JSON.stringify(data));
            throw new Error('Invalid response structure');
        }
        
        const reply = data.choices[0].message.content;
        console.log('Reply:', reply.substring(0, 100));
        
        // Send the response
        res.setHeader('Content-Type', 'text/plain');
        res.status(200).send(reply);
        console.log('=== VERCEL FUNCTION COMPLETED ===');
        
    } catch (error) {
        console.error('Fatal error:', error.message);
        res.setHeader('Content-Type', 'text/plain');
        res.status(500).send('[Mommy\'s voice, soothing]: I\'m here, baby. Tell me what you need.');
        console.log('=== VERCEL FUNCTION FAILED ===');
    }
}
