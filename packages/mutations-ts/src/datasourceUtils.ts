import { execute, makePromise } from 'apollo-link'
import { HttpLink } from 'apollo-link-http';
import gql from 'graphql-tag'

const GET_SUBGRAPHS_BY_NAME = gql`
  query subgraphs($name: String){
    subgraphs{
      currentVersion {
            deployment {
                manifest {
                  dataSources (where: {name: $name}){
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
const GET_SUBGRAPHS = gql`
{
  subgraphs{
    currentVersion {
          deployment {
              manifest {
                dataSources{
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

export const getSubgraphsByName = async (link: HttpLink, variables: Object) => {
  return await makePromise(
      execute(link, {
          query: GET_SUBGRAPHS_BY_NAME,
          variables
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

export interface Source {
    abi: string,
    address: string
}

export interface DataSourceInterface{
    name: string,
    network: string,
    source: Source
}

export interface EthereumContractAbi{
    file: string
}