const CONFIG = require("./config");
const Importer = require("./import");

require("dotenv").config({
  path: `.env.${process.env.NODE_ENV}`,
});

let contentfulImporter = new Importer(
  process.env.ACCESS_TOKEN,
  process.env.SPACE_ID,
  process.env.SYS_ID
);
contentfulImporter.init().then(() => {
  // contentfulImporter.importContentTypes('./contenttypes.json')
  contentfulImporter.importWordpressData(process.argv[2]);
});
