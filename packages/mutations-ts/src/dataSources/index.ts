import { DataSource } from './dataSource'
import { getDataSource, getContractAbis } from './utils'

import { HttpLink } from 'apollo-link-http'
const ipfsHttpClient = require('ipfs-http-client')

export class DataSources {

  private _subgraph: string
  private _metadataLink: HttpLink
  private _ipfs: any

  constructor(subgraph: string, nodeEndpoint: string, ipfsEndpoint: string) {
    this._subgraph = subgraph
    this._metadataLink = new HttpLink({ uri: `${nodeEndpoint}/subgraphs` })

    const url = new URL(ipfsEndpoint)
    this._ipfs = ipfsHttpClient({
      protocol: url.protocol.replace(/[:]+$/, ''),
      host: url.hostname,
      port: url.port,
      'api-path': url.pathname.replace(/\/$/, '') + '/api/v0/',
    })

    return new Proxy(this, {
      get: (target: any, name: string): DataSource => {
        if (!(name in target)) {
          const dataSource = new DataSource(this, name)
          target[name] = dataSource
        }
        return target[name]
      }
    })
  }

  public async fetchAbi(name: string): Promise<string | undefined> {
    const { data } = await getDataSource(
      this._metadataLink, this._subgraph, name
    )

    if (!data || data.subgraphs.length === 0 ||
        data.subgraphs[0].currentVersion.deployment.manifest.dataSources.length === 0) {
      throw new Error(`Error fetching dataSource from subgraph '${this._subgraph}' with name '${name}'`)
    }

    const abiName = data.subgraphs[0].currentVersion.deployment.manifest.dataSources[0].source.abi

    const result = await getContractAbis(
      this._metadataLink, abiName
    )

    if (!result.data || result.data.ethereumContractAbis.length === 0) {
    throw new Error(`Error fetching ethereum contract abis with name '${abiName}'`)
  }

    const abi = result.data.ethereumContractAbis[0].file;

    const resp = await this._ipfs.get(abi)

    if (resp.length === 0) {
      throw new Error(`Error fetching ABI from IPFS with name '${name}' and hash '${abi}'`)
    }

    return resp[0].content.toString('utf8')
  }

  public async fetchAddress(name: string): Promise<string | undefined> {
    const { data } = await getDataSource(
      this._metadataLink, this._subgraph, name
    )

    if (!data || data.subgraphs.length === 0 ||
        data.subgraphs[0].currentVersion.deployment.manifest.dataSources.length === 0) {
          throw new Error(`Error fetching dataSource from subgraph '${this._subgraph}' with name '${name}'`)
    }

    return data.subgraphs[0].currentVersion.deployment.manifest.dataSources[0].source.address
  }
}

export {
  DataSource
}
