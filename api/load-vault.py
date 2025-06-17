import json
from http.server import BaseHTTPRequestHandler

class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        
        vault_data = {
            "status": "OPERATIONAL",
            "vault_content": "SITEMONKEYS BUSINESS INTELLIGENCE: Launch Budget $15K, Monthly Burn $3K, Margins 87%. Pricing: Boost $697, Climb $1497, Lead $2997. Zero-failure protocols active.",
            "tokens": 1500,
            "estimated_cost": "$0.0030",
            "folders_loaded": ["Core Intelligence", "Financial Constraints", "Legal Framework"],
            "message": "SiteMonkeys Vault Loaded"
        }
        
        self.wfile.write(json.dumps(vault_data).encode())
    
    def do_POST(self):
        self.do_GET()
    
    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
