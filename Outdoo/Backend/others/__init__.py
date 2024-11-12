from flask import Flask, session
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS, cross_origin
from os import path
from flask_login import LoginManager
from sqlalchemy import event
from sqlalchemy.engine import Engine
from flask_jwt_extended import JWTManager
#from flask_session import Session

db = SQLAlchemy()
DB_NAME = 'database.db'

def create_app():
    app = Flask(__name__)
    app.config['SECRET_KEY'] = 'asfsdafasdfwrbsedragfw'
    CORS(app, supports_credentials=True, origins="http://localhost:5173")
    app.config['SQLALCHEMY_DATABASE_URI'] = f'sqlite:///{DB_NAME}'
    db.init_app(app)
    jwt = JWTManager(app)

    @event.listens_for(Engine, "connect")
    def set_sqlite_pragma(dbapi_connection, connection_record):
        cursor = dbapi_connection.cursor()
        cursor.execute("PRAGMA foreign_keys=ON")
        cursor.close()

    from .auth import views
    from .auth import auth

    app.register_blueprint(views, url_prefix='/')
    app.register_blueprint(auth, url_prefix='/')

    from .models import User, Note

    create_database(app)

    login_manager = LoginManager()
    login_manager.init_app(app)
    login_manager.login_view = 'auth.login'

    @login_manager.user_loader
    def load_user(user_id):
        from .models import User  # Import User model
        user = User.query.get(int(user_id))
        print("Loading user:", user)  # Debug statement
        return user
    
    return app

def create_database(app):
    if not path.exists(DB_NAME):
        with app.app_context():
            db.create_all()
            print('Created Database!')