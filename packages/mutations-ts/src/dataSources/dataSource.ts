import { DataSources } from './'

export class DataSource {

  private _dataSources: DataSources;
  private _name: string;
  private _abi?: string;
  private _address?: string;

  constructor(dataSources: DataSources, name: string) {
    this._name = name;
    this._dataSources = dataSources;
  }
 
  get name(): string {
    return this._name
  }

  get abi(): Promise<string | undefined> {
    return new Promise((resolve, reject) => {
      if (this._abi) {
        resolve(this._abi)
      } else {
        this._dataSources.fetchAbi(this._name)
          .then(abi => this._abi = abi)
          .finally(() => resolve(this._abi))
          .catch(err => reject(err))
      }
    })
  }

  get address(): Promise<string | undefined> {
    return new Promise((resolve, reject) => {
      if (this._address) {
        resolve(this._address)
      } else {
        this._dataSources.fetchAddress(this._name)
          .then(address => this._address = address)
          .finally(() => resolve(this._address))
          .catch(err => reject(err))
      }
    })
  }
}
