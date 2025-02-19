from flask import Flask, request, jsonify, send_file
import os
from flask_jwt_extended import JWTManager, create_access_token

app = Flask(__name__)
app.config['JWT_SECRET_KEY'] = os.getenv('SECRET_KEY', 'mysecretkey')
jwt_manager = JWTManager(app)

@app.route('/login', methods=['GET'])
def login_page():
    return send_file('index.html') 

@app.route('/authenticate', methods=['POST'])
def login():
    data = request.json
    if not data or 'username' not in data or 'password' not in data:
        return jsonify({'msg': 'Missing username or password'}), 400
    
    if data['username'] == 'admin' and data['password'] == 'password':
        token = create_access_token(identity=data['username'])
        return jsonify(access_token=token)
    
    return jsonify({'msg': 'Invalid credentials'}), 401

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
