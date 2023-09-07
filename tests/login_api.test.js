const app = require('../app')
const supertest = require('supertest')
const api = supertest(app)
const mongoose = require('mongoose')

test('should return 200 if username and password are correct', async () => {
  const user = {
    username: 'john1',
    password: 'john2023'
  }
  await api
    .post('/api/login')
    .send(user)
    .expect(200)
    .expect('Content-Type', /application\/json/)
})

test('should return 401 if username or password is incorrect', async () => {
  const user = {
    username: 'john1',
    password: 'john20'
  }
  await api
    .post('/api/login')
    .send(user)
    .expect(401)
    .expect('Content-Type', /application\/json/)
})

afterAll(async () => mongoose.connection.close())