// Paragraph

const getRichTextListItem = value => {
  return {
    data: {},
    content: [
      {
        data: {},
        content: [
          {
            data: {},
            content: [
              {
                data: {},
                marks: [],
                value,
                nodeType: 'text'
              }
            ],
            nodeType: 'paragraph'
          }
        ],
        nodeType: 'list-item'
      }
    ],
    nodeType: 'document'
  }
}

const getRichTextNode = (value, nodeType, data = {}) => {
  return {
    data: {},
    content: [
      {
        data,
        content: [
          {
            data: {},
            marks: [],
            value,
            nodeType: 'text'
          }
        ],
        nodeType
      }
    ],
    nodeType: 'document'
  }
}

const getUnorderedList = () => {
  return {
    data: {},
    content: [
      {
        data: {},
        content: [
          {
            data: {},
            content: [
              {
                data: {},
                content: [
                  {
                    data: {},
                    marks: [],
                    value: 'Excepteur sint occaecat cupidatat non proident,',
                    nodeType: 'text'
                  }
                ],
                nodeType: 'paragraph'
              }
            ],
            nodeType: 'list-item'
          },
          {
            data: {},
            content: [
              {
                data: {},
                content: [
                  {
                    data: {},
                    marks: [],
                    value: 'sunt in culpa qui officia',
                    nodeType: 'text'
                  }
                ],
                nodeType: 'paragraph'
              }
            ],
            nodeType: 'list-item'
          },
          {
            data: {},
            content: [
              {
                data: {},
                content: [
                  {
                    data: {},
                    marks: [],
                    value: 'deserunt mollit anim id est laborum.',
                    nodeType: 'text'
                  }
                ],
                nodeType: 'paragraph'
              }
            ],
            nodeType: 'list-item'
          }
        ],
        nodeType: 'unordered-list'
      }
    ],
    nodeType: 'document'
  }
}
// '<p>excepteur sint occaecat cupidatat non proident <a href="https://www.debijenkorf.nl">sunt in culpa qui officia</a>deserunt mollit anim id est</p>'
const getRichTextHyperlink = () => {
  return {
    data: {},
    content: [
      {
        data: {},
        content: [
          {
            data: {},
            marks: [],
            value: 'excepteur sint occaecat cupidatat non proident ',
            nodeType: 'text'
          },
          {
            data: {
              uri: 'https://www.debijenkorf.nl'
            },
            content: [
              {
                data: {},
                marks: [],
                value: 'sunt in culpa qui officia',
                nodeType: 'text'
              }
            ],
            nodeType: 'hyperlink'
          },
          {
            data: {},
            marks: [],
            value: 'deserunt mollit anim id est',
            nodeType: 'text'
          }
        ],
        nodeType: 'paragraph'
      }
    ],
    nodeType: 'document'
  }
}

module.exports = {
  getUnorderedList,
  getRichTextHyperlink,
  getRichTextListItem,
  getRichTextNode
}
