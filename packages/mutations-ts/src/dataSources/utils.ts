import { execute, makePromise } from 'apollo-link'
import { HttpLink } from 'apollo-link-http';
import gql from 'graphql-tag'

const GET_DATASOURCE = gql`
  query GetDataSource($subgraph: String, $dataSource: String) {
    subgraphs (where: {name: $subgraph}) {
      currentVersion {
        deployment {
          manifest {
            dataSources (where: {name: $dataSource}) {
              source {
                address
                abi
              }
            }
          }
        }
      }
    }
  }
`

export const getDataSource = async (link: HttpLink, subgraph: string, dataSource: string) => {
  return await makePromise(
    execute(link, {
      query: GET_DATASOURCE,
      variables: {
        subgraph,
        dataSource
      }
    })
  )
}
