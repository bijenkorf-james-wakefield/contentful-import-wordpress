'use-strict'

const fs = jest.requireActual('fs')

function readFile (path, options, callback) {
  let testJSON = '[{ "name": "test", "id": "test" }]'
  let testXML = '<root>content</root>'

  let data = path.match(/\.xml/) ? testXML : testJSON
  callback = callback || options
  let buffer = Buffer.from(data)
  if (!path || path === 'unknownFile.txt') {
    return callback(new Error(), null)
  } else {
    return callback(null, buffer)
  }
}

fs.readFile = readFile

module.exports = fs
