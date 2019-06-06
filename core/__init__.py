from flask import Flask
from flask_socketio import SocketIO
from core.config import Config


socketio = SocketIO()

def create_app(config_class=Config):
    # start up flask
    app = Flask(__name__)
    app.config.from_object(Config)

    # initialize application features
    socketio.init_app(app)

    # blueprints setup
    from core.main.routes import main
    app.register_blueprint(main)

    return app