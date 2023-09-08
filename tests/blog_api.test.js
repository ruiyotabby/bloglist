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
  return token.body.token
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

  const user = await User.find({})

  const blogObjects = initialBlogs.map(blog => (
    blog.user = user[0].id,
    new Blog(blog)
    ))
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
  const returnedBlogs = await Blog.find({})
  await api
    .get('/api/blogs')
    .expect(200)
    .expect('Content-Type', /application\/json/)

  expect(returnedBlogs).toHaveLength(initialBlogs.length)
})

test('a specific title is within the returned blogs', async () => {
  const returnedBlogs = await Blog.find({})
  const titles = returnedBlogs.map(blog => blog.title)

  expect(titles).toContain('First')
})

test('unique identifier is named id', async () => {
  const returnedBlogs = await Blog.find({})

  expect(returnedBlogs[0].id).toBeDefined()
})

describe('a new blog post', () => {
  test('is saved to db if valid', async () => {
    const blogsAtStart = await Blog.find({})

    const newBlog = {
      title: "Third",
      author: "hakuna",
      url: 'https://loclhost:10000',
      likes: 99
    }

    const token = await getToken()

    await api
      .post('/api/blogs')
      .auth(token, { type: 'bearer' })
      .send(newBlog)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const blogsAtEnd = await Blog.find({})
    expect(blogsAtEnd).toHaveLength(blogsAtStart.length+1)

    const titles = blogsAtEnd.map(b => b.title)
    expect(titles).toContain('Third')
  })

  test('isnot saved to db if unautorized', async () => {
    const blogsAtStart = await Blog.find({})

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

    const blogsAtEnd = await Blog.find({})
    expect(blogsAtEnd).toHaveLength(blogsAtStart.length)

    const titles = blogsAtEnd.map(b => b.title)
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
      .auth(token, { type: 'bearer' })
      .send(newBlog)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const blogs = await Blog.find({})

    expect(blogs[initialBlogs.length].likes).toBe(0)
  })

  test('without title or url is invalid', async () => {
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
      .auth(token, { type: 'bearer' })
      .send(newBlog)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    const blogs = await Blog.find({})
    expect(blogs).toHaveLength(initialBlogs.length)

    const titles = blogs.map(b => b.title)
    expect(titles).not.toContain('fourth')
  })
})

describe('deletion of a blog', () => {
  test('succeeds if id and auth is valid', async () => {
    const blogsAtStart = await Blog.find({})
    const blogToDelete = blogsAtStart[0]

    const token = await getToken()

    await api
      .delete(`/api/blogs/${blogToDelete.id}`)
      .auth(token, { type: 'bearer' })
      .expect(204)

    const blogsAtEnd = await Blog.find({})
    expect(blogsAtEnd).toHaveLength(blogsAtStart.length - 1)
    expect(blogsAtEnd).not.toContainEqual(blogToDelete)
  })

  test('fails if there is no auth', async () => {
    const blogsAtStart = await Blog.find({})
    const blogToDelete = blogsAtStart[0]

    await api
      .delete(`/api/blogs/${blogToDelete.id}`)
      .expect(401)

    const blogsAtEnd = await Blog.find({})
    expect(blogsAtEnd).toHaveLength(blogsAtStart.length)
    expect(blogsAtEnd).toContainEqual(blogToDelete)
  })

  test('fails if id is invalid', async () => {
    const blogsAtStart = await Blog.find({})
    const blogToDelete = blogsAtStart[0]

    const token = await getToken()

    await api
      .delete(`/api/blogs/64ecac6591cbb53fdbd652a9`)
      .auth(token, { type: 'bearer' })
      .expect(400)

    const blogsAtEnd = await Blog.find({})
    expect(blogsAtEnd).toHaveLength(blogsAtStart.length)
    expect(blogsAtEnd).toContainEqual(blogToDelete)
  })
})

describe('updating of a blog', () => {
  test('succeeds if id is valid', async () => {
    const newBlog = {
      likes: 20
    }

    const blogsAtStart = await Blog.find({})
    const blogToUpdate = blogsAtStart[0]

    await api
      .put(`/api/blogs/${blogToUpdate.id}`)
      .send(newBlog)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const blogsAtEnd = await Blog.find({})
    expect(blogsAtEnd).toHaveLength(blogsAtStart.length)

    expect(blogsAtStart).not.toEqual(blogsAtEnd)
    expect(blogsAtStart[0]).not.toEqual(blogsAtEnd[0])
  })

  test('fails to update if id is invalid', async () => {
    const newBlog = {
      likes: 20
    }

    const blogsAtStart = await Blog.find({})

    await api
      .put(`/api/blogs/64ecac6591cbb53fdbd792a9`)
      .send(newBlog)
      .expect(201)

    const blogsAtEnd = await Blog.find({})
    expect(blogsAtEnd).toHaveLength(blogsAtStart.length)
    expect(blogsAtStart).toEqual(blogsAtEnd)
    expect(blogsAtStart[0]).toEqual(blogsAtEnd[0])
  })
})

afterAll(async () => await mongoose.connection.close())