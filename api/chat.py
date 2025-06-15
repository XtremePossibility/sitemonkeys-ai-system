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
            # Parse request body
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            request_data = json.loads(post_data.decode('utf-8'))
            
            user_message = request_data.get('message', '')
            vault_memory = request_data.get('vault_memory', '')
            
            if not user_message:
                raise ValueError("No message provided")
            
            # Initialize OpenAI client
            client = OpenAI(api_key=os.environ.get('OPENAI_API_KEY'))
            
            # Create system prompt with vault memory
            system_prompt = f"""You are the SiteMonkeys Zero-Failure Business Validation AI operating under the complete founder's directive.

{vault_memory}

CORE OPERATIONAL RULES:
1. ZERO-FAILURE APPROACH: Every recommendation must be validated and have contingency plans
2. FINANCIAL PROTECTION: Never recommend anything that exceeds the $15K budget or reduces margins below 87%
3. DATA-DRIVEN DECISIONS: All advice must be backed by the loaded business intelligence
4. FOUNDER PROTECTION: Prioritize sustainable, low-risk growth strategies
5. MARKET LEADERSHIP: Position SiteMonkeys as the premium choice in local SEO/web design

RESPONSE STYLE:
- Professional but friendly business advice
- Specific, actionable recommendations
- Include relevant data from the vault when applicable
- Always consider the zero-failure directive
- Focus on "From Overlooked to Overbooked" mission

Answer all questions as the SiteMonkeys business validation expert with complete access to the founder's business intelligence."""

            # Prepare messages for GPT-4 Turbo
            messages = [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_message}
            ]
            
            # Call GPT-4 Turbo with high context limit
            response = client.chat.completions.create(
                model="gpt-4-turbo-preview",  # GPT-4 Turbo with 128K context
                messages=messages,
                max_tokens=500,  # Reasonable response length
                temperature=0.7,  # Balanced creativity/consistency
                top_p=0.9
            )
            
            ai_response = response.choices[0].message.content
            usage_data = response.usage
            
            # Calculate costs
            message_cost = calculate_cost(usage_data.model_dump() if hasattr(usage_data, 'model_dump') else usage_data.__dict__)
            
            # Prepare response data
            response_data = {
                "success": True,
                "response": ai_response,
                "model_used": "gpt-4-turbo",
                "tokens_used": usage_data.total_tokens if hasattr(usage_data, 'total_tokens') else 0,
                "cost_info": {
                    "message_cost": message_cost,
                    "input_tokens": usage_data.prompt_tokens if hasattr(usage_data, 'prompt_tokens') else 0,
                    "output_tokens": usage_data.completion_tokens if hasattr(usage_data, 'completion_tokens') else 0,
                    "total_tokens": usage_data.total_tokens if hasattr(usage_data, 'total_tokens') else 0
                }
            }
            
            # Send successful response
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.send_header('Access-Control-Allow-Methods', 'POST')
            self.send_header('Access-Control-Allow-Headers', 'Content-Type')
            self.end_headers()
            
            response_json = json.dumps(response_data)
            self.wfile.write(response_json.encode('utf-8'))
            
        except Exception as e:
            # Error handling
            error_response = {
                "success": False,
                "error": str(e),
                "response": "I apologize, but I encountered an error processing your request. Please try again or contact support if the issue persists."
            }
            
            self.send_response(500)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            
            response_json = json.dumps(error_response)
            self.wfile.write(response_json.encode('utf-8'))
    
    def do_OPTIONS(self):
        # Handle CORS preflight requests
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
