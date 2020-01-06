import DataSource  from './DataSource.class'

export default class DataSources {

    constructor(graphqlEndpoint: string) {
        return new Proxy({}, {
            get: (target: any, name: string) => {
                return name in target?
                    target[name]
                    : new DataSource(target, name, graphqlEndpoint);
            }
        })
    }
}