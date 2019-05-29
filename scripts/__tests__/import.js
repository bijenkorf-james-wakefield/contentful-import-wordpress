const CONTENTFUL = require("../config");

jest.mock("contentful-management");
jest.mock("fs");

require("dotenv").config({
  path: `.env.${process.env.NODE_ENV}`,
});

const Importer = require("../import");
const Promise = require("bluebird");
// const contentful = require('contentful-management')

describe("Incorrectly configured", () => {
  let TestImporter;
  beforeAll(async () => {
    TestImporter = new Importer(null, null, null);
  });
  afterEach(() => {});

  test("getSpace: rejects if invalid params used in configuration", async () => {
    // arrange

    // act

    // assert
    await expect(TestImporter.getSpace()).rejects.toThrow();
  });
  test("getEnvironment: rejects if invalid params used in configuration", async () => {
    // arrange
    // act
    // assert
    await expect(TestImporter.getEnvironment()).rejects.toThrow();
  });
  test("getContentTypes: throws error if space.getContentTypes rejects", async () => {
    // act
    // assert
    await expect(TestImporter.getContentTypes()).rejects.toThrow();
  });
});

describe("Correctly configured", () => {
  let TestImporter;

  beforeAll(() => {
    TestImporter = new Importer(
      process.env.ACCESS_TOKEN,
      process.env.SPACE_ID,
      process.env.SYS_ID
    );

    return TestImporter.init();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("init: space is initialised", async () => {
    // arrange
    let result;
    let expected = "logistics";
    // act
    result = TestImporter;
    // assert
    await expect(result.space).toBeDefined();
  });

  test("init: environment is initialised", async () => {
    // arrange
    let result = true;
    let expected = "master";
    // act
    result = TestImporter;
    // assert
    await expect(result.environment).toBeDefined();
  });

  test("importContentTypes: throws error if wrong args passed", async () => {
    // act
    // assert
    await expect(TestImporter.importContentTypes()).rejects.toThrow();
  });

  test("importContentTypes: resolves", async () => {
    // arrange
    let spy = jest.spyOn(TestImporter, "createContentType");
    let expected = "Done";
    let result;
    // console.log('environment', TestImporter.environment)

    // act
    result = await TestImporter.importContentTypes("../contenttypes.json");
    // assert
    expect(result[0]).toBe(expected);
    expect(spy).toHaveBeenCalledTimes(1);

    // spy.mockClear()
  });

  test("getContentTypes: response matches snapshot", async () => {
    // act
    // assert
    await expect(TestImporter.getContentTypes()).toMatchSnapshot();
  });

  test("readFile: rejects if incorrect argument used", async () => {
    // act
    // assert
    await expect(TestImporter.readFile()).rejects.toThrow();
  });

  test("readFile: rejects if non existant file used", async () => {
    // act
    // assert
    await expect(TestImporter.readFile("unknownFile.txt")).rejects.toThrow();
  });

  test("writeFile: calls writeFile mock and returns saved on success", async () => {
    // arrange
    let data = Buffer.from("Test data");
    let expected = "Saved";
    let testfile = "somefile.txt";
    let result = await TestImporter.writeFile(testfile, data);
    // act
    // assert
    expect(result.toString()).toBe(expected);
  });

  test("writeFile: rejects if incorrect argument used", async () => {
    // act
    // assert
    await expect(TestImporter.writeFile()).rejects.toThrow();
  });

  test("parseXml: throws error if something goes wrong", async () => {
    // arrange
    // act
    // assert
    await expect(TestImporter.parseXml()).rejects.toThrow();
  });

  test("parseXml: throws error if something goes wrong", async () => {
    // arrange
    let expected = { node: "content" };
    let result;
    // act
    result = await TestImporter.parseXml("<node>content</node>");
    // assert
    expect(result).toEqual(expected);
  });

  test("parseXml: throws error if you pass non xml string", async () => {
    // act
    await expect(TestImporter.parseXml(9)).rejects.toThrow();
  });

  test("createContentType: rejects if invalid input passed as args", async () => {
    // arrange
    let item = null;
    // act
    // assert
    await expect(TestImporter.createContentType(item)).rejects.toThrow();
  });

  test("createContentType: Should be called once and then done", async () => {
    // arrange
    let spy = jest.spyOn(TestImporter, "createContentType");
    let result;
    let expected = "Done";
    let types = [{ id: "test", name: "Test" }];
    const getResult = async () => {
      return Promise.all(
        types.map(item => TestImporter.createContentType(item))
      );
    };
    // act
    result = await getResult();
    // assert
    expect(spy.mock.calls[0][0]).toEqual(types[0]);
    expect(spy).toHaveBeenCalledTimes(1);
    expect(result.length).toEqual(1);
    expect(result[0]).toEqual(expected);

    // clear mock
    spy.mockRestore();
  });

  test("createContentType: Should be called three times, then Done", async () => {
    // arrange
    let spy = jest.spyOn(TestImporter, "createContentType");
    let result;
    let expected = "Done";
    let types = [
      { id: "1", name: "One" },
      { id: "2", name: "Two" },
      { id: "3", name: "Three" },
    ];
    const getResult = async () => {
      return Promise.all(
        types.map(item => TestImporter.createContentType(item))
      );
    };
    // act
    result = await getResult();
    // assert
    expect(spy.mock.calls[0][0]).toEqual(types[0]);
    expect(spy).toHaveBeenCalledTimes(3);
    expect(result.length).toEqual(3);
    expect(result[0]).toEqual(expected);
    // clear mock
    spy.mockRestore();
  });

  test("importWordpressData: should reject with incorrect args", async () => {
    let spy = jest.spyOn(TestImporter, "importWordpressData");

    await expect(TestImporter.importWordpressData()).rejects.toThrow();
    expect(spy).toHaveBeenCalledTimes(1);
  });
  test.skip("importWordpressData: should resolve data", async () => {
    let spy = jest.spyOn(TestImporter, "importWordpressData");
    let expected = { root: "content" };
    let result;

    result = await TestImporter.importWordpressData("testfile.xml");

    expect(result).toEqual(expected);
    expect(spy).toHaveBeenCalledTimes(1);
    // clear mock
    spy.mockRestore();
  });

  test("mapPost: should create an object with the en locale", () => {
    const data = require("../__mocks__/mockData.json");
    let result;
    let pages;

    // inject data, bypassing other routes
    TestImporter.data = data;
    // get only pages
    pages = TestImporter.getItemByType("page");

    result = TestImporter.mapPost(pages[0]);

    expect(result).toMatchSnapshot();
  });
  test("mapPost: should create an object with the nl locale", () => {
    const data = require("../__mocks__/mockData.json");
    let result;
    let pages;

    // inject data, bypassing other routes
    TestImporter.data = data;
    // get only pages
    pages = TestImporter.getItemByType("page");

    result = TestImporter.mapPost(pages[1]);
    expect(result).toMatchSnapshot();
  });
  test("mapPost: should handle all data without error", () => {
    const data = require("../__mocks__/mockData.json");
    let results;
    let pages;

    // inject data, bypassing other routes
    TestImporter.data = data;
    // get only pages
    pages = TestImporter.getItemByType("page");

    results = pages.map(page => {
      TestImporter.mapPost(page);
    });
    expect(results.length).toEqual(pages.length);
  });

  test.skip("createContentEntryWithId: should create entry for each page", async () => {
    const data = require("../__mocks__/mockData.json");
    let spy = jest.spyOn(TestImporter, "createContentEntryWithId");
    let expected = "Done";
    let result;
    let pages;

    TestImporter.data = data;
    pages = TestImporter.getItemByType("page");

    // console.log(data.rss.channel[0]['item'].length)
    // console.log(pages.length)

    result = await TestImporter.createContentEntryWithId("page", pages[0]);

    console.log("result ", result);
    expect(result.length).toEqual(pages.length);
    // clear mock
    spy.mockRestore();
  });
  test("createContentEntryWithId: should resolve after seconds", async () => {
    // arrange
    const data = require("../__mocks__/mockData.json");
    let spy = jest.spyOn(TestImporter, "createContentEntryWithId");
    let expected = "Done";
    let results;
    let pages;
    // jest.useFakeTimers()

    // act
    TestImporter.data = data;
    pages = TestImporter.getItemByType("page").slice(0, 5);

    // console.log(data.rss.channel[0]['item'].length)
    // console.log(pages.length)

    results = await Promise.map(
      pages,
      async page => {
        return TestImporter.createContentEntryWithId("page", page);
      },
      { concurrency: 1 }
    );

    // assert
    // expect(setTimeout).toHaveBeenCalledTimes(1)
    // expect(setTimeout).toHaveBeenLastCalledWith(expect.any(Function), 1000)
    expect(results.length).toEqual(pages.length);
    // clear mock
    spy.mockRestore();
  });
  test("getByNode, for author returns author element", () => {
    // arrange
    let results;
    let expected = 3;
    let data = require("../__mocks__/mockData.json");

    //  act
    // inject data, bypassing other routes
    TestImporter.data = data;
    results = TestImporter.getByNode("wp:author");
    // assert
    expect(results.length).toEqual(expected);
  });
  test("getByNode, returns an empty array if nothing found", () => {
    // arrange
    let result;
    let expected = [];
    let data = require("../__mocks__/mockData.json");

    //  act
    // inject data, bypassing other routes
    TestImporter.data = data;
    result = TestImporter.getByNode();
    // assert
    expect(result).toEqual(expected);
  });
  test("mapAuthor mapping should match snapshot", () => {
    // arrange
    let result;
    let data = require("../__mocks__/mockData.json");

    //  act
    // inject data, bypassing other routes
    TestImporter.data = data;
    result = TestImporter.getByNode("wp:author");
    result = TestImporter.mapAuthor(result[1]);
    // assert
    expect(result).toMatchSnapshot();
  });
});
