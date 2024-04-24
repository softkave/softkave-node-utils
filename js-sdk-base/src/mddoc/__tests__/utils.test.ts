import {SoftkaveMddocEndpointsBase} from '../utils';

class Endpoints01 extends SoftkaveMddocEndpointsBase {}
class Endpoints02 extends SoftkaveMddocEndpointsBase {
  endpoints01 = new Endpoints01(this.config);
}

describe('config', () => {
  test('config changes cascades', async () => {
    const oldAuthToken = Math.random().toString();
    const newAuthToken = Math.random().toString();
    const endpoints = new Endpoints02({authToken: oldAuthToken});
    expect(endpoints.endpoints01.getSdkConfig().authToken).toBe(oldAuthToken);
    endpoints.setSdkConfig({authToken: newAuthToken});
    expect(endpoints.endpoints01.getSdkConfig().authToken).toBe(newAuthToken);
  });
});
