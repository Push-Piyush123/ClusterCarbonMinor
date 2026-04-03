const dotenv = require('dotenv');
const connectDB = require('./config/db');
const clusteringService = require('./services/clusteringService');
const mongoose = require('mongoose');

dotenv.config();

const runTest = async () => {
    try {
        await connectDB();
        console.log("Connected to DB, running recompute...");
        
        const result = await clusteringService.recomputeClusters();
        console.log("Recompute API Result:", JSON.stringify(result, null, 2));

        if(result.success && result.clusters.length > 0) {
            console.log("\nTesting getClusterMetrics for first cluster...");
            const firstClusterId = result.clusters[0]._id; // we might not have _id since recompute only returns sector, state, membercount mapping, let's fetch it
            
            const Cluster = require('./models/Cluster');
            const c = await Cluster.findOne({ sector: result.clusters[0].sector, state: result.clusters[0].state });
            
            if (c) {
                const metrics = await clusteringService.getClusterMetrics(c._id);
                console.log("Metrics Result:", JSON.stringify(metrics, null, 2));
            }
        }
    } catch(err) {
        console.error("Test error:", err);
    } finally {
        await mongoose.disconnect();
        console.log("Disconnected DB");
        process.exit(0);
    }
};

runTest();
