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
from datetime import datetime

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

@auth.route('/logout', methods=['GET','POST'])
@jwt_required
def logout():
    if request.method == 'POST':
        return jsonify({"message":"Logged out"}),200
    return jsonify({"message":"Null"}),402

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
            "activityID": activity.id,
            "activityName": activity.activityName,
            "activityTime": num_to_time(activity.time.start_time) if activity.time else None,
            "activityLocation": activity.location.location if activity.location else None
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

@views.route('/profile', methods=['GET'])
@jwt_required()
def profile():
    current_user = get_jwt_identity()
    user = User.query.filter_by(email=current_user).first()
    profile_data = {
        "email": user.email,
        "name": user.first_name,
        "password": user.password
    }
    return jsonify(profile_data)

@auth.route('/change-password', methods=['POST'])
@jwt_required()
def change_password():
    data = request.get_json()
    print("Received data:", data)

    current_password = data.get('currentPassword')
    new_password = data.get('newPassword')
    confirm_new_password = data.get('confirmNewPassword')
    current_user_email = get_jwt_identity()
    user = User.query.filter_by(email=current_user_email).first()

    # Check if the current password is correct
    if not check_password_hash(user.password, current_password):
        print("Incorrect current password")
        return jsonify({"message": "Incorrect current password"}), 400

    # Validate the new password
    if new_password != confirm_new_password:
        print("New passwords do not match")
        return jsonify({"message": "New passwords do not match"}), 400
    elif len(new_password) < 6:
        print("New password is too short")
        return jsonify({"message": "New password is too short"}), 400

    # Update the password in the database
    user.password = generate_password_hash(new_password, method='pbkdf2:sha256')
    db.session.commit()

    print("Password changed successfully")
    return jsonify({"message": "Password changed successfully"}), 200


@views.route('/updatepoints', methods=['GET', 'POST'])
@jwt_required()
def updatepoints():
    current_user = get_jwt_identity()
    user = User.query.filter_by(email=current_user).first()
    user_id = user.id 
    user_points = Points.query.filter_by(user_id=user_id).first()
    inipoints = user_points.point if user_points else 0
    if request.method == 'POST':
        data = request.get_json()
        print(data)
        points = data.get('points')
        print(points)
        if not user_points:
            user_points = Points(point=points, user_id=user_id)
            db.session.add(user_points)
        else:
            user_points.point = points
        db.session.commit()
        return jsonify({"points" : "points", "Message" : "Updated"}),200
        
    return jsonify({"points": inipoints})

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
        activity = data.get('selectedActivity')
        activitytime = data.get('addactivity_time')
        activitytime = num_to_time(activitytime)
        activitylocation = data.get('postalCode')
        print("activity data=", activity, activitytime, activitylocation)
        current_user = get_jwt_identity()
        user = User.query.filter_by(email=current_user).first()
        user_id = user.id 
        print("data = ", data)
        new_activity=Activity(activityName=activity, user_id=user_id)
        db.session.add(new_activity)
        db.session.commit()

        new_location=Location(location=activitylocation, activity_id=new_activity.id)
        db.session.add(new_location)
        db.session.commit()

        new_time=Time(start_time=activitytime, activity_id=new_activity.id)
        db.session.add(new_time)
        db.session.commit()
        user_activities = Activity.query.filter_by(user_id=user_id).all()
        print("data =", user_activities)

        return jsonify({"message" : "activity added"}), 200
        
    return jsonify({"Null"})

@views.route('/delete-activity', methods=['POST'])
@jwt_required()
def delete_activity():
    data = request.get_json()
    print(data)
    activityId = data.get('activityID')
    activity = Activity.query.get(activityId)
    current_user = get_jwt_identity()
    user = User.query.filter_by(email=current_user).first()
    user_id = user.id
    
    if activity:
        if activity.user_id == user_id:
            db.session.delete(activity)
            db.session.commit()
    
    return jsonify({})

def num_to_time(num):
    num = int(num)
    if num == -1:
        return datetime.now().strftime('%I:%M %p')
    hours = num // 2
    minutes = (num % 2) * 30
    time = datetime.strptime(f"{hours:02}:{minutes:02}", "%H:%M")
    return time.strftime("%I:%M %p")