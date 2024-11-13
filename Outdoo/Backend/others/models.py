from . import db #import from current folder, in this case website
from flask_login import UserMixin
from sqlalchemy.sql import func

class Note(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    data = db.Column(db.String(10000))
    date = db.Column(db.DateTime(timezone=True), default=func.now())
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'))

class Activity(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    activityName = db.Column(db.String(50))
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    location = db.relationship('Location', backref='activity', uselist=False, cascade="all, delete-orphan", passive_deletes=True)
    time = db.relationship('Time', backref='activity', uselist=False, cascade="all, delete-orphan", passive_deletes=True)

class Time(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    start_time = db.Column(db.Integer)
    activity_id = db.Column(db.Integer, db.ForeignKey('activity.id', ondelete='CASCADE'))

class Location(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    location = db.Column(db.String(50))
    activity_id = db.Column(db.Integer, db.ForeignKey('activity.id', ondelete='CASCADE'))

class Points(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    point = db.Column(db.Integer)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'))

class Rewards(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    RewardName = db.Column(db.String(50))
    status = db.Column(db.Boolean, default=False)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'))

class User(db.Model, UserMixin):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(150), unique=True)
    password = db.Column(db.String(150))
    first_name = db.Column(db.String(150))
    notes = db.relationship('Note')
    activity = db.relationship('Activity')
    points = db.relationship('Points')
    rewards = db.relationship('Rewards')