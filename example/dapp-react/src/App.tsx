import * as React from 'react'
import ApolloClient from 'apollo-client'
import { split } from 'apollo-link'
import { InMemoryCache } from 'apollo-boost'
import { createHttpLink } from 'apollo-link-http'
import { getMainDefinition } from 'apollo-utilities'
import { useQuery } from '@apollo/react-hooks'
import {
  Grid,
  LinearProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Button,
  AppBar,
  FormControlLabel,
  Switch,
  Toolbar,
  IconButton
} from '@material-ui/core'
import faker from 'faker/locale/en_US'
import './App.css'
import Header from './components/Header'
import CustomError from './components/Error'
import Gravatars from './components/Gravatars'
import Filter from './components/Filter'
import { CREATE_GRAVATAR, GRAVATARS_QUERY } from './queries'

import gravatarMutations from 'example-mutations'
import { createMutations, createMutationsLink } from '@graphprotocol/mutations-ts'
import { useMutation } from '@graphprotocol/mutations-apollo-react'

if (!process.env.REACT_APP_GRAPHQL_ENDPOINT) {
  throw new Error('REACT_APP_GRAPHQL_ENDPOINT environment variable not defined')
}

const nodeEndpoint = process.env.REACT_APP_GRAPHQL_ENDPOINT
const queryLink = createHttpLink({ uri: `${nodeEndpoint}/subgraphs/name/example` })

