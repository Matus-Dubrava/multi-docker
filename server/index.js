const express = require('express');
const redis = require('redis');
const cors = require('cors');
const bodyParser = require('body-parser');

const keys = require('./keys');

// app setup
const app = express();
app.use(cors());
app.use(bodyParser.json());

// postgres setup
const { Pool } = require('pg');

const pgClient = new Pool({
    host: keys.pgHost,
    user: keys.pgUser,
    port: keys.pgPort,
    password: keys.pgPassword,
    database: keys.pgDatabase
});

pgClient.on('error', () => {
    console.log('Lost PG connection');
});

pgClient
    .query('CREATE TABLE IF NOT EXISTS values(number INT)')
    .catch(err => console.log(err));

// redis setup
const redisClient = redis.createClient({
    host: keys.redisHost,
    port: keys.redisPort,
    retry_strategy: () => 1000
});

const redisPublisher = redisClient.duplicate();

// Express route handlers
app.get('/', (req, res) => {
    res.send('hi');
});

app.get('/values/all', async (req, res) => {
    const values = await pgClient.query('SELECT * FROM values');

    res.send(values.rows);
});

app.get('/values/current', async (req, res) => {
    redisClient.hgetall('values', (err, values) => {
        res.send(values);
    });
});

app.post('/values', async (req, res) => {
    const index = req.body.index;

    if (parseInt(index) > 40) {
        return res.status(422).send('index too high');
    }

    redisClient.hset('values', index, 'nothing yet!');
    redisPublisher.publish('insert', index);
    pgClient.query('INSERT INTO values(number) VALUES ($1)', [index]);
    res.send({ working: true });
});

app.listen(5000, err => {
    console.log('listening...');
});
