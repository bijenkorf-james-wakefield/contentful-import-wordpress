const contentful = require("contentful-management");
const fs = require("fs");
const xml2js = require("xml2js");
const path = require("path");
const Promise = require("bluebird");
const util = require("./util");

class Importer {
  constructor(token, id, sysID) {
    this.authToken = token;
    this.parser = new xml2js.Parser();
    this.space = null;
    this.environment = null;
    this.data = null;
    this.id = id;
    this.sysID = sysID;
    this.contentTypes = null;
    this.categories = null;
    this.authors = null;
    this.posts = null;
    this.tags = null;
    this.locale = null;
  }

  async getSpace() {
    try {
      if (!this.id) {
        throw new Error("Space ID must be defined");
      }
      this.client = contentful.createClient({
        accessToken: this.authToken,
      });
      return await this.client.getSpace(this.id);
    } catch (error) {
      return Promise.reject(error);
    }
  }

  async getEnvironment() {
    try {
      if (!this.sysID) {
        throw new Error("SYS ID must be defined");
      }
      return await this.space.getEnvironment(this.sysID);
    } catch (error) {
      return Promise.reject(error);
    }
  }

  async getContentTypes() {
    try {
      return await this.environment.getContentTypes();
    } catch (error) {
      return Promise.reject(error);
    }
  }

  async readFile(filename) {
    return new Promise((resolve, reject) => {
      fs.readFile(filename, (err, data) => {
        err ? reject(err) : resolve(data);
      });
    });
  }

  async writeFile(filename, data) {
    return new Promise((resolve, reject) => {
      fs.writeFile(filename, data, err => {
        err ? reject(err) : resolve("Saved");
      });
    });
  }

  async parseXml(data) {
    if (!data) {
      return Promise.reject(new Error("invalid argument data"));
    }
    return new Promise((resolve, reject) => {
      this.parser.parseString(data, (err, result) => {
        if (err) {
          reject(err);
        }
        resolve(result);
      });
    });
  }
  async createContentType(contentType) {
    if (!contentType || !contentType.id) {
      return Promise.reject(
        new Error("Invalid arguments passed to createContentType")
      );
    }
    // check if id is already set
    try {
      let tmp = await this.environment.getContentType(contentType.id);
      console.log(tmp);
    } catch (error) {
      try {
        let id = contentType.id;
        delete contentType.id;
        let createdContentType = await this.environment.createContentTypeWithId(
          id,
          contentType
        );
        createdContentType.publish();
      } catch (error) {
        console.error("another error", error);
      }
    }

    return new Promise(resolve => {
      setTimeout(() => {
        return resolve("Done");
      }, 200);
    });
  }
  async createContentEntryWithId(typeID, entryId, entry) {
    console.log(`creating item: ${typeID}`);

    try {
      let asset = await this.environment.createEntryWithId(
        typeID,
        entryId,
        entry
      );
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          resolve(asset);
        }, 500);
      });
    } catch (err) {
      console.log("error on entry", entry);
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          reject(err);
        }, 2000);
      });
    }
  }
  getLocale(input) {
    let locale;

    locale = input["wp:postmeta"]
      .filter(item => {
        return item["wp:meta_key"][0] === "language_code";
      })
      .map(item => {
        return item["wp:meta_value"][0];
      });
    locale = locale.length ? "nl" : "en";

    return locale;
  }
  getSlug(input) {
    let slug;
    let regex = /[0-9]{1,}\/(.*[^/])\/?$/;
    try {
      slug = input.link[0].match(regex)[1];
    } catch (error) {
      console.error("failed on ", input, error);
    }

    return slug;
  }
  mapPost(input) {
    let locale = this.getLocale(input);
    let slug = this.getSlug(input);
    let post = {
      fields: {
        id: input["wp:post_id"][0],
        title: {
          [locale]: input.title[0].trim(),
        },
        slug: {
          [locale]: slug,
        },
        body: {
          [locale]: {
            data: {},
            content: [
              {
                data: {},
                content: [
                  {
                    data: {},
                    marks: [],
                    value: input["content:encoded"][0],
                    nodeType: "text",
                  },
                ],
                nodeType: "paragraph",
              },
            ],
            nodeType: "document",
          },
        },
      },
    };
    // [slug, ],
    // [body, content],
    // [author, ],
    // [categories, ],
    // [attachment, ],
    return post;
  }
  mapAuthor(input) {
    let author = {
      fields: {
        id: input["wp:author_id"][0],
        email: { en: input["wp:author_email"][0] },
        display_name: { en: input["wp:author_display_name"][0] },
        first_name: { en: input["wp:author_first_name"][0] },
        last_name: { en: input["wp:author_last_name"][0] },
        slug: {
          en: input["wp:author_display_name"][0]
            .toLowerCase()
            .split(" ")
            .join("-"),
        },
      },
    };
    return author;
  }
  async createAuthors() {}
  async createTags() {}
  async createCategories() {}
  analyseXml() {
    console.log(`found: ${this.getItemByType("post").length} posts`);
    console.log(`found: ${this.getItemByType("page").length} pages`);
    console.log(
      `found: ${this.getItemByType("attachment").length} attachments`
    );
    console.log(`found: ${this.getByNode("wp:author").length} authors`);
    console.log(`found: ${this.getByNode("wp:category").length} categories`);
    console.log(`found: ${this.getByNode("wp:tag").length} tags`);
  }
  getItemByType(type) {
    let items = this.data.rss.channel[0]["item"] || [];
    return items.filter(item => item["wp:post_type"][0] === type);
  }
  getByNode(node) {
    let items = this.data.rss.channel[0][node] || [];
    return items.map(item => item);
  }
  async importContentTypes(filename) {
    if (typeof filename !== "string") {
      return Promise.reject(new Error("Invalid argument filename"));
    }
    // getContentTypes from file
    try {
      let contentTypesModel = await this.readFile(
        path.join(__dirname, filename)
      );
      this.contentTypes = JSON.parse(contentTypesModel);
      let results = Promise.map(
        this.contentTypes,
        async item => {
          return this.createContentType(item);
        },
        { concurrency: 1 }
      );

      return Promise.all(results);
    } catch (err) {
      return Promise.reject(err);
    }
  }
  async importWordpressData(exportFile) {
    // parse xml
    let exportData = await this.readFile(exportFile);
    this.data = await this.parseXml(exportData);

    // await this.
    // return this.data
    // this.analyseXml()
    let pages = this.getItemByType("page").map(page => {
      return this.mapPost(page);
    });
    console.log("Pages", pages);

    let relatedPages = util.getRelatedEntries(pages);

    console.log(relatedPages);

    let mergedPages = relatedPages.map(related => {
      return util.mergeEntry(related[0], related[1]);
    });

    console.log(mergedPages);

    Promise.map(
      mergedPages,
      async page => {
        let id = page.fields.id;
        delete page.fields.id;
        let asset = await this.createContentEntryWithId("page", id, page);
        asset.publish();
      },
      { concurrency: 1 }
    );

    // return this.data

    // create authors
    // let authors = this.getByNode('wp:author').map(author => {
    //   return this.mapAuthor(author)
    // })

    // Promise.map(
    //   authors,
    //   async author => {
    //     let id = author.fields.id
    //     delete author.fields.id
    //     let asset = await this.createContentEntryWithId('author', id, author)
    //     await asset.publish()
    //   },
    //   { concurrency: 1 }
    // )

    // await this.createContentEntry('page')
    // create posts
    // await this.createContentEntry('post')
    // create pages
    // await this.createContentEntry('attachment')
    // create tags
    // create categories
    // create attachments
    // done
  }
  async init() {
    // console.log('initialising')

    // Setup space
    try {
      this.space = await this.getSpace();
    } catch (error) {
      Promise.reject(new Error(error));
    }
    // Setup environment
    try {
      this.environment = await this.getEnvironment();
    } catch (error) {
      Promise.reject(new Error(error));
    }
    Promise.resolve("Initialized");
  }
}

module.exports = Importer;
