import localResolver from './localResolver'
import { MutationExecutors } from './types'

const executors: MutationExecutors = {
  localResolver
}

export * from './types'
export default executors
