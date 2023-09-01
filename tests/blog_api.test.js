const mongoose = require('mongoose');
const supertest = require('supertest');
const app = require('../app')
const Blog = require('../models/blog');
const api = supertest(app)

const initialBlogs = [
  {
    title: "First",
    author: "mwenyewe",
    url: 'https://loclhost:10000',
    likes: 4
  },
  {
    title: "Second",
    author: "mgeni",
    url: 'https://loclhost:10000',
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

describe('a blog post', () => {
  test('is saved to db if valid', async () => {
    const newBlog = {
      title: "Third",
      author: "hakuna",
      url: 'https://loclhost:10000',
      likes: 99
    }
    const blog = new Blog(newBlog)
    await blog.save()
    const blogs = await api.get('/api/blogs')
    const titles = blogs.body.map(b => b.title)

    await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(201)
    .expect('Content-Type', /application\/json/)

    expect(blogs.body).toHaveLength(initialBlogs.length+1)
    expect(titles).toContain('Third')
  })

  test('without likes will default to 0', async () => {
    const newBlog = {
      title: "Some title",
      url: 'https://loclhost:10000',
      author: "hakuna"
    }

    const blog = new Blog(newBlog)
    await blog.save()
    const blogs = await api.get('/api/blogs')

    expect(blogs.body[initialBlogs.length].likes).toBe(0)
  })

  test('without title and url is invalid', async () => {
    const newBlog = {
      title: "fourth",
      author: "leao",
      likes: 99
    }

    let error

    try {
      const blog = new Blog(newBlog)
      await blog.save()
      
      expect(blog._id).toBeUndefined()
    } catch (exception) {
      error = exception
    }

    const blogs = await api.get('/api/blogs')
    const titles = blogs.body.map(b => b.title)

    await api
      .post('/api/blogs')
      .send(newBlog)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    expect(error).toBeInstanceOf(mongoose.Error.ValidationError)
    expect(blogs.body).toHaveLength(initialBlogs.length)
    expect(titles).not.toContain('fourth')
  })

})

afterAll(async () => await mongoose.connection.close())