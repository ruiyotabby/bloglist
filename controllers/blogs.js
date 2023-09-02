const blogsRouter = require('express').Router()
const { default: mongoose } = require('mongoose')
const Blog = require('../models/blog')
const { request, response } = require('../app')

blogsRouter.get('/', async (request, response, next) => {
  try {
    const blogs = await Blog.find({})
    response.status(200).json(blogs)
  } catch (error) {
    next(error)
  }
})

blogsRouter.post('/', async (request, response, next) => {
  try {
    const newBlog = new Blog(request.body)
    const blog = await newBlog.save()
    response.status(201).json(blog)
  } catch (error) {
    next(error)
  }
})

blogsRouter.delete('/:id', async (request, response, next) => {
  try {
    await Blog.findOneAndDelete(request.params.id)
    response.status(204).end()
  } catch (error) {
    next(error)
  }
})

module.exports = blogsRouter