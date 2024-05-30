import dotenv from 'dotenv'
dotenv.config() // Load environment variables from .env file
// import * as swaggerDocument from './../swagger.json'
import express from 'express'
// import http from 'http';
import { config } from './config'
import bodyParser from 'body-parser'
import cookieParser from 'cookie-parser'
import compression from 'compression'
import cors from 'cors'
import { ExceptionsHandler } from './middlewares/exceptions.handler'
import { UnknownRoutesHandler } from './middlewares/unknownRoutes.handler'
import morgan from 'morgan'
import { GeocodingController } from './ressources/geocoding/geocoding.controller'
import { rateLimit } from 'express-rate-limit'
import swaggerUi from 'swagger-ui-express'
import swaggerJSDoc from 'swagger-jsdoc'

const app = express()
app.set('trust proxy', 1)

app.use(morgan('tiny'))
app.use(compression())
app.use(cookieParser())
app.use(bodyParser.json())
app.use(express.json())
app.use(cors())
// app.use(limiter);

// Swagger
const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Planner api',
      version: '0.1.2'
    }
  },
  apis: ['./**/*.ts'] // files containing annotations as above
}
const swaggerSpec = swaggerJSDoc(options)

if (process.env.NODE_ENV === 'development') {
  app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec))
}
app.use('/geocode', GeocodingController)

// app.get('/', (req, res) => res.send('🏠'));

/**
 * Pour toutes les autres routes non définies, on retourne une erreur
 */
app.all('*', UnknownRoutesHandler)

/**
 * Gestion des erreurs
 * /!\ Cela doit être le dernier `app.use`
 */
app.use(ExceptionsHandler)

app.listen(config.API_PORT, () => console.log('Silence, ça tourne sur le port ' + config.API_PORT))
