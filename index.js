const express = require('express');
const redis = require('redis');

const application = express();

const redisClient = redis.createClient({
    host: 'redis-server'
});

// initialise the counter
redisClient.set('visits', 0);

application.get('/info', (req, resp) => {
    resp.send('Express is up and running....');
});

application.get('/visits', (req, resp) => {
    redisClient.get('visits', (err, visits) => {
        redisClient.set('visits', parseInt(visits) + 1);
        resp.send(`Number of Visits ${visits}`);
    });
});

application.listen(8095, () => {
    console.info('listening on port 8095')
});