const mongoose = require('mongoose');
const supertest = require('supertest');
const app = require('../app')
const Blog = require('../models/blog');
const api = supertest(app)
const User = require('../models/user')

const getToken = async () => {
  const user = {
    username: 'john1',
    password: 'john2023'
  }

  const token = await api.post('/api/login').send(user)
  return token
}

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

describe('a new blog post', () => {
  test('is saved to db if valid', async () => {
    const blogsAtStart = await api.get('/api/blogs')

    const newBlog = {
      title: "Third",
      author: "hakuna",
      url: 'https://loclhost:10000',
      likes: 99
    }

    const token = await getToken()

    await api
      .post('/api/blogs')
      .auth(token.body.token, { type: 'bearer' })
      .send(newBlog)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const blogsAtEnd = await api.get('/api/blogs')
    expect(blogsAtEnd.body).toHaveLength(blogsAtStart.body.length+1)

    const titles = blogsAtEnd.body.map(b => b.title)
    expect(titles).toContain('Third')
  })

  test('isnot saved to db if unautorized', async () => {
    const blogsAtStart = await api.get('/api/blogs')

    const newBlog = {
      title: "Third",
      author: "hakuna",
      url: 'https://loclhost:10000',
      likes: 99
    }

    await api
      .post('/api/blogs')
      .send(newBlog)
      .expect(401)
      .expect('Content-Type', /application\/json/)

    const blogsAtEnd = await api.get('/api/blogs')
    expect(blogsAtEnd.body).toHaveLength(blogsAtStart.body.length)

    const titles = blogsAtEnd.body.map(b => b.title)
    expect(titles).not.toContain('Third')
  })

  test('without likes will default to 0', async () => {
    const newBlog = {
      title: "Some title",
      url: 'https://loclhost:10000',
      author: "hakuna"
    }

    const token = await getToken()

    await api
      .post('/api/blogs')
      .auth(token.body.token, { type: 'bearer' })
      .send(newBlog)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const blogs = await api.get('/api/blogs')

    expect(blogs.body[initialBlogs.length].likes).toBe(0)
  })

  test('without title and url is invalid', async () => {
    const newBlog = {
      title: "fourth",
      author: "leao",
      likes: 99
    }

    try {
      const blog = new Blog(newBlog)
      await blog.save()

      expect(blog._id).toBeUndefined()
    } catch (exception) {
      expect(exception).toBeInstanceOf(mongoose.Error.ValidationError)
    }

    const token = await getToken()

    await api
      .post('/api/blogs')
      .auth(token.body.token, { type: 'bearer' })
      .send(newBlog)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    const blogs = await api.get('/api/blogs')
    expect(blogs.body).toHaveLength(initialBlogs.length)

    const titles = blogs.body.map(b => b.title)
    expect(titles).not.toContain('fourth')
  })
})

describe('deletion of a blog', () => {
  test('succeeds if id is valid', async () => {
    const blogsAtStart = await api.get('/api/blogs')
    const blogToDelete = blogsAtStart.body[0]

    await api
      .delete(`/api/blogs/${blogToDelete.id}`)
      .expect(204)

    const blogsAtEnd = await api.get('/api/blogs')
    expect(blogsAtEnd.body).toHaveLength(blogsAtStart.body.length - 1)
    expect(blogsAtEnd.body).not.toContainEqual(blogToDelete)
  })

  test('fails if id is valid', async () => {
    const blogsAtStart = await api.get('/api/blogs')
    const blogToDelete = blogsAtStart.body[0]

    await api
      .delete(`/api/blogs/64ecac6591cbb53fdbd652a9`)
      .expect(204)

    const blogsAtEnd = await api.get('/api/blogs')
    expect(blogsAtEnd.body).not.toHaveLength(blogsAtStart.body.length - 1)
    expect(blogsAtEnd.body).toContainEqual(blogToDelete)
  })
})

describe('updating of a blog', () => {
  test('succeeds if id is valid', async () => {
    const newBlog = {
      likes: 20
    }

    const blogsAtStart = await api.get('/api/blogs')
    const blogToUpdate = blogsAtStart.body[0]

    await api
      .put(`/api/blogs/${blogToUpdate.id}`)
      .send(newBlog)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const blogsAtEnd = await api.get('/api/blogs')
    expect(blogsAtEnd.body).toHaveLength(blogsAtStart.body.length)

    expect(blogsAtStart.body).not.toEqual(blogsAtEnd.body)
    expect(blogsAtStart.body[0]).not.toEqual(blogsAtEnd.body[0])
  })

  test('fails to update if id is invalid', async () => {
    const newBlog = {
      likes: 20
    }

    const blogsAtStart = await api.get('/api/blogs')

    await api
      .put(`/api/blogs/64ecac6591cbb53fdbd792a9`)
      .send(newBlog)
      .expect(201)

    const blogsAtEnd = await api.get('/api/blogs')
    expect(blogsAtEnd.body).toHaveLength(blogsAtStart.body.length)

    expect(blogsAtStart.body).toEqual(blogsAtEnd.body)
    expect(blogsAtStart.body[0]).toEqual(blogsAtEnd.body[0])
  })
})

afterAll(async () => await mongoose.connection.close())