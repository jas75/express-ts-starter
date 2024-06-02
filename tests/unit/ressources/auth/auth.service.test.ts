/* eslint-disable @typescript-eslint/no-var-requires */
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
// import { QueryResult } from 'pg';
import { AuthService } from '../../../../src/ressources/auth/auth.service';
import { bcryptMock } from '../../../mocks/bcryptMock';

// Mock pour pool.query
jest.mock('../../../../src/database', () => ({
  query: jest.fn()
}));

describe('AuthService', () => {
  describe('registertUser', () => {
    it('should insert a user into the database', async () => {
      // Mock la réponse de pool.query
      (require('../../../../src/database').query as jest.Mock).mockResolvedValueOnce({
        rows: [{ id: 1, username: 'testUser', password: 'hashedPassword' }]
      });

      const authService = new AuthService();
      const result = await authService.registertUser('testUser', 'hashedPassword');

      expect(result.rows).toHaveLength(1);
      expect(result.rows[0].id).toBe(1);
      expect(result.rows[0].username).toBe('testUser');
      expect(result.rows[0].password).toBe('hashedPassword');
    });

    it('should throw an error if the query fails', async () => {
      // Mock la réponse de pool.query pour simuler une erreur
      (require('../../../../src/database').query as jest.Mock).mockRejectedValueOnce(new Error('Database error'));

      const authService = new AuthService();
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
    it('should hash a password', async () => {
      // Mock la fonction bcrypt.hash pour retourner une valeur prédéfinie
    //   (bcrypt.hash as jest.Mock).mockResolvedValueOnce('hashedPassword');
    bcryptMock.hash.mockRejectedValueOnce(new Error('Hashing error'));

      const authService = new AuthService();
      const hashedPassword = await authService.hashPassword('password');

      expect(bcrypt.hash).toHaveBeenCalledWith('password', 10);
      expect(hashedPassword).toBe('hashedPassword');
    });

    it('should throw an error if bcrypt.hash fails', async () => {
      // Mock la fonction bcrypt.hash pour simuler une erreur
      (bcrypt.hash as jest.Mock).mockRejectedValueOnce(new Error('Hashing error'));

      const authService = new AuthService();
      await expect(authService.hashPassword('password')).rejects.toThrow('Hashing error');
    });
  });
});
