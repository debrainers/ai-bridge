export default async function handler(req, res) {
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
        const userId = req.query.id;
        
        if (!userId) {
            return res.status(400).send('');
        }

        const timestamp = Date.now();
        const base_url = "https://raw.githubusercontent.com/debrainers/buyer-access/refs/heads/main/";
        const file_url = base_url + userId + ".lua?t=" + timestamp;
        
        const response = await fetch(file_url, {
            headers: {
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                'Pragma': 'no-cache',
                'Expires': '0'
            }
        });
        
        if (!response.ok) {
            return res.status(404).send('');
        }
        
        const content = await response.text();
        
        res.setHeader('Content-Type', 'text/plain');
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');
        
        res.status(200).send(content);
        
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('');
    }
}
