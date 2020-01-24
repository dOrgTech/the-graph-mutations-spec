import { useEffect } from 'react'
import { BehaviorSubject } from 'rxjs'

export const useObservable = <TState>(
  observable: BehaviorSubject<TState>,
  setter: React.Dispatch<React.SetStateAction<TState>>
) => {
  useEffect(() => {
    let subscription = observable.subscribe(result => {
      if (result) setter(result)
    })
    return () => subscription.unsubscribe()
  }, [observable, setter])
}
