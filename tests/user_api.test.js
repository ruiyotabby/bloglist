const supertest = require('supertest')
const app = require('../app')
const api = supertest(app)
const User = require('../models/user')
const mongoose = require('mongoose')

beforeEach( async () => {
  await User.deleteMany({})
})

test('all users are returned', async () => {
  const users = await User.find({})

  await api
    .get('/api/users')
    .expect(200)
    .expect('Content-Type', /application\/json/)


})

test('when a valid user is added', async () => {
  const usersAtStart = await User.find({})

  const user = {
    name: 'root',
    username: 'root',
    password: '123'
  }

  await api
    .post('/api/users')
    .send(user)
    .expect(201)
    .expect('Content-Type', /application\/json/)

  const usersAtEnd = await User.find({})

  expect(usersAtEnd.map(u => u.passwordHash)).not.toContain('123')
  expect(usersAtEnd).toHaveLength(usersAtStart.length + 1)
})

afterAll(async ()=> await mongoose.connection.close())