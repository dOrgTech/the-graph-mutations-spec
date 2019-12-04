import Web3 from "web3"
import IPFSClient from "ipfs-http-client"

export const requiredContext = {
  ethereum: (provider) => {
    return new Web3(provider)
  },
  ipfs: (provider) => {
    return IPFSClient(provider)
  }
}
