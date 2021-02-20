const Importer = require("./import");

const dotFile = process.env.NODE_ENV
  ? `.env.${process.env.NODE_ENV}`
  : `.env.development`;

require("dotenv").config({
  path: dotFile,
});

console.log("Environment", dotFile);

let contentfulImporter = new Importer(
  process.env.ACCESS_TOKEN,
  process.env.SPACE_ID,
  process.env.SYS_ID
);
contentfulImporter.init().then(() => {
  // contentfulImporter.importContentTypes('./contenttypes.json')
  contentfulImporter.importWordpressData(process.argv[2]);
});
