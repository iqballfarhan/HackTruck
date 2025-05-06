const request = require('supertest');
const app = require('../app');
const { sequelize } = require('../models');

describe('HacTruck API', () => {
  let token;
  let driverToken;
  let postId;

  beforeAll(async () => {
    await sequelize.sync({ force: true });

    // Create test user
    const userResponse = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'test@example.com',
        password: 'password123',
        role: 'user',
        name: 'Test User',
      });
    token = userResponse.body.token;

    // Create test driver
    const driverResponse = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'driver@example.com',
        password: 'password123',
        role: 'driver',
        name: 'Test Driver',
      });
    driverToken = driverResponse.body.token;
  });

  afterAll(async () => {
    await sequelize.close();
  });

  describe('Auth API', () => {
    test('should register a new user', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'newuser@example.com',
          password: 'password123',
          role: 'user',
          name: 'New User',
        });
      
      expect(response.status).toBe(201);
      expect(response.body.user).toHaveProperty('id');
      expect(response.body).toHaveProperty('token');
    });

    test('should login existing user', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123',
        });
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('token');
    });

    test('should handle google login', async () => {
      // Mock Google login (requires actual token for real testing)
      const response = await request(app)
        .post('/api/auth/google')
        .send({ token: 'mock-google-token' });
      
      expect(response.status).toBe(500); // Expect failure due to mock token
    });
  });

  describe('Post API', () => {
    test('should create a new post by driver', async () => {
      const response = await request(app)
        .post('/api/posts')
        .set('Authorization', `Bearer ${driverToken}`)
        .send({
          departureDate: '2025-05-01',
          origin: 'Jakarta',
          destination: 'Surabaya',
          truckType: 'box',
          maxWeight: 1000,
          phoneNumber: '08123456789',
        });
      
      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      postId = response.body.id;
    });

    test('should get all posts with pagination', async () => {
      const response = await request(app)
        .get('/api/posts?page=1&limit=10')
        .set('Authorization', `Bearer ${token}`);
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('posts');
      expect(response.body).toHaveProperty('totalPages');
    });

    test('should prevent non-driver from creating post', async () => {
      const response = await request(app)
        .post('/api/posts')
        .set('Authorization', `Bearer ${token}`)
        .send({
          departureDate: '2025-05-01',
          origin: 'Jakarta',
          destination: 'Surabaya',
          truckType: 'box',
          maxWeight: 1000,
          phoneNumber: '08123456789',
        });
      
      expect(response.status).toBe(403);
    });

    test('should update a post', async () => {
      const response = await request(app)
        .put(`/api/posts/${postId}`)
        .set('Authorization', `Bearer ${driverToken}`)
        .send({
          maxWeight: 1500,
        });
      
      expect(response.status).toBe(200);
      expect(response.body.maxWeight).toBe(1500);
    });

    test('should delete a post', async () => {
      const response = await request(app)
        .delete(`/api/posts/${postId}`)
        .set('Authorization', `Bearer ${driverToken}`);
      
      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Post deleted');
    });
  });
});