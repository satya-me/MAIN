require('dotenv').config();

const mongoose = require('mongoose');

const certificatePath = process.env.CERTIFICATE_PATH || "global-bundle.pem";
const MONGODB_URI = "mongodb://intelliSaver:intelliSaver_2024@intellisavermdb.cluster-cnk86qi66aj9.us-east-1.docdb.amazonaws.com:27017/?tls=true&tlsCAFile=" + certificatePath + "&replicaSet=rs0&readPreference=secondaryPreferred&retryWrites=false";

const connectToDatabase = async () => {
    try {
        await mongoose.connect(MONGODB_URI);
        const dbInfo = {
            status: 'Connected to the database',
            host: mongoose.connection.host,
            DB: mongoose.connection.name,
        };

        console.table(dbInfo);
    } catch (error) {
        console.error('Error connecting to the database:', error);
        process.exit(1); // Exit the application on database connection error
    }
};

module.exports = { connectToDatabase };
