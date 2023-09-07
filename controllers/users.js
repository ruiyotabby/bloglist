const usersRouter = require('express').Router()
const bcrypt = require('bcrypt')
const User = require('../models/user')

usersRouter.get('/', async (request, response, next) => {
  const users = await User
    .find({})
    .populate('blogs', { title: 1, url: 1, likes: 1, author: 1 })
    .catch((e) => next(e))

  response.status(200).json(users)
})

usersRouter.post('/', async (request, response, next) => {
  const { username, name, password } = request.body

  if(!password) {
    return response.status(400).json({ error: 'Enter password'})
  } else if(password.length < 3) {
    return response.status(400).json({ error: 'password too short'})
  }

  const passwordHash = await bcrypt.hash(password, 10)
  const user = new User({
    name,
    username,
    passwordHash
  })

  try {
    const savedUser = await user.save()
    response.status(201).json(savedUser)
  } catch (error) {
    next(error)
  }
})

module.exports = usersRouter