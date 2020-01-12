import * as React from 'react';
import ApolloClient from 'apollo-client';
import { split } from 'apollo-link';
import { gql, InMemoryCache } from 'apollo-boost';
import { createHttpLink } from 'apollo-link-http';
import { getMainDefinition } from 'apollo-utilities';
import { ApolloProvider } from 'react-apollo'
import { useQuery, useMutation } from '@apollo/react-hooks';
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
import CustomError from './components/Error'
import Gravatars from './components/Gravatars'
import Filter from './components/Filter'

import gravatarMutations from 'gravatar-mutations'
import {State} from 'gravatar-mutations/dist'
import { createMutations, createMutationsLink } from '@graphprotocol/mutations-ts'
import { useMutationAndSubscribe } from '@graphprotocol/mutations-react'

if (!process.env.REACT_APP_GRAPHQL_ENDPOINT) {
  throw new Error('REACT_APP_GRAPHQL_ENDPOINT environment variable not defined')
}

const nodeEndpoint = process.env.REACT_APP_GRAPHQL_ENDPOINT
const queryLink = createHttpLink({ uri: `${nodeEndpoint}/subgraphs/name/gravity` });

const mutations = createMutations({
  mutations: gravatarMutations,
  subgraph: "gravatars",
  node: nodeEndpoint,
  config: {
    ethereum: async () => {
      const { ethereum } = (window as any);

      if (!ethereum) {
        throw Error("Please install metamask");
      }

      await ethereum.enable();
      // TODO: I think this can be changed back to
      //       return ethereum;
      return (window as any).web3.currentProvider;
    },
    ipfs: () => {
      return process.env.REACT_APP_IPFS_PROVIDER
    },
    property: {
      a: "hey",
      b: "hi"
    }
  }
})

const mutationLink = createMutationsLink({ mutations });

const link = split(
  ({ query }) => {
    const node = getMainDefinition(query);
    return node.kind === "OperationDefinition" && node.operation === "mutation"
  },
  mutationLink,
  queryLink
);

const client = new ApolloClient({
  link,
  cache: new InMemoryCache()
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
    createGravatar(options: $options) @client{
      id
      owner
      displayName
      imageUrl
    }
  }
`

const UPDATE_GRAVATAR_NAME = gql`
  mutation updateGravatarName($displayName: String!) {
    updateGravatarName(displayName: $displayName) @client{
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

  const [state, setState] = React.useState({
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

  // TODO: have "status?" object be returned from execute mutation
  // TODO: optimistic response after data is returned from mutations
  const [executeCreate] = useMutation(
    CREATE_GRAVATAR,
    {
      client,
      variables: {
        options: { displayName: "...", imageUrl: "..." }
      }
    })

  const {executeMutation: executeUpdateName, subscriptionData} = useMutationAndSubscribe(
    UPDATE_GRAVATAR_NAME,
    {
      client,
      optimisticResponse: {
        updateGravatarName: {
          id: '0x0', //Apollo updates cache based on this ID
          imageUrl: '',
          owner: '',
          displayName: "Optimistically Updated Name",
          __typename: "Gravatar"
        }
      },
      variables: {
        displayName: "New Name"
      },
      context: {
        client
      },
      onError: (error) => {
        alert(error)
      }
    }, State)

  console.log(subscriptionData)

  const { data, error, loading } = useQuery(GRAVATARS_QUERY, {
    client,
    variables: {
      where: {
        ...(withImage ? { imageUrl_starts_with: 'http' } : {}),
        ...(withName ? { displayName_not: '' } : {}),
      },
      orderBy: orderBy,
    }
  });

  return (
    <div className="App">
      <Grid container direction="column">
        <Header onHelp={toggleHelpDialog} />
        <Filter
          orderBy={orderBy}
          withImage={withImage}
          withName={withName}
          onOrderBy={(field: any) => setState({ ...state, orderBy: field })}
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
              <CustomError error={error} />
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
      <button onClick={event => executeCreate()}>
        Create Gravatar
      </button>
      <button onClick={event => executeUpdateName()}>
        Update First Gravatar (Optimistic)
      </button>
    </div>
  )
}

export default App
