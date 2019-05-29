const CONFIG = require("./config");
const Importer = require("./import");

let contentfulImporter = new Importer(
  CONFIG.ACCESS_TOKEN,
  CONFIG.SPACE_ID,
  CONFIG.SYS_ID
);
contentfulImporter.init().then(() => {
  // contentfulImporter.importContentTypes('./contenttypes.json')
  contentfulImporter.importWordpressData(process.argv[2]);
});
