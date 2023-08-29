const lodash = require('lodash')

const dummy = (blogs) => {
  return 1
}

const totalLikes = (blogs) => {
  let sum = 0
  for (const blog of blogs) {
    sum += blog.likes
  }

  return sum
}

const favoriteBlog = (blogs) => {
  let max = blogs.length < 1 ? {} : blogs[0]
  for (const blog of blogs) {
    max = blog.likes > max.likes
    ? blog
    : max
  }

  return max
}

const mostBlogs = (blogs) => {
  const grouped = lodash.groupBy(blogs, 'author')
  let objects = []

  for (const key in grouped) {
    const obj = {
      author: key,
      blogs: grouped[key].length
    }

    objects.push(obj);
  }

  const ordered = lodash.orderBy(objects, ['name', 'blogs'], ['asc', 'desc'])

  return blogs.length < 1
  ? {}
  : ordered[0]
}

const mostLikes = (blogs) => {
  const grouped = lodash.groupBy(blogs, 'author')
  let objects = []

  for (const key in grouped) {
    let likes = 0
    grouped[key].forEach((k) => likes += k.likes)

    const obj = {
      likes,
      author: key,
    }

    objects.push(obj);
  }
  
  const ordered = lodash.orderBy(objects, ['name', 'likes'], ['asc', 'desc'])

  return blogs.length < 1
  ? {}
  : ordered[0]
}

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog,
  mostBlogs,
  mostLikes
}