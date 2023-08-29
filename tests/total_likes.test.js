const totalLikes = require('../utils/list_helper').totalLikes

describe('total likes', () => {
  test('of 3 objects', () => {
    const result = totalLikes(
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
      ])

    expect(result).toBe(12)
  })

  test('of 1 object', () => {
    const result = totalLikes(
      [
        {
          title:	"First",
          author:	"mwenyewe",
          likes:	4
        }
      ])

    expect(result).toBe(4)
  })

  test('of an empty array', () => {
    const result = totalLikes([])

    expect(result).toBe(0)
  })
})