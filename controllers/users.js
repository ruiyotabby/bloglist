const usersRouter = require('express').Router()
const bcrypt = require('bcrypt')
const User = require('../models/user')

usersRouter.get('/', async (request, response, next) => {
  const users = await User.find({}).catch((e) => next(e))

  response.status(200).json(users)
})

usersRouter.post('/', async (request, response, next) => {
  const { username, name, password } = request.body

  const passwordHash = await bcrypt.hash(password, 10)
  const user = new User({
    name,
    username,
    passwordHash
  })

  const savedUser = await user.save().catch((err) => response.status(400).json({error: err.message}))

  response.status(201).json(savedUser)
})

module.exports = usersRouter