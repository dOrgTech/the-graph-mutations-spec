import React, { Component } from 'react'
import ApolloClient, { gql, InMemoryCache } from 'apollo-boost'
import { ApolloProvider, Query } from 'react-apollo'
import {
  Grid,
  LinearProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Button,
} from '@material-ui/core'
import './App.css'
import Header from './components/Header'
import Error from './components/Error'
import Gravatars from './components/Gravatars'
import Filter from './components/Filter'

import gravatarMutations from 'gravatar-mutations'
import { initMutations } from '@graphprotocol/mutations-ts'

if (!process.env.REACT_APP_GRAPHQL_ENDPOINT) {
  throw new Error('REACT_APP_GRAPHQL_ENDPOINT environment variable not defined')
}

const mutations = initMutations(
  gravatarMutations,
  {
    thegraph: process.env.REACT_APP_GRAPHQL_ENDPOINT,
    ethereum: window.ethereum,
    ipfs: process.env.IPFS_ENDPOINT
  }
)

const client = new ApolloClient({
  uri: process.env.REACT_APP_GRAPHQL_ENDPOINT,
  cache: new InMemoryCache(),
  resolvers: mutations.resolvers
})

// mutations.resolvers -
//   wrapped version of the original `gravatarMutations.resolvers`
//   object. These wrapping functions inject a `context` property
//   named `thegraph` with all of the fields added by the
//   `requiredContext` generator functions. Additionally the datasource
//   addresses have been fetched from the graph-node and are available
//   like so `context.thegraph.datasources.${name}`.

const GRAVATARS_QUERY = gql`
  query gravatars($where: Gravatar_filter!, $orderBy: Gravatar_orderBy!) {
    gravatars(first: 100, where: $where, orderBy: $orderBy, orderDirection: asc) {
      id
      owner
      displayName
      imageUrl
    }
  }
`

const CREATE_GRAVATAR = gql`
  mutation createGravatar($options: GravatarOptions) {
    createGravatar(options: $options) {
      id
      owner
      displayName
      imageUrl
    }
  }
`

const UPDATE_GRAVATAR_NAME = gql`
  mutation updateGravatarName($displayName: String!) {
    updateGravatarName(displayName: $displayName) {
      id
      owner
      displayName
      imageUrl
    }
  }
`

const UPDATE_GRAVATAR_IMAGE = gql`
  mutation updateGravatarImage($imageUrl: String!) {
    updateGravatarImage(imageUrl: $imageUrl) {
      id
      owner
      displayName
      imageUrl
    }
  }
`

const App = () => {

  const [withImage, setWithImage] = useState(false)
  const [withName, setWithName] = useState(false)
  const [orderBy, setOrderBy] = useState('displayName')
  const [showHelpDialog, setShowHelpDialog] = useState(false)

  const [createGravatar] = useMutation(CREATE_GRAVATAR, {
    optimisticResponse: {
      createGravatar: {
        __typename: "Gravatar",
        // ID must be deterministic in order to use optimistic updates
        id: undefined,
        owner: window.ethereum.defaultAccount.address.toLowerCase(),
        displayName: "...",
        imageUrl: "..."
      }
    },
    update(proxy, result) {
      const data = cloneDeep(proxy.readQuery({
        query: GRAVATARS_QUERY
      }, true))

      data.gravatars.push(result.data.createGravatar)

      proxy.writeQuery({query: GRAVATARS_QUERY, data})
    },
    onError(error) {
      // our optimistic update will be reverted here
    },
    variables: {
      options: {
        displayName: "...",
        imageUrl: "..."
      }
    }
  })

  const toggleHelpDialog = () => {
    setShowHelpDialog(!showHelpDialog)
  }

  const gotoQuickStartGuide = () => {
    window.location.href = 'https://thegraph.com/docs/quick-start'
  }

  return (
    <ApolloProvider client={client}>
      <div className="App">
        <Grid container direction="column">
          <Header onHelp={toggleHelpDialog} />
          <Filter
            orderBy={orderBy}
            withImage={withImage}
            withName={withName}
            onOrderBy={field => setOrderBy(field)}
            onToggleWithImage={() => setWithImage(!withImage)}
            onToggleWithName={() => setWithName(!state.withName)}
          />
          <Grid item>
            <Grid container>
              <Query
                query={GRAVATARS_QUERY}
                variables={{
                  where: {
                    ...(withImage ? { imageUrl_starts_with: 'http' } : {}),
                    ...(withName ? { displayName_not: '' } : {}),
                  },
                  orderBy: orderBy,
                }}
              >
                {({ data, error, loading }) => {
                  return loading ? (
                    <LinearProgress variant="query" style={{ width: '100%' }} />
                  ) : error ? (
                    <Error error={error} />
                  ) : (
                    <Gravatars gravatars={data.gravatars} />
                  )
                }}
              </Query>
            </Grid>
          </Grid>
        </Grid>
        <Dialog
          fullScreen={false}
          open={showHelpDialog}
          onClose={toggleHelpDialog}
          aria-labelledby="help-dialog"
        >
          <DialogTitle id="help-dialog">{'Show Quick Guide?'}</DialogTitle>
          <DialogContent>
            <DialogContentText>
              We have prepared a quick guide for you to get started with The Graph at
              this hackathon. Shall we take you there now?
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={toggleHelpDialog} color="primary">
              Nah, I'm good
            </Button>
            <Button onClick={gotoQuickStartGuide} color="primary" autoFocus>
              Yes, pease
            </Button>
          </DialogActions>
        </Dialog>
        <button onClick={createGravatar}>
          Create Gravatar
        </button>
      </div>
    </ApolloProvider>
  )
}

export default App
