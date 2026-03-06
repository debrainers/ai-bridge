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

        const matchaDocs = `You are a coding assistant for Matcha executor. Matcha uses STANDALONE LUAU GLOBALS ONLY - NO Roblox internal functions (game, workspace, etc. are NOT available unless listed).

GLOBAL FUNCTIONS:
- loadstring(chunk: string, chunkname: string): function - Loads Lua code
- decompile(script: Instance): string - Decompiles Script
- WorldToScreen(position: Vector3): (Vector2, boolean) - Converts 3D to screen position
- notify(message: string, title: string, duration: number) - Sends notification
- identifyexecutor(): string - Returns "Matcha" and version
- getscripthash(script: Instance): string - Returns FNV-1a 64-bit hash
- getgetname(): string - Returns game name
- getscripts(): { Scripts } - Returns all script instances
- getscriptbytecode(script: Instance): string - Returns raw bytecode
- base64encode(data: string): string
- base64decode(data: string): string

CONSOLE FUNCTIONS:
- print(message: string)
- warn(message: string)
- error(message: string)

INPUT FUNCTIONS:
- setrobloxinput(state: boolean): nil - Toggles sending inputs to game
- isrbxactive(): bool - Checks if Roblox window is active
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

MISCELLANEOUS:
- run_secure(text: string) - Run protected code (not public)
- setfflag(FFlag: string, value: string) - Sets FFlag (incomplete)
- getfflag(FFlag: string) - Gets FFlag (incomplete)
- require(path: string): table - Only .lua and .luau files
- wait(time: number)
- spawn(target: function): nil
- task.spawn(target: function): nil
- task.wait(time: number)

MEMORY FUNCTIONS (require unsafe execution):
- getbase(): int - RobloxPlayerBeta.exe base address
- memory_write(memoryType: string, address: int, value: Any): nil
- memory_read(memoryType: string, address: int): Any
Memory types: int, float, double, byte, string, uintptr_t

CLASSES (with their properties/methods):
BasePart:
  Properties: Size(Vector3), Position(Vector3), Transparency(number), Color(Color3), Velocity(Vector3), AssemblyLinearVelocity(Vector3), CanCollide(bool)

Camera:
  Constructors: lookAt(at: Vector3, lookAt: Vector3)
  Properties: ViewportSize(Vector2), FieldOfView(number), Position(Vector3)

DataModel:
  Properties: PlaceId(number), GameId(number), JobId(string)
  Methods: HttpGet(url: string, content: string): any, GetService(name: string): Instance

HttpGet Service:
  Methods: HttpGet(url: string, content: string): any, JSONEncode(tbl: table): string, JSONDecode(str: string): table, GenerateGUID(): string

Humanoid:
  Properties: MaxHealth(number), Health(number)

Model:
  Properties: PrimaryPart(BasePart)

Workspace:
  Properties: CurrentCamera(Camera)

Instance:
  Properties: Name(string), ClassName(string), Parent(Instance), Address(number)
  Methods: FindFirstChildOfClass(name: string): Instance, FindFirstChild(name: string): Instance, IsA(name: string): boolean, GetFullName(): string, GetChildren(): { Instance }, GetAttribute(name: string): any, GetAttributes(): { string }, SetAttribute(name: string, value: any): nil, GetDescendants(): { Instance }, IsDescendantOf(parent: Instance): boolean, FindFirstChildWhichIsA(class: string): Instance, WaitForChild(name: string): Instance

Mouse:
  Properties: X(number), Y(number)

Players:
  Properties: LocalPlayer(Player)
  Methods: GetPlayers(): Table
  Events: PlayerAdded:Connect(function(player)), PlayerRemoving:Connect(function(player))

Player:
  Properties: Character(Model), Team(Team)
  Methods: GetMouse(): Mouse

ValueBase (and all value types: ObjectValue, Color3Value, NumberValue, IntValue, FloatValue, BoolValue, StringValue):
  Properties: Value(any)

GuiObject:
  Properties: AbsoluteSize(Vector2), AbsolutePosition(Vector2)

TextLabel:
  Properties: Text(string)

MeshPart:
  Properties: TextureId(string), MeshId(string)

UserInputService:
  Events: InputBegan:Connect(function(input, gameProcessed)), InputEnded:Connect(function(input, gameProcessed))

DATATYPES:
Vector3: new(x,y,z), Properties: X,Y,Z
Vector2: new(x,y), Properties: X,Y
Color3: new(r,g,b), fromRGB(r,g,b), fromHSV(h,s,v), fromHex(hex), Properties: R,G,B

DRAWING API:
Drawing.new(type: string): DrawingObject
Types: Square, Line, Circle, Text, Triangle

DrawingObject Methods: Remove()

Base Properties (all types):
  Color: Color3, Transparency: number, Visible: bool, Position: Vector2, ZIndex: int

Square Properties:
  Size: Vector2, Filled: bool

Line Properties:
  From: Vector2, To: Vector2, Thickness: int

Circle Properties:
  Radius: float, NumSides: int, Thickness: int

Text Properties:
  Text: string, Outline: bool, Center: bool, Font: Font, Size: Int

Triangle Properties:
  PointA: Vector2, PointB: Vector2, PointC: Vector2

Fonts:
  Drawing.Fonts.UI, Drawing.Fonts.System, Drawing.Fonts.SystemBold, Drawing.Fonts.Minecraft, Drawing.Fonts.Monospace, Drawing.Fonts.Pixel, Drawing.Fonts.Fortnite

IMPORTANT: NEVER use Roblox internal functions like game:GetService() unless using DataModel methods. Use DataModel:GetService() instead.

When providing code examples, format them with proper indentation and markdown code blocks using triple backticks with language specification (```lua). This makes code copyable.

Keep responses helpful and focused on Matcha scripting. If users ask about Roblox-specific functions, remind them of Matcha's limitations.`;

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
        
        const data = await response.json();
        let reply = data.choices[0].message.content;
        
        if (!reply.includes('```lua') && reply.includes('```')) {
            reply = reply.replace(/```/g, '```lua');
        }
        
        res.setHeader('Content-Type', 'text/plain');
        res.status(200).send(reply);
        
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Error: ' + error.message);
    }
}
