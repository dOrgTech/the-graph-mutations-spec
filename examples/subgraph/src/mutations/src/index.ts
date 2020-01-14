import gql from "graphql-tag"
import { ethers } from "ethers"
import IPFSClient from "ipfs-http-client"
import {
  EventPayload,
  StateBuilder,
  FullState,
  ManagedState
} from "@graphprotocol/mutations-ts"

interface ProgressUpdateEvent extends EventPayload {
  progress: number
}

type EventMap = {
  'PROGRESS_UPDATED': ProgressUpdateEvent
}

interface CustomState {
  progress: number
  myValue: number
  myFlag: boolean
}

const stateBuilder: StateBuilder<CustomState, EventMap> = {
  getInitialState(): CustomState {
    return {
      progress: 0,
      myValue: 0,
      myFlag: false
    }
  },
  reducers: {
    "PROGRESS_UPDATED": async (state: FullState<CustomState>, payload: ProgressUpdateEvent) => {
      state.progress = payload.progress;
    }
  }
}

async function queryUserGravatar(context: any) {
  const { client } = context
  const { ethereum } = context.graph.config

  return await client.query({
    query: gql`
      query GetGravatars {
        gravatar (id: "${ethereum.provider.selectedAddress}") {
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
// async function sendTx<TEvent extends keyof (CoreEvents & EventMap)>(tx: any, event: TEvent, payload, context: any) {
//   const state: ManagedState<State, EventMap> = context.state;
//   try {
//     tx = await tx
//     state.sendEvent("TRANSACTION_SENT", tx)
//     await tx.wait()
//     state.sendEvent(event, payload)
//   } catch (error) {
//     console.log(error)
//     state.sendEvent('TRANSACTION_ERROR', {
//       hash: "hash",
//       error
//     })
//   }
// }

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
  try{
    const state: ManagedState<CustomState, EventMap> = context.state;
    const txResult = await tx;
    await txResult.wait();
  }catch(error){
    console.log(error)
  }
  return await queryUserGravatar(context)
}

async function updateGravatarName(_root: any, { displayName }: any, context: any) {
  const gravity = await getGravityContract(context)
  const tx = gravity.updateGravatarName(displayName)
  try{
    const state: ManagedState<CustomState, EventMap> = context.graph.state;
    await state.sendEvent("PROGRESS_UPDATED", {progress: 20})
    const txResult = await tx;
    await state.sendEvent("TRANSACTION_SENT", txResult)
    await state.sendEvent("PROGRESS_UPDATED", {progress: 50})
    await txResult.wait();
    await state.sendEvent("PROGRESS_UPDATED", {progress: 100})
  }catch(error){
    console.log(error)
  }
  return await queryUserGravatar(context)
}

async function updateGravatarImage(_root: any, { imageUrl }: any, context: any) {
  const gravity = await getGravityContract(context)
  const tx = gravity.updateGravatarImage(imageUrl)
  try{
    const state: ManagedState<CustomState, EventMap> = context.state;
    const txResult = await tx;
    await txResult.wait();
  }catch(error){
    console.log(error)
  }
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

export type State = FullState<CustomState>

export default {
  resolvers,
  config,
  stateBuilder
}
