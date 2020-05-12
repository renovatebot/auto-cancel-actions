import nock from 'nock';

beforeAll(() => {
  nock.disableNetConnect();
});

afterAll(() => {
  jest.clearAllMocks();
  nock.enableNetConnect();
});
