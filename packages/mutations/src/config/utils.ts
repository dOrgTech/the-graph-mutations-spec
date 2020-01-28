import {
  ConfigGetters,
  ConfigSetters,
  ConfigValues
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
  config: any,
  getters: any,
  setters: any
) => {
  const keys = Object.keys(setters)
  for (let key of keys) {
    if (typeof getters === 'function') {
      getters = await callFunc(getters)
    }

    const getter = getters[key]
    const setter = setters[key]

    if (typeof setter === 'function') {
      let value = getter
      if (typeof getter === 'function') {
        value = await callFunc(getter)
      }
      config[key] = setter(value)
    } else {
      config[key] = { }
      initConfig(config[key], getters[key], setters[key])
    }
  }
}

export const createConfig = async <TConfig extends ConfigSetters>(
  getters: ConfigGetters<TConfig>,
  setters: ConfigSetters
): Promise<ConfigValues<TConfig>> => {
  const config = { }
  await initConfig(config, getters, setters)
  return config as ConfigValues<TConfig>
}

export const validateConfig = (getters: any, setters: any) => {
  Object.keys(setters).forEach(key => {
    if (getters[key] === undefined) {
      throw Error(`Failed to find mutation configuration value for the property ${key}.`)
    }

    if (typeof setters[key] === 'object') {
      if (typeof getters[key] === 'function') {
        // we return here, as we can't validate at runtime that
        // the function will return the shape we're looking for
        return
      }
      validateConfig(getters[key], setters[key])
    }
  })
}
