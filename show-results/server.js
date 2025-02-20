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
app.get('/results', async (req, res) => {
  const token = req.cookies.token;
  
  if (!token) {
    return res.status(403).json({ msg: 'No token provided' });
  }

  jwt.verify(token, process.env.JWT_SECRET_KEY, async (err, decoded) => {
    if (err) {
      return res.status(403).json({ msg: 'Invalid token' });
    }

    // Connect to MongoDB and fetch results
    await client.connect();
    const db = client.db('analytics_db');
    const results = await db.collection('results').find().toArray();
    console.log(results); // Debugging log
    
    if (results.length === 0) {
      return res.status(404).json({ msg: 'No analysis data found' });
    }
    const analyticsData = results[0];
    // Render the HTML page with the analytics data embedded
    res.send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Show Results</title>
          <style>
              body {
                  font-family: Arial, sans-serif;
                  display: flex;
                  justify-content: center;
                  align-items: center;
                  height: 100vh;
                  background-color: #f4f4f4;
              }
              .container {
                  background: white;
                  padding: 20px;
                  border-radius: 10px;
                  box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);
                  text-align: center;
                  width: 300px;
              }
              button {
                  width: calc(100% - 20px);
                  padding: 10px;
                  margin: 10px 0;
                  border: 1px solid #ccc;
                  border-radius: 5px;
                  background-color: #28a745;
                  color: white;
                  cursor: pointer;
              }
              button:hover {
                  background-color: #218838;
              }
          </style>
      </head>
      <body>
          <div class="container">
              <h2>Show Results</h2>
              <h3>Temperature Analytics:</h3>
              <p>Min: ${analyticsData.temperature.t_min}</p>
              <p>Max: ${analyticsData.temperature.t_max}</p>
              <p>Avg: ${analyticsData.temperature.t_avg}</p>
              <h3>Heart Rate Analytics:</h3>
              <p>Min: ${analyticsData.heart_rate.h_min}</p>
              <p>Max: ${analyticsData.heart_rate.h_max}</p>
              <p>Avg: ${analyticsData.heart_rate.h_avg}</p>
              <h3>Weight Analytics:</h3>
              <p>Min: ${analyticsData.weight.w_min}</p>
              <p>Max: ${analyticsData.weight.w_max}</p>
              <p>Avg: ${analyticsData.weight.w_avg}</p>
              <button onclick="redirectToEnterData()">Enter Data</button>
          </div>

          <script>
              // Redirect to the Enter Data page
              function redirectToEnterData() {
                  window.location.href = 'http://localhost:3000/data';
              }
          </script>
      </body>
      </html>
    `);
  });
});

app.listen(3001, () => console.log('Show Results service running on port 3001'));
