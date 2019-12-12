import gql from "graphql-tag"
import Web3 from "web3"
import IPFSClient from "ipfs-http-client"

async function queryUserGravatar(context: any) {
  const { client } = context
  const { ethereum } = context.thegraph.config

  return await client.query(gql`
  {
    gravatar(owner: ${ethereum.eth.defaultAccount}) {
      id
      owner
      displayName
      imageUrl
    }
  }`)
}

async function sendTx(tx: any, msg: string, context: any) {
  const { mutationState } = context.thegraph
  const { ethereum } = context.thegraph.config

  await tx.send({ from: ethereum.eth.defaultAccount })
    .on("transactionHash", (hash: string) => {
      mutationState.addTransaction(hash, msg)
    })
    .on("error", (error: Error) => {
      mutationState.addError(error)
      throw new Error(`Failed while sending "${msg}"`)
    })
}

async function getGravityContract(context: any) {
  const { ethereum } = context.thegraph.config
  const { Gravity } = context.thegraph.dataSources

  return new ethereum.eth.Contract(
    await Gravity.abi(), await Gravity.address()
  )
}

async function createGravatar(_root: any, {options}: any, context: any) {
  const { displayName, imageUrl } = options
  const gravity = await getGravityContract(context)
  const tx = gravity.methods.createGravatar(displayName, imageUrl)

  await sendTx(tx, "Creating Gravatar", context)
  return await queryUserGravatar(context)
}

async function updateGravatarName(_root: any, {displayName}: any, context: any) {
  const gravity = await getGravityContract(context)
  const tx = gravity.methods.updateGravatarName(displayName)

  await sendTx(tx, "Updating Gravatar Name", context)
  return await queryUserGravatar(context)
}

async function updateGravatarImage(_root: any, {imageUrl}: any, context: any) {
  const gravity = await getGravityContract(context)
  const tx = gravity.methods.updateGravatarImage(imageUrl)

  // Example of custom data within the state
  context.thegraph.mutationState.addData("imageUrl", imageUrl)

  await sendTx(tx, "Updating Gravatar Image", context)
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
    return new Web3(provider)
  },
  ipfs: (provider: string) => {
    return IPFSClient(provider)
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
  config
}
