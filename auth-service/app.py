from flask import Flask, request, jsonify
import jwt
import datetime
import os
from flask_jwt_extended import JWTManager, create_access_token

app = Flask(__name__)
app.config['JWT_SECRET_KEY'] = os.getenv('SECRET_KEY', 'mysecretkey')
jwt_manager = JWTManager(app)

@app.route('/login', methods=['POST'])
def login():
    data = request.json
    if data['username'] == 'admin' and data['password'] == 'password':
        token = create_access_token(identity=data['username'])
        return jsonify(access_token=token)
    return jsonify({'msg': 'Invalid credentials'}), 401

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)