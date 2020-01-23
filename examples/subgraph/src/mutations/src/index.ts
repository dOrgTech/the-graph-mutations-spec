import gql from "graphql-tag"
import { ethers } from "ethers"
import IPFSClient from "ipfs-http-client"
import {
  EventPayload,
  StateBuilder,
  FullState,
  ManagedState
} from "@graphprotocol/mutations-ts"
import { Transaction } from "ethers/utils"

interface CustomEvent extends EventPayload {
  myValue: string
}

type EventMap = {
  'CUSTOM_EVENT': CustomEvent
}

interface CustomState {
  myValue: string
  myFlag: boolean
}

const stateBuilder: StateBuilder<CustomState, EventMap> = {
  getInitialState(): CustomState {
    return {
      myValue: '',
      myFlag: false
    }
  },
  reducers: {
    "CUSTOM_EVENT": async (state: FullState<CustomState>, payload: CustomEvent) => {
      state.myValue = payload.myValue;
      return state
    }
  }
}

async function queryUserGravatar(context: any) {
  const { client } = context
  const { ethereum } = context.graph.config

  return await client.query({
    query: gql`
      query GetGravatars {
        gravatars (where: {owner: "${ethereum.provider.selectedAddress}"}) {
          id
          owner
          displayName
          imageUrl
        }
      }`
  }
  )
}

async function sendTx(tx: Transaction, state: ManagedState<CustomState, EventMap>) {
  try {
    await state.sendEvent("TRANSACTION_CREATED", {id: tx.hash, description: tx.data}, 20)
    tx = await tx
    await state.sendEvent("TRANSACTION_COMPLETED", {id: tx.hash, description: tx.data}, 60)
    return tx;
  } catch (error) {
    await state.sendEvent('TRANSACTION_ERROR', error, 60)
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
  const state: ManagedState<CustomState, EventMap> = context.graph.state;
  const gravity = await getGravityContract(context)
  
  await sleep(2000)
  if(context.fail){
    throw new Error("Transaction Errored (Controlled Error Test Case)")
  }

  const txResult = await sendTx(gravity.createGravatar(displayName, imageUrl), state)
  if(!txResult) {
    throw new Error("WHOLE PROCESS FAILED")
  }

  const { data } = await queryUserGravatar(context)
  return data.gravatars[0]
}

async function updateGravatarName(_root: any, { displayName }: any, context: any) {
  const state: ManagedState<CustomState, EventMap> = context.graph.state;
  const gravity = await getGravityContract(context)
  
  await sleep(2000)
  if(context.fail){
    throw new Error("Transaction Errored (Controlled Error Test Case)")
  }

  const txResult = await sendTx(gravity.updateGravatarName(displayName), state)
  if(!txResult) {
    throw new Error("WHOLE PROCESS FAILED")
  }

  await state.sendEvent("CUSTOM_EVENT", {myValue: displayName}, 100)

  const { data } = await queryUserGravatar(context)
  return data.gravatars[0];
}

async function updateGravatarImage(_root: any, { imageUrl }: any, context: any) {
  const state: ManagedState<CustomState, EventMap> = context.graph.state;
  const gravity = await getGravityContract(context)
  
  await sleep(2000)
  if(context.fail){
    throw new Error("Transaction Errored (Controlled Error Test Case)")
  }

  await sendTx(gravity.updateGravatarImage(imageUrl), state)
  
  const { data } = await queryUserGravatar(context)
  return data.gravatars[0]
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

export type State = FullState<CustomState>

export default {
  resolvers,
  config,
  stateBuilder
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
