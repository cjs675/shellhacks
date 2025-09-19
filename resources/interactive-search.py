import os
from google import genai
from google.genai import types
from dotenv import load_dotenv
load_dotenv()

'''

check /resources/interactive-search.md 
for more info on how to run

'''

import os
api_key = os.getenv('GEMINI_API_KEY')

def main():
    """
    interactive dialog to make requests to google's search client 

    this version is for older libraries that use the genai.Client() pattern.
    """
    # --- Configuration ---
    # Check for the API Key environment variable.
    if "GEMINI_API_KEY" not in os.environ:
        print("Error: GEMINI_API_KEY environment variable not set.")
        return

    # --- Client and Tool Initialization ---
    try:
        # Initialize the client (older style)
        client = genai.Client()

        # 1. Define the grounding tool (do this once)
        print(" Setting up Google Search grounding tool...")
        grounding_tool = types.Tool(
            google_search_retrieval=types.GoogleSearch()
        )

        # 2. Configure generation settings to use the tool (do this once)
        config = types.GenerateContentConfig(
            tools=[grounding_tool]
        )

        # Define the model to use
        model_name = "models/gemini-1.5-flash"

    except Exception as e:
        print(f" Error during initialization: {e}")
        return

    # --- Interactive Chat Loop ---
    print(" Gemini Chat Initialized (Google Search Enabled).")
    print("   Type 'exit' or 'quit' to end the session.")
    print("=====================================================================")

    while True:
        prompt = input("You: ")

        if prompt.lower() in ["exit", "quit"]:
            print("\n Chat: Terminated")
            break
        
        if not prompt:
            continue

        try:
            print("\nGemini: ...searching and thinking...")
            
            # 3. Make the request, passing the config on every call
            response = client.models.generate_content(
                model=model_name,
                contents=prompt,
                config=config, # Pass the tool config here
            )
            print(f"\nGemini: {response.text}\n")
            
        except Exception as e:
            print(f"\n An error occurred: {e}\n")
        
        print("---------------------------------------------------------------------")

if __name__ == "__main__":
    main()
