import gql from "graphql-tag"
import { ethers } from "ethers"
import IPFSClient from "ipfs-http-client"
import {
  EventPayload,
  StateBuilder,
  ManagedState,
  TransactionSent,
  CoreEvents
} from "@graphprotocol/mutations-ts"

interface MyEvent extends EventPayload {
  foo: string
}

type EventMap = {
  'GRAVATAR_UPDATED': MyEvent,
  'GRAVATAR_CREATED': MyEvent
}

class State {
  myValue: string
  myFlag: boolean
}

const stateBuilder: StateBuilder<State, EventMap> = {
  getInitialState(): State {
    return {
      myValue: "",
      myFlag: false
    }
  },
  reducers: {
    'GRAVATAR_UPDATED': (state: State, payload: MyEvent) => {

    },
    'GRAVATAR_CREATED': (state: State, payload: MyEvent) => {

    },
    'TRANSACTION_SENT': (state: State, payload: TransactionSent) => {

    }
  }
}

const managedState = new ManagedState<State, EventMap>(stateBuilder)
const stateCopy = managedState.getState();
managedState.setState(stateCopy)

async function queryUserGravatar(context: any) {
  const { client } = context
  const { ethereum } = context.graph.config

  return await client.query({
    query: gql`
      query GetGravatars {
        gravatar (id: '${ethereum.provider.selectedAddress}') {
          id
          owner
          displayName
          imageUrl
        }
      }`
  }
  )
}

// TODO: remove ID at this level, pass it in using the uuid
async function sendTx<TEvent extends keyof (CoreEvents & EventMap)>(tx: any, event: TEvent, context: any) {
  const state: ManagedState<State, EventMap> = context.state;
  try {
    tx = await tx
    state.sendEvent("TRANSACTION_SENT", tx)
    await tx.wait()
    state.sendEvent(event, tx)
  } catch (error) {
    console.log(error)
    state.sendEvent('TRANSACTION_ERROR', {
      hash: "hash",
      error
    })
  }
}

async function getGravityContract(context: any) {
  const { ethereum } = context.graph.config
  const abi = await context.graph.dataSources.Gravity.abi
  const address = await context.graph.dataSources.Gravity.address

  const contract = new ethers.Contract(
    address, abi, ethereum.getSigner()
  )
  contract.connect(ethereum)
  return contract
}

async function createGravatar(_root: any, { options }: any, context: any) {
  const { displayName, imageUrl } = options
  const gravity = await getGravityContract(context)
  const tx = gravity.createGravatar(displayName, imageUrl)
  await sendTx(tx, "GRAVATAR_CREATED", context)
  return await queryUserGravatar(context)
}

async function updateGravatarName(_root: any, { displayName }: any, context: any) {
  const gravity = await getGravityContract(context)
  const tx = gravity.updateGravatarName(displayName)
  await sendTx(tx, "GRAVATAR_UPDATED", context)
  return await queryUserGravatar(context)
}

async function updateGravatarImage(_root: any, { imageUrl }: any, context: any) {
  const gravity = await getGravityContract(context)
  const tx = gravity.updateGravatarImage(imageUrl)
  await sendTx(tx, "GRAVATAR_UPDATED", context)
  return await queryUserGravatar(context)
}

const resolvers = {
  Mutation: {
    createGravatar,
    updateGravatarName,
    updateGravatarImage
  }
}

const config = {
  ethereum: (provider: any) => {
    return new ethers.providers.Web3Provider(provider)
  },
  ipfs: (provider: string) => {
    const url = new URL(provider)
    return IPFSClient({
      protocol: url.protocol.replace(/[:]+$/, ''),
      host: url.hostname,
      port: url.port,
      'api-path': url.pathname.replace(/\/$/, '') + '/api/v0/',
    })
  },
  // Example of a custom configuration property
  property: {
    // Property setters can be nested
    a: (value: string) => { },
    b: (value: string) => { }
  }
}

export default {
  resolvers,
  config,
  State
}
