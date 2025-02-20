from flask import Flask, jsonify, request
import mysql.connector
import pymongo
import numpy as np
from datetime import datetime
import os
import jwt
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

db = mysql.connector.connect(
    host='mysql',
    user='user',
    password='password',
    database='data_db'
)
cursor = db.cursor()

mongo_client = pymongo.MongoClient('mongodb://mongodb:27017/')
mongo_db = mongo_client['analytics_db']
SECRET_KEY = os.getenv('JWT_SECRET_KEY', 'mysecretkey')

def perform_analysis(data):
    temperatures = [record[0] for record in data]
    heart_rates = [record[1] for record in data]
    weights = [record[2] for record in data]

    return {
        'temperature': {
            'min': min(temperatures),
            'max': max(temperatures),
            'avg': sum(temperatures) / len(temperatures)
        },
        'heart_rate': {
            'min': min(heart_rates),
            'max': max(heart_rates),
            'avg': sum(heart_rates) / len(heart_rates)
        },
        'weight': {
            'min': min(weights),
            'max': max(weights),
            'avg': sum(weights) / len(weights)
        }
    }

@app.route('/analyze', methods=['POST'])
def analyze():
    token = request.cookies.get('token')

    if not token:
        return jsonify({'msg': 'No token provided'}), 403
    
    decoded = jwt.decode(token, SECRET_KEY, algorithms=['HS256'])

    if decoded is None:
        return jsonify({'msg': 'Invalid or expired token'}), 401

    cursor.execute("SELECT temperature, heart_rate, weight FROM records")
    data = cursor.fetchall()
    
    if not data:
        return jsonify({'msg': 'No data found for analysis'}), 404
    analysis_result = perform_analysis(data)
    result = mongo_db.results.insert_one(analysis_result)
    
    inserted_stats = mongo_db.results.find_one({'_id': result.inserted_id})
    inserted_stats['_id'] = str(inserted_stats['_id'])
    
    return jsonify(inserted_stats)
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001)