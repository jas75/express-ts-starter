// import { AuthService } from '../../../../src/ressources/auth/auth.service';
// import request from 'supertest';
// import { app, server } from '../../../../src';
// import pool from '../../../../src/database';

// // jest.mock('../../../../src/database');
// // jest.mock('../../../../src/ressources/auth/auth.service');
// jest.mock('../../../../src/database', () => ({
//   query: jest.fn()
// }));

// const mockPoolQuery = pool.query as jest.Mock;

// jest.mock('../../../../src/ressources/auth/auth.service');

// describe('AuthController', () => {
//   // let req: Partial<Request>;
//   // let res: Partial<Response>;
//   // let next: jest.Mock;
//   let authService: AuthService;

//   // beforeEach(() => {
//   //   req = {
//   //     body: {},
//   //     params: {}
//   //   };
//   //   res = {
//   //     status: jest.fn().mockReturnThis(),
//   //     json: jest.fn()
//   //   };
//   //   next = jest.fn();
//   //   authService = new AuthService() as jest.Mocked<AuthService>;
//   // });
//   // const mockPoolQuery = pool.query as jest.Mock;

//   beforeEach(() => {
//     authService = new AuthService();
//     // authService = new AuthService();
//     // mockPoolQuery.mockClear();
//     authService.registertUser = jest.fn();

//   });
  
//   afterAll(async () => {
//     jest.clearAllMocks();
//     await server.close();
//     // await pool.end();
//   });

//   describe('POST /auth/register', () => {
//     it('should work', async () => {
//         const username = 'testUser';
//       // const password = 'password';
//       const hashedPassword = 'hashedPassword';
//       const user = { id: 1, username: 'testUser', password: 'hashedPassword' };

//     //   jest.spyOn(authService, 'hashPassword').mockResolvedValue(hashedPassword);
//     // console.log(mockPoolQuery.mockResolvedValueOnce({ rows: [user] }))
//       // mockPoolQuery.mockResolvedValueOnce({ rows: [user] });

//       authService.registertUser = jest.fn().mockResolvedValue({
//         command: '',
//         rowCount: 1,
//         oid: 0,
//         fields: [],
//         rows: [user],
//       });
//       // jest.spyOn(authService, 'registertUser').mockResolvedValue({
//       //   command: '',
//       //   rowCount: 1,
//       //   oid: 0,
//       //   fields: [],
//       //   rows: [user]
//       // });
//       const response = await request(app)
//         .post('/auth/register')
//         .send({ username, hashedPassword });

//         console.log(response.body)
//     //   expect(response.status).toBe(201);
//       expect(response.body).toEqual(user);
//     });

//     // it('should register a new user', async () => {
//     //   const hashedPassword = 'hashedPassword';
//     //   const user = { id: 1, username: 'testUser' };
//     //   req.body = { username: 'testUser', password: 'password' };
//     //   const mockHashPassword = jest.spyOn(authService, 'hashPassword').mockResolvedValue(hashedPassword);
//     //   const mockRegisterUser = jest
//     //     .spyOn(authService, 'registertUser')
//     //     .mockResolvedValue({ rows: [user] } as QueryResult<any>);
//     //   await AuthController['/register'](req as Request, res as Response);
//     //   expect(mockHashPassword).toHaveBeenCalledWith('password');
//     //   expect(mockRegisterUser).toHaveBeenCalledWith('testUser', hashedPassword);
//     //   expect(res.status).toHaveBeenCalledWith(201);
//     //   expect(res.json).toHaveBeenCalledWith(user);
//     // });
//     // it('should handle errors during registration', async () => {
//     //   req.body = { username: 'testUser', password: 'password' };
//     //   authService.hashPassword.mockRejectedValueOnce(new Error('Hashing error'));
//     //   await AuthController['/register'](req as Request, res as Response);
//     //   expect(res.status).toHaveBeenCalledWith(500);
//     //   expect(res.json).toHaveBeenCalledWith({ error: 'Database error', details: new Error('Hashing error') });
//     // });
//   });

//   // describe('POST /login', () => {
//   //   it('should log in a user', async () => {
//   //     const user = { id: 1, username: 'testUser' };
//   //     const token = 'testToken';
//   //     authService.createJWT.mockReturnValueOnce(token);
//   //     const authenticateFn = jest.fn((req, res, next) => {
//   //       req.user = user;
//   //       next();
//   //     });
//   //     passport.authenticate.mockReturnValueOnce(authenticateFn);
//   //     await AuthController['/login'](req as Request, res as Response, next);
//   //     expect(passport.authenticate).toHaveBeenCalledWith('local', expect.any(Function));
//   //     expect(authService.createJWT).toHaveBeenCalledWith(user.id, user.username, config.JWT_SECRET);
//   //     expect(res.json).toHaveBeenCalledWith({ token });
//   //   });
//   //   it('should handle errors during login', async () => {
//   //     const authenticateFn = jest.fn((req, res, next) => {
//   //       next(new Error('Authentication error'));
//   //     });
//   //     passport.authenticate.mockReturnValueOnce(authenticateFn);
//   //     await AuthController['/login'](req as Request, res as Response, next);
//   //     expect(res.status).toHaveBeenCalledWith(500);
//   //     expect(res.json).toHaveBeenCalledWith({
//   //       error: 'Authentication error',
//   //       details: new Error('Authentication error')
//   //     });
//   //   });
//   // });
//   // describe('GET /protected', () => {
//   //   it('should return "This is a protected route"', () => {
//   //     const authenticateFn = jest.fn((req, res, next) => {
//   //       req.user = { id: 1, username: 'testUser' };
//   //       next();
//   //     });
//   //     passport.authenticate.mockReturnValueOnce(authenticateFn);
//   //     AuthController['/protected'](req as Request, res as Response);
//   //     expect(res.send).toHaveBeenCalledWith('This is a protected route');
//   //   });
//   // });
// });



import request from 'supertest';
import express from 'express';
import { AuthService } from '../../../../src/ressources/auth/auth.service';
// import { AuthController } from './auth.controller';
import pool from '../../../../src/database'; // Importer le mock de la base de données
import { AuthController } from '../../../../src/ressources/auth/auth.controller';
import { app, server } from '../../../../src';

// Mock AuthService
jest.mock('../../../../src/ressources/auth/auth.service', () => {
  return {
    AuthService: jest.fn().mockImplementation(() => ({
      hashPassword: jest.fn(),
      registertUser: jest.fn()
    }))
  };
});

jest.mock('../../../../src/database', () => {
  return {
    query: jest.fn()
  }
}); // Mock la base de données

// Créer une instance mock du AuthService
// const mockAuthService = {
//   hashPassword: jest.fn(),
//   registertUser: jest.fn()
// };

// Assigner l'instance mock à AuthService
(AuthService as jest.Mock).mockImplementation(() => mockAuthService);

const MockAuthService = AuthService as jest.MockedClass<typeof AuthService>;
describe('AuthController', () => {

  beforeEach(() => {
    // app = express();
    // app.use(express.json());

  });

  afterEach(() => {
    jest.clearAllMocks();
  });

    afterAll(async () => {
    // jest.clearAllMocks();
    await server.close();
    // await pool.end();
  });

  it('should register a user successfully', async () => {
    const mockUser = { id: 1, username: 'testuser', password: 'hashedpassword' };
    MockAuthService.hashPassword.mockResolvedValue('hashedpassword');
    (pool.query as jest.Mock).mockResolvedValue({ rows: [mockUser] });

    const response = await request(app)
      .post('/auth/register')
      .send({ username: 'testuser', password: 'testpassword' });

    expect(response.status).toBe(201);
    expect(response.body).toEqual(mockUser);
    expect(mockAuthService.hashPassword).toHaveBeenCalledWith('testpassword');
    expect(pool.query).toHaveBeenCalledWith(
      'INSERT INTO users (username, password) VALUES ($1, $2) RETURNING *',
      ['testuser', 'hashedpassword']
    );
  });

  // it('should return 500 if registration fails', async () => {
  //   authServiceMock.hashPassword.mockResolvedValue('hashedpassword');
  //   (pool.query as jest.Mock).mockRejectedValue(new Error('Database error'));

  //   const response = await request(app)
  //     .post('/auth/register')
  //     .send({ username: 'testuser', password: 'testpassword' });

  //   expect(response.status).toBe(500);
  //   expect(response.body).toEqual({ error: 'Database error', details: {} });
  //   expect(authServiceMock.hashPassword).toHaveBeenCalledWith('testpassword');
  //   expect(pool.query).toHaveBeenCalledWith(
  //     'INSERT INTO users (username, password) VALUES ($1, $2) RETURNING *',
  //     ['testuser', 'hashedpassword']
  //   );
  // });
});
