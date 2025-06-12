const request = require('supertest');
const app = require('../../app');
const db = require('../config/db');
const volunteeringController = require('../controllers/volunteering-controller');
const volunteeringModel = require('../models/volunteering-model');


// -----------------------
// INTEGRATION TESTS
// -----------------------

describe('integration - /volunteering endpoints', () => {
  let createdPostID = null;

  beforeAll(async () => {
    await db.execute('DELETE FROM Volunteer');
    await db.execute('DELETE FROM Application');
    await db.execute('DELETE FROM Post');
    await db.execute("DELETE FROM User WHERE UserID = 1");
    await db.execute(
      `INSERT INTO User (UserID, Username, Forename, Surname, Email, Password, CredibilityPoints) 
       VALUES (1, 'testuser', 'Test', 'User', 'test@example.com', 'password', 0)`
    );
  });

  afterAll(async () => {
    await db.execute('DELETE FROM Volunteer');
    await db.execute('DELETE FROM Application');
    await db.execute('DELETE FROM Post');
    await db.execute("DELETE FROM User WHERE UserID = 1");
  });

  test('should redirect to login if not logged in', async () => {
    const res = await request(app).get('/volunteering');
    expect(res.statusCode).toBe(302);
    expect(res.headers.location).toMatch(/users\/login/);
  });

  test('should load volunteering page if logged in', async () => {
    const res = await request(app)
      .get('/volunteering')
      .set('x-test-login', 'true');
    expect(res.statusCode).toBe(200);
    expect(res.text).toMatch(/volunteer/i);
  });

  test('should create a new volunteer post', async () => {
    const payload = {
      title: 'test vol title',
      description: 'test desc',
      location: 'Testville',
      startDate: '2100-01-01',
      applyBy: '2100-01-01',
      points: 10
    };

    const res = await request(app)
      .post('/volunteering/create')
      .set('x-test-login', 'true')
      .type('form')
      .send(payload);

    expect(res.statusCode).toBe(302);
    const [rows] = await db.query(
      'SELECT * FROM Volunteer v JOIN Post p ON v.PostID = p.PostID WHERE p.Title = ?',
      [payload.title]
    );
    expect(rows.length).toBe(1);
    createdPostID = rows[0].PostID;
  });

  test('should delete a volunteering post', async () => {
    expect(createdPostID).not.toBeNull();
    const res = await request(app)
      .post(`/volunteering/delete/${createdPostID}`)
      .set('x-test-login', 'true');
    expect(res.statusCode).toBe(302);

    const [rows] = await db.query('SELECT * FROM Volunteer WHERE PostID = ?', [createdPostID]);
    expect(rows.length).toBe(0);
  });
});

// -----------------------
// UNIT TESTS- MODEL
// -----------------------

