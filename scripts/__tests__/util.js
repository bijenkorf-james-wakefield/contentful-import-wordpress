const util = require("../util");
const fixture = require("../__fixtures__/contentful");

describe("Utils -  withFields", () => {
  test("should return an object matching fixture for paragraph", () => {
    let input = "<p>Test</p>";
    let expected = fixture.richTextModel("Test", "paragraph");
    let result;

    result = util.withFields(input);

    expect(result).toEqual(expected);
  });

  test("should return an object matching fixture for Heading 1", () => {
    let input = "<h1>Test</h1>";
    let expected = fixture.richTextModel("Test", "heading-1");
    let result;

    result = util.withFields(input);

    expect(result).toEqual(expected);
  });
  test("should return an object matching fixture for Heading 6", () => {
    let input = "<h6>Test</h6>";
    let expected = fixture.richTextModel("Test", "heading-6");
    let result;

    result = util.withFields(input);

    expect(result).toEqual(expected);
  });

  test("should return an object matching fixture for list item", () => {
    let input =
      "<li><p>Excepteur sint occaecat cupidatat non proident,</p></li>";
    let expected = fixture.richTextListItem;
    let result;

    result = util.withFields(input);
    expect(result).toEqual(expected);
  });
});

describe("Utils - mergeEntry", () => {
  test("should be defined", () => {
    let expected = {};
    let result;
    result = util.mergeEntry({}, {});
    expect(result).toStrictEqual(expected);
  });

  test("should do a deep merge on two objects with similar data structure", () => {
    let expected = {
      fields: {
        title: { en: "Test page", nl: "Test page" },
        slug: { en: "test-page", nl: "test-page" },
      },
    };
    let object1 = {
      fields: {
        title: {
          en: "Test page",
        },
        slug: {
          en: "test-page",
        },
      },
    };

    let object2 = {
      fields: {
        title: {
          nl: "Test page",
        },
        slug: {
          nl: "test-page",
        },
      },
    };

    let result;
    result = util.mergeEntry(object1, object2);
    expect(result).toStrictEqual(expected);
  });
});

describe("Utils - getRelatedEntries", () => {
  test("should return two entries that are related based on id", () => {
    let result;
    let expected = [
      [
        { fields: { id: 936, title: { en: "Kiwi" } } },
        { fields: { id: 284, title: { en: "Kiwi" } } },
      ],
      [
        { fields: { id: 1, title: { en: "Banana" } } },
        { fields: { id: 2, title: { nl: "Banaan" } } },
      ],
    ];
    let input = [
      { fields: { id: 936, title: { en: "Kiwi" } } },
      { fields: { id: 284, title: { en: "Kiwi" } } },
      { fields: { id: 1, title: { en: "Banana" } } },
      { fields: { id: 2, title: { nl: "Banaan" } } },
      { fields: { id: 3, title: { en: "Kiwi" } } },
      { fields: { id: 3, title: { en: "Kiwi" } } },
      ,
    ];

    result = util.getRelatedEntries(input);

    expect(result).toStrictEqual(expected);
  });
});
