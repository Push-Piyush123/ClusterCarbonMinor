const dotenv = require('dotenv');
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const { calculateClusterEmissions, getEmissionStatus, getDashboardMetrics } = require('./services/emissionCalculationService');
const Cluster = require('./models/Cluster');

dotenv.config();

const runTest = async () => {
    try {
        await connectDB();
        console.log("Connected to DB, running emission calculations test...");
        
        const cluster = await Cluster.findOne({ sector: "Foundry", state: "Maharashtra" });
        if (!cluster) {
            console.log("No Foundry - Maharashtra cluster found. Did Phase 3 run properly?");
            return;
        }

        const clusterId = cluster._id.toString();
        const periodStart = "2024-06-01";
        const periodEnd = "2024-06-30";
        const periodLabel = "June 2024";

        console.log(`Calculating emissions for Cluster ${clusterId} (${cluster.clusterName}) for ${periodLabel}...`);
        
        const result = await calculateClusterEmissions(clusterId, periodStart, periodEnd, periodLabel);
        console.log("\nCalculation API Result:");
        console.log(JSON.stringify(result, null, 2));

        if (result.success && result.summaries && result.summaries.length > 0) {
            const firstMsme = result.summaries[0].msmeId;
            console.log(`\nTesting getEmissionStatus for MSME ${firstMsme}...`);
            const status = await getEmissionStatus(firstMsme);
            console.log("MSME Status:", JSON.stringify(status, null, 2));
            
            console.log("\nTesting getDashboardMetrics...");
            const dashboard = await getDashboardMetrics();
            console.log("Dashboard Metrics:", JSON.stringify(dashboard, null, 2));
        }

    } catch (error) {
        console.error("Test error:", error);
    } finally {
        await mongoose.disconnect();
        console.log("Disconnected DB");
        process.exit(0);
    }
};

runTest();