describe('unit - volunteering model functions', () => {
    beforeEach(async () => {
      await db.execute('DELETE FROM Volunteer');
      await db.execute('DELETE FROM Application');
      await db.execute('DELETE FROM Post');
      await db.execute("DELETE FROM User WHERE UserID = 1");
      await db.execute(
        `INSERT INTO User (UserID, Username, Forename, Surname, Email, Password, CredibilityPoints)
         VALUES (1, 'testuser', 'Test', 'User', 'test@example.com', 'password', 0)`
      );
    });
  
    test('createVolunteerEvent inserts correctly', async () => {
      const data = {
        userId: 1,
        title: 'unit create test',
        description: 'description',
        location: 'somewhere',
        startDate: '2100-01-01',
        applyBy: '2100-01-01',
        points: 5
      };
      await volunteeringModel.createVolunteerEvent(data);
      const [rows] = await db.query('SELECT * FROM Post WHERE Title = ?', [data.title]);
      expect(rows.length).toBe(1);
    });
  
    test('getAllVolunteerEvents returns posts and joined flag', async () => {
      const data = {
        userId: 1,
        title: 'getAll test',
        description: 'desc',
        location: 'loc',
        startDate: '2100-01-01',
        applyBy: '2100-01-01',
        points: 3
      };
      await volunteeringModel.createVolunteerEvent(data);
      const allPosts = await volunteeringModel.getAllVolunteerEvents(1);
      expect(Array.isArray(allPosts)).toBe(true);
      expect(allPosts[0]).toHaveProperty('PostID');
    });
  
    test('joinVolunteerEvent adds application and updates points', async () => {
      const data = {
        userId: 1,
        title: 'join test',
        description: 'desc',
        location: 'place',
        startDate: '2100-01-01',
        applyBy: '2100-01-01',
        points: 10
      };
      await volunteeringModel.createVolunteerEvent(data);
      const [postRows] = await db.query('SELECT * FROM Post WHERE Title = ?', [data.title]);
      const postID = postRows[0].PostID;
      await volunteeringModel.joinVolunteerEvent(1, postID);
  
      const [apps] = await db.query('SELECT * FROM Application WHERE UserID = 1 AND PostID = ?', [postID]);
      expect(apps.length).toBe(1);
      const [user] = await db.query('SELECT * FROM User WHERE UserID = 1');
      expect(user[0].CredibilityPoints).toBe(10);
    });
  
    test('unjoinVolunteerEvent removes application and reduces points', async () => {
      const data = {
        userId: 1,
        title: 'unjoin test',
        description: 'desc',
        location: 'city',
        startDate: '2100-01-01',
        applyBy: '2100-01-01',
        points: 8
      };
      await volunteeringModel.createVolunteerEvent(data);
      const [postRows] = await db.query('SELECT * FROM Post WHERE Title = ?', [data.title]);
      const postID = postRows[0].PostID;
      await volunteeringModel.joinVolunteerEvent(1, postID);
      await volunteeringModel.unjoinVolunteerEvent(1, postID);
  
      const [apps] = await db.query('SELECT * FROM Application WHERE UserID = 1 AND PostID = ?', [postID]);
      expect(apps.length).toBe(0);
      const [user] = await db.query('SELECT * FROM User WHERE UserID = 1');
      expect(user[0].CredibilityPoints).toBe(0);
    });
  
    test('getApplicantsForPost returns correct format', async () => {
      const data = {
        userId: 1,
        title: 'applicant test',
        description: 'desc',
        location: 'town',
        startDate: '2100-01-01',
        applyBy: '2100-01-01',
        points: 4
      };
      await volunteeringModel.createVolunteerEvent(data);
      const [postRows] = await db.query('SELECT * FROM Post WHERE Title = ?', [data.title]);
      const postID = postRows[0].PostID;
      await volunteeringModel.joinVolunteerEvent(1, postID);
  
      const applicants = await volunteeringModel.getApplicantsForPost(postID);
      expect(applicants.length).toBe(1);
      expect(applicants[0]).toHaveProperty('UserID');
      expect(applicants[0]).toHaveProperty('CredibilityPoints');
    });
  
    test('getVolunteerPost returns correct data', async () => {
      const data = {
        userId: 1,
        title: 'getVolPost',
        description: 'desc',
        location: 'area',
        startDate: '2100-01-01',
        applyBy: '2100-01-01',
        points: 2
      };
      await volunteeringModel.createVolunteerEvent(data);
      const [rows] = await db.query('SELECT * FROM Post WHERE Title = ?', [data.title]);
      const postID = rows[0].PostID;
  
      const result = await volunteeringModel.getVolunteerPost(postID);
      expect(result).toHaveProperty('PostID');
      expect(result.Title).toBe(data.title);
    });
  
    test('deleteVolunteerEvent removes the post', async () => {
      const data = {
        userId: 1,
        title: 'deleteVolPost',
        description: 'desc',
        location: 'spot',
        startDate: '2100-01-01',
        applyBy: '2100-01-01',
        points: 7
      };
      await volunteeringModel.createVolunteerEvent(data);
      const [rows] = await db.query('SELECT * FROM Post WHERE Title = ?', [data.title]);
      const postID = rows[0].PostID;
  
      await volunteeringModel.deleteVolunteerEvent(postID);
      const [deleted] = await db.query('SELECT * FROM Post WHERE PostID = ?', [postID]);
      expect(deleted.length).toBe(0);
    });
  });

// -----------------------
// UNIT TESTS - CONTROLLER
// -----------------------

describe('unit - volunteering controller functions', () => {
  const createMockRes = () => {
    const res = {};
    res.locals = { loggedIn: true, language: 'en' };
    res.render = jest.fn();
    res.redirect = jest.fn();
    res.status = jest.fn().mockReturnValue(res);
    res.send = jest.fn();
    return res;
  };

  const createMockReq = (sessionData = {}, queryData = {}, params = {}, bodyData = {}) => ({
    session: { user: { UserID: 1, ...sessionData } },
    query: queryData,
    params,
    body: bodyData
  });

  test('handleJoinEvent redirects after joining', async () => {
    const req = createMockReq({}, {}, { id: '5' });
    const res = createMockRes();
    volunteeringModel.joinVolunteerEvent = jest.fn();

    await volunteeringController.handleJoinEvent(req, res);
    expect(volunteeringModel.joinVolunteerEvent).toHaveBeenCalled();
    expect(res.redirect).toHaveBeenCalledWith('/volunteering');
  });

  test('handleCreate creates post and redirects', async () => {
    const req = createMockReq({}, {}, {}, {
      title: 'test',
      description: 'desc',
      location: 'loc',
      startDate: '2100-01-01',
      applyBy: '2100-01-01',
      points: '5'
    });
    const res = createMockRes();
    volunteeringModel.createVolunteerEvent = jest.fn();

    await volunteeringController.handleCreate(req, res);
    expect(volunteeringModel.createVolunteerEvent).toHaveBeenCalled();
    expect(res.redirect).toHaveBeenCalledWith('/volunteering');
  });

  test('handleUnjoinEvent redirects after unjoining', async () => {
    const req = createMockReq({}, {}, { id: '6' });
    const res = createMockRes();
    volunteeringModel.unjoinVolunteerEvent = jest.fn();

    await volunteeringController.handleUnjoinEvent(req, res);
    expect(volunteeringModel.unjoinVolunteerEvent).toHaveBeenCalled();
    expect(res.redirect).toHaveBeenCalledWith('/volunteering');
  });

  test('handleDeleteEvent only deletes if owner and redirects', async () => {
    const req = createMockReq({}, {}, { id: '10' });
    const res = createMockRes();
    volunteeringModel.getVolunteerPost = jest.fn().mockResolvedValue({ UserID: 1 });
    volunteeringModel.deleteVolunteerEvent = jest.fn();

    await volunteeringController.handleDeleteEvent(req, res);
    expect(volunteeringModel.getVolunteerPost).toHaveBeenCalledWith(10);
    expect(volunteeringModel.deleteVolunteerEvent).toHaveBeenCalledWith(10);
    expect(res.redirect).toHaveBeenCalledWith('/volunteering');
  });

  test('viewApplicants renders applicant view', async () => {
    const req = createMockReq({}, {}, { id: '9' });
    const res = createMockRes();
    const mockApplicants = [{ UserID: 1, Username: 'test' }];
    volunteeringModel.getApplicantsForPost = jest.fn().mockResolvedValue(mockApplicants);

    await volunteeringController.viewApplicants(req, res);
    expect(volunteeringModel.getApplicantsForPost).toHaveBeenCalledWith(9);
    expect(res.render).toHaveBeenCalledWith('../src/views/pages/view-applicants', { applicants: mockApplicants });
  });
});

afterAll(async () => {
  try {
    await db.end();
  } catch (err) {
    console.error('Error closing DB connection:', err);
  }
});
