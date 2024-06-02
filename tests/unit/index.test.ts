import dotenv from 'dotenv';
dotenv.config(); // Load environment variables from .env file
import app from '../../src/index';
import request from 'supertest';
import pool from '../../src/database';

describe('Test server initialization and routes', () => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  // let sever;
  // afterAll(async (done) => {
  //   await pool.end(); // Ferme la connexion à la base de données après tous les tests
  // });

  // beforeAll(async () => {
  //   await pool.query('SELECT 1');
  // });
  // it('should start the server and respond to the /geocode route', async () => {
  //   const response = await request(app).get('/geocode');
  //   expect(response.status).toBe(200); // Assurez-vous que cette route existe et retourne un statut 200
  // });

  // it('should respond to the /auth route', async () => {
  //   const response = await request(app).get('/auth');
  //   expect(response.status).toBe(200); // Assurez-vous que cette route existe et retourne un statut 200
  // });

  it('should return 404 for unknown routes', async () => {
    const response = await request(app).get('/unknown-route');
    expect(response.status).toBe(404);
  });

  it('should return 401 for unauthorized routes', async () => {
    const response = await request(app).get('/auth/protected');
    expect(response.status).toBe(401);
  });

  it('should serve Swagger docs in development', async () => {
    console.log('NODE_ENV:')
    console.log(process.env.NODE_ENV)

    console.log(process.env.POSTGRES_USER)

    // if (process.env.NODE_ENV === 'development') {
    const response = await request(app).get('/api-doc/');
    // console.log(response)
    // console.log('IL PASSE LA DEDANS ?')
    expect(response.status).toBe(200 || 304);
    // }
  });

  it('should connect to the database', async () => {
    const res = await pool.query('SELECT 1');
    expect(res.rowCount).toBe(1);
  });
});
