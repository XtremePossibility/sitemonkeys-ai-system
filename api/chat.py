import os
import json
from openai import OpenAI
from http.server import BaseHTTPRequestHandler

def calculate_cost(usage_data):
    """Calculate estimated cost for GPT-4 Turbo usage"""
    if not usage_data:
        return "0.00"
    
    # GPT-4 Turbo pricing (as of 2024)
    input_cost_per_1k = 0.
