import os
import json
import openai
from http.server import BaseHTTPRequestHandler

class handler(BaseHTTPRequestHandler):
    def do_POST(self):
        try:
            # Read request body
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            data = json.loads(post_data.decode('utf-8'))
            
            user_message = data.get('message', '')
            vault_memory = data.get('vault_memory', '')
            
            # Set up OpenAI
            openai.api_key = os.getenv("OPENAI_API_KEY")
            
            # Create messages for GPT-4 Turbo (128K context)
            messages = [
                {
                    "role": "system", 
                    "content": f"""You are the SiteMonkeys business intelligence AI system. You have access to complete business intelligence and must follow the zero-failure directives exactly as specified.

{vault_memory}

CRITICAL INSTRUCTIONS:
- Follow the founder's directives above all else
- Provide specific numbers when asked (budgets, margins, burn rates)
- Base all responses on the loaded business intelligence
- Never give generic advice - use the specific SiteMonkeys requirements
- If asked about costs or feasibility, reference the exact constraints above"""
                },
                {"role": "user", "content": user_message}
            ]
            
            # Call GPT-4 Turbo with high context limit
            response = openai.ChatCompletion.create(
                model="gpt-4-1106-preview",  # GPT-4 Turbo with 128K context
                messages=messages,
                max_tokens=4000,
                temperature=0.1  # Low temperature for consistent business responses
            )
            
            ai_response = response['choices'][0]['message']['content']
            
            # Return success response
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            
            response_data = {
                "success": True,
                "response": ai_response,
                "model_used": "gpt-4-turbo",
                "tokens_used": response.get('usage', {}).get('total_tokens', 'unknown')
            }
            
            self.wfile.write(json.dumps(response_data).encode())
            
        except Exception as e:
            # Return error response
            self.send_response(500)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            
            response = {
                "success": False,
                "error": str(e)
            }
            
            self.wfile.write(json.dumps(response).encode())
    
    def do_OPTIONS(self):
        # Handle CORS preflight
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
