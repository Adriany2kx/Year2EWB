const request = require('supertest');
const session = require('supertest-session');
const app = require('../../app');

jest.mock('../controllers/user-controller', () => ({
  login: jest.fn((req, res) => {
    const {identifier, password} = req.body;
    if (identifier === 'validUser' && password === 'validPass') {
      req.session.user = {UserID: 1, Username: 'validUser'};
      return res.redirect('/');
    }
    return res.render('../src/views/pages/login', {
      login: {},
      errorMessage: 'Invalid credentials'
    });
  }),
  signup: [
    jest.fn((req, res, next) => next()),
    jest.fn((req, res) => {
      const {username, email} = req.body;
      if (username === 'takenUser' || email === 'taken@gmail.com') {
        return res.render('../src/views/pages/signup', {
          signup: {},
          errorMessage: 'Invalid credentials: username or email already used'
        });
      }
      return res.redirect('/users/login');
    })
  ],
  resetPassword: jest.fn((req, res) => {
    const {identifier, newPassword, newPasswordConfirmation} = req.body;
    if (newPassword !== newPasswordConfirmation) {
      return res.render('../src/views/pages/reset-password', {
        resetPassword: {},
        errorMessage: 'Password does not match, please try again'
      });
    }
    return res.redirect('/users/login');
  })
}));

describe('Users route via app.js', () => {
  let testSession;

  beforeAll(() => {
    testSession = session(app);
  });

  describe('GET routes', () => {
    it('Renders login page', async () => {
      const res = await testSession.get('/users/login');
      expect(res.statusCode).toBe(200);
      expect(res.text).toContain('Log In');
    });

    it('Renders signup page', async () => {
      const res = await testSession.get('/users/signup');
      expect(res.statusCode).toBe(200);
      expect(res.text).toContain('Sign Up');
    });

    it('Renders reset password page', async () => {
      const res = await testSession.get('/users/resetPassword');
      expect(res.statusCode).toBe(200);
      expect(res.text).toContain('Reset Password');
    });
  });

  describe('POST /users/login', () => {
    it('Logs in with valid credentials', async () => {
      const res = await testSession
        .post('/users/login')
        .send({identifier: 'validUser', password: 'validPass'});
      expect(res.statusCode).toBe(302);
      expect(res.headers.location).toBe('/');
    });

    it('Fails to login with invalid credentials', async () => {
      const res = await testSession
        .post('/users/login')
        .send({identifier: 'invalidUser', password: 'wrongPass'});
      expect(res.statusCode).toBe(200);
      expect(res.text).toContain('Invalid credentials');
    });
  });

  describe('POST /users/signup', () => {
    it('Signs up with new credentials', async () => {
      const res = await testSession
        .post('/users/signup')
        .send({
          username: 'newUser',
          forename: 'Test',
          surname: 'Test',
          email: 'new@gmail.com',
          password: 'securePass'
        });
      expect(res.statusCode).toBe(302);
      expect(res.headers.location).toBe('/users/login');
    });

    it('Fails to signup with an existing username or email', async () => {
      const res = await testSession
        .post('/users/signup')
        .send({
          username: 'takenUser',
          forename: 'Test',
          surname: 'User',
          email: 'taken@gmail.com',
          password: '123456'
        });
      expect(res.statusCode).toBe(200);
      expect(res.text).toContain('Invalid credentials: username or email already used');
    });
  });

  describe('POST /users/resetPassword', () => {
    it('Resets password when confirmation matches', async () => {
      const res = await testSession
        .post('/users/resetPassword')
        .send({
          identifier: 'validUser',
          newPassword: 'newPass123',
          newPasswordConfirmation: 'newPass123'
        });
      expect(res.statusCode).toBe(302);
      expect(res.headers.location).toBe('/users/login');
    });

    it('Fails to reset when confirmation mismatches', async () => {
      const res = await testSession
        .post('/users/resetPassword')
        .send({
          identifier: 'validUser',
          newPassword: 'newPass123',
          newPasswordConfirmation: 'wrongConfirm'
        });
      expect(res.statusCode).toBe(200);
      expect(res.text).toContain('Password does not match');
    });
  });
});
