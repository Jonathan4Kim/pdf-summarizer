from flask import Flask, request, jsonify, session
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
import os
from chatbot import Chatbot
from flask_login import LoginManager, login_user, login_required, logout_user, current_user
from werkzeug.security import generate_password_hash, check_password_hash
from werkzeug.utils import secure_filename
from dotenv import load_dotenv
from pathlib import Path

# Get the path to the root directory (two levels up from the current file)
root_dir = Path(__file__).resolve().parent.parent

# Construct the path to the .env file
dotenv_path = root_dir / '.env'

# Load the .env file
load_dotenv(dotenv_path)

# create flask app
app = Flask(__name__)
CORS(app)

app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///database.db'
# encrypt data by giving a secret key
app.config['SECRET_KEY'] = 'aoitodo'
app.config['UPLOAD_FOLDER'] = 'pdfs'

# ensure upload folder exists
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

db = SQLAlchemy(app=app)

login_manager = LoginManager(app)


@login_manager.user_loader
def load_user(user_id):
    return User.get(int(user_id))


#############
# DATABASES #
#############


class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(20), nullable=False, unique=True)
    name = db.Column(db.String(50))
    password_hash = db.Column(db.String(128))

    def set_password(self, password):
        self.password_hash = generate_password_hash(password=password)

    def set_name(self, name):
        self.name = name

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    def is_authenticated(self):
        return True

    def is_active(self):
        return True

    def is_anonymous(self):
        return False

    def get_id(self):
        return str(self.id)


def get_or_create_chatbot():
    return Chatbot(filename=session['filename'])


with app.app_context():
    db.create_all()
    print('database created')

################
# LOGIN/SIGNUP #
################


def create_unique_id(name):
    # helper function: hash user id
    return abs(hash(name))


###########
# ROUTING #
###########


@app.route('/register', methods=['POST'])
def register():

    # get name, username, and passwords from frontend form
    name = request.form.get('name')
    username = request.form.get('username')
    password = request.form.get('password')
    print(f"{name} {username} {password}")

    # make sure the username filtered is first
    if User.query.filter_by(username=username).first():
        print('not new')
        return jsonify({'message': 'operation failed: user already exists'}), 500

    # if this is a new user, set the name and password accordingly
    new_user = User(username=username)
    new_user.set_name(name=name)
    new_user.set_password(password=password)

    # add the new user to our database and commit the changes
    db.session.add(new_user)
    db.session.commit()
    print('new user added')

    # return to server, letting frontend know that user was successfully registered
    return jsonify({'message': 'User registered successfully'}), 200


@app.route('/login', methods=['POST'])
def login():

    # get the username and password
    username = request.form.get('username')
    password = request.form.get('password')
    user = User.query.filter_by(username=username).first()

    # make sure user exists and password is the same. log in if so!
    if user and user.check_password(password):
        login_user(user)
        print('logging in...')
        return jsonify({'message': 'operation successful: logging in!'}), 200

    # throw an error disallowing the functionality to continue, no rerouting.
    return jsonify({'message': 'operation failed: invalid credentials'}), 500


@app.route('/logout', methods=['POST'])
def logout():
    # logout the user
    logout_user()

    # close the weaviate session and flask session as well
    session['filename'].client.close()
    session.pop('filename', None)

    # emit successful logout code
    return jsonify({'message': 'logging out...'}), 200


# chatbot initialization
chatbot = None

# Configure upload folder
UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'pdf'}

if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER


def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


@app.route('/add_file', methods=['POST'])
def add_file():
    global chatbot

    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400

    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)

        # Initialize chatbot with the uploaded file
        chatbot = Chatbot()
        chatbot._initialize_with_file(filepath)

        return jsonify({
            'message': 'File uploaded successfully',
        }), 200


@app.route('/chat', methods=['POST'])
def chat():
    """
    Take in a query, pass it to
    the llm for a response/retrieval.
    Passes it to chat_page to the frontend
    for the response.
    """
    global chatbot

    if chatbot is None:
        return jsonify({'error': 'Please upload a document first'}), 400

    data = request.json
    if not data or 'message' not in data:
        return jsonify({'error': 'No message provided'}), 401

    query = data['message']
    response = chatbot.ask_query(query)

    return jsonify({
        'response': response
    })


@app.route('/summary', methods=['GET'])
def get_summary():
    global chatbot
    if chatbot is None:
        return jsonify({'error': 'No document uploaded yet'}), 400
    return jsonify({'summary': chatbot.summary}), 200


if __name__ == '__main__':
    app.run(debug=True)
