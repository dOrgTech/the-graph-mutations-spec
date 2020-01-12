import { useEffect, useState } from 'react';
import { useMutation } from '@apollo/react-hooks';
import { BehaviorSubject } from 'rxjs';
import { MutationState } from '@graphprotocol/mutations-ts'

function useObservable<TMutationState>(
  observable: BehaviorSubject<TMutationState>,
  setter: React.Dispatch<React.SetStateAction<TMutationState>>
) {
  useEffect(() => {
    let subscription = observable.subscribe(result => {
      if (result) setter(result)
    })
    return () => subscription.unsubscribe();
  }, [observable, setter])
}

export function useMutationAndSubscribe<TMutationState = MutationState>(
    mutation: any, // TODO: no any
    mutationOptions: any // TODO: no any
) {

  const [subscriptionData, setSubscriptionData] = useState({} as TMutationState)
  const [observable] = useState(new BehaviorSubject({} as TMutationState))

  mutationOptions.context = {
    ...mutationOptions.context,
    __stateObserver: observable
  }

  const [executeMutation, loading] = useMutation(mutation, mutationOptions)

  useObservable<TMutationState>(observable, setSubscriptionData);

  return {
    executeMutation: () => {
      executeMutation();
    },
    loadingMutation: loading,
    subscriptionData
  }
}
