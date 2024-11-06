import requests
import os
from dotenv import load_dotenv

load_dotenv()

UV_API_URL = os.getenv('UV_API_URL')
WEATHER_API_URL = os.getenv('WEATHER_API_URL')
WEATHER_API_KEY = os.getenv('WEATHER_API_KEY')
LAT = os.getenv('LAT')
LON = os.getenv('LON')

def get_uv_index():
    uv_api = requests.get(UV_API_URL)
    return uv_api.json()['data']['records'][0]['index'][0]['value']

def get_weather():
    url = f"{WEATHER_API_URL}?lat={LAT}&lon={LON}&appid={WEATHER_API_KEY}&units=metric"
    weather_api = requests.get(url)
    data = weather_api.json()
    icon = data['weather'][0]['icon']
    weather_description = data['weather'][0]['description']
    temperature = data['main']['temp']
    return icon, weather_description, temperature