import {
  ConfigGetters,
  ConfigSetters
} from './types'

const initConfig = (
  config: any,
  getters: any,
  setters: any
) => {
  Object.keys(setters).forEach(key => {
    if (typeof setters[key] === "function") {
      config[key] = setters[key](getters[key])
    } else {
      initConfig(config[key], getters[key], setters[key])
    }
  })
}

export const createConfig = <T extends ConfigSetters>(
  getters: ConfigGetters<T>,
  setters: ConfigSetters
) => {
  const config = { }
  initConfig(config, getters, setters)
  return config
}

export const validateConfig = (getters: any, setters: any) => {
  Object.keys(setters).forEach(key => {
    if (getters[key] === undefined) {
      throw Error(`Failed to find mutation configuration value for the property ${key}.`)
    }

    if (typeof setters[key] === "object") {
      validateConfig(getters[key], setters[key])
    }
  })
}
