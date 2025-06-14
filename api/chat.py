import os
import json
from http.server import BaseHTTPRequestHandler

class handler(BaseHTTPRequestHandler):
    def do_POST(self):
        try:
            # Read request body
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            request_data = json.loads(post_data.decode('utf-8'))
            
            user_message = request_data.get('message', '')
            memory_context = request_data.get('memory', '')
            
            if not user_message:
                raise ValueError("No message provided")
            
            # Get AI response
            ai_response = get_ai_response(user_message, memory_context)
            
            # Return success response
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.send_header('Access-Control-Allow-Methods', 'POST, OPTIONS')
            self.send_header('Access-Control-Allow-Headers', 'Content-Type')
            self.end_headers()
            
            response = {
                "success": True,
                "response": ai_response
            }
            
            self.wfile.write(json.dumps(response).encode())
            
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

def get_ai_response(user_input, memory_context):
    """Get AI response with your enforcement shell"""
    import openai
    
    # OpenAI setup
    openai_key = os.getenv("OPENAI_API_KEY")
    if not openai_key:
        raise ValueError("OPENAI_API_KEY not found in environment variables")
    
    openai.api_key = openai_key
    
    try:
        response = openai.ChatCompletion.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": memory_context},
                {"role": "user", "content": user_input}
            ],
            temperature=0.2,
            max_tokens=4000
        )
        
        return response['choices'][0]['message']['content'].strip()
        
    except Exception as e:
        raise Exception(f"OpenAI API Error: {e}")
