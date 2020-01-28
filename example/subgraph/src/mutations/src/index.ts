import {
  ConfigGenerator,
  ConfigGenerators,
  MutationResolvers,
  MutationResolver,
  MutationsModule,
  EventPayload,
  EventTypeMap,
  MutationState,
  StateBuilder,
  StateUpdater
} from "@graphprotocol/mutations"

import gql from 'graphql-tag'
import { ethers } from 'ethers'
import { Transaction } from 'ethers/utils'

interface CustomEvent extends EventPayload {
  myValue: string
}

interface EventMap extends EventTypeMap {
  'CUSTOM_EVENT': CustomEvent
}

interface State {
  myValue: string
  myFlag: boolean
}

const stateBuilder: StateBuilder<State, EventMap> = {
  getInitialState(): State {
    return {
      myValue: '',
      myFlag: false
    }
  },
  reducers: {
    'CUSTOM_EVENT': async (state: MutationState<State>, payload: CustomEvent) => {
      return {
        myValue: 'true'
      }
    }
  }
}

async function queryUserGravatar(context: any) {
  const { client } = context
  const { ethereum } = context.graph.config

  // TODO time travel query (specific block #)
  // block: hash#?
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

async function sendTx(tx: Transaction, state: StateUpdater<State, EventMap>) {
  try {
    await state.dispatch('TRANSACTION_CREATED', { id: tx.hash, description: tx.data })
    tx = await tx
    await state.dispatch('TRANSACTION_COMPLETED', { id: tx.hash, description: tx.data })
    return tx;
  } catch (error) {
    await state.dispatch('TRANSACTION_ERROR', error)
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
  const state: StateUpdater<State, EventMap> = context.graph.state;
  const gravity = await getGravityContract(context)

  await sleep(2000)
  if (context.fail) {
    throw new Error('Transaction Errored (Controlled Error Test Case)')
  }

  const txResult = await sendTx(gravity.createGravatar(displayName, imageUrl), state)
  if (!txResult) {
    throw new Error('WHOLE PROCESS FAILED')
  }

  const { data } = await queryUserGravatar(context)
  return null
}

async function deleteGravatar(_root: any, { }: any, context: any) {
  const state: StateUpdater<State, EventMap> = context.graph.state;
  const gravity = await getGravityContract(context)

  const txResult = await sendTx(gravity.deleteGravatar(), state)

  if (!txResult) {
    throw new Error('Error deleting gravatar')
  }
  return true
}

async function updateGravatarName(_root: any, { displayName }: any, context: any) {
  const state: StateUpdater<State, EventMap> = context.graph.state;
  const gravity = await getGravityContract(context)

  await state.dispatch('PROGRESS_UPDATE', { value: 50 })
  await state.dispatch('CUSTOM_EVENT', { myValue: 'test' })

  await sleep(2000)
  if (context.fail) {
    throw new Error('Transaction Errored (Controlled Error Test Case)')
  }

  const txResult = await sendTx(gravity.updateGravatarName(displayName), state)
  if (!txResult) {
    throw new Error('WHOLE PROCESS FAILED')
  }

  await state.dispatch('CUSTOM_EVENT', { myValue: displayName })

  const { data } = await queryUserGravatar(context)
  return data.gravatars[0]
}

async function updateGravatarImage(_root: any, { imageUrl }: any, context: any) {
  const state: StateUpdater<State, EventMap> = context.graph.state;
  const gravity = await getGravityContract(context)

  await sleep(2000)
  if (context.fail) {
    throw new Error('Transaction Errored (Controlled Error Test Case)')
  }

  await sendTx(gravity.updateGravatarImage(imageUrl), state)

  const { data } = await queryUserGravatar(context)
  return data.gravatars[0]
}

const resolvers = {
  Mutation: {
    createGravatar,
    deleteGravatar,
    updateGravatarName,
    updateGravatarImage
  }
}

const config = {
  ethereum: (provider: any) => {
    return new ethers.providers.Web3Provider(provider)
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
  stateBuilder
}

export {
  State,
  EventMap,
  CustomEvent
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
