const express = require('express');
const { MongoClient } = require('mongodb');
const cookieParser = require('cookie-parser');
const path = require('path');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
const mongoUrl = 'mongodb://mongodb:27017';
const client = new MongoClient(mongoUrl);

// Use cookie-parser middleware
app.use(cookieParser());
app.use(express.static('public')); // Serve static files like the HTML, CSS, JS


// Serve the HTML page at the /results route
app.get('/results', (req, res) => {
  const token = req.cookies.token;
  
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

// API route to fetch analyzed data
app.get('/show-results', async (req, res) => {
  const token = req.cookies.token;
  
    if (!token) {
      return res.status(403).json({ msg: 'No token provided' });
    }
  
    jwt.verify(token, process.env.JWT_SECRET_KEY, (err, decoded) => {
      if (err) {
        return res.status(403).json({ msg: 'Invalid token' });
      }
    });
  await client.connect();
  const db = client.db('analytics_db');
  const results = await db.collection('results').find().toArray();

  const analyticsData = {
    temperature: {
      min: Math.min(...results.map(r => r.temperature)),
      max: Math.max(...results.map(r => r.temperature)),
      avg: results.reduce((acc, r) => acc + r.temperature, 0) / results.length,
    },
    heart_rate: {
      min: Math.min(...results.map(r => r.heart_rate)),
      max: Math.max(...results.map(r => r.heart_rate)),
      avg: results.reduce((acc, r) => acc + r.heart_rate, 0) / results.length,
    },
    weight: {
      min: Math.min(...results.map(r => r.weight)),
      max: Math.max(...results.map(r => r.weight)),
      avg: results.reduce((acc, r) => acc + r.weight, 0) / results.length,
    },
  };

  res.json(analyticsData);
});

app.listen(3001, () => console.log('Show Results service running on port 3001'));
