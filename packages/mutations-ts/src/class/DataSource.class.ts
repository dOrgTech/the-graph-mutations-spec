import {
    getABIs,
    IDataSource,
    IEthereumContractAbi,
    getSubgraphsByName
} from '../datasourceUtils'

import { HttpLink } from 'apollo-link-http';
import { IDataSourceConfig } from '../interface/IDataSourceConfig';

export default class DataSource {

    private _dataSources: any;
    private _link: HttpLink;
    private _ipfs: any;
    private _name: string;
    private _abi: string = '';
    private _address: string = '';

    constructor(dataSources: any, name: string, {graphqlEndpoint, ipfs}: IDataSourceConfig) {
        this._link = new HttpLink({ uri: `${graphqlEndpoint}/subgraphs` })
        this._name = name;
        this._dataSources = dataSources;
        this._dataSources[name] = this;
        this._ipfs = ipfs;
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
                const [file] = await this._ipfs.get(ethereumContractAbis[0].file)
                this._abi = file.content.toString('utf8');
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