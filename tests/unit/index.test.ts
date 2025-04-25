import { app, server } from '../../src/index';
import request from 'supertest';
import { pool } from '../../src/database';

describe('Test server initialization and routes', () => {
  afterAll(async () => {
    await server.close();
    await pool.end();
  });

  it('should return 404 for unknown routes', async () => {
    const response = await request(app).get('/unknown-route');
    expect(response.status).toBe(404);
  });

  it('should return 401 for unauthorized routes', async () => {
    const response = await request(app).get('/auth/protected');
    expect(response.status).toBe(401);
  });

  it('should serve Swagger docs in development', async () => {
    const response = await request(app).get('/api-doc/');
    expect(response.status).toBe(200 || 304);
  });

  it('should connect to the database', async () => {
    const res = await pool.query('SELECT 1');
    expect(res.rowCount).toBe(1);
  });
});
