/* eslint-disable @typescript-eslint/no-var-requires */
import jwt from 'jsonwebtoken';
import { AuthService } from '../../../../src/ressources/auth/auth.service';
import pool from '../../../../src/database';
// Mock pour pool.query
jest.mock('../../../../src/database', () => ({
  query: jest.fn()
}));

describe('AuthService', () => {
  let authService: AuthService;
  const mockPoolQuery = pool.query as jest.Mock;

  beforeEach(() => {
    authService = new AuthService();
    mockPoolQuery.mockClear();
  });

  describe('registerUser', () => {
    it('should insert a user into the database', async () => {
      // Mock la réponse de pool.query
      mockPoolQuery.mockResolvedValueOnce({
        rows: [{ id: 1, username: 'testUser', password: 'hashedPassword' }]
      });

      const result = await authService.registertUser('testUser', 'hashedPassword');

      expect(result.rows).toHaveLength(1);
      expect(result.rows[0].id).toBe(1);
      expect(result.rows[0].username).toBe('testUser');
      expect(result.rows[0].password).toBe('hashedPassword');
    });

    it('should throw an error if the query fails', async () => {
      // Mock la réponse de pool.query pour simuler une erreur
      mockPoolQuery.mockRejectedValueOnce(new Error('Database error'));

      await expect(authService.registertUser('testUser', 'hashedPassword')).rejects.toThrow('Database error');
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
