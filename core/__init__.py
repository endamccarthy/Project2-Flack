from flask import Flask
from flask_socketio import SocketIO, emit
from core.config import Config


socketio = SocketIO()

def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(Config)

    socketio.init_app(app)

    # Blueprints setup
    from core.main.routes import main
    app.register_blueprint(main)

    return app