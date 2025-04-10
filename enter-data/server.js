const express = require('express');
const mysql = require('mysql2');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const app = express();
const cookieParser = require('cookie-parser');
require('dotenv').config();
const axios = require('axios');


app.use(cookieParser());
app.use(express.json());

const db = mysql.createConnection({
  host: 'mysql',
  user: 'user',
  password: 'password',
  database: 'data_db'
});

db.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL:', err);
    return;
  }
  
  console.log('Connected to MySQL');
  
  app.get('/data', (req, res) => {
    const token = req.cookies.token;
    db.query(
      `CREATE TABLE IF NOT EXISTS records (
        id INT AUTO_INCREMENT PRIMARY KEY,
        temperature DECIMAL(5,2),
        heartrate INT,
        weight DECIMAL(5,2)
      )`,
      (err) => {
        if (err) {
          console.error('Error creating table:', err);
          return;
        }
        console.log('Table is ready');
      }
    );
  });
    
    if (!token) {
      return res.status(403).json({ msg: 'No token provided' });
  }

  jwt.verify(token, process.env.JWT_SECRET_KEY, (err, decoded) => {
    if (err) {
      return res.status(403).json({ msg: 'Invalid token' });
    }

    res.sendFile(__dirname + '/index.html');  
  });
});

app.post('/enterdata', (req, res) => {
    const token = req.cookies.token;

    if (!token) {
        return res.status(403).json({ msg: 'No token provided' });
    }

    jwt.verify(token, process.env.JWT_SECRET_KEY, (err, decoded) => {
        if (err) {
            return res.status(403).json({ msg: 'Invalid token' });
        }

        const temperature = parseFloat(req.body.value.temperature);  // Convert to float
        const heartrate = parseInt(req.body.value.heartrate, 10);    // Convert to integer
        const weight = parseFloat(req.body.value.weight);           // Convert to float
        console.log('Received data:', temperature, heartrate, weight);
        console.log('Types - Temperature:', typeof temperature, 'HeartRate:', typeof heartrate, 'Weight:', typeof weight);

        const query = 'INSERT INTO records (temperature, heartrate, weight) VALUES (?, ?, ?)';
        db.query(query, [temperature, heartrate, weight], (err, result) => {
            if (err) {
                console.error('Error storing data:', err.sqlMessage);
                return res.status(500).json({ msg: 'Error storing data' });
            }
            res.status(200).json({ msg: 'Data stored successfully' });
        });      
    });
});

app.listen(3000, () => console.log('Enter Data service running on port 3000'));