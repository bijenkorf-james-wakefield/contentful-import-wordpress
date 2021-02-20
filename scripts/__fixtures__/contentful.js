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

const getRichTextParagraphWithInlineType = () => {
  return {
    nodeType: 'document',
    data: {},
    content: [
      {
        nodeType: 'paragraph',
        content: [
          {
            nodeType: 'text',
            data: {},
            value: 'Lorem ipsum ',
            marks: []
          },
          {
            nodeType: 'text',
            value: 'dolor',
            marks: [
              {
                type: 'bold'
              }
            ],
            data: {}
          },
          {
            nodeType: 'text',
            value: ' sit ',
            marks: [],
            data: {}
          },
          {
            nodeType: 'text',
            value: 'amet',
            marks: [
              {
                type: 'italic'
              }
            ],
            data: {}
          },
          {
            nodeType: 'text',
            value: ', ',
            marks: [],
            data: {}
          },
          {
            nodeType: 'text',
            value: 'consectetur adipiscing',
            marks: [
              {
                type: 'underline'
              }
            ],
            data: {}
          },
          {
            nodeType: 'text',
            value:
              ' elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
            marks: [],
            data: {}
          }
        ],
        data: {}
      }
    ]
  }
}

const getRichTextNode = (value, nodeType, data = {}, marks = []) => {
  return {
    data: {},
    content: [
      {
        data,
        content: [
          {
            data: {},
            marks,
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
  getRichTextNode,
  getRichTextParagraphWithInlineType
}
