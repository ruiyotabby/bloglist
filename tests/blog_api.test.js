const mongoose = require('mongoose');
const supertest = require('supertest');
const app = require('../app')
const Blog = require('../models/blog');
const api = supertest(app)

const initialBlog = [
  {
    title: "First",
    author: "mwenyewe",
    likes: 4
  },
  {
    title: "Second",
    author: "mgeni",
    likes: 2
  }
]

beforeEach(async () => {
  await Blog.deleteMany({})

  let blogObjects = initialBlog.map(blog => new Blog(blog))
  const promiseArray = blogObjects.map(blog => blog.save())
  await Promise.all(promiseArray)
})

test('should return blogs as json', async () => {
  await api
    .get('/api/blogs')
    .expect(200)
    .expect('Content-Type', /application\/json/)
})

test('should return all blogs', async () => {
  const returnedBlogs = await api.get('/api/blogs')

  expect(returnedBlogs.body).toHaveLength(initialBlog.length)
})

test('a specific title is within the returned blogs', async () => {
  const returnedBlogs = await api.get('/api/blogs')
  const titles = returnedBlogs.body.map(blog => blog.title)

  expect(titles).toContain('First')
})

afterAll(async () => await mongoose.connection.close())