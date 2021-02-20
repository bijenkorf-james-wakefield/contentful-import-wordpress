const util = require('../util')
const fixture = require('../__fixtures__/contentful')
const fs = require('fs')
describe('Util', () => {
  describe('getRichText', () => {
    test('should return an object matching fixture for block nodes like paragraph', () => {
      let input = '<p>Banana</p>'
      let expected = fixture.getRichTextNode('Banana', 'paragraph')
      let result
      input = util.parseHTML(input)
      result = util.getRichText(input)
      expect(result).toEqual(expected)
    })

    test('should return the correct data structure for anchors', () => {
      let input =
        '<p>excepteur sint occaecat cupidatat non proident <a href="https://www.debijenkorf.nl">sunt in culpa qui officia</a>deserunt mollit anim id est</p>'
      let expected = fixture.getRichTextHyperlink()
      let result

      input = util.parseHTML(input)
      result = util.getRichText(input)
      expect(result).toEqual(expected)
    })

    test('should return the correct data structure for multipleinline items like bold or italic', () => {
      let input =
        '<p>Lorem ipsum <b>dolor</b> sit <em>amet</em>, <u>consectetur adipiscing</u> elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>'

      let expected = fixture.getRichTextParagraphWithInlineType('bold')
      let result

      input = util.parseHTML(input)
      result = util.getRichText(input)

      expect(result).toEqual(expected)
    })

    test('should ignore spans', () => {
      let input =
        '<p><strong><span style="color: #000000; font-family: Calibri; font-size: medium;">Adres: straatnaam huisnummer</span></strong></p>'
      let expected = fixture.getRichTextNode(
        'Adres: straatnaam huisnummer',
        'paragraph'
      )
      let result

      input = util.parseHTML(input)
      result = util.getRichText(input)
      // console.log('result', result)

      expect(result).toEqual(expected)
    })

    test('should handle images', () => {
      let input =
        '<p class="bk-image"><a href="/wp-content/uploads/2013/02/hex_makeup.jpg"><img class="alignnone size-full wp-image-644" alt="hex_makeup" src="/wp-content/uploads/2013/02/hex_makeup.jpg" width="234" height="196" /></a></p>'
      let expected = {
        data: {},
        content: [
          {
            data: {},
            content: [
              {
                data: { uri: '/wp-content/uploads/2013/02/hex_makeup.jpg' },
                content: [
                  { data: {}, content: [], nodeType: 'embedded-asset-block' }
                ],
                nodeType: 'hyperlink'
              }
            ],
            nodeType: 'paragraph'
          }
        ],
        nodeType: 'document'
      }
      let result

      input = util.parseHTML(input)
      result = util.getRichText(input)

      expect(result).toEqual(expected)
    })

    test('should ignore inline styles', () => {
      let input =
        '<style><!-- a{ text-decoration: none; } --></style><span style="color: #999999;">Damco  is  onze  logistiekedienstverlener  voor</span>'
      let expected = {
        data: {},
        content: [
          {
            data: {},
            marks: [],
            value: 'Damco  is  onze  logistiekedienstverlener  voor',
            nodeType: 'text'
          }
        ],
        nodeType: 'document'
      }
      let result

      input = util.parseHTML(input)
      result = util.getRichText(input)

      expect(result).toEqual(expected)
    })

    test('should return an object matching fixture for element with attributes', () => {
      let input =
        '<a title="A link" href="https://en.wikipedia.org/wiki/Cucumber">Cucumber</a>'
      let expected = fixture.getRichTextNode('Cucumber', 'hyperlink', {
        uri: 'https://en.wikipedia.org/wiki/Cucumber'
      })
      let result
      input = util.parseHTML(input)
      result = util.getRichText(input)
      expect(result).toEqual(expected)
    })

    test('should return an object matching fixture for list item', () => {
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
      let input =
        '<ul><li><p>Excepteur sint occaecat cupidatat non proident,</p></li><li><p>sunt in culpa qui officia</p></li><li><p>deserunt mollit anim id est laborum.</p></li></ul>'
      let expected = fixture.getUnorderedList()
      let result
      input = util.parseHTML(input)
      result = util.getRichText(input)
      // console.log('result', result)

      expect(result).toEqual(expected)
    })

    test('should return the correct data structure for inline element like anchors in parents', () => {
      let input =
        '<p>excepteur sint occaecat cupidatat non proident <a href="https://www.debijenkorf.nl">sunt in culpa qui officia</a>deserunt mollit anim id est</p>'
      let expected = fixture.getRichTextHyperlink()
      let result

      input = util.parseHTML(input)
      result = util.getRichText(input)
      expect(result).toEqual(expected)
    })
  })

  describe('isTagFromList', () => {
    test('should return true if input is an inline tagName', () => {
      let input = 'b'
      let expected = true
      let result
      result = util.isTagFromList(input, 'inline')
      expect(result).toEqual(expected)
    })
    test('should return false if input is not an inline tagName', () => {
      let input = 'p'
      let expected = false
      let result
      result = util.isTagFromList(input)
      expect(result).toEqual(expected)
    })
    test('should return true if input is a tagName to ignore', () => {
      let input = 'table'
      let expected = true
      let result
      result = util.isTagFromList(input, 'ignore')
      expect(result).toEqual(expected)
    })
    test('should return false if input is not a tagName to ignore', () => {
      let input = 'p'
      let expected = false
      let result
      result = util.isTagFromList(input, 'ignore')
      expect(result).toEqual(expected)
    })
  })

  describe('mergeEntry', () => {
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

  describe('getRelatedEntries', () => {
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
        { fields: { id: 9, title: { en: 'Banana' } } },
        { fields: { id: 2, title: { nl: 'Banaan' } } },
        { fields: { id: 3, title: { en: 'Kiwi' } } },
        { fields: { id: 284, title: { en: 'Kiwi' } } },
        { fields: { id: 3, title: { en: 'Kiwi' } } }
      ]

      result = util.getRelatedEntries(input)

      expect(result).toStrictEqual(expected)
    })
    test('id is a string', () => {
      let result
      let expected = [
        [
          { fields: { id: '936', title: { en: 'Kiwi' } } },
          { fields: { id: '284', title: { en: 'Kiwi' } } }
        ]
      ]
      let input = [
        { fields: { id: '936', title: { en: 'Kiwi' } } },
        { fields: { id: '9', title: { en: 'Banana' } } },
        { fields: { id: '2', title: { nl: 'Banaan' } } },
        { fields: { id: '3', title: { en: 'Kiwi' } } },
        { fields: { id: '284', title: { en: 'Kiwi' } } },
        { fields: { id: '3', title: { en: 'Kiwi' } } }
      ]

      result = util.getRelatedEntries(input)

      expect(result).toStrictEqual(expected)
    })
  })

  describe('getNodeType', () => {
    test('should return paragraph', () => {
      let expected = 'paragraph'
      let result
      let input = 'p'
      result = util.getNodeType(input)
      expect(result).toStrictEqual(expected)
    })

    test('should return empty string if no match', () => {
      let expected = ''
      let result
      let input = 'abracadabra'
      result = util.getNodeType(input)
      expect(result).toStrictEqual(expected)
    })
  })

  describe('removeInlineStyles', () => {
    test('should remove inline styles from a string', () => {
      let input = `<style>
      a{
      text-decoration: none;
      }
      </style>`
      let result
      let expected = ''

      result = util.removeInlineStyles(input)

      expect(result).toEqual(expected)
    })

    test('should remove inline styles from a string', () => {
      let input = ` <style><!--
      a{ text-decoration: none; }
      --></style>
      <div class="fleft">`
      let result
      let expected = ` 
      <div class="fleft">`

      result = util.removeInlineStyles(input)

      expect(result).toEqual(expected)
    })
  })

  describe('insertParagraphTags', () => {
    test('should add paragraphs on newlines', () => {
      // eslint-disable-next-line no-tabs
      let input = `Voor  het  transport  van  onze  <strong>Ex  Works</strong> goederen hebben  wij speciale  afspraken  gemaakt  met  Internationaal Transportbedrijf  Van Vliet b.v.`
      // eslint-disable-next-line no-tabs
      let expected = `<p>Voor  het  transport  van  onze  <strong>Ex  Works</strong> goederen hebben  wij speciale  afspraken  gemaakt  met  Internationaal Transportbedrijf  Van Vliet b.v.</p>`
      let result

      result = util.addParagraphTags(input)

      expect(result).toEqual(expected)
    })
    test('should wrap html tags on newlines', () => {
      let input = `All suppliers <a href="http://localhost:3000/wp-content/uploads/2019/01/Etical-Trading-Requirements-de-Bijenkorf-Part-C-January-2019.pdf">Ethical Trading Requirements </a>Part C (<span style="color: #ff6600;">as of 1-1-2019</span>)
<span style="color: #ffffff;">.................</span><a href="http://localhost:3000/wp-content/uploads/2016/06/Ethical-Trading-Requirements-Part-C-1.pdf">Ethical Trading Requirements</a> Part C`
      let expected = `<p>All suppliers <a href="http://localhost:3000/wp-content/uploads/2019/01/Etical-Trading-Requirements-de-Bijenkorf-Part-C-January-2019.pdf">Ethical Trading Requirements </a>Part C (<span style="color: #ff6600;">as of 1-1-2019</span>)</p>
<p><span style="color: #ffffff;">.................</span><a href="http://localhost:3000/wp-content/uploads/2016/06/Ethical-Trading-Requirements-Part-C-1.pdf">Ethical Trading Requirements</a> Part C</p>`
      let result

      result = util.addParagraphTags(input)
      expect(result).toEqual(expected)
    })
    test('should not wrap certain tags', () => {
      let inputs = [
        '<h1>Heading</h1>',
        '<h1>Heading</h1>',
        '<h2>Heading</h2>',
        '<h3>Heading</h3>',
        '<h4>Heading</h4>',
        '<h5>Heading</h5>',
        '<h6>Heading</h6>',
        '<ul>',
        '<li>',
        '<ol class="some-class">'
      ]
      let expected = inputs.slice(0)
      let results = []
      results = inputs.map(input => {
        return util.addParagraphTags(input)
      })
      expect(results).toEqual(expected)
    })

    test('should not wrap empty lines', () => {
      let input = `One

Two
`
      let expected = `<p>One</p>

<p>Two</p>
`
      let result
      result = util.addParagraphTags(input)
      expect(result).toEqual(expected)
    })
  })

  describe('addParagraphTagsToListItems', () => {
    test('should wrap list items ', () => {
      let input = '<li>item</li>'
      let expected = '<li><p>item</p></li>'
      let result
      result = util.addParagraphTagsToListItems(input)
      expect(result).toEqual(expected)
    })
    test('should handle list items with attributes', () => {
      let input = '<li class="muchos">item</li>'
      let expected = '<li class="muchos"><p>item</p></li>'
      let result
      result = util.addParagraphTagsToListItems(input)
      expect(result).toEqual(expected)
    })
    test('should handle nested lists', () => {
      let input = `<li>One
      <ol>`
      let expected = `<li><p>One</p>
      <ol>`
      let result
      result = util.addParagraphTagsToListItems(input)
      expect(result).toEqual(expected)
    })
  })

  describe('removeNonBreakingSpaces', () => {
    test('should remove &nbsp; from a string', () => {
      let input = `</a></span>

&nbsp;

&nbsp;`
      let expected = `</a></span>



`
      let result
      result = util.removeNonBreakingSpaces(input)
      expect(result).toEqual(expected)
    })
  })

  describe('removeDoubleLineBreaks', () => {
    test('should remove double line breaks', () => {
      let input = `De Bijenkorf Supplier Conditions

      Own stock <a href="http://localhost:3000/wp-content/uploads/2016/06/General-purchase-conditions-of-magazijn-de-Bijenkorf-B-V-Part-A-bv.pdf">General Purchase Conditions of Magazijn de Bijenkorf B.V.</a> Part A`
      let expected = `De Bijenkorf Supplier Conditions
      Own stock <a href="http://localhost:3000/wp-content/uploads/2016/06/General-purchase-conditions-of-magazijn-de-Bijenkorf-B-V-Part-A-bv.pdf">General Purchase Conditions of Magazijn de Bijenkorf B.V.</a> Part A`
      let result
      result = util.replaceDoubleLineBreaks(input)
      expect(result).toEqual(expected)
    })
    test('should not remove single line breaks', () => {
      let input = `De Bijenkorf Supplier Conditions
      Own stock <a href="http://localhost:3000/wp-content/uploads/2016/06/General-purchase-conditions-of-magazijn-de-Bijenkorf-B-V-Part-A-bv.pdf">General Purchase Conditions of Magazijn de Bijenkorf B.V.</a> Part A`
      let expected = `De Bijenkorf Supplier Conditions
      Own stock <a href="http://localhost:3000/wp-content/uploads/2016/06/General-purchase-conditions-of-magazijn-de-Bijenkorf-B-V-Part-A-bv.pdf">General Purchase Conditions of Magazijn de Bijenkorf B.V.</a> Part A`
      let result
      result = util.replaceDoubleLineBreaks(input)
      expect(result).toEqual(expected)
    })
  })

  describe('removeDoubleSpaces', () => {
    test('should remove double spaces from a string', () => {
      /* eslint-disable no-irregular-whitespace */
      let input = `Damco  is  our  nominated  Sea  &amp;  Air  Forwarder  for  all  <strong>Free On Board </strong>(Sea)<strong></strong>&amp; <strong> Free Carrier  </strong>(Air)  shipments.<strong>
</strong>`
      /* eslint-enable no-irregular-whitespace */
      let expected = `Damco is our nominated Sea &amp; Air Forwarder for all <strong>Free On Board </strong>(Sea)<strong></strong>&amp; <strong> Free Carrier </strong>(Air) shipments.<strong>
</strong>`
      let result = util.removeDoubleSpaces(input)
      expect(result).toEqual(expected)
    })
  })

  describe('integration', () => {
    test('should compose to create desired output', () => {
      /* eslint-disable no-irregular-whitespace */
      let input = `Voor  het  transport  van  onze  <strong>Ex  Works</strong> goederen hebben  wij speciale  afspraken  gemaakt  met  KLG Europe.

      Wij  verzoeken u – minstens  2  dagen  van te  voren – de  paklijst/factuur  met  het  Bijenkorf ordernummer  te mailen naar  zowel  vervoerder  als  Bijenkorf  Aankomst  Goederenkantoor (<span style="color: #3366ff;"><a href="mailto:deliveries@debijenkorf.nl"><span style="color: #3366ff;">deliveries@debijenkorf.nl</span></a>)
      </span>
      
      <style><!-- a{ text-decoration: none; } --></style>
      
      <b>Forwarder: flat packed</b>
      KLG Europe - Eersel bv
      Meerheide 15
      NL 5521 DZ Eersel
      The Netherlands
      ctc: Ms. Linda Coppens
      tel.: +31 (0) 497 584477
      fax: +31 (0) 497 584401
      e-mail: <a title="procumulator.france@eersel.klgeurope.com" href="mailto:procumulator.france@eersel.klgeurope.com"><span style="color: #3366ff;">procumulator.france@eersel.klgeurope.com</span></a>`
      /* eslint-enable no-irregular-whitespace */
      let expected = ''
      let result = util.getRichText(
        util.parseHTML(
          util.removeLineBreaks(
            util.addParagraphTagsToListItems(
              util.addParagraphTags(
                util.removeWhitespace(
                  util.replaceDoubleLineBreaks(
                    util.removeEmptyTags(
                      util.removeDoubleSpaces(
                        util.removeUnwantedHtml(
                          util.removeNonBreakingSpaces(
                            util.removeInlineStyles(input)
                          )
                        )
                      )
                    )
                  )
                )
              )
            )
          )
        )
      )

      fs.writeFile('output.txt', result, (data, err) => {})

      console.log('result :', result)

      expect(result).toEqual(expected)
    })
  })
})
