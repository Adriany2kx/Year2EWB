const request = require('supertest');
const app = require('../../app');
const db = require('../config/db');
const workshopController = require('../controllers/workshop-controller');
const workshopModel = require('../models/workshop-model');

// -----------------------
// INTEGRATION TESTS
// -----------------------

describe('integration - /workshops endpoints', () => {
  let createdPostID = null;

  // clear tables first, then add test user
  beforeAll(async () => {
    await db.execute('DELETE FROM Workshop');
    await db.execute('DELETE FROM Post');
    await db.execute("DELETE FROM User WHERE UserID = 1");
    await db.execute(
      `INSERT INTO User (UserID, Username, Forename, Surname, Email, Password) 
       VALUES (1, 'testuser', 'Test', 'User', 'test@example.com', 'password')`
    );
  });

  afterAll(async () => {
    // remove anything created during tests
    await db.execute('DELETE FROM Workshop');
    await db.execute('DELETE FROM Post');
    await db.execute("DELETE FROM User WHERE UserID = 1");
  });

  test('should redirect to login if not logged in', async () => {
    const res = await request(app).get('/workshops');
    expect(res.statusCode).toBe(302);
    expect(res.headers.location).toMatch(/users\/login/);
  });

  test('should load workshops page if logged in', async () => {
    const res = await request(app)
      .get('/workshops')
      .set('x-test-login', 'true');
    expect(res.statusCode).toBe(200);
    // just check page loads, not content details
    expect(res.text).toMatch(/workshop/i);
  });

  test('should create a new workshop', async () => {
    const payload = {
      title: 'integration workshop',
      description: 'made by test',
      location: 'Cape Town',
      startDate: '2100-01-01',
      applyBy: '2100-01-01',
      date: '2100-01-01',
      remainingSlots: 3,
    };

    const res = await request(app)
      .post('/workshops')
      .set('x-test-login', 'true')
      .type('form')
      .send(payload);

    expect(res.statusCode).toBe(302);

    // confirm it really got inserted
    const [rows] = await db.query(
      'SELECT * FROM Workshop w JOIN Post p ON w.PostID = p.PostID WHERE p.Title = ?',
      [payload.title]
    );
    expect(rows.length).toBe(1);
    createdPostID = rows[0].PostID;
  });

  test('should delete a workshop with /delete/:id', async () => {
    expect(createdPostID).not.toBeNull();

    const res = await request(app)
      .post(`/workshops/delete/${createdPostID}`)
      .set('x-test-login', 'true');
    expect(res.statusCode).toBe(302);

    // make sure it's gone
    const [rows] = await db.query('SELECT * FROM Workshop WHERE PostID = ?', [createdPostID]);
    expect(rows.length).toBe(0);
  });
});

// -----------------------
// UNIT TESTS
// -----------------------

describe('unit - workshop controller/model', () => {
  // clear tables before each test
  beforeEach(async () => {
    await db.execute('DELETE FROM Workshop');
    await db.execute('DELETE FROM Post');
    await db.execute("DELETE FROM User WHERE UserID = 1");
    await db.execute(
      `INSERT INTO User (UserID, Username, Forename, Surname, Email, Password) 
       VALUES (1, 'testuser', 'Test', 'User', 'test@example.com', 'password')`
    );
  });

  test('fetchFiltered returns an array', async () => {
    const result = await workshopController.fetchFiltered('', '');
    expect(Array.isArray(result)).toBe(true);
  });

  test('fetchFiltered actually finds a unique workshop by title', async () => {
    // make a workshop with a unique name
    const uniqueTitle = 'unittest_workshop_' + Math.floor(Math.random() * 100000);
    const description = 'unit test desc';
    const location = 'Jozi';
    const startDate = '2101-01-01';
    const applyBy = '2101-01-01';
    const date = '2101-01-01';
    const remainingSlots = 8;

    const [postRes] = await db.execute(
      `INSERT INTO Post (UserID, Title, Description, Location, StartDate, ApplyBy, Type) VALUES (?, ?, ?, ?, ?, ?, 'Workshop')`,
      [1, uniqueTitle, description, location, startDate, applyBy]
    );

    // deal with possible differences in insertId/returned value
    let postID = postRes.insertId;
    if (!postID) {
      // fallback for MySQL2 weirdness
      const [row] = await db.query('SELECT PostID FROM Post WHERE Title = ?', [uniqueTitle]);
      postID = row[0].PostID;
    }

    await workshopModel.createWorkshop(postID, date, remainingSlots);

    // see if we can find it with a search
    const found = await workshopController.fetchFiltered(uniqueTitle, '');
    expect(found.some(w => w.Title === uniqueTitle)).toBe(true);

    // clean up
    await db.execute('DELETE FROM Workshop WHERE PostID = ?', [postID]);
    await db.execute('DELETE FROM Post WHERE PostID = ?', [postID]);
  });

  test('deleteWorkshop removes both workshop and post', async () => {
    // add a dummy to delete
    const [postRes] = await db.execute(
      `INSERT INTO Post (UserID, Title, Description, Location, StartDate, ApplyBy, Type) VALUES (?, ?, ?, ?, ?, ?, 'Workshop')`,
      [1, 'delete_me', 'desc', 'somewhere', '2102-01-01', '2102-01-01']
    );

    let postID = postRes.insertId;
    if (!postID) {
      const [row] = await db.query('SELECT PostID FROM Post WHERE Title = "delete_me"');
      postID = row[0].PostID;
    }

    await workshopModel.createWorkshop(postID, '2102-01-01', 2);

    await workshopModel.deleteWorkshop(postID);

    // check both are gone
    const [wRows] = await db.query('SELECT * FROM Workshop WHERE PostID = ?', [postID]);
    expect(wRows.length).toBe(0);
    const [pRows] = await db.query('SELECT * FROM Post WHERE PostID = ?', [postID]);
    expect(pRows.length).toBe(0);
  });
});

// close database connection after all tests
afterAll(async () => {
  try {
    await db.end();
  } catch (err) {
    console.error('Error closing database connection:', err);
  }
});