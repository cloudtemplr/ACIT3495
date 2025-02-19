const express = require('express');
const { MongoClient } = require('mongodb');
require('dotenv').config();

const app = express();
const mongoUrl = 'mongodb://mongodb:27017';
const client = new MongoClient(mongoUrl);

app.get('/results', async (req, res) => {
  await client.connect();
  const db = client.db('analytics_db');
  const results = await db.collection('results').find().toArray();
  res.json(results);
});

app.listen(3001, () => console.log('Show Results service running on port 3001'));
