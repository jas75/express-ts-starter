import { Request, Response, Router } from 'express';
// import { AuthService } from './auth.service';
import pool from '../../database';
import bcrypt from 'bcrypt';

const AuthController = Router();
// const service: AuthService = new AuthService();

AuthController.post('/register', async (req: Request, res: Response) => {
  const { username, password } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await pool.query('INSERT INTO users (username, password) VALUES ($1, $2) RETURNING *', [
      username,
      hashedPassword
    ]);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Database error', details: err });
  }
});

export { AuthController };
