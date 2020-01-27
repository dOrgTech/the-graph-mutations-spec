import React from 'react'
import { cloneDeep } from 'lodash'
import {
  Grid,
  Button
} from '@material-ui/core'

import { CREATE_GRAVATAR, GRAVATARS_QUERY } from '../../queries'
import { useMutation } from '@graphprotocol/mutations-apollo-react'


const DevTests = ({ randName, randPic, client, options }) => {

  const { withImage, withName, orderBy } = options

  //FULL DATA FAILURE TEST CASE
  const [failExecuteCreate] = useMutation(
    CREATE_GRAVATAR,
    {
      client,
      variables: {
        options: { displayName: randName, imageUrl: randPic }
      },
      refetchQueries: [
        {
          query: GRAVATARS_QUERY,
          variables: {
            where: {
              ...(withImage ? { imageUrl_starts_with: 'http' } : {}),
              ...(withName ? { displayName_not: '' } : {}),
            },
            orderBy: "displayName"
          }
        }
      ],
      optimisticResponse: {
        createGravatar: {
          id: "New",
          imageUrl: randPic,
          owner: (window as any).web3.currentProvider.selectedAddress,
          displayName: randName,
          __typename: "Gravatar"
        }
      },
      context: {
        fail: true
      },
      update: (proxy, result) => {
        const data: any = cloneDeep(proxy.readQuery({
          query: GRAVATARS_QUERY,
          variables: {
            where: {
              ...(withImage ? { imageUrl_starts_with: 'http' } : {}),
              ...(withName ? { displayName_not: '' } : {}),
            },
            orderBy: "displayName",
          }
        }, true))

        if (result.data && result.data.createGravatar) {
          data.gravatars.push(result.data.createGravatar)
        }

        proxy.writeQuery({
          query: GRAVATARS_QUERY, 
          data,
          variables: {
            where: {
              ...(withImage ? { imageUrl_starts_with: 'http' } : {}),
              ...(withName ? { displayName_not: '' } : {}),
            },
            orderBy: "displayName",
          }
        })
      },
      onError: (error) => {
        alert(error)
      }
    }
  )

  //PARTIAL DATA SUCCESS TEST CASE (IMAGE URL MISSING)
  const [partialDataSuccess] = useMutation(
    CREATE_GRAVATAR,
    {
      client,
      variables: {
        options: { displayName: randName, imageUrl: randPic }
      },
      refetchQueries: [
        {
          query: GRAVATARS_QUERY,
          variables: {
            where: {
              ...(withImage ? { imageUrl_starts_with: 'http' } : {}),
              ...(withName ? { displayName_not: '' } : {}),
            },
            orderBy: "displayName"
          }
        }
      ],
      optimisticResponse: {
        createGravatar: {
          id: "New",
          owner: (window as any).web3.currentProvider.selectedAddress,
          displayName: randName,
          imageUrl: '',
          __typename: "Gravatar"
        }
      },
      update: (proxy, result) => {
        const data: any = cloneDeep(proxy.readQuery({
          query: GRAVATARS_QUERY,
          variables: {
            where: {
              ...(withImage ? { imageUrl_starts_with: 'http' } : {}),
              ...(withName ? { displayName_not: '' } : {}),
            },
            orderBy: "displayName",
          }
        }, true))

        if (result.data && result.data.createGravatar) {
          data.gravatars.push(result.data.createGravatar)
        }

        proxy.writeQuery({
          query: GRAVATARS_QUERY, 
          data,
          variables: {
            where: {
              ...(withImage ? { imageUrl_starts_with: 'http' } : {}),
              ...(withName ? { displayName_not: '' } : {}),
            },
            orderBy: "displayName",
          }
        })
      },
      onError: (error) => {
        alert(error)
      }
    }
  )

  //PARTIAL DATA FAILURE TEST CASE (IMAGE URL MISSING)
  const [partialDataFailure] = useMutation(
    CREATE_GRAVATAR,
    {
      client,
      variables: {
        options: { displayName: randName, imageUrl: randPic }
      },
      refetchQueries: [
        {
          query: GRAVATARS_QUERY,
          variables: {
            where: {
              ...(withImage ? { imageUrl_starts_with: 'http' } : {}),
              ...(withName ? { displayName_not: '' } : {}),
            },
            orderBy: "displayName"
          }
        }
      ],
      optimisticResponse: {
        createGravatar: {
          id: "New",
          owner: (window as any).web3.currentProvider.selectedAddress,
          displayName: randName,
          imageUrl: '',
          __typename: "Gravatar"
        }
      },
      context: {
        fail: true
      },
      update: (proxy, result) => {
        const data: any = cloneDeep(proxy.readQuery({
          query: GRAVATARS_QUERY,
          variables: {
            where: {
              ...(withImage ? { imageUrl_starts_with: 'http' } : {}),
              ...(withName ? { displayName_not: '' } : {}),
            },
            orderBy: "displayName",
          }
        }, true))

        if (result.data && result.data.createGravatar) {
          data.gravatars.push(result.data.createGravatar)
        }

        proxy.writeQuery({
          query: GRAVATARS_QUERY, 
          data,
          variables: {
            where: {
              ...(withImage ? { imageUrl_starts_with: 'http' } : {}),
              ...(withName ? { displayName_not: '' } : {}),
            },
            orderBy: "displayName",
          }
        })
      },
      onError: (error) => {
        alert(error)
      }
    }
  )

  return (
    <div>
      <Grid container direction="column">
        <Button size="small" color="secondary" variant="outlined" onClick={() => failExecuteCreate()}>
          Create Gravatar Failure Test (Full Optimistic Data)
            </Button>
        <Button size="small" color="primary" variant="outlined" onClick={() => partialDataSuccess()}>
          Create Gravatar Success Test (Partial Optimistic Data)
            </Button>
        <Button size="small" color="secondary" variant="outlined" onClick={() => partialDataFailure()}>
          Create Gravatar Failure Test (Partial Optimistic Data)
            </Button>
      </Grid>
    </div>
  )
}

export default DevTests;