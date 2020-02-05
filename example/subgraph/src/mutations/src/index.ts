import {
  EventPayload,
  MutationContext,
  MutationResolvers,
  MutationState,
  StateBuilder,
  StateUpdater,
} from "@graphprotocol/mutations"

import gql from 'graphql-tag'
import { ethers } from 'ethers'
import { Transaction } from 'ethers/utils'
import {
  AsyncSendable,
  Web3Provider
} from "ethers/providers"

// State Payloads + Events + StateBuilder
interface CustomEvent extends EventPayload {
  myValue: string
}

type EventMap = {
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

// Configuration
type Config = typeof config

const config = {
  ethereum: (provider: AsyncSendable): Web3Provider => {
    return new Web3Provider(provider)
  },
  // Example of a custom configuration property
  property: {
    // Property setters can be nested
    a: (value: string) => { },
    b: (value: string) => { }
  }
}

type Context = MutationContext<Config, State, EventMap>

async function queryUserGravatar(context: Context) {
  const { client } = context
  const { ethereum } = context.graph.config

  const address = await ethereum.getSigner().getAddress()

  if (client) {
    // TODO time travel query (specific block #)
    // block: hash#?
    for (let i = 0; i < 20; ++i) {
      const { data } = await client.query({
        query: gql`
          query GetGravatars {
            gravatars (where: {owner: "${address}"}) {
              id
              owner
              displayName
              imageUrl
            }
          }`
        }
      )

      if (data === null) {
        await sleep(500)
      } else {
        return data.gravatars[0]
      }
    }
  }

  return null
}

async function sendTx(tx: Transaction, description: string, state: StateUpdater<State, EventMap>) {
  try {
    await state.dispatch('TRANSACTION_CREATED', {
      id: tx.hash,
      to: tx.to,
      from: tx.from,
      data: tx.data,
      amount: tx.value.toString(),
      chainId: `ethereum-${tx.chainId}`,
      description
    })
    tx = await tx
    await state.dispatch('TRANSACTION_COMPLETED', { id: tx.hash, description: tx.data })
    return tx;
  } catch (error) {
    await state.dispatch('TRANSACTION_ERROR', error)
  }
}

async function getGravityContract(context: Context) {
  const { dataSources } = context.graph
  const abi = await dataSources.get("Gravity").abi
  const address = await dataSources.get("Gravity").address

  if (!abi || !address) { 
    throw Error(`Missing the DataSource "Gravity"`)
  }

  const { ethereum } = context.graph.config

  const contract = new ethers.Contract(
    address, abi, ethereum.getSigner()
  )
  contract.connect(ethereum)

  return contract
}

async function createGravatar(_, { options }: any, context: Context) {
  const { displayName, imageUrl } = options
  const state = context.graph.state
  const gravity = await getGravityContract(context)

  await sleep(2000)
  if (context.fail) {
    throw new Error('Transaction Errored (Controlled Error Test Case)')
  }

  const txResult = await sendTx(
    await gravity.createGravatar(displayName, imageUrl),
    `Create new Gravatar named ${displayName}...`,
    state
  )

  if (!txResult) {
    throw new Error('WHOLE PROCESS FAILED')
  }

  return await queryUserGravatar(context)
}

async function deleteGravatar(_, { }: any, context: Context) {
  const state = context.graph.state;
  const gravity = await getGravityContract(context)

  const txResult = await sendTx(
    await gravity.deleteGravatar(),
    `Delete user's Gravatar...`,
    state
  )

  if (!txResult) {
    throw new Error('Error deleting gravatar')
  }
  return true
}

async function updateGravatarName(_, { displayName }: any, context: Context) {
  const state = context.graph.state;
  const gravity = await getGravityContract(context)

  await state.dispatch('PROGRESS_UPDATE', { value: 50 })
  await state.dispatch('CUSTOM_EVENT', { myValue: 'test' })

  await sleep(2000)
  if (context.fail) {
    throw new Error('Transaction Errored (Controlled Error Test Case)')
  }

  const txResult = await sendTx(
    await gravity.updateGravatarName(displayName),
    `Change Gravatar's name to ${displayName}...`,
    state
  )

  if (!txResult) {
    throw new Error('WHOLE PROCESS FAILED')
  }

  await state.dispatch('CUSTOM_EVENT', { myValue: displayName })

  return await queryUserGravatar(context)
}

async function updateGravatarImage(_, { imageUrl }: any, context: Context) {
  const state = context.graph.state;
  const gravity = await getGravityContract(context)

  await sleep(2000)
  if (context.fail) {
    throw new Error('Transaction Errored (Controlled Error Test Case)')
  }

  await sendTx(
    await gravity.updateGravatarImage(imageUrl),
    `Update Gravatar's image...`,
    state
  )

  return await queryUserGravatar(context)
}

const resolvers: MutationResolvers<Config, State, EventMap> = {
  Mutation: {
    createGravatar,
    deleteGravatar,
    updateGravatarName,
    updateGravatarImage
  }
}

export default {
  resolvers,
  config,
  stateBuilder
}

// Required Types
export {
  State,
  EventMap,
  CustomEvent
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
