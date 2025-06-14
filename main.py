# SiteMonkeys Zero-Failure AI System
# Complete Google Drive Integration + Chat Interface

import streamlit as st
import os
import json
from google.oauth2 import service_account
from googleapiclient.discovery import build
import openai
from anthropic import Anthropic

# Page configuration
st.set_page_config(
    page_title="🐒 SiteMonkeys Zero-Failure AI",
    page_icon="🐒",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Initialize API clients
@st.cache_resource
def initialize_services():
    """Initialize Google Drive and AI services"""
    
    # Google Drive setup
    google_creds = os.getenv("GOOGLE_CREDENTIALS_JSON")
    if not google_creds:
        st.error("❌ GOOGLE_CREDENTIALS_JSON not found in environment variables")
        st.stop()
    
    try:
        creds_dict = json.loads(google_creds)
        creds = service_account.Credentials.from_service_account_info(
            creds_dict, 
            scopes=["https://www.googleapis.com/auth/drive.readonly"]
        )
        drive_service = build("drive", "v3", credentials=creds)
    except Exception as e:
        st.error(f"❌ Google Drive setup failed: {e}")
        st.stop()
    
    # OpenAI setup
    openai_key = os.getenv("OPENAI_API_KEY")
    if not openai_key:
        st.error("❌ OPENAI_API_KEY not found in environment variables")
        st.stop()
    
    openai_client = openai.OpenAI(api_key=openai_key)
    
    # Anthropic setup
    anthropic_key = os.getenv("ANTHROPIC_API_KEY")
    if not anthropic_key:
        st.error("❌ ANTHROPIC_API_KEY not found in environment variables")
        st.stop()
    
    anthropic_client = Anthropic(api_key=anthropic_key)
    
    return drive_service, openai_client, anthropic_client

# Load vault contents from Google Drive
@st.cache_data(ttl=300)  # Cache for 5 minutes
def load_vault_memory():
    """Load all enforcement files from Google Drive vault"""
    
    drive_service = initialize_services()[0]
    vault_folder_id = "1LAkbqjN7g-HJV9BRWV-AsmMpY1JzJiIM"
    
    memory_content = "=== SITEMONKEYS ZERO-FAILURE ENFORCEMENT LOADED ===\n\n"
    
    # Files to load from vault
    enforcement_files = [
        "00_EnforcementShell.txt",
        "00_EnforcementShell_Addendum.txt", 
        "00_BEHAVIOR_ENFORCEMENT_DEEP_LAYER.txt",
        "FULL COMPLETE Founder's Directive – Elevated and Executable Form (Exact Instruction Set).txt",
        "Comprehensive Services Offered by a World-Class Full-Service Digital Marketing Agency.txt"
    ]
    
    try:
        # Find VAULT_MEMORY_FILES subfolder
        folder_response = drive_service.files().list(
            q=f"'{vault_folder_id}' in parents and name='VAULT_MEMORY_FILES' and mimeType='application/vnd.google-apps.folder'",
            fields="files(id, name)"
        ).execute()
        
        if not folder_response['files']:
            st.error("❌ VAULT_MEMORY_FILES folder not found")
            return "ERROR: Vault folder not accessible"
        
        subfolder_id = folder_response['files'][0]['id']
        
        # Load each enforcement file
        for filename in enforcement_files:
            try:
                file_response = drive_service.files().list(
                    q=f"'{subfolder_id}' in parents and name='{filename}'",
                    fields="files(id, name, mimeType)"
                ).execute()
                
                if file_response['files']:
                    file_id = file_response['files'][0]['id']
                    mime_type = file_response['files'][0]['mimeType']
                    
                    # Export based on file type
                    if mime_type == "application/vnd.google-apps.document":
                        request = drive_service.files().export_media(
                            fileId=file_id, 
                            mimeType="text/plain"
                        )
                    else:
                        request = drive_service.files().get_media(fileId=file_id)
                    
                    content = request.execute().decode("utf-8")
                    memory_content += f"\n=== {filename} ===\n{content}\n\n"
                    
                else:
                    memory_content += f"\n=== {filename} ===\nFILE NOT FOUND\n\n"
                    
            except Exception as e:
                memory_content += f"\n=== {filename} ===\nERROR LOADING: {e}\n\n"
        
        return memory_content
        
    except Exception as e:
        st.error(f"❌ Vault loading failed: {e}")
        return f"ERROR: Could not load vault - {e}"

# AI Response with Fallback Logic
def get_ai_response(user_input, memory_context):
    """Get AI response with Claude -> GPT-4 fallback"""
    
    _, openai_client, anthropic_client = initialize_services()
    
    # Try Claude first
    try:
        response = anthropic_client.messages.create(
            model="claude-3-5-sonnet-20241022",
            max_tokens=4000,
            temperature=0.2,
            system=memory_context,
            messages=[{"role": "user", "content": user_input}]
        )
        return f"🧠 **Claude Response:**\n\n{response.content[0].text}"
        
    except Exception as claude_error:
        st.warning(f"⚠️ Claude failed: {str(claude_error)[:100]}... Falling back to GPT-4")
        
        # Fallback to GPT-4
        try:
            response = openai_client.chat.completions.create(
                model="gpt-4",
                messages=[
                    {"role": "system", "content": memory_context},
                    {"role": "user", "content": user_input}
                ],
                temperature=0.2,
                max_tokens=4000
            )
            return f"🤖 **GPT-4 Response (Claude fallback):**\n\n{response.choices[0].message.content}"
            
        except Exception as gpt_error:
            return f"❌ **Both AI systems failed:**\n\nClaude: {claude_error}\nGPT-4: {gpt_error}\n\nPlease check your API keys and try again."

# Main Application
def main():
    
    # Header
    st.title("🐒 SiteMonkeys Zero-Failure AI System")
    st.caption("Powered by your Google Drive enforcement vault with Claude + GPT-4 fallback")
    
    # Load enforcement memory
    with st.spinner("🔄 Loading SiteMonkeys enforcement vault from Google Drive..."):
        memory_context = load_vault_memory()
    
    # Check if memory loaded successfully
    if "ERROR:" in memory_context:
        st.error("❌ Failed to load enforcement vault")
        st.code(memory_context)
        st.stop()
    
    # Sidebar status
    with st.sidebar:
        st.header("🔐 System Status")
        st.success("✅ Google Drive Connected")
        st.success("✅ Enforcement Vault Loaded")
        st.success("✅ Claude + GPT-4 Ready")
        st.success("✅ Zero-Failure Mode Active")
        
        st.markdown("---")
        st.subheader("🎯 Loaded Enforcement Files")
        if "00_EnforcementShell.txt" in memory_context:
            st.success("✅ Enforcement Shell")
        if "BEHAVIOR_ENFORCEMENT" in memory_context:
            st.success("✅ Behavior Enforcement")
        if "Founder's Directive" in memory_context:
            st.success("✅ Founder's Directive")
        if "Comprehensive Services" in memory_context:
            st.success("✅ Services Matrix")
            
        st.markdown("---")
        if st.button("🔄 Refresh Vault Memory"):
            st.cache_data.clear()
            st.rerun()
            
        if st.button("🗑️ Clear Chat History"):
            st.session_state.messages = []
            st.rerun()
    
    # Initialize chat history
    if "messages" not in st.session_state:
        st.session_state.messages = []
    
    # Display chat messages
    for message in st.session_state.messages:
        with st.chat_message(message["role"]):
            st.markdown(message["content"])
    
    # Chat input
    if prompt := st.chat_input("Ask about SiteMonkeys validation, scaling, competitive analysis, or anything else..."):
        # Add user message
        st.session_state.messages.append({"role": "user", "content": prompt})
        with st.chat_message("user"):
            st.markdown(prompt)
        
        # Get AI response
        with st.chat_message("assistant"):
            with st.spinner("🤔 Processing with zero-failure enforcement..."):
                response = get_ai_response(prompt, memory_context)
                st.markdown(response)
        
        # Add assistant response
        st.session_state.messages.append({"role": "assistant", "content": response})

if __name__ == "__main__":
    main()
