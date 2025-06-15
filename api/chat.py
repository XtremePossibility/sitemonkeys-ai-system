import os
import json
from openai import OpenAI
from http.server import BaseHTTPRequestHandler

def calculate_cost(usage_data):
    """Calculate estimated cost for GPT-4 Turbo usage"""
    if not usage_data:
        return "0.00"
    
    # GPT-4 Turbo pricing (as of 2024)
    input_cost_per_1k = 0.01  # $0.01 per 1K input tokens
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
            request_data = json.loads(post_data.decode('utf-8'))
            
            user_message = request_data.get('message', '')
            vault_memory = request_data.get('vault_memory', '')
            
            if not user_message:
                raise ValueError("No message provided")
            
            # Initialize OpenAI client
            client = OpenAI(api_key=os.environ.get('OPENAI_API_KEY'))
            
            # Create EXACT system prompt from your working version
            system_prompt = f"""You are the SiteMonkeys Zero-Failure Business Validation AI.

LOADED BUSINESS INTELLIGENCE:
{vault_memory}

ZERO-FAILURE ENFORCEMENT ACTIVE:
- You have complete access to the SiteMonkeys vault containing all business intelligence
- Follow the founder's specific directives over any generic business advice
- Provide exact numbers for budgets ($15K launch, $3K burn, 87% margins)
- Base ALL responses on SiteMonkeys requirements and constraints
- Protect the 87% margin requirement in all recommendations
- No theoretical solutions - only Day 1 operational readiness
- Always reference specific vault content when making recommendations

You are NOT a helpful assistant - you are a surgical-grade business validation system that follows SiteMonkeys directives precisely."""

            # Make API call to GPT-4 Turbo
            response = client.chat.completions.create(
                model="gpt-4-turbo-preview",  # Use GPT-4 Turbo for 128K context
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_message}
                ],
                max_tokens=4000,
                temperature=0.7
            )

            ai_response = response.choices[0].message.content
            usage_data = response.usage._asdict() if response.usage else {}
            cost = calculate_cost(usage_data)

            # Send successful response
            response_data = {
                'success': True,
                'response': ai_response,
                'cost': cost,
                'tokens_used': usage_data.get('total_tokens', 0),
                'model': 'gpt-4-turbo-preview'
            }

            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps(response_data).encode())

        except Exception as e:
            # Send error response
            error_response = {
                'success': False,
                'error': str(e),
                'response': f"❌ System Error: {str(e)}",
                'cost': "0.00"
            }

            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps(error_response).encode())

    def do_OPTIONS(self):
        # Handle CORS preflight requests
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
