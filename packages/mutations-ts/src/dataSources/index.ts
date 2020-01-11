import { DataSource } from "./dataSource"

export default class DataSources {

  // TODO: store ipfs & link

  constructor(graphqlEndpoint: string, ipfs: any) {
      return new Proxy({}, {
          get: (target: any, name: string) => {
              return name in target?
                  target[name]
                  // TODO: pass in this
                  : new DataSource(target, name, {graphqlEndpoint, ipfs} as DataSourceConfig);
          }
      })
  }
}

export {
  DataSource
};
