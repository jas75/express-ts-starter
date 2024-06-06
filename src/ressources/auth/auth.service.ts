import dotenv from 'dotenv';
dotenv.config();
import bcrypt from 'bcrypt';
import { QueryResult } from 'pg';
import { pool } from '../../database';
import jwt from 'jsonwebtoken';

export class AuthService {
  public async registertUser(username: string, hashedPassword: string): Promise<QueryResult<any>> {
    try {
      const result = await pool.query('INSERT INTO users (username, password) VALUES ($1, $2) RETURNING *', [
        username,
        hashedPassword
      ]);
      return result;
    } catch (err) {
      throw err;
    }
  }

  public createJWT(userId: number, username: string, secret: string) {
    const token = jwt.sign({ userId: userId, username: username }, secret, {
      expiresIn: '1h'
    });
    return token;
  }

  public async hashPassword(password: string): Promise<string> {
    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      return hashedPassword;
    } catch (err) {
      throw err;
    }
  }
}
