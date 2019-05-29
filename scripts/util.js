const parser = require("xml2json");
const merge = require("deepmerge");

let options = {
  object: true,
};

let typeMap = {
  p: "paragraph",
  h1: "heading-1",
  h2: "heading-2",
  h3: "heading-3",
  h4: "heading-4",
  h5: "heading-5",
  h6: "heading-6",
  li: "list-item",
};

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
  [, 327], // Amsterdam - only Dutch
  [, 331], // Den Haag - only Dutch
  [, 336], // Rotterdam - only Dutch
  [, 332], // Eindhoven - only Dutch
  [, 326], // Amstelveen - only Dutch
  [, 335], // Maastricht - only Dutch
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
  [1904, 505], // Sea and Air Forwarder
];

/**
 * mergeEntry
 * @param {object} input
 * @returns {object} output
 */
function mergeEntry(object1, object2) {
  let output = merge(object1, object2);
  return output;
}

// Trying to get two objects by id, which are related and return them.
function getRelatedEntries(input) {
  let found;

  let output = pageMapping
    .map(array => {
      return input.filter(item => {
        return item.fields.id == array[0] || item.fields.id == array[1];
      });
    })
    .filter(item => item.length);

  return output;
}

function withFields(input) {
  if (typeof input !== "string") {
    throw new Error("withFields: Invalid argument type input");
  }
  let fields = {};
  let parsed = parser.toJson(input, options);
  // example node
  //   {
  //     data: {},
  //     marks: [],
  //     value: "",
  //     nodeType: "text",
  //   };
  for (node in parsed) {
    //console.log(node);
    if (typeof parsed[node] === "object") {
      fields = {
        data: {},
        content: [
          {
            data: {},
            content: [
              {
                data: {},
                marks: [],
                value: Object.values(parsed[node])[0],
                nodeType: "text",
              },
            ],
            nodeType: typeMap[Object.keys(parsed[node])[0]],
          },
        ],
        nodeType: typeMap[node],
      };
    } else {
      fields = {
        data: {},
        content: [
          {
            data: {},
            marks: [],
            value: parsed[node],
            nodeType: "text",
          },
        ],
        nodeType: typeMap[node],
      };
    }
  }
  return fields;
}

module.exports.getRelatedEntries = getRelatedEntries;
module.exports.withFields = withFields;
module.exports.mergeEntry = mergeEntry;
