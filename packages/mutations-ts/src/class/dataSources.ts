import DataSource  from './dataSource'
import { DataSourceConfig } from '../interface/dataSourceConfig';

export default class DataSources {

    constructor(graphqlEndpoint: string, ipfs: any) {
        return new Proxy({}, {
            get: (target: any, name: string) => {
                return name in target?
                    target[name]
                    : new DataSource(target, name, {graphqlEndpoint, ipfs} as DataSourceConfig);
            }
        })
    }
}