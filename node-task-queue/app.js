import express, { json } from 'express';
import { appendFileSync } from 'fs';
import { join } from 'path';
import { RateLimiterRedis } from 'rate-limiter-flexible';
import { createClient } from 'redis';

import taskQueue from './taskQueue.js';
const app = express();
const PORT = process.env.PORT || 3000;


const redisClient = createClient();



const rateLimiter = new RateLimiterRedis({
    storeClient: redisClient,
    points: 20, // 20 requests
    duration: 60, // Per 60 seconds (1 minute)
    keyPrefix: 'rate-limit',
    execEvenly: true, // Spread requests evenly over duration
});

app.use(json());

const logFilePath = join(__dirname, 'task.log');


async function task(user_id) {
    const logMessage = `${user_id} - task completed at - ${new Date().toISOString()}\n`;
    appendFileSync(logFilePath, logMessage);
    console.log(logMessage.trim());
}

app.post('/api/v1/task', async (req, res) => {
    const { user_id } = req.body;

    try {
        await rateLimiter.consume(user_id, 1);

        taskQueue.addTask(user_id, async () => {
            await task(user_id);
        });

        res.status(200).send({ message: 'Task queued' });
    } catch (rateLimiterRes) {
        res.status(429).send({ message: 'Rate limit exceeded, task queued' });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
