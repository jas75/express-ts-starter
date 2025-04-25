import request from 'supertest';
import { app, server } from '../../../../src';
import { pool } from '../../../../src/database';

describe('AuthController', () => {
  let token: any;
  afterAll(async () => {
    await pool.query(`DELETE FROM users WHERE username = 'testUser'`);
    await pool.end();
    await server.close();
  });
  describe('POST /auth/register', () => {
    it('should register a user', async () => {
      const response = await request(app).post('/auth/register').send({ username: 'testUser', password: 'password' });
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id');
      expect(response.body.username).toBe('testUser');
    });

    it('should return 500 if service throws an error', async () => {
      const err = await request(app).post('/auth/register').send({ username: 'testUser', password: 'password' });
      expect(err.status).toBe(500);
    });
  });

  describe('POST /auth/login', () => {
    it('should log in a user', async () => {
      const response = await request(app).post('/auth/login').send({ username: 'testUser', password: 'password' });
      token = response.body.token;
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('token');
    });

    it('should return 401 if credentials are invalid', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({ username: 'wronguser', password: 'wrongpassword' });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('GET /auth/protected', () => {
    it('should access a protected route', async () => {
      const response = await request(app).get('/auth/protected').set('Authorization', `Bearer ${token}`);
      expect(response.status).toBe(200);
    });

    it('should return 401 for unauthenticated requests', async () => {
      const response = await request(app).get('/auth/protected');
      expect(response.status).toBe(401);
    });
  });
});
