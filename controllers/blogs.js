const blogsRouter = require('express').Router()
const Blog = require('../models/blog')
const userExtractor = require('../utils/middleware').userExtractor


blogsRouter.get('/', async (request, response, next) => {
  try {
    const blogs = await Blog.find({}).populate('user', { username: 1, name: 1 })
    response.status(200).json(blogs)
  } catch (error) {
    next(error)
  }
})

blogsRouter.post('/', userExtractor, async (request, response, next) => {
  try {
    const { title, author, likes, url } = request.body
    const user = request.user
    const newBlog = new Blog({ title, author, likes, url, user: user._id })
    const blog = await newBlog.save()
    user.blogs = user.blogs.concat(blog)
    await user.save()
    response.status(201).json(blog)
  } catch (error) {
    next(error)
  }
})

blogsRouter.delete('/:id', userExtractor, async (request, response, next) => {
  try {
    const user = request.user
    const blog = await Blog.findById(request.params.id)

    if (!blog) {
      return response.status(400).json({error: 'No blog found'})
    }
    if (blog.user.toString() !== user._id.toString()) {
      return response.status(401).json({error: 'Only the user who posted can delete'})
    }
    const deletedBlog = await Blog.findByIdAndRemove(blog._id)
    response.status(204).json(deletedBlog)
  } catch (error) {
    next(error)
  }
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