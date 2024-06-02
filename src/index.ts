import dotenv from 'dotenv';
dotenv.config(); // Load environment variables from .env file
import express from 'express';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import compression from 'compression';
import cors from 'cors';
import { ExceptionsHandler } from './middlewares/exceptions.handler';
import { UnknownRoutesHandler } from './middlewares/unknownRoutes.handler';
import morgan from 'morgan';
import { GeocodingController } from './ressources/geocoding/geocoding.controller';
import swaggerUi from 'swagger-ui-express';
import swaggerJSDoc from 'swagger-jsdoc';
import pool from './database';
import { AuthController } from './ressources/auth/auth.controller';
import { config } from './config';

const app = express();
app.set('trust proxy', 1);
app.use(morgan('tiny'));
app.use(compression());
app.use(cookieParser());
app.use(bodyParser.json());
app.use(express.json());
app.use(cors());

// Swagger
const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'express-ts-starter',
      version: '0.0.1'
    }
  },
  apis: ['./**/*.ts'] // files containing annotations as above
};
const swaggerSpec = swaggerJSDoc(options);

if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test') {
  app.use('/api-doc', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
}
app.use('/geocode', GeocodingController);
app.use('/auth', AuthController);
// app.get('/', (req, res) => res.send('🏠'));

/**
 * Pour toutes les autres routes non définies, on retourne une erreur
 */
// app.all('*', UnknownRoutesHandler);

/**
 * Gestion des erreurs
 * /!\ Cela doit être le dernier `app.use`
 */
// app.use(ExceptionsHandler);

// if (require.main === module) {
const server = app.listen(config.API_PORT, () => console.log('Silence, ça tourne sur le port ' + config.API_PORT));
// Database test connection
(async () => {
  try {
    await pool.query('SELECT 1');
    console.log('Database runs on port ' + config.POSTGRES_PORT);
  } catch (err) {
    console.error('Unable to connect to the database:', err);
    process.exit(1); // Exit the application with a failure code
  }
})();

export { app, server, pool };