const mutations = createMutations({
  mutations: gravatarMutations,
  subgraph: "gravatars",
  node: nodeEndpoint,
  config: {
    ethereum: async () => {
      const { ethereum } = (window as any)

      if (!ethereum) {
        throw Error("Please install metamask")
      }

      await ethereum.enable()
      return (window as any).web3.currentProvider
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

const mutationLink = createMutationsLink({ mutations })

const link = split(
  ({ query }) => {
    const node = getMainDefinition(query)
    return node.kind === "OperationDefinition" && node.operation === "mutation"
  },
  mutationLink,
  queryLink
)

const client = new ApolloClient({
  link,
  cache: new InMemoryCache()
})

interface Gravatar {
  id: string,
  imageUrl: string,
  owner: string,
  displayName: string,
  __typename: string
}

function App() {

  const [state, setState] = React.useState({
    withImage: false,
    withName: false,
    orderBy: 'displayName',
    showHelpDialog: false,
  })

  const [gravatars, setGravatars] = React.useState([] as Gravatar[])
  const [devMode, setDevMode] = React.useState(false)
  const alreadyCreated = !!gravatars.find((gravatar) => gravatar.owner === (window as any).web3.currentProvider.selectedAddress)
  const randName = faker.name.findName()

  const toggleHelpDialog = () => {
    setState({ ...state, showHelpDialog: !state.showHelpDialog })
  }

  const gotoQuickStartGuide = () => {
    window.location.href = 'https://thegraph.com/docs/quick-start'
  }

  const { withImage, withName, orderBy, showHelpDialog } = state

  const { data, error, loading } = useQuery(GRAVATARS_QUERY, {
    client,
    variables: {
      where: {
        ...(withImage ? { imageUrl_starts_with: 'http' } : {}),
        ...(withName ? { displayName_not: '' } : {}),
      },
      orderBy: orderBy,
    }
  })

  if(data && gravatars.length === 0){
    setGravatars(data.gravatars)
  }

  // FULL DATA SUCCESS TEST CASE
  const [executeCreate] = useMutation(
    CREATE_GRAVATAR,
    {
      client,
      variables: {
        options: { displayName: randName, imageUrl: "https://i.pravatar.cc/350?u="+randName }
      },
      optimisticResponse: {
        createGravatar: {
          id: "New",
          imageUrl: "https://i.pravatar.cc/350?u="+randName,
          owner: (window as any).web3.currentProvider.selectedAddress,
          displayName: randName,
          __typename: "Gravatar"
        }
      },
      update: (proxy, result) => {
        const data: any = proxy.readQuery({
          query: GRAVATARS_QUERY,
          variables: {
            where: {
              ...(withImage ? { imageUrl_starts_with: 'http' } : {}),
              ...(withName ? { displayName_not: '' } : {}),
            },
            orderBy: orderBy,
          }
        }, true)

        if (result.data && result.data.createGravatar) {
          data.gravatars.push(result.data.createGravatar)
        }

        setGravatars(data.gravatars)
      },
      onError: (error) => {
        setGravatars(gravatars.filter(gravatar => gravatar.id !== "New"))
        alert(error)
      }
    }
  )

  //FULL DATA FAILURE TEST CASE
  const [failExecuteCreate] = useMutation(
    CREATE_GRAVATAR,
    {
      client,
      variables: {
        options: { displayName: randName, imageUrl: "https://i.pravatar.cc/350?u="+randName }
      },
      optimisticResponse: {
        createGravatar: {
          id: "New",
          imageUrl: "https://i.pravatar.cc/350?u="+randName,
          owner: (window as any).web3.currentProvider.selectedAddress,
          displayName: randName,
          __typename: "Gravatar"
        }
      },
      context: {
        fail: true
      },
      update: (proxy, result) => {
        const data: any = proxy.readQuery({
          query: GRAVATARS_QUERY,
          variables: {
            where: {
              ...(withImage ? { imageUrl_starts_with: 'http' } : {}),
              ...(withName ? { displayName_not: '' } : {}),
            },
            orderBy: orderBy,
          }
        }, true)

        if (result.data && result.data.createGravatar) {
          data.gravatars.push(result.data.createGravatar)
        }

        setGravatars(data.gravatars)
      },
      onError: (error) => {
        setGravatars(gravatars.filter(gravatar => gravatar.id !== "New"))
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
        options: { displayName: randName, imageUrl: "https://i.pravatar.cc/350?u="+randName }
      },
      optimisticResponse: {
        createGravatar: {
          id: "New",
          owner: (window as any).web3.currentProvider.selectedAddress,
          displayName: randName,
          __typename: "Gravatar"
        }
      },
      update: (proxy, result) => {
        const data: any = proxy.readQuery({
          query: GRAVATARS_QUERY,
          variables: {
            where: {
              ...(withImage ? { imageUrl_starts_with: 'http' } : {}),
              ...(withName ? { displayName_not: '' } : {}),
            },
            orderBy: orderBy,
          }
        }, true)

        if (result.data && result.data.createGravatar) {
          data.gravatars.push(result.data.createGravatar)
        }

        setGravatars(data.gravatars)
      },
      onError: (error) => {
        setGravatars(gravatars.filter(gravatar => gravatar.id !== "New"))
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
        options: { displayName: randName, imageUrl: "https://i.pravatar.cc/350?u="+randName }
      },
      optimisticResponse: {
        createGravatar: {
          id: "New",
          owner: (window as any).web3.currentProvider.selectedAddress,
          displayName: randName,
          __typename: "Gravatar"
        }
      },
      context: {
        fail: true
      },
      update: (proxy, result) => {
        const data: any = proxy.readQuery({
          query: GRAVATARS_QUERY,
          variables: {
            where: {
              ...(withImage ? { imageUrl_starts_with: 'http' } : {}),
              ...(withName ? { displayName_not: '' } : {}),
            },
            orderBy: orderBy,
          }
        }, true)

        if (result.data && result.data.createGravatar) {
          data.gravatars.push(result.data.createGravatar)
        }

        setGravatars(data.gravatars)
      },
      onError: (error) => {
        setGravatars(gravatars.filter(gravatar => gravatar.id !== "New"))
        alert(error)
      }
    }
  )

  return (
    <>
    <AppBar color="primary" position="static">
      <Toolbar>
        <IconButton color="primary" aria-label="menu">
          <Header onHelp={toggleHelpDialog} />
        </IconButton>
        <FormControlLabel
          control={<Switch checked={devMode} onChange={()=>{setDevMode(!devMode)}} aria-label="Dev mode switch" />}
          label="Developer Mode"
        />
      </Toolbar>
    </AppBar>
    <div className="App">
      <Grid container direction="column">
        Filter: 
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
          {!alreadyCreated? (
            <Button size="large" color="primary" variant="outlined" onClick={() => executeCreate()}>
              Create New Random Gravatar
          </Button>
          ): "A Gravatar with this address has already been created"}
          <Grid container>
            {loading ? (
              <LinearProgress variant="query" style={{ width: '100%' }} />
            ) : error ? (
              <CustomError error={error} />
            ) : (
                  <Gravatars client={client} gravatars={gravatars} devMode={devMode} />
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
      <br></br>
      {devMode? 
        !alreadyCreated?
          (<Grid container direction="column">
            <Button size="small" color="primary" variant="outlined" onClick={() => executeCreate()}>
              Create Gravatar Success Test (Full Optimistic Data)
            </Button>
            <Button size="small" color="secondary" variant="outlined" onClick={() => failExecuteCreate()}>
              Create Gravatar Failure Test (Full Optimistic Data)
            </Button>
            <Button size="small" color="primary" variant="outlined" onClick={() => partialDataSuccess()}>
              Create Gravatar Success Test (Partial Optimistic Data)
            </Button>
            <Button size="small" color="secondary" variant="outlined" onClick={() => partialDataFailure()}>
              Create Gravatar Failure Test (Partial Optimistic Data)
            </Button>
          </Grid>) 
          : "A Gravatar with this address has already been created"
            : null}
    </div>
    </>
  )
}

export default App
