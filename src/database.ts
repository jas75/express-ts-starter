import dotenv from 'dotenv';
dotenv.config();
import { Pool } from 'pg';

const { POSTGRES_HOST, POSTGRES_PORT, POSTGRES_DB, POSTGRES_USER, POSTGRES_PASSWORD } = process.env;

const pool = new Pool({
  user: POSTGRES_USER, // Remplacez par votre nom d'utilisateur PostgreSQL
  host: POSTGRES_HOST, // L'adresse de votre serveur PostgreSQL
  database: POSTGRES_DB, // Remplacez par le nom de votre base de données
  password: POSTGRES_PASSWORD, // Remplacez par votre mot de passe PostgreSQL
  port: parseInt(POSTGRES_PORT as string) // Le port par défaut de PostgreSQL
});

export default pool;
