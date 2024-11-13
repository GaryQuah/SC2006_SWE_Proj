import openai
import os
from dotenv import load_dotenv, find_dotenv


load_dotenv()
openai.api_key = os.getenv('OPENAI_API_KEY2')

def get_response(prompt):
    response = openai.ChatCompletion.create(
        model="gpt-3.5-turbo",
        messages=[{"role": "user", "content": prompt}]
    )
    return response.choices[0].message.content.strip()