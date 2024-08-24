import cluster from 'cluster';

if (cluster.isPrimary) 
    { 
    const numCPUs = 2; 

    for (let i = 0; i < numCPUs; i++) {
        cluster.fork();
    }

    
    
    cluster.on('exit', (worker, code, signal) => {
        console.log(`Worker ${worker.process.pid} died`);
        cluster.fork(); 
    });
} else {
    import('./app.js'); 
}
