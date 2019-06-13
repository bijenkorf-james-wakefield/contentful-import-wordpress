const parser = require('xml2json')
const merge = require('deepmerge')

let options = {
  object: true
}

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

const dataFullDoc = {
  div: {
    // 0
    h1: 'Test page', // 1
    p: [
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.',
      { a: { href: 'mailto:email@example.com', $t: 'email@example.com' } },
      { a: { href: 'https://www.debijenkorf.nl', $t: 'External link' } }
    ],
    ul: {
      li: [
        { p: 'Excepteur sint occaecat cupidatat non proident,' },
        { p: 'sunt in culpa qui officia' },
        { p: 'deserunt mollit anim id est laborum.' }
      ]
    }
  }
}

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

// let result = getRichText(
//   parseHTML(
//     '<ul><li><p>Excepteur sint occaecat cupidatat non proident, </p></li><li><p>sunt in culpa qui officia </p></li><li><p>deserunt mollit anim id est laborum.</p></li></ul>'
//   )
// )
// console.log(result)

/**
 * mergeEntry
 * @param {object} input
 * @returns {object} output
 */
function mergeEntry (object1, object2) {
  let output = merge(object1, object2)
  return output
}

// Trying to get two objects by id, which are related and return them.
function getRelatedEntries (input) {
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
 * Recursive function that creates branches
 * @param  {object} input
 * @returns {array} input mapped to a branch
 */

let tmp = {
  p: {
    $t:
      'excepteur sint occaecat cupidatat non proident deserunt mollit anim id est',
    a: { href: 'https://www.debijenkorf.nl', $t: 'sunt in culpa qui officia' }
  }
}
function traverse (input = {}) {
  // console.log('input', input)

  if (typeof input === 'string') {
    // base
    return [getLeaf(input)]
  } else {
    // recursion
    let branch = {}
    let data = {}

    for (let child of Object.values(input)) {
      // if we hit an array
      if (Array.isArray(child)) {
        // console.log('Child ====>', child)
        // for the each item of items in the array
        return child.map(item => {
          // get the branch for the parent
          branch = getBranch(typeMap[Object.keys(input).pop()])
          // and get the children
          branch.content = traverse(item)
          return branch
        })

        // TODO: Return each branch instead of array
      } else {
        data = child.hasOwnProperty('href') ? { uri: child.href } : data

        branch = getBranch(typeMap[Object.keys(input).pop()], data)
        if (child.hasOwnProperty('$t')) {
          branch.content = traverse(child.$t)
        } else {
          branch.content = traverse(child)
        }
      }
    }
    // console.log('branch', branch)

    return [branch]
  }
}

function parseHTML (input) {
  return parser.toJson(input, options)
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

module.exports.getRelatedEntries = getRelatedEntries
module.exports.withFields = withFields
module.exports.mergeEntry = mergeEntry
module.exports.traverseDom = traverse
module.exports.parseHTML = parseHTML
module.exports.getBranch = getBranch
module.exports.getLeaf = getLeaf
module.exports.getRichText = getRichText

// const attempt1 = () =>{
//   if (i === 0) {
//     i = i + 1
//     // traverseDom(htmlObject[key])
//     return withFields({ doc: '' }, false)
//   }
//   // Object - dig deeper
//   if (typeof htmlObject[key] === 'object' && !htmlObject[key].length) {
//     console.log(`Found Object, enter it`)
//     i = i + 1
//     traverseDom(htmlObject[key], i)
//     return withFields({ [key]: '' }, true)
//   }

//   // String - an end node, wrap it
//   if (typeof htmlObject[key] === 'string') {
//     console.log(`Found string, wrap it`)
//     return withFields(Object.assign({}, { [key]: htmlObject[key] }))
//   }
//   // Array map it
//   if (typeof htmlObject[key] === 'object' && htmlObject[key].length) {
//     console.log(`Found Array, iterate it`)
//     return htmlObject[key].map(item => {
//       if (typeof item === 'string') {
//         return withFields(Object.assign({}, { [key]: item }))
//       } else if (typeof item === 'object') {
//         return traverseDom(item, i)
//       }
//     })
//   }
// })
// }

// // attempt 2
// function traverseDomTopDown (input, i, root, branch) {
//   // stop the iteration from running away from us
//   let isLeaf = false
//   branch = branch || []

//   if (i === 0) {
//     root = withFields({ doc: null })
//   }

//   branch['content'] = Object.keys(input).map(key => {
//     isLeaf = typeof input[key] === 'string'

//     return withFields({ [key]: input[key] }, isLeaf)
//   })

//   // set ref to content on first iteration
//   if (i === 0) {
//     root.content = branch.content
//   }

//   if (isLeaf) {
//     return root
//   }
//   i = i + 1
//   if (Object.values(input)) {
//     return traverseDomTopDown(
//       Object.values(input)[0],
//       i,
//       root,
//       branch.content[0]
//     )
//   }
// }
