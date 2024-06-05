import { Request, Response, Router } from 'express';
import { AuthService } from './auth.service';
import passport from '../../services/passport/passport-config';
import { config } from '../../config';
const AuthController = Router();
const service: AuthService = new AuthService();

AuthController.post('/register', async (req: Request, res: Response) => {
  const { username, password } = req.body;
  console.log(username)
  console.log(password)
  try {
    const hashedPassword = await service.hashPassword(password);
    const result = await service.registertUser(username, hashedPassword);
    console.log(result)
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.log(err);
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
    const token = service.createJWT(user.id, user.username, config.JWT_SECRET as string);
    return res.json({ token });
  })(req, res, next);
});

// Route protégée
AuthController.get('/protected', passport.authenticate('jwt', { session: false }), (req: Request, res: Response) => {
  res.send('This is a protected route');
});

export { AuthController };
