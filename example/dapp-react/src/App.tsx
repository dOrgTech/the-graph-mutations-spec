import * as React from 'react'
import ApolloClient from 'apollo-client'
import { split } from 'apollo-link'
import { InMemoryCache } from 'apollo-boost'
import { createHttpLink } from 'apollo-link-http'
import { getMainDefinition } from 'apollo-utilities'
import { useQuery } from '@apollo/react-hooks'
import { cloneDeep } from 'lodash'
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
import './App.css'
import Header from './components/Header'
import CustomError from './components/Error'
import Gravatars from './components/Gravatars'
import Filter from './components/Filter'
import { CREATE_GRAVATAR, GRAVATARS_QUERY } from './queries'

import gravatarMutations from 'example-mutations'
import { createMutations, createMutationsLink } from '@graphprotocol/mutations'
import { useMutation } from '@graphprotocol/mutations-apollo-react'
import { getRandomProfilePic, getRandomName } from './utils'
import DevTests from './components/DevTests'

if (!process.env.REACT_APP_GRAPHQL_ENDPOINT) {
  throw new Error('REACT_APP_GRAPHQL_ENDPOINT environment variable not defined')
}

const nodeEndpoint = process.env.REACT_APP_GRAPHQL_ENDPOINT
const queryLink = createHttpLink({ uri: `${nodeEndpoint}/subgraphs/name/example` })

interface Gravatar {
  id: string,
  imageUrl: string,
  owner: string,
  displayName: string,
  __typename: string
}

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

function App() {

  const [withImage, setWithImage] = React.useState(false)
  const [withName, setWithName] = React.useState(false)
  const [orderBy, setOrderBy] = React.useState('displayName')
  const [showHelpDialog, setShowHelpDialog] = React.useState(false)
  const [devMode, setDevMode] = React.useState(false)

  let alreadyCreated = false
  const randName = getRandomName()
  const randPic = getRandomProfilePic(randName)

  const toggleHelpDialog = () => {
    setShowHelpDialog(!showHelpDialog)
  }

  const gotoQuickStartGuide = () => {
    window.location.href = 'https://thegraph.com/docs/quick-start'
  }

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

  if (data && data.gravatars){
    alreadyCreated = !!data.gravatars.find((gravatar) => gravatar.owner === (window as any).web3.currentProvider.selectedAddress)
  }

  const [executeCreate] = useMutation(
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
            where: { },
            orderBy: "displayName"
          }
        }
      ],
      optimisticResponse: {
        createGravatar: {
          id: "0xa",
          owner: (window as any).web3.currentProvider.selectedAddress,
          displayName: randName,
          imageUrl: randPic,
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
            where: { },
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
          onOrderBy={(field: any) => setOrderBy(field)}
          onToggleWithImage={() =>
            setWithImage(!withImage)
          }
          onToggleWithName={() =>
            setWithName(!withName)
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
                  <Gravatars client={client} gravatars={data.gravatars} devMode={devMode} />
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
            Yes, please
            </Button>
        </DialogActions>
      </Dialog>
      <br></br>
      {devMode? 
        !alreadyCreated?
          <DevTests client={client} randName={randName} randPic={randPic} options={{withImage, withName, orderBy}} />
          : "A Gravatar with this address has already been created"
            : null}
    </div>
    </>
  )
}

export default App
