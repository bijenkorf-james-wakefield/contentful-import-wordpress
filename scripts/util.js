const parser = require('parse5')
const merge = require('deepmerge')

/**
 * Get the relevant contentful nodeType
 * @param  {string} input
 * @returns {string} the nodeType name if found
 */
function getNodeType (input = '') {
  let typeMap = {
    p: 'paragraph',
    h1: 'heading-1',
    h2: 'heading-2',
    h3: 'heading-3',
    h4: 'heading-4',
    h5: 'heading-5',
    h6: 'heading-6',
    ul: 'unordered-list',
    ol: 'ordered-list',
    li: 'list-item',
    a: 'hyperlink',
    doc: 'document',
    hr: 'hr',
    b: 'bold',
    strong: 'bold',
    i: 'italic',
    em: 'italic',
    u: 'underline',
    code: 'code',
    blockquote: 'blockquote',
    img: 'embedded-asset-block'
  }
  let output = typeMap[input] || ''
  return output
}

/**
 * merges two entries
 * @param {object} object1
 * @param {object} object2
 * @returns {object} the merged objects
 */
function mergeEntry (object1 = {}, object2 = {}) {
  let output = merge(object1, object2)
  return output
}

/**
 * combine related entries based on ID
 * @param {array} input
 * @return {array} the related entries
 */
function getRelatedEntries (input = []) {
  // Array containing array of page ID's that are related
  let pageMapping = [
    // en | nl
    [1, 957], // Homepage
    [936, 284], // Conditions
    [1815, 995], // EDI
    [784, 283], // Forwarders
    [787, 286], // stores
    [789, 282], // contact
    [39, 544], // disclaimer
    [91266, 1266], // Waalwijk - only Dutch
    [9327, 327], // Amsterdam - only Dutch
    [9331, 331], // Den Haag - only Dutch
    [9336, 336], // Rotterdam - only Dutch
    [9332, 332], // Eindhoven - only Dutch
    [9326, 326], // Amstelveen - only Dutch
    [9335, 335], // Maastricht - only Dutch
    [9337, 337], // Utecht - only Dutch
    [1857, 437], // Forwarders
    [1863, 491], // Austria
    [1860, 712], // Belgium
    [1864, 495], // Czech Republic
    [1865, 713], // Denmark
    [1867, 483], // Finland
    [1868, 484], // France
    [1869, 482], // Germany
    [1870, 485], // Greece
    [1872, 487], // Ireland
    [1873, 488], // Italy
    [1875, 489], // Luxembourg
    [1876, 490], // Norway
    [1877, 492], // Portugal
    [1878, 493], // SLovakia
    [1879, 494], // Spain
    [1880, 497], // Sweden
    [1883, 498], // Swiss
    [1881, 496], // Turkey
    [1882, 486], // UK
    [1904, 505] // Sea and Air Forwarder
  ]

  let output = pageMapping
    .map(array => {
      return input.filter(item => {
        return (
          parseInt(item.fields.id, 10) === array[0] ||
          parseInt(item.fields.id, 10) === array[1]
        )
      })
    })
    .filter(item => item.length)

  return output
}

/**
 * Recursive function that creates the desired data structure
 * @param  {array} input is parsed HTML
 * @returns {array} output is an array for each branch
 */

function traverse (input = []) {
  try {
    return input.map(item => {
      let branch = {}
      let data = {}
      let marks = []
      let leaf = {}

      // console.log('item', item)
      // base
      if (typeof item.value === 'string') {
        if (isTagFromList(item.parentNode.tagName, 'inline')) {
          marks = [{ type: getNodeType(item.parentNode.tagName) }]
        }

        leaf = getLeaf(item.value, marks)
        return leaf
      }

      if (item.attrs.length) {
        for (let attr of item.attrs) {
          data = attr.name === 'href' ? { uri: attr.value } : data
        }
      }
      // console.log('leaf', leaf)

      if (
        isTagFromList(item.tagName, 'inline') ||
        isTagFromList(item.tagName, 'ignore')
      ) {
        // skip inline tags
        return traverse(item.childNodes).pop()
      }
      branch = getBranch(getNodeType(item.tagName), data)
      branch.content = traverse(item.childNodes)

      return branch
    })
  } catch (error) {
    console.error(error, input)
  }
}

function isTagFromList (input = '', type = 'inline') {
  const IGNORE_TAGS = ['span', 'table', 'tr', 'td', 'tbody', 'style']
  const INLINE_TAGS = ['strong', 'u', 'b', 'i', 'em', 'code']

  let output = false
  let tagNames = []

  tagNames =
    type === 'inline' ? INLINE_TAGS : type === 'ignore' ? IGNORE_TAGS : []

  output = tagNames.includes(input)
  return output
}

