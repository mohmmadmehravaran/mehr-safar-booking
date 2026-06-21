import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { createApp } from '../app.js';

const app = createApp();

describe('Mehr Safar API', () => {
  let adminToken = '';

  beforeAll(() => {
    process.env.NODE_ENV = 'test';
  });

  it('GET /health -> ok', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });

  it('GET /api/hotels -> list with pagination', async () => {
    const res = await request(app).get('/api/hotels');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.pagination).toBeDefined();
  });

  it('GET /api/hotels/:id -> single hotel with rooms', async () => {
    const res = await request(app).get('/api/hotels/1');
    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe(1);
    expect(Array.isArray(res.body.data.rooms)).toBe(true);
  });

  it('POST /api/auth/admin/login -> token', async () => {
    const res = await request(app)
      .post('/api/auth/admin/login')
      .send({ username: process.env.ADMIN_USERNAME || 'admin', password: process.env.ADMIN_PASSWORD || 'admin123' });
    expect(res.status).toBe(200);
    expect(res.body.token).toBeTruthy();
    adminToken = res.body.token;
  });

  it('blocks hotel creation without admin token', async () => {
    const res = await request(app).post('/api/hotels').send({});
    expect(res.status).toBe(401);
  });

  it('registers a user and logs in', async () => {
    const phone = '0912' + Math.floor(1000000 + Math.random() * 8999999);
    const reg = await request(app).post('/api/auth/register').send({
      fullName: 'تست کاربر', phone, email: `t${Date.now()}@example.com`, password: 'secret123',
    });
    expect(reg.status).toBe(201);
    expect(reg.body.token).toBeTruthy();
  });

  it('admin can create a hotel', async () => {
    const res = await request(app)
      .post('/api/hotels')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'هتل تست', city: 'تهران', address: 'خ تست', stars: 4, type: 'هتل',
        review: 'خوب', reviewScore: 8, pricePerNight: 1000000,
        rooms: [{ name: 'اتاق تست', capacity: 2, price: 1000000, count: 3, features: [] }],
      });
    expect(res.status).toBe(201);
    expect(res.body.data.id).toBeGreaterThan(0);
  });
});
