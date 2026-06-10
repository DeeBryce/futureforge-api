const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
const Cohort = require('../models/Cohort');

jest.setTimeout(30000);

let token;

describe('Cohort API Tests', () => {

  // =========================
  // SETUP
  // =========================
  beforeAll(async () => {
    require('dotenv').config();

    const uri = process.env.MONGO_URI || process.env.MONGODB_URI;
    if (!uri) throw new Error('MONGODB_URI missing');

    await mongoose.connect(uri);

    // get auth token
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'admin@futureforgelearning.com',
        password: 'FutureForge@2026',
      });

    token = res.body.token;
  });

  // clean DB after each test
  afterEach(async () => {
    await Cohort.deleteMany({});
  });

  // proper teardown
  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  });

  // =========================
  // POST /api/cohorts
  // =========================
  describe('POST /api/cohorts', () => {

    it('should create cohort successfully (authorized)', async () => {
      const res = await request(app)
        .post('/api/cohorts')
        .set('Authorization', `Bearer ${token}`)
        .send({
          cohortNumber: 101,
          startDate: '2026-01-11'
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.cohortNumber).toBe(101);
    });

    it('should reject without token', async () => {
      const res = await request(app)
        .post('/api/cohorts')
        .send({
          cohortNumber: 102,
          startDate: '2026-01-11'
        });

      expect(res.statusCode).toBe(401);
    });

    it('should reject invalid data', async () => {
      const res = await request(app)
        .post('/api/cohorts')
        .set('Authorization', `Bearer ${token}`)
        .send({});

      expect(res.statusCode).toBe(400);
    });

  });

  // =========================
  // GET ALL COHORTS
  // =========================
  describe('GET /api/cohorts', () => {

    it('should return all cohorts', async () => {

      await Cohort.create({
        cohortNumber: 999 + Math.floor(Math.random() * 1000),
        startDate: '2026-01-11'
      });

      const res = await request(app).get('/api/cohorts');

      expect(res.statusCode).toBe(200);
      expect(res.body.length).toBeGreaterThan(0);
    });

  });

  // =========================
  // GET SINGLE COHORT
  // =========================
  describe('GET /api/cohorts/:id', () => {

    it('should return a single cohort', async () => {
      const cohort = await Cohort.create({
        cohortNumber: 200 + Math.floor(Math.random() * 1000),
        startDate: '2026-01-11'
      });

      const res = await request(app).get(`/api/cohorts/${cohort._id}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.cohortNumber).toBe(cohort.cohortNumber);
    });

    it('should return 404 if not found', async () => {
      const fakeId = new mongoose.Types.ObjectId();

      const res = await request(app).get(`/api/cohorts/${fakeId}`);

      expect(res.statusCode).toBe(404);
    });

  });

  // =========================
  // PATCH STATUS
  // =========================
  describe('PATCH /api/cohorts/:id/status', () => {

    it('should update cohort status', async () => {
      const cohort = await Cohort.create({
        cohortNumber: 300 + Math.floor(Math.random() * 1000),
        startDate: '2026-01-11'
      });

      const res = await request(app)
        .patch(`/api/cohorts/${cohort._id}/status`)
        .set('Authorization', `Bearer ${token}`)
        .send({ status: 'ongoing' });

      expect(res.statusCode).toBe(200);
      expect(res.body.status).toBe('ongoing');
    });

    it('should reject invalid status', async () => {
      const cohort = await Cohort.create({
        cohortNumber: 400 + Math.floor(Math.random() * 1000),
        startDate: '2026-01-11'
      });

      const res = await request(app)
        .patch(`/api/cohorts/${cohort._id}/status`)
        .set('Authorization', `Bearer ${token}`)
        .send({ status: 'invalid-status' });

      expect(res.statusCode).toBe(400);
    });

  });

  // =========================
  // DELETE COHORT
  // =========================
  describe('DELETE /api/cohorts/:id', () => {

    it('should delete cohort', async () => {
      const cohort = await Cohort.create({
        cohortNumber: 500 + Math.floor(Math.random() * 1000),
        startDate: '2026-01-11'
      });

      const res = await request(app)
        .delete(`/api/cohorts/${cohort._id}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
    });

    it('should reject unauthorized delete', async () => {
      const cohort = await Cohort.create({
        cohortNumber: 600 + Math.floor(Math.random() * 1000),
        startDate: '2026-01-11'
      });

      const res = await request(app)
        .delete(`/api/cohorts/${cohort._id}`);

      expect(res.statusCode).toBe(401);
    });

  });

});