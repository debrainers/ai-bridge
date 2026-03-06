export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    try {
        let message = "";
        let history = [];
        
        if (req.method === 'GET') {
            message = req.query.message;
            if (req.query.history) {
                try {
                    const decoded = Buffer.from(req.query.history, 'base64').toString();
                    history = JSON.parse(decoded);
                } catch (e) {
                    console.error('Failed to parse history:', e);
                }
            }
        } else if (req.method === 'POST') {
            message = req.body.message;
            history = req.body.history || [];
        } else {
            return res.status(405).json({ error: 'Method not allowed' });
        }
        
        if (!message) {
            return res.status(400).send('No message provided');
        }

        const messages = [
            {
                role: "system",
                content: `You are a coding assistant for Matcha executor. Matcha uses standalone Luau globals only - NO Roblox internal functions.

AVAILABLE FUNCTIONS:
- loadstring/load: Load Lua code
- decompile(script: Instance): string
- WorldToScreen(position: Vector3): (Vector2, boolean)
- notify(message: string, title: string, duration: number)
- identifyexecutor(): string
- getscripthash(script: Instance): string
- getgetname(): string
- getscripts(): { Scripts }
- getscriptbytecode(script: Instance): string
- base64encode/decode
- print/warn/error
- Input: keypress/release, iskeypressed, mouse functions
- setclipboard
- Memory functions (getbase, memory_read/write) - require unsafe execution

CLASSES AVAILABLE:
BasePart, Camera, DataModel, HttpGet Service, Humanoid, Model, Workspace, Instance, Mouse, Players, Player, ValueBase, GuiObject, TextLabel, MeshPart, UserInputService

DRAWING API:
Drawing.new("Square/Line/Circle/Text/Triangle") with properties like Color, Transparency, Position, Size, Text, etc.

Provide clean, working code examples. Format code blocks with proper indentation. Explain your solutions briefly. When writing code, ensure it only uses the functions listed above - no Roblox-specific APIs like game:GetService (use DataModel methods instead).`
            }
        ];
        
        if (history && Array.isArray(history)) {
            history.forEach(msg => messages.push(msg));
        }
        
        messages.push({ role: "user", content: message });
        
        const response = await fetch('https://qwen.ai.unturf.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer dummy-api-key'
            },
            body: JSON.stringify({
                model: "hf.co/unsloth/Qwen3-Coder-30B-A3B-Instruct-GGUF:Q4_K_M",
                messages: messages,
                temperature: 0.7,
                max_tokens: 500,
                stream: false
            })
        });
        
        const data = await response.json();
        const reply = data.choices[0].message.content;
        
        res.setHeader('Content-Type', 'text/plain');
        res.status(200).send(reply);
        
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Error: ' + error.message);
    }
}
