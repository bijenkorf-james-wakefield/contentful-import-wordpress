const util = require('../util')
const fixture = require('../__fixtures__/contentful')

describe('Utils -  withFields', () => {
  test('should return an object matching fixture for  paragraph', () => {
    let input = '<p>Banana</p>'
    let expected = fixture.getRichTextNode('Banana', 'paragraph')
    let result
    input = util.parseHTML(input)
    result = util.getRichText(input)

    expect(result).toEqual(expected)
  })

  test('should return an object matching fixture for Heading 1', () => {
    let input = '<h1>Orange</h1>'
    let expected = fixture.getRichTextNode('Orange', 'heading-1')
    let result
    input = util.parseHTML(input)
    result = util.getRichText(input)

    expect(result).toEqual(expected)
  })

  test('should return an object matching fixture for Heading 6', () => {
    let input = '<h6>Kiwi</h6>'
    let expected = fixture.getRichTextNode('Kiwi', 'heading-6')
    let result
    input = util.parseHTML(input)
    result = util.getRichText(input)

    expect(result).toEqual(expected)
  })

  test('should return an object matching fixture for list item', () => {
    // nested nodes expect a nested response.
    // e.g. list item containing paragraph
    // let spy = jest.spyOn(fixture, 'getRichText')
    let input =
      '<li><p>Excepteur sint occaecat cupidatat non proident,</p></li>'
    let expected = fixture.getRichTextListItem(
      'Excepteur sint occaecat cupidatat non proident,'
    )

    let result
    input = util.parseHTML(input)
    result = util.getRichText(input)

    expect(result).toEqual(expected)
  })

  test('should return the correct data structure for unordered list', () => {
    // nested nodes expect a nested response.
    // e.g. list item containing paragraph
    let input =
      '<ul><li><p>Excepteur sint occaecat cupidatat non proident, </p></li><li><p>sunt in culpa qui officia </p></li><li><p>deserunt mollit anim id est laborum.</p></li></ul>'
    let expected = fixture.getUnorderedList()
    let result
    input = util.parseHTML(input)
    result = util.getRichText(input)

    expect(result).toEqual(expected)
  })
  test('should return the correct data structure for unordered list', () => {
    // nested nodes expect a nested response.
    // e.g. list item containing paragraph
    let input =
      '<ul><li><p>Excepteur sint occaecat cupidatat non proident, </p></li><li><p>sunt in culpa qui officia </p></li><li><p>deserunt mollit anim id est laborum.</p></li></ul>'
    let expected = fixture.getUnorderedList()
    let result
    input = util.parseHTML(input)
    result = util.getRichText(input)

    expect(result).toEqual(expected)
  })
  test('should return the correct data structure for inline element like anchors', () => {
    // nested nodes expect a nested response.
    // e.g. list item containing paragraph
    let input =
      '<p>excepteur sint occaecat cupidatat non proident <a href="https://www.debijenkorf.nl">sunt in culpa qui officia</a>deserunt mollit anim id est</p>'
    let expected = fixture.getRichTextHyperlink()
    let result

    input = util.parseHTML(input)
    console.log('input', input)
    result = util.getRichText(input)
    console.log('result', result)
    expect(result).toEqual(expected)
  })
})

describe.skip('Utils - mergeEntry', () => {
  test('should do a deep merge on two objects with similar data structure', () => {
    let expected = {
      fields: {
        title: { en: 'Test page', nl: 'Test page' },
        slug: { en: 'test-page', nl: 'test-page' }
      }
    }
    let object1 = {
      fields: {
        title: {
          en: 'Test page'
        },
        slug: {
          en: 'test-page'
        }
      }
    }

    let object2 = {
      fields: {
        title: {
          nl: 'Test page'
        },
        slug: {
          nl: 'test-page'
        }
      }
    }

    let result
    result = util.mergeEntry(object1, object2)
    expect(result).toStrictEqual(expected)
  })
})

describe('Utils - getRelatedEntries', () => {
  test('should return two entries that are related based on id', () => {
    let result
    let expected = [
      [
        { fields: { id: 936, title: { en: 'Kiwi' } } },
        { fields: { id: 284, title: { en: 'Kiwi' } } }
      ]
    ]
    let input = [
      { fields: { id: 936, title: { en: 'Kiwi' } } },
      { fields: { id: 284, title: { en: 'Kiwi' } } },
      { fields: { id: 1, title: { en: 'Banana' } } },
      { fields: { id: 2, title: { nl: 'Banaan' } } },
      { fields: { id: 3, title: { en: 'Kiwi' } } },
      { fields: { id: 3, title: { en: 'Kiwi' } } }
    ]

    result = util.getRelatedEntries(input)

    expect(result).toStrictEqual(expected)
  })
})
