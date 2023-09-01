const mongoose = require('mongoose');
const supertest = require('supertest');
const app = require('../app')
const Blog = require('../models/blog');
const api = supertest(app)

const initialBlogs = [
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

  let blogObjects = initialBlogs.map(blog => new Blog(blog))
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

  expect(returnedBlogs.body).toHaveLength(initialBlogs.length)
})

test('a specific title is within the returned blogs', async () => {
  const returnedBlogs = await api.get('/api/blogs')
  const titles = returnedBlogs.body.map(blog => blog.title)

  expect(titles).toContain('First')
})

test('unique identifier is named id', async () => {
  const returnedBlogs = await api.get('/api/blogs')

  expect(returnedBlogs.body[0].id).toBeDefined()
})

test('new blog post is saved to db', async () => {
  const newBlog = {
    title: "Third",
    author: "hakuna",
    likes: 99
  }
  const blog = new Blog(newBlog)
  await blog.save()
  const blogs = await api.get('/api/blogs')
  const titles = blogs.body.map(b => b.title)

  expect(blogs.body).toHaveLength(initialBlogs.length+1)
  expect(titles).toContain('Third')
})

afterAll(async () => await mongoose.connection.close())