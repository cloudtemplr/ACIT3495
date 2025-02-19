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

db.connect();

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
    db.query('INSERT INTO records (value) VALUES (?)', [value], (err) => {
      if (err) return res.sendStatus(500);
      res.sendStatus(201);
    });
  });
});

app.listen(3000, () => console.log('Enter Data service running on port 3000'));