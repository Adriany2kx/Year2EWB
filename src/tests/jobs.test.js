const request = require('supertest');
const session = require('supertest-session');
const app = require('../../app');

jest.mock('../controllers/job-controller', () => ({
  fetchFiltered: jest.fn().mockResolvedValue([
    {
      Title: 'Test Job',
      Description: 'This is a test job',
      Location: 'Makers Valley',
      StartDate: '2025-06-15',
      ApplyBy: '2025-06-30',
      HourlyRate: 20,
      Contract: 'Part-time',
      WeeklyHours: 25,
      Email: 'test@gmail.com'
    }
  ]),
  postJob: jest.fn((req, res) => res.redirect('/jobs'))
}));

describe('Jobs route via app.js', () => {
  let testSession;

  beforeAll(() => {
    testSession = session(app);
  });

  it('Redirects to login if user not logged in', async () => {
    const res = await testSession.get('/jobs');
    expect(res.headers.location).toBe('/users/login');
  });

  it('Renders job listings when user is logged in', async () => {
    const res = await testSession
      .get('/jobs')
      .set('x-test-login', 'true');  // Triggers fake login middleware in app.js
    expect(res.statusCode).toBe(200);
    expect(res.text).toContain('Test Job');
    expect(res.text).toContain('Jobs board');
  });

  it('Handles job post submission', async () => {
    const res = await testSession
      .post('/jobs')
      .set('x-test-login', 'true')
      .send({
        Title: 'Test Job',
        Description: 'This is a test job',
        Location: 'Makers Valley',
        StartDate: '2025-06-15',
        ApplyBy: '2025-06-30',
        HourlyRate: 20,
        Contract: 'Part-time',
        WeeklyHours: 25,
        Email: 'test@gmail.com'
    });
    expect(res.statusCode).toBe(302);
    expect(res.headers.location).toBe('/jobs');
  });
});

