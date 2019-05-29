const contentful = jest.requireActual('contentful-management')

const ContentTypeAPI = {
  publish: jest.fn()
}
const EnvironmentAPI = {
  createContentType: jest.fn(),
  createContentTypeWithId: jest.fn().mockResolvedValue(ContentTypeAPI),
  createEntry: jest.fn(),
  createEntryWithId: jest.fn(),
  getContentTypes: jest.fn(),
  getContentType: jest.fn().mockRejectedValue(new Error('Async error'))
}

const SpaceAPI = {
  getEnvironment: jest.fn().mockResolvedValue(EnvironmentAPI)
}

const ClientApi = {
  getSpace: jest.fn().mockResolvedValue(SpaceAPI)
}

module.exports = {
  ...contentful,
  createClient: jest.fn().mockReturnValue(ClientApi)
}
