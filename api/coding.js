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

        const matchaDocs = `You are a coding assistant for Matcha executor. Matcha uses STANDALONE LUAU GLOBALS ONLY - NO Roblox internal functions.

GLOBAL FUNCTIONS:
- loadstring(chunk: string, chunkname: string): function
- decompile(script: Instance): string
- WorldToScreen(position: Vector3): (Vector2, boolean)
- notify(message: string, title: string, duration: number)
- identifyexecutor(): string
- getscripthash(script: Instance): string
- getgetname(): string
- getscripts(): { Scripts }
- getscriptbytecode(script: Instance): string
- base64encode(data: string): string
- base64decode(data: string): string

INPUT FUNCTIONS:
- setrobloxinput(state: boolean): nil
- isrbxactive(): bool
- setclipboard(value: string): nil
- keyrelease(keycode: int): nil
- keypress(keycode: int): nil
- iskeypressed(keycode: int): bool
- ismouse1pressed(): bool
- ismouse2pressed(): bool
- mouse1press(): nil
- mouse1release(): nil
- mouse1click(): nil
- mouse2press(): nil
- mouse2release(): nil
- mouse2click(): nil
- mousemoveabs(x: int, y: int): nil
- mousemoverel(x: int, y: int): nil
- mousescroll(amount: int): nil

CONSOLE:
- print(message: string)
- warn(message: string)
- error(message: string)

MISCELLANEOUS:
- wait(time: number)
- spawn(target: function): nil
- task.spawn(target: function): nil
- task.wait(time: number)
- require(path: string): table

MEMORY (unsafe):
- getbase(): int
- memory_write(type: string, address: int, value: Any): nil
- memory_read(type: string, address: int): Any

CLASSES AVAILABLE:
BasePart, Camera, DataModel, HttpGet Service, Humanoid, Model, Workspace, Instance, Mouse, Players, Player, ValueBase, GuiObject, TextLabel, MeshPart, UserInputService

DRAWING API:
Drawing.new("Square/Line/Circle/Text/Triangle")
Properties: Color, Transparency, Visible, Position, ZIndex

IMPORTANT: When providing code examples, format them with \`\`\`lua code blocks. Make them copyable.`;

        const messages = [
            { role: "system", content: matchaDocs },
            ...history,
            { role: "user", content: message }
        ];
        
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
                max_tokens: 1000,
                stream: false
            })
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('API error:', response.status, errorText);
            return res.status(500).send('API error: ' + response.status);
        }
        
        const data = await response.json();
        let reply = data.choices[0].message.content;
        
        if (!reply.includes('```lua') && reply.includes('```')) {
            reply = reply.replace(/```/g, '```lua');
        }
        
        res.setHeader('Content-Type', 'text/plain');
        res.status(200).send(reply);
        
    } catch (error) {
        console.error('Server error:', error);
        res.status(500).send('Server error: ' + error.message);
    }
}
