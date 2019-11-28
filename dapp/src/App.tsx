import React, { useState } from 'react'
import ApolloClient, { gql, InMemoryCache } from 'apollo-boost'
import { useQuery } from '@apollo/react-hooks';
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
import { resolvers, setWeb3Provider } from 'example-mutations'
import './App.css'
import Header from './components/Header'
import Error from './components/Error'
import Gravatars from './components/Gravatars'
import Filter from './components/Filter'
import useMutationAndSubscribe from './hooks/useMutationAndSubscribe';

if (!process.env.REACT_APP_GRAPHQL_ENDPOINT) {
  throw new Error('REACT_APP_GRAPHQL_ENDPOINT environment variable not defined')
}

// TODO: this is a singleton pattern, and should really
// be instance based...
setWeb3Provider(window.ethereum)
window.ethereum.enable()

const client = new ApolloClient({
  uri: process.env.REACT_APP_GRAPHQL_ENDPOINT,
  cache: new InMemoryCache(),
  resolvers
})

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

// TODO: how does the GravatarOptions type get here? Does it? Does it get treated as an "any"?
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

function App() {

  const [state, setState] = useState({
    withImage: false,
    withName: false,
    orderBy: 'displayName',
    showHelpDialog: false,
  })

  const toggleHelpDialog = () => {
    setState({ ...state, showHelpDialog: !state.showHelpDialog })
  }

  const gotoQuickStartGuide = () => {
    window.location.href = 'https://thegraph.com/docs/quick-start'
  }
  const { withImage, withName, orderBy, showHelpDialog } = state

  const { executeMutation, loadingMutation, subscriptionData } = useMutationAndSubscribe(
    CREATE_GRAVATAR,
    {
      onCompleted: () => { },
      update: () => { },
      optimisticResponse: {},
      onError: () => { },
      variables: {
        options: { displayName: "...", imageUrl: "..." }
      }
    })

  const { data, error, loading } = useQuery(GRAVATARS_QUERY, {
    variables: {
      where: {
        ...(withImage ? { imageUrl_starts_with: 'http' } : {}),
        ...(withName ? { displayName_not: '' } : {}),
      },
      orderBy: orderBy,
    }
  });

  return (
    <ApolloProvider client={client}>
      <div className="App">
        <Grid container direction="column">
          <Header onHelp={this.toggleHelpDialog} />
          <Filter
            orderBy={orderBy}
            withImage={withImage}
            withName={withName}
            onOrderBy={field => setState({ ...state, orderBy: field })}
            onToggleWithImage={() =>
              setState({ ...state, withImage: !state.withImage })
            }
            onToggleWithName={() =>
              setState({ ...state, withName: !state.withName })
            }
          />
          <Grid item>
            <Grid container>
              {loading ? (
                <LinearProgress variant="query" style={{ width: '100%' }} />
              ) : error ? (
                <Error error={error} />
              ) : (
                    <Gravatars gravatars={data.gravatars} />
                  )
              }
            </Grid>
          </Grid>
        </Grid>
        <Dialog
          fullScreen={false}
          open={showHelpDialog}
          onClose={this.toggleHelpDialog}
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
            <Button onClick={this.toggleHelpDialog} color="primary">
              Nah, I'm good
              </Button>
            <Button onClick={this.gotoQuickStartGuide} color="primary" autoFocus>
              Yes, pease
              </Button>
          </DialogActions>
        </Dialog>
        <button onClick={executeMutation}>
          Create Gravatar
        </button>
      </div>
    </ApolloProvider>
  )
}

export default App