/**
 * remove inline style declaration from string
 * @param {string} input
 * @returns {string} the string without inline style declarations
 */
function removeInlineStyles (input = '') {
  let output = ''
  // match anthing between style tags
  let regex = /(<style>[\s\S]+<\/style>)/

  output = input.replace(regex, '')

  return output
}

/**
 * remove non breaking spaces from input
 * @param {string} input
 * @returns {string} output without &nbsp;
 */
function removeNonBreakingSpaces (input = '') {
  let output = ''
  let regex = /(&nbsp;)/g
  output = input.replace(regex, '')
  return output
}

/**
 * add paragraph <p/> tags where newlines
 * @param {string} input
 * @returns {string} the output string with <p/> tags instead of newlines
 */
function addParagraphTags (input) {
  let output
  // Note to future self:
  // (^.*[^<\s]$) matches everything from the start to end of line
  // except opening html tags or whitespace
  // (?!^[\n]) does not match empty newlines
  let regex = /^((?!<\/?(li|h\d|ul|ol)[^>]*>)(?![\s]).+)$/gm

  output = input.replace(regex, '<p>$&</p>')

  return output
}

/**
 * add paragraphs tags to list items
 * @param {string} input
 * @returns {string} list item with paragraphs
 */
function addParagraphTagsToListItems (input = '') {
  let output = ''
  output = input.replace(
    /(((?<=<li[^>]*>)[^<]+$)|(?<=<li[^>]*>).*(?=<))/gm,
    '<p>$1</p>'
  )
  return output
}

/**
 * remove HTML table tags from string input
 * @param {string} input
 * @returns {string} output without HTML table
 */
function removeUnwantedHtml (input = '') {
  let output = ''
  let regex = /<\/?(strong|p|img|div|span|table|tr|td|tbody|thead|col|colgroup)[^>]*>/gi
  output = input.replace(regex, '')
  return output
}

/**
 * Replace double line breaks with a single line break
 * @param {string} input
 * @returns {string} output without single line breaks
 */
function replaceDoubleLineBreaks (input = '') {
  let output = ''
  let regex = /([\n]+)/gm

  output = input.replace(regex, '\n')
  return output
}

/**
 * remove whitespace
 * @param {string} input
 * @returns {string} output
 */

function removeWhitespace (input = '') {
  let output = ''
  let regex = /(^[\s]+)/gm
  output = input.replace(regex, '')
  return output
}

/**
 * remove whitespace
 * @param {string} input
 * @returns {string} output
 */

function removeDoubleSpaces (input = '') {
  let output = ''
  let regex = /([^\S\r\n]{1,})/g
  output = input.replace(regex, ' ')
  return output
}
/**
 * Remove empty html tags from input
 * @param {string} input
 * @returns {string} output without empty tags
 */
function removeEmptyTags (input = '') {
  let output = ''
  let regex = /<(\w+)(?:\s+\w+="[^"]*(?:"\$[^"]+"[^"]+)?")*>\s*<\/\1>/gim
  output = input.replace(regex, '')
  return output
}
/**
 * parses a HTML string
 * @param {string} input is a string of HTML
 * @returns {array} the parsed HTML
 */
function parseHTML (input = '') {
  let parsed = parser.parse(input)
  // childNodes[0] ->the first item in the array is the <!DOCTYPE />
  // childNodes[1] ->the second childNode is the <body/> whereas the first is the <head/>
  // chilNodes -> the chilNodes in the body (what we want)
  return parsed.childNodes[0].childNodes[1].childNodes
}
/**
 * Remove line breaks as they can cause invalid input
 * @param {string} input
 * @returns {string} output without line breaks
 */
function removeLineBreaks (input = '') {
  let output = ''
  let regex = /[\n]+/gm
  output = input.replace(regex, '')
  return output
}

function getLeaf (value, marks = []) {
  return {
    data: {},
    marks,
    value,
    nodeType: 'text'
  }
}

function getBranch (nodeType, data = {}) {
  return {
    data,
    content: [],
    nodeType
  }
}

function getRichText (input) {
  let root = getBranch('document')
  root.content = traverse(input)
  return root
}

module.exports = {
  getRelatedEntries,
  mergeEntry,
  traverse,
  parseHTML,
  getBranch,
  getLeaf,
  getRichText,
  getNodeType,
  isTagFromList,
  removeInlineStyles,
  addParagraphTags,
  removeNonBreakingSpaces,
  removeDoubleSpaces,
  replaceDoubleLineBreaks,
  removeLineBreaks,
  removeWhitespace,
  removeUnwantedHtml,
  removeEmptyTags,
  addParagraphTagsToListItems
}
