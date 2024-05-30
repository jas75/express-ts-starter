import dotenv from 'dotenv';
dotenv.config(); // Load environment variables from .env file

export const config = {
  API_PORT: process.env.API_PORT,
  JWT_SECRET: process.env.JWT_SECRET,
  POSTGRES_PORT: process.env.POSTGRES_PORT
};
