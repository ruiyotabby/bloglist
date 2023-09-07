const supertest = require('supertest')
const app = require('../app')
const api = supertest(app)
const User = require('../models/user')
const mongoose = require('mongoose')

beforeEach( async () => {
  await User.deleteMany({})

  const initialNote = new User({
    name: 'John',
    username: 'john1',
    password: 'john2023'
  })

  await initialNote.save()
})

test('all users are returned', async () => {
  const users = await User.find({})

  await api
    .get('/api/users')
    .expect(200)
    .expect('Content-Type', /application\/json/)


})

describe('a new user', () => {
  test('is added when valid', async () => {
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

  test('returns 400 when a user without password is added', async () => {
    const usersAtStart = await User.find({})

    const user = {
      name: 'root',
      username: 'root'
    }

    await api
      .post('/api/users')
      .send(user)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    const usersAtEnd = await User.find({})

    expect(usersAtEnd).toHaveLength(usersAtStart.length)
  })

  test('fails if a user with a short password is added', async () => {
    const usersAtStart = await User.find({})

    const user = {
      name: 'root',
      username: 'root',
      password: '1'
    }

    await api
      .post('/api/users')
      .send(user)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    const usersAtEnd = await User.find({})

    expect(usersAtEnd).toHaveLength(usersAtStart.length)
  })

  test('fails when a user with a duplicate username is added', async () => {
    const usersAtStart = await User.find({})

    const user = {
      name: 'John',
      username: 'john1',
      password: 'john2023'
    }

    await api
      .post('/api/users')
      .send(user)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    const usersAtEnd = await User.find({})

    expect(usersAtEnd).toHaveLength(usersAtStart.length)
  })
})

afterAll(async ()=> await mongoose.connection.close())