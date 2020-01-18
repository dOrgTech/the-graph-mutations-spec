// Validate that all leaf property values of the ConfigGetters
// instance match the type of the ConfigSetters function arguments
type SetterValue<T> =
  T extends ((value: infer U) => any) ? U : ConfigGetters<T>

type GetterFunc<T> =
  (() => SetterValue<T>) | (() => Promise<SetterValue<T>>)

type ConfigGetterProp<T> = SetterValue<T> | GetterFunc<T>

export type ConfigGetters<T> = {
  [Prop in keyof T]: ConfigGetterProp<T[Prop]>
}

export type ConfigValues<T> = {
  [Prop in keyof T]: SetterValue<T[Prop]>
}

export type ConfigSetters = {
  [key: string]: ((value: any) => any) | ConfigSetters
}
