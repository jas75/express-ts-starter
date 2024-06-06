const dotenv = require('dotenv');
const { execSync } = require('child_process');
const { Client } = require('pg');
const util = require('util');
const { exec } = require('child_process');
// Charger les variables d'environnement depuis le fichier .env
dotenv.config();

// Configuration de la connexion à partir des variables d'environnement
const config = {
    user: process.env.POSTGRES_USER,
    host: process.env.POSTGRES_HOST,
    password: process.env.POSTGRES_PASSWORD,
    port: process.env.POSTGRES_PORT,
};

const databaseName = process.env.POSTGRES_DB + '_test';
const sanitizedDbName = databaseName.replace(/"/g, '""').replace(/-/g, '_');;

async function testDatabaseExists(client, dbName) {
    const result = await client.query(`SELECT 1 FROM pg_database WHERE datname = $1`, [sanitizedDbName]);
    return result.rows.length > 0;
}

async function createTestDatabase() {
    const client = new Client(config);

    try {
        await client.connect();
        console.log(`Connected to PostgreSQL.`);

        const exists = await testDatabaseExists(client, sanitizedDbName);

        if (exists) {
            console.log(`Database '${sanitizedDbName}' exists`);
        } else {
            await client.query(`CREATE DATABASE ${sanitizedDbName}`);
            console.log(`Database  '${sanitizedDbName}' created successfully.`);

            process.env.POSTGRES_DB = sanitizedDbName;
            const execAsync = util.promisify(exec);
            console.log('Running migrations ..')
            await execAsync('npm run migrate:up:test');
            console.log('Migrations done.');
            
        }
    } catch (err) {
        console.error('Error during process:', err);
    }
}

createTestDatabase();
