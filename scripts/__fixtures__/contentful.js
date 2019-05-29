// Paragraph
const richTextNode = {
  data: {},
  content: [
    {
      data: {},
      marks: [],
      value: "",
      nodeType: "text",
    },
  ],
  nodeType: "",
};

const richTextWrappedNode = {
  data: {},
  content: [richTextNode],
  nodeType: "",
};

module.exports.richTextListItem = {
  data: {},
  content: [
    {
      data: {},
      content: [
        {
          data: {},
          marks: [],
          value: "Excepteur sint occaecat cupidatat non proident,",
          nodeType: "text",
        },
      ],
      nodeType: "paragraph",
    },
  ],
  nodeType: "list-item",
};

const richTextHyperlink = {
  data: {},
  content: [
    {
      data: {},
      marks: [],
      value: "",
      nodeType: "text",
    },
    {
      data: {
        uri: "mailto:email@example.com",
      },
      content: [
        {
          data: {},
          marks: [],
          value: "email@example.com",
          nodeType: "text",
        },
      ],
      nodeType: "hyperlink",
    },
    {
      data: {},
      marks: [],
      value: "",
      nodeType: "text",
    },
  ],
  nodeType: "paragraph",
};

module.exports.richTextModel = (
  text = "",
  nodeType = "paragraph",
  wrapped = false
) => {
  let data = Object.assign({}, richTextNode);
  data.nodeType = nodeType;
  data.content[0].value = text;
  return data;
};
