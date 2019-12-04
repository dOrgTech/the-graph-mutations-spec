import Web3 from "web3"
const web3 = new Web3()

export function setWeb3Provider(provider) {
  web3.setProvider(provider)
}

export default web3
