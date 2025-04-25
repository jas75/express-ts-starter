/* eslint-disable @typescript-eslint/no-var-requires */
import dotenv from 'dotenv';
dotenv.config();
import jwt from 'jsonwebtoken';
import { AuthService } from '../../../../src/ressources/auth/auth.service';
import { pool } from '../../../../src/database';
import { server } from '../../../../src';

describe('AuthService', () => {
  let authService: AuthService;

  beforeAll(() => {
    authService = new AuthService();
  });

  afterAll(async () => {
    await pool.end();
    await server.close();
  });

  describe('registerUser', () => {
    it('should insert a user into the database  and return the result', async () => {
      const result = await authService.registertUser('testUser', 'hashedPassword');
      expect(result.rows).toHaveLength(1);
      expect(result.rows[0].username).toBe('testUser');
      expect(result.rows[0].password).toBe('hashedPassword');
    });

    it('should throw an error if the query fails', async () => {
      try {
        await authService.registertUser('testUser', 'hashedPassword');
      } catch (err: any) {
        expect(err.code).toBe('23505');
        await pool.query(`DELETE FROM users WHERE username = 'testUser'`);
      }
    });
  });

  describe('createJWT', () => {
    it('should create a JWT token', () => {
      const authService = new AuthService();
      const token = authService.createJWT(1, 'testUser', 'secret');

      const decoded = jwt.verify(token, 'secret') as { userId: number; username: string };
      expect(decoded.userId).toBe(1);
      expect(decoded.username).toBe('testUser');
    });
  });

  describe('hashPassword', () => {
    it('should hash a password asynchronously', async () => {
      const password = 'password123';
      const hashedPassword = await authService.hashPassword(password);
      expect(hashedPassword).toBeDefined();
      expect(typeof hashedPassword).toBe('string');
      expect(hashedPassword.length).toBeGreaterThan(0);
    });
  });
});
