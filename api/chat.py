import os
import json
from openai import OpenAI
from http.server import BaseHTTPRequestHandler

def calculate_cost(usage_data):
    """Calculate estimated cost for GPT-4 Turbo usage"""
    if not usage_data:
        return "0.00"
    
    # GPT-4 Turbo pricing (as of 2024)
    input_cost_per_1k = 0.01   # $0.01 per 1K input tokens
    output_cost_per_1k = 0.03  # $0.03 per 1K output tokens
    
    input_tokens = usage_data.get('prompt_tokens', 0)
    output_tokens = usage_data.get('completion_tokens', 0)
    
    input_cost = (input_tokens / 1000) * input_cost_per_1k
    output_cost = (output_tokens / 1000) * output_cost_per_1k
    total_cost = input_cost + output_cost
    
    return f"{total_cost:.4f}"

class handler(BaseHTTPRequestHandler):
    def do_POST(self):
        try:
            # Read request body
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            data = json.loads(post_data.decode('utf-8'))
            
            user_message = data.get('message', '')
            vault_memory = data.get('vault_memory', '')
            
            # Set up OpenAI client
            client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
            
            # Create messages for GPT-4 Turbo (128K context)
            messages = [
                {
                    "role": "system", 
                    "content": f"""You are the SiteMonkeys business intelligence AI system operating under Zero-Failure Directive. 

CRITICAL: You have COMPLETE ACCESS to the loaded SiteMonkeys vault files and business intelligence below. Reference these files directly when answering questions.

{vault_memory}

BEHAVIORAL INSTRUCTIONS:
- You HAVE ACCESS to all loaded vault files - never claim you don't
- Follow the founder's directives above all else
- Provide specific numbers when asked (budgets, margins, burn rates)
- Base all responses on the loaded SiteMonkeys business intelligence
- Never give generic advice - use the specific SiteMonkeys requirements
- If asked about files, confirm what you have loaded from the vault"""
                },
                {"role": "user", "content": user_message}
            ]
            
            # Call GPT-4 Turbo with high context limit - FORCE VERSION
            response = client.chat.completions.create(
                model="gpt-4-turbo",  # Use explicit turbo model name
                messages=messages,
                max_tokens=2000,
                temperature=0.1  # Low temperature for consistent business responses
            )
            
            ai_response = response.choices[0].message.content
            
            # Return success response
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            
            response_data = {
                "success": True,
                "response": ai_response,
                "model_used": "gpt-4-turbo",
                "cost_info": {
                    "input_tokens": response.usage.prompt_tokens,
                    "output_tokens": response.usage.completion_tokens,
                    "total_tokens": response.usage.total_tokens,
                    "estimated_cost": calculate_cost({
                        'prompt_tokens': response.usage.prompt_tokens,
                        'completion_tokens': response.usage.completion_tokens,
                        'total_tokens': response.usage.total_tokens
                    }),
                    "session_total": "tracked_in_frontend"
                }
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
