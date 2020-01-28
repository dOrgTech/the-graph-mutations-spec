import {
  ConfigGenerators,
  ConfigArguments,
  ConfigProperties
} from './types'

const isPromise = (test: any) => typeof test.then === 'function'

const callFunc = async (func: any) => {
  let result = func()
  if (isPromise(result)) {
    result = await result
  }
  return result
}

const initConfig = async (
  properties: any,
  args: any,
  generators: any
) => {
  const keys = Object.keys(generators)
  for (let key of keys) {
    if (typeof args === 'function') {
      args = await callFunc(args)
    }

    const generator = generators[key]
    let arg = args[key]

    if (typeof generator === 'function') {
      if (typeof arg === 'function') {
        arg = await callFunc(arg)
      }
      properties[key] = generator(arg)
    } else {
      properties[key] = { }
      initConfig(properties[key], args[key], generators[key])
    }
  }
}

export const createConfig = async <TConfig extends ConfigGenerators>(
  args: ConfigArguments<TConfig>,
  generators: ConfigGenerators
): Promise<ConfigProperties<TConfig>> => {
  const config = { }
  await initConfig(config, args, generators)
  return config as ConfigProperties<TConfig>
}

export const validateConfig = (args: any, generators: any) => {
  Object.keys(generators).forEach(key => {
    if (args[key] === undefined) {
      throw Error(`Failed to find mutation configuration value for the property ${key}.`)
    }

    if (typeof generators[key] === 'object') {
      if (typeof args[key] === 'function') {
        // we return here, as we can't validate at runtime that
        // the function will return the shape we're looking for
        return
      }
      validateConfig(args[key], generators[key])
    }
  })
}
