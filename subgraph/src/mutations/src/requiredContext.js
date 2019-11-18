import { setWeb3Provider } from "./web3"
import { setIPFSProvider } from "./ipfs"

export const requiredContext = {
  ethereum: (provider) => {
    setWeb3Provider(provider)
  },
  ipfs: (provider) => {
    setIPFSProvider(provider)
  }
}
