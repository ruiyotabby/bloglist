const favoriteBlog = require('../utils/list_helper').favoriteBlog

describe('favorite blog', () => {
  test('of an empty list', () => {
    const result = favoriteBlog([])

    expect(result).toEqual({})
  })

  test('of 1 object', () => {
    const blogs = [
      {
        title:	"First",
        author:	"mwenyewe",
        likes:	4
      }
    ]
    const result = favoriteBlog(blogs)

    expect(result).toEqual(blogs[0])
  })

  test('of many objects', () => {
    const blogs = [
      {
        _id: "5a422a851b54a676234d17f7",
        title: "React patterns",
        author: "Michael Chan",
        url: "https://reactpatterns.com/",
        likes: 7,
        __v: 0
      },
      {
        _id: "5a422aa71b54a676234d17f8",
        title: "Go To Statement Considered Harmful",
        author: "Edsger W. Dijkstra",
        url: "http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html",
        likes: 5,
        __v: 0
      },
      {
        _id: "5a422b3a1b54a676234d17f9",
        title: "Canonical string reduction",
        author: "Edsger W. Dijkstra",
        url: "http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html",
        likes: 12,
        __v: 0
      },
      {
        _id: "5a422b891b54a676234d17fa",
        title: "First class tests",
        author: "Robert C. Martin",
        url: "http://blog.cleancoder.com/uncle-bob/2017/05/05/TestDefinitions.htmll",
        likes: 10,
        __v: 0
      }
    ]
    const result = favoriteBlog(blogs)

    expect(result).toEqual(blogs[2])
  })

})