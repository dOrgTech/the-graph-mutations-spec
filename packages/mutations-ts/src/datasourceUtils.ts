import { execute, makePromise } from 'apollo-link'
import { HttpLink } from 'apollo-link-http';
import gql from 'graphql-tag'

const GET_SUBGRAPHS = gql`{
    subgraphs {
      currentVersion {
        deployment {
          manifest {
            dataSources {
              name
              network
              source {
                address
                abi
              }
            }
            templates {
              name
              source {
                abi
              }
            }
          }
          dynamicDataSources {
            name
            network
            source {
              address
              abi
            }
          }
        }
      }
    }
  }
  `
  
  const GET_ABIS = gql`
    query ethereumContractAbis($name: String!){
        ethereumContractAbis(where: {name: $name}){
          file
        }
      }
  `

export const getSubgraphs = async (link: HttpLink) => {

    return await makePromise(
        execute(link, {
            query: GET_SUBGRAPHS
        })
    )
}

export const getABIs = async (link: HttpLink, variables: Object) => {

    return await makePromise(
        execute(link, {
            query: GET_ABIS,
            variables
        })
    )
}

export interface ISource {
    abi: string,
    address: string
}

export interface IDataSource{
    name: string,
    network: string,
    source: ISource
}

export interface IEthereumContractAbi{
    file: string
}