const express = require('express');
const mysql = require('mysql2');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
app.use(express.json());

const db = mysql.createConnection({
  host: '3495-mysql',
  user: 'user',
  password: 'password',
  database: 'data_db'
});

db.connect(() => {

  console.log('Connected to MySQL');
  
  // Create table if it doesn't exist
  db.query(
    `CREATE TABLE IF NOT EXISTS records (
      id INT AUTO_INCREMENT PRIMARY KEY,
      temperature DECIMAL(5,2),
      heartrate INT,
      weight DECIMAL(5,2),
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    )`
  );
});

app.get('/data', (req, res) => {
  const { token } = req.headers;
  jwt.verify(token, process.env.SECRET_KEY, (err) => {
    if (err) return res.sendStatus(403);  
    res.sendFile(__dirname + '/index.html', () => {
      res.setHeader('X-Auth-Token', token)
    });
  });
});

app.post('/enterdata', (req, res) => {
  const { token, value } = req.body;
  jwt.verify(token, process.env.SECRET_KEY, (err) => {
    if (err) return res.sendStatus(403);
    db.query('INSERT INTO records (temperature, heartrate, weight) VALUES (?, ?, ?)', [value.temperature, value.heartrate, value.weight], (err) => {
      if (err) return res.sendStatus(500);
      res.sendStatus(201);
    });
  });
});

app.listen(3000, () => console.log('Enter Data service running on port 3000'));