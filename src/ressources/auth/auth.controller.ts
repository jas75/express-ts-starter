import { Request, Response, Router } from 'express';
// import { AuthService } from './auth.service';
import pool from '../../database';
import bcrypt from 'bcrypt';
import passport from '../../services/passport/passport-config';
import jwt from 'jsonwebtoken';
import { config } from '../../config';
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

AuthController.post('/login', (req: Request, res: Response, next) => {
  passport.authenticate('local', (err: any, user: any, info: any) => {
    if (err) {
      return res.status(500).json({ error: 'Authentication error', details: err });
    }
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials', details: info });
    }
    const token = jwt.sign({ userId: user.id, username: user.username }, config.JWT_SECRET as string, {
      expiresIn: '1h'
    });
    return res.json({ token });
  })(req, res, next);
});

// Route protégée
AuthController.get('/protected', passport.authenticate('jwt', { session: false }), (req: Request, res: Response) => {
  res.send('This is a protected route');
});

export { AuthController };
