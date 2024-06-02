import request from 'supertest';
import app from '../../src/index';
import pool from '../../src/database';

describe('Test server initialization and routes', () => {
  afterAll(async () => {
    await pool.end(); // Ferme la connexion à la base de données après tous les tests
  });

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
    expect(response.status).toBe(404); // Assurez-vous que les routes inconnues retournent un 404
  });

  it('should serve Swagger docs in development', async () => {
    if (process.env.NODE_ENV === 'development') {
      const response = await request(app).get('/docs');
      expect(response.status).toBe(200); // Assurez-vous que les docs Swagger sont servis en développement
    }
  });

  it('should connect to the database', async () => {
    const res = await pool.query('SELECT 1');
    expect(res.rowCount).toBe(1); // Vérifie que la base de données répond correctement
  });
});
