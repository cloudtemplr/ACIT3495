from flask import Flask, jsonify
import mysql.connector
import pymongo
import numpy as np

app = Flask(__name__)

mysql_conn = mysql.connector.connect(
    host='localhost',
    user='user',
    password='password',
    database='data_db'
)

mongo_client = pymongo.MongoClient('mongodb://localhost:27017/')
mongo_db = mongo_client['analytics_db']

@app.route('/analyze', methods=['GET'])
def analyze():
    cursor = mysql_conn.cursor()
    cursor.execute('SELECT value FROM records')
    values = [row[0] for row in cursor.fetchall()]
    
    max_val = np.max(values)
    min_val = np.min(values)
    avg_val = np.mean(values)
    
    stats = {
        'max': int(max_val),  
        'min': int(min_val),  
        'avg': float(avg_val) 
    }
    
    result = mongo_db.results.insert_one(stats)
    
    inserted_stats = mongo_db.results.find_one({'_id': result.inserted_id})
    inserted_stats['_id'] = str(inserted_stats['_id'])
    
    return jsonify(inserted_stats)
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001)