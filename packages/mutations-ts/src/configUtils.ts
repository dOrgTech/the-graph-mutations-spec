import {
  ConfigGetters,
  ConfigSetters,
  ConfigValues
} from './types'

const initConfig = async (
  config: any,
  getters: any,
  setters: any
) => {
  const keys = Object.keys(setters)
  for (let key of keys) {
    if (typeof getters === "function") {
      if (getters.constructor.name === "AsyncFunction") {
        getters = await getters()
      } else {
        getters = getters()
      }
    }

    if (typeof setters[key] === "function") {
      if (getters[key] === "function") {
        if (getters.constructor.name === "AsyncFunction") {
          config[key] = setters[key](await getters[key]())
        } else {
          config[key] = setters[key](getters[key]())
        }
      } else {
        config[key] = setters[key](getters[key])
      }
    } else {
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

    if (typeof setters[key] === "object") {
      if (typeof getters[key] === "function") {
        // we return here, as we can't validate at runtime that
        // the function will return the shape we're looking for
        return
      }
      validateConfig(getters[key], setters[key])
    }
  })
}
