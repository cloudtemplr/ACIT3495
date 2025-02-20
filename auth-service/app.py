from flask import Flask, request, jsonify, send_file, make_response
import os
from flask_jwt_extended import JWTManager, create_access_token
import mysql.connector

app = Flask(__name__)
app.config['JWT_SECRET_KEY'] = os.getenv('SECRET_KEY', 'mysecretkey')
jwt_manager = JWTManager(app)

db = mysql.connector.connect(
    host='mysql',
    user='user',
    password='password',
    database='data_db'   
)
cursor = db.cursor()

create_dataase_query = "CREATE DATABASE IF NOT EXISTS data_db"
cursor.execute(create_dataase_query)
db.commit()

create_table_query = """
CREATE TABLE IF NOT EXISTS data_db.tokens (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) NOT NULL,
    token TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
"""
cursor.execute(create_table_query)
db.commit()

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
        cursor.execute("INSERT INTO tokens (username, token) VALUES (%s, %s)", (data['username'], token))
        db.commit()  
        response = make_response(jsonify({'msg': 'Logged in successfully'}))
        response.set_cookie('token', token, httponly=True, secure=False, max_age=3600)
        
        return response

    return jsonify({'msg': 'Invalid credentials'}), 401

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
