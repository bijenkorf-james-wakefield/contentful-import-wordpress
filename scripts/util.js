const parser = require('parse5')
const merge = require('deepmerge')
/**
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
    li: 'list-item',
    a: 'hyperlink',
    doc: 'document'
  }
  let output = typeMap[input] || ''
  return output
}

/**
 * mergeEntry
 * @param {object} input
 * @returns {object} output
 */
function mergeEntry (object1, object2) {
  let output = merge(object1, object2)
  return output
}

function getRelatedEntries (input) {
  // Array containing array of page ID's that are related
  let pageMapping = [
    // en | nl
    [936, 284], // Conditions
    [1815, 995], // EDI
    [784, 283], // Forwarders
    [787, 286], // stores
    [789, 282], // contact
    [39, 544], // disclaimer
    [39, 1266], // Waalwijk
    // [, 327], // Amsterdam - only Dutch
    // [, 331], // Den Haag - only Dutch
    // [, 336], // Rotterdam - only Dutch
    // [, 332], // Eindhoven - only Dutch
    // [, 326], // Amstelveen - only Dutch
    // [, 335], // Maastricht - only Dutch
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
        return item.fields.id === array[0] || item.fields.id === array[1]
      })
    })
    .filter(item => item.length)

  return output
}

// first iteration is the document so
// get the wrapping object
// data.nodeType = 'document'
// -> 0: {nodeType:'document'}
// second iteration has children that need
// to be added to the content prop
// data.content = <childNode>
// -> 1: {nodeType:'document' content: [...]}
// third iteration needs to add children
// to the content of the previous node
// data.content[0].content:[] = <childNode>
// -> 2: {nodeType:'document' content: [data:{}, content[...]]}

/**
 * Recursive function that creates the desired data structure
 * @param  {array} input
 * @returns {array} output a branch
 */

function traverse (input = []) {
  // console.log('traverse input:', input)

  // console.log('input on recursion', input)
  return input.map(item => {
    // console.log('childNode', item)

    let branch = {}
    let data = {}
    let leaf = {}
    // if (item.attrs.length) {
    //   for (let attr of item.attrs) {
    //     data = attr.name === 'href' ? { uri: attr.value } : data
    //   }
    // }
    if (typeof item.value === 'string') {
      leaf = getLeaf(item.value)
      return leaf
    }

    if (item.attrs.length) {
      for (let attr of item.attrs) {
        data = attr.name === 'href' ? { uri: attr.value } : data
      }
    }
    // console.log('leaf', leaf)

    branch = getBranch(getNodeType(item.tagName), data)
    branch.content = traverse(item.childNodes)

    return branch
  })

  // console.log('branch = ', branch)
}

function parseHTML (input) {
  let parsed = parser.parse(input)
  // childNodes[0] ->the first item in the array is the <!DOCTYPE />
  // childNodes[1] ->the second childNode is the <body/> whereas the first is the <head/>
  // chilNodes -> the chilNodes in the body (what we want)
  return parsed.childNodes[0].childNodes[1].childNodes // document // body
}

function getLeaf (value) {
  return {
    data: {},
    marks: [],
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

function withFields (node, isLeaf = false) {
  if (typeof node !== 'object') {
    throw new Error('withFields: Invalid argument type input')
  }

  let fields = {}
  fields = {
    data: {},
    content: [],
    nodeType: typeMap[Object.keys(node)[0]]
  }
  if (isLeaf) {
    fields.content = [
      {
        data: {},
        marks: [],
        value: Object.values(node)[0],
        nodeType: 'text'
      }
    ]
  }

  return fields
}

module.exports = {
  getRelatedEntries,
  withFields,
  mergeEntry,
  traverse,
  parseHTML,
  getBranch,
  getLeaf,
  getRichText,
  getNodeType
}
