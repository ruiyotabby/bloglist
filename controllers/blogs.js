const blogsRouter = require('express').Router()
const { default: mongoose } = require('mongoose')
const Blog = require('../models/blog')
const jwt = require('jsonwebtoken')
const config = require('../utils/config')
const User = require('../models/user')


blogsRouter.get('/', async (request, response, next) => {
  try {
    const blogs = await Blog.find({}).populate('user', { username: 1, name: 1 })
    response.status(200).json(blogs)
  } catch (error) {
    next(error)
  }
})

blogsRouter.post('/', (request, response, next) => {
  const { title, author, likes, url } = request.body

  jwt.verify(request.token, config.SECRET, async (error, decoded) => {
    if (!(decoded && decoded.id)) {
      return response.status(401).json({error: 'token invalid'})
    }

    try {
      const user = await User.findById(decoded.id)
      const newBlog = new Blog({
        title,
        author,
        likes,
        url,
        user: user._id
      })
      const blog = await newBlog.save()
      user.blogs = user.blogs.concat(blog)
      await user.save()
      response.status(201).json(blog)
    } catch (error) {
      next(error)
    }
    next(error)
  })


})

blogsRouter.delete('/:id', (request, response, next) => {

  jwt.verify(request.token, config.SECRET, async (error, decoded) => {
    if (!(decoded && decoded.id)) {
      return response.status(401).json({error: 'Invalid token'})
    }
    const user = await User.findById(decoded.id)

    try {
      const blog = await Blog.findById(request.params.id)
      if (!blog) {
        return response.status(400).json({error: 'Invalid blog'})
      }

      if (blog.user.toString() !== user._id.toString()) {
        return response.status(401).json({error: 'Only the user who posted can delete'})
      }

      const deletedBlog = await Blog.findByIdAndRemove(blog._id)
      response.status(204).json(deletedBlog)
    } catch (error) {
      next(error)
    }
    next(error)
  })
})

blogsRouter.put('/:id', async (request, response, next) => {
  try {
    const blog = await Blog.findByIdAndUpdate(request.params.id, request.body)
    response.status(201).json(blog)
  } catch (error) {
    next(error)
  }
})

module.exports = blogsRouter