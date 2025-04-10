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
results = mongo_db['results']
SECRET_KEY = os.getenv('JWT_SECRET_KEY', 'mysecretkey')

def perform_analysis(data):
    temperatures = [float(record[0]) for record in data]
    heart_rates = [record[1] for record in data]
    weights = [float(record[2]) for record in data]
    if not temperatures or not heart_rates or not weights:
        return {
            'temperature': {'t_min': 0, 't_max': 0, 't_avg': 0},
            'heart_rate': {'h_min': 0, 'h_max': 0, 'h_avg': 0},
            'weight': {'w_min': 0, 'w_max': 0, 'w_avg': 0}
        }
    return {
        'temperature': {
            't_min': min(temperatures),
            't_max': max(temperatures),
            't_avg': sum(temperatures) / len(temperatures)
        },
        'heart_rate': {
            'h_min': min(heart_rates),
            'h_max': max(heart_rates),
            'h_avg': sum(heart_rates) / len(heart_rates)
        },
        'weight': {
            'w_min': min(weights),
            'w_max': max(weights),
            'w_avg': sum(weights) / len(weights)
        }
    }

@app.route('/analyze', methods=['GET'])
def analyze():
    token = request.cookies.get('token')

    if not token:
        return jsonify({'msg': 'No token provided'}), 403
    
    decoded = jwt.decode(token, SECRET_KEY, algorithms=['HS256'])

    if decoded is None:
        return jsonify({'msg': 'Invalid or expired token'}), 401

    cursor.execute("SELECT temperature, heartrate, weight FROM records")
    data = cursor.fetchall()
    print(data)
    
    if not data:
        return jsonify({'msg': 'No data found for analysis'}), 404
    analysis_result = perform_analysis(data)
    results.delete_many({})

    result = mongo_db.results.insert_one(analysis_result)
    print(result)
    inserted_stats = mongo_db.results.find_one({'_id': result.inserted_id})
    inserted_stats['_id'] = str(inserted_stats['_id'])

    cursor.close()
    db.close()
    
    return jsonify(inserted_stats)
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001)