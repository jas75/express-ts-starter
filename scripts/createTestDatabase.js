const dotenv = require('dotenv');
const { Client } = require('pg');
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
const sanitizedDbName = databaseName.replace(/"/g, '""');

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
            console.log('erreur la ?')

            await client.query(`CREATE DATABASE ${sanitizedDbName}`);
            console.log('il passe pas la ')
            console.log(`Database  '${sanitizedDbName}' created successfully.`);
        }
    } catch (err) {
        console.error('Error creating the database:', err);
    }
}

createTestDatabase();
