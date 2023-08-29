
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

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog,
}