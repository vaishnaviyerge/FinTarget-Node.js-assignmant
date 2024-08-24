import Queue from 'bull';

const taskQueue = new Queue('task-queue', {
    redis: {
        host: '127.0.0.1',
        port: 6379,
    },
});

taskQueue.process(async (job, done) => {
    const { user_id, taskFunction } = job.data;
    await taskFunction(user_id);
    done();
});

function addTask(user_id, taskFunction) {
    taskQueue.add({ user_id, taskFunction }, {
        attempts: 3,
        backoff: 1000,
    });
}

export default {
    addTask,
};
