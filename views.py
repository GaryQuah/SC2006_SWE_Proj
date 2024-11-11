from flask import Blueprint, render_template, request, flash, jsonify
from flask_login import login_required, current_user
from .models import Activity, Location, Time, Points
from . import db
import json
from .api_handler import get_weather, get_uv_index
from .static.activitylist import ActivitiesList
from .chatbot import get_response
import ast
from datetime import datetime

views = Blueprint('views', __name__)

def num_to_time(num):
    num = int(num)
    if num == -1:
        return datetime.now().strftime('%I:%M %p')
    hours = num // 2
    minutes = (num % 2) * 30
    time = datetime.strptime(f"{hours:02}:{minutes:02}", "%H:%M")
    return time.strftime("%I:%M %p")

@views.route('/dashboard', methods=['GET'])
@login_required
def dashboard():
    user_id = current_user.id 
    user_activities = Activity.query.filter_by(user_id=user_id).all()
    user_points = Points.query.filter_by(user_id=user_id).first()

    activities_list = []
    for activity in user_activities:
        activity_data = {
            "activityName": activity.activityName,
            "start_time": num_to_time(activity.time.start_time) if activity.time else None
        }
        activities_list.append(activity_data)
    points = user_points.point if user_points else 0
    
    # Fetch weather and UV details
    _, description, temperature = get_weather()
    uv_index = get_uv_index()
    
    # Generate UV description based on uv_index
    if uv_index <= 2:
        uv_description = "Low: You’re good to go! Enjoy the outdoors, but pop on some sunglasses and a little SPF 15+ if you have sensitive skin. Have fun!"
    elif uv_index in {3, 4, 5}:
        uv_description = "Moderate: It’s a warm day! Wear a hat, sunglasses, and don’t forget your SPF 30+. Find some shade during midday to stay cool and protected."
    elif uv_index in {6, 7}:
        uv_description = "High: Sun’s getting strong! Grab your sunscreen (SPF 30+), a wide-brimmed hat, and some light clothing to keep your skin safe. Shade is your friend!"
    elif uv_index in {8, 9, 10}:
        uv_description = "Very High: The sun means business! You’ll need full protection: SPF 30+, a hat, and long sleeves. Stay in the shade when possible to beat the heat."
    elif uv_index >= 11:
        uv_description = "Extreme: Whoa, it's intense out there! Cover up with SPF 30+, wear a hat, long sleeves, and try to stay indoors or in the shade to avoid serious sunburn."

    # Structure data for JSON response
    data = {
        "weather_description": description,
        "temperature": temperature,
        "uv_index": uv_index,
        "uv_description": uv_description,
        "activities": activities_list,
        "points": points
    }

    # Send the data as JSON response
    return jsonify(data)

@views.route('/', methods=['GET', 'POST'])
@login_required
def home():

    _, description, temperature = get_weather()
    uv_index = get_uv_index()
    chatbot_response = None

    if uv_index <= 2:
        uv_description = "Low\nYou’re good to go! Enjoy the outdoors, but pop on some sunglasses and a little SPF 15+ if you have sensitive skin. Have fun!"
    elif uv_index == (3 or 4 or 5):
        uv_description = "Moderate\nIt’s a warm day! Wear a hat, sunglasses, and don’t forget your SPF 30+. Find some shade during midday to stay cool and protected."
    elif uv_index == (6 or 7):
        uv_description = "High\nSun’s getting strong! Grab your sunscreen (SPF 30+), a wide-brimmed hat, and some light clothing to keep your skin safe. Shade is your friend!"
    elif uv_index == (8 or 9 or 10):
        uv_description = "Very High\nThe sun means business! You’ll need full protection: SPF 30+, a hat, and long sleeves. Stay in the shade when possible to beat the heat."
    elif uv_index >= 11:
        uv_description = "Extreme\nWhoa, it's intense out there! Cover up with SPF 30+, wear a hat, long sleeves, and try to stay indoors or in the shade to avoid serious sunburn."

    if request.method == 'POST':
        if 'update_points' in request.form:
            points = request.form.get('points')
            if points:
                user_points = Points.query.filter_by(user_id=current_user.id).first()
                if not user_points:
                    user_points = Points(point=points, user_id=current_user.id)
                    db.session.add(user_points)
                else:
                    user_points.point = points
                db.session.commit()
                flash('Points updated!', category='success')
            else:
                flash('Please enter valid points.', category='error')
        else:
            activity = request.form.get('activity')
            location = request.form.get('location')
            time = request.form.get('time')

            if len(location) < 1:
                flash('Location is too short!', category='error')
            else:
                new_activity=Activity(activityName=activity, user_id=current_user.id)
                db.session.add(new_activity)
                db.session.commit()

                new_location=Location(location=location, activity_id=new_activity.id)
                db.session.add(new_location)
                db.session.commit()

                new_time=Time(start_time=time, activity_id=new_activity.id)
                db.session.add(new_time)
                db.session.commit()
                
                flash('Activity added!', category='success')
            
                ActivitiesList.append(activity)
                prompt = f"From the list={ActivitiesList}, can you return me a list of activities that are suitable for me to do with the current UV Index: {uv_index}, Weather Description: {description}, Temperature: {temperature}°C. No unnecessary words, just in this format: Activities = []"

                #chatbot_response = get_response(prompt)
                #print(chatbot_response)
                chatbot_response = ("Activities = ['Indoor Cycling', 'Jump Rope', 'Aerobics', 'Basketball', 'Badminton', 'Table Tennis', 'Dance', 'Gym', 'Pilates']")
                Activities = ast.literal_eval(chatbot_response.split('=')[1].strip())
                print(Activities)

    return render_template(
        "home.html", 
        user=current_user, 
        description=description, 
        temperature=temperature, 
        uv_index=uv_index,
        uv_description=uv_description.replace('\n', '<br>'),
        chatbot_response=chatbot_response
        )

@views.route('/delete-activity', methods=['POST'])
def delete_activity():
    activity = json.loads(request.data)
    activityId = activity['activityId']
    activity = Activity.query.get(activityId)
    
    if activity:
        if activity.user_id == current_user.id:
            db.session.delete(activity)
            db.session.commit()

            _, description, temperature = get_weather()
            uv_index = get_uv_index()
            uv_description = ""
    
    return jsonify({})