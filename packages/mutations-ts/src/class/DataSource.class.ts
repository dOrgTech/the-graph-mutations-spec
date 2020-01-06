import {
    getABIs,
    IDataSource,
    IEthereumContractAbi,
    getSubgraphsByName
} from '../datasourceUtils'

import { HttpLink } from 'apollo-link-http';

export default class DataSource {

    private _dataSources: any;
    private _link: HttpLink;
    private _name: string;
    private _abi: string = '';
    private _address: string = '';

    constructor(dataSources: any, name: string, graphqlEndpoint: string) {
        this._link = new HttpLink({ uri: `${graphqlEndpoint}/subgraphs` })
        this._name = name;
        this._dataSources = dataSources;
        this._dataSources[name] = this;
    }

    get abi(): Promise<string> {
        return (async () => {
            if (this._abi === '') {
                const { data } = await getABIs(
                    this._link,
                    { name: this._name }
                )
                if (!data || data.ethereumContractAbis.length === 0) throw new Error(`Error fetching ABIs for subgraph with name '${this._name}'`)
                const ethereumContractAbis = data.ethereumContractAbis as IEthereumContractAbi[];
                this._abi = ethereumContractAbis[0].file;
                return this._abi;
            } else {
                return this._abi;
            }
        })()
    }

    get address(): Promise<string> {
        return (async () => {
            if (this._address === '') {
                const { data } = await getSubgraphsByName(this._link, {name: this._name})
                if(!data || data.subgraphs[0].currentVersion.deployment.manifest.dataSources.length === 0)
                    throw new Error("Error fetching subgraph metadata")
                const dataSource = data.subgraphs[0].currentVersion.deployment.manifest.dataSources[0] as IDataSource;
                this._address = dataSource.source.address;
                return this._address;
            } else {
                return this._address;
            }
        })()

    }
}