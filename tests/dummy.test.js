const dummy = require('../utils/list_helper').dummy

test('dummy of one object in array', () => {
  const result = dummy([{
    title:	"First",
    author:	"mwenyewe",
    likes:	4
  }])

  expect(result).toBe(1)
})

test('dummy of many objects in array', () => {
  const result = dummy(
    [
      {
        title:	"First",
        author:	"mwenyewe",
        likes:	4
      },
      {
        title:	"First",
        author:	"mwenyewe",
        likes:	4
      },
      {
        title:	"First",
        author:	"mwenyewe",
        likes:	4
      }
    ]
  )

  expect(result).toBe(1)
})

test('dummy of empty array', () => {
  const result = dummy([])

  expect(result).toBe(1)
})