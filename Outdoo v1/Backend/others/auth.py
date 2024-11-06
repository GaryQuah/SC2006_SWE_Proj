from flask import Blueprint, render_template, request, flash, redirect, url_for, jsonify
from .models import User, Note, Activity, Location, Time, Points
from werkzeug.security import generate_password_hash, check_password_hash
from . import db
from flask_login import logout_user
import json
from .api_handler import get_weather, get_uv_index
from .activitylist import ActivitiesList
from .chatbot import get_response
import ast
from flask_jwt_extended import create_access_token
from flask_jwt_extended import get_jwt_identity
from flask_jwt_extended import jwt_required

views = Blueprint('views', __name__)
auth = Blueprint('auth', __name__)

@auth.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        try:
            data = request.get_json()
            email = data.get('email')
            password = data.get('password')

            if not email or not password:
                return jsonify({'message': "Email and password are required."}), 400

            print("email = ", email)
            print("password = ", password)
            user = User.query.filter_by(email=email).first()
            if user:
                if check_password_hash(user.password, password):
                    access_token = create_access_token(identity=email)
                    print("access token: ", access_token)
                    return jsonify({"email": email, "token": access_token}), 200
                else:
                    return jsonify({'message': "Wrong Credentials"}), 401
            else:
                return jsonify({'message': "Email does not exist"}), 401
        except Exception as e:
            print("Error occurred:", e)  # Log the error for debugging
            return jsonify({"error": "An unexpected error occurred."}), 500
        
    return jsonify({"message": "Method not allowed. Use POST to log in."}), 405

@auth.route('/logout')
@jwt_required
def logout():
    logout_user()
    return redirect(url_for('auth.login'))

@auth.route('/sign-up', methods=['GET','POST'])
def sign_up():
    if request.method == 'POST':
        try:
            data = request.get_json()
            email = data.get('email')
            first_name = data.get('userName')
            password1 = data.get('password')
            password2 = data.get('confirmpassword')
            print("email = ",email)
            print("firstname = ",first_name)
            print("password = ",password1)
            print("password2 = ",password2)

            user = User.query.filter_by(email=email).first()
            print("user = ",user)
            print("here0")

            if user != None:
                print("came here1")
                return jsonify({'message': "Email already exists."}), 401
            elif len(email) < 4:
                print("came here2")
                return jsonify({'message': "Email must be greater than 3 characters."}), 401
            elif len(first_name) < 2:
                print("came here3")
                return jsonify({'message': "First Name must be greater than 1 character."}), 401
            elif password1 != password2:
                print("came here4")
                return jsonify({'message': "Password don\'t match"}), 401
            elif len(password1) < 6:
                print("came here5")
                return jsonify({'message': "Password must be at least 6 characters."}), 401
            else:
                print("came here6")
                new_user = User(email=email, first_name=first_name, password=generate_password_hash(password1, method='pbkdf2:sha256'))
                db.session.add(new_user)
                db.session.commit()
                return jsonify({'message': "Account created!"}), 200

        except Exception as e:
            # Handle any errors and return 500 status
            return jsonify({"error": str(e)}), 500
            
    return jsonify({"message":"nothing"})

@views.route('/dashboard', methods=['GET'])
@jwt_required()
def dashboard():
    current_user = get_jwt_identity()
    user = User.query.filter_by(email=current_user).first()
    user_id = user.id 
    user_activities = Activity.query.filter_by(user_id=user_id).all()
    user_points = Points.query.filter_by(user_id=user_id).first()
    
    activities_list = []
    for activity in user_activities:
        activity_data = {
            "activityName": activity.activityName,
            "start_time": activity.time.start_time if activity.time else None
        }
        activities_list.append(activity_data)
    points = user_points.point if user_points else 0

    print(points)
    
    # Fetch weather and UV details
    _, description, temperature = get_weather()
    uv_index = get_uv_index()
    
    # Generate UV description based on uv_index
    if uv_index <= 2:
        uv_description = "Low: You’re good to go! Enjoy the outdoors, but pop on a little SPF 15+."
    elif uv_index in {3, 4, 5}:
        uv_description = "Moderate: It’s a warm day! Wear a hat, sunglasses, and don’t forget your SPF 30+."
    elif uv_index in {6, 7}:
        uv_description = "High: Sun’s getting strong! Grab your sunscreen (SPF 30+)"
    elif uv_index in {8, 9, 10}:
        uv_description = "Very High: The sun means business! You’ll need full protection: SPF 30+, a hat, and long sleeves."
    elif uv_index >= 11:
        uv_description = "Extreme: Whoa, it's intense out there! Cover up with SPF 30+, wear a hat, long sleeves, and try to stay indoors."

    # Structure data for JSON response
    data = {
        "weather_description": description,
        "weather_icon" : _,
        "temperature": temperature,
        "uv_index": uv_index,
        "uv_description": uv_description,
        "activities": activities_list,
        "points": points
    }
    
    print(data)
    # Send the data as JSON response
    
    return jsonify(data)

@views.route('/addactivity', methods=['GET', 'POST'])
@jwt_required()
def addactivity():
    _, description, temperature = get_weather()
    uv_index = get_uv_index()
    chatbot_response = None
    Activities = []
    location = "null"
    if request.method == 'POST':
        data = request.get_json()
        print(data)
        activity = data.get('addactivity_activity')
        location = data.get('addactivity_location')
        print("activity after get:", activity)
        print("location after get:", location)
        ActivitiesList.append(activity)
        prompt =  f"From the list={ActivitiesList}, can you return me a list of activities that are suitable for me to do with the current UV Index: {uv_index}, Weather Description: {description}, Temperature: {temperature}°C. No unnecessary words, just in this format: Activities = []"
        #chatbot_response = get_response(prompt)
        #print(chatbot_response)
        chatbot_response = ("Activities = ['Indoor Cycling', 'Jump Rope', 'Aerobics', 'Basketball', 'Badminton', 'Table Tennis', 'Dance', 'Gym', 'Pilates']")
        Activities = ast.literal_eval(chatbot_response.split('=')[1].strip())
        print(Activities)
        print(location)

        return jsonify({"activities" : Activities, "location" : location})
        
    return jsonify({"activities" : Activities, "location" : location})

@views.route('/sendactivity', methods=['GET', 'POST'])
@jwt_required()
def sendactivity():
    if request.method == 'POST':
        data = request.get_json()
        print(data)
        return jsonify({"message" : "activity added"}), 200
        
    return jsonify({"Null"})

@views.route('/delete-activity', methods=['POST'])
@jwt_required()
def delete_activity():
    activity = json.loads(request.data)
    activityId = activity['activityId']
    activity = Activity.query.get(activityId)
    current_user = get_jwt_identity()
    user = User.query.filter_by(email=current_user).first()
    user_id = user.id
    
    if activity:
        if activity.user_id == current_user.id:
            db.session.delete(activity)
            db.session.commit()

            _, description, temperature = get_weather()
            uv_index = get_uv_index()
            uv_description = ""
    
    return jsonify({})