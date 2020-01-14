import { useEffect, useState } from 'react';
import { useMutation, MutationHookOptions } from '@apollo/react-hooks';
import { BehaviorSubject } from 'rxjs';
import { CoreState } from '@graphprotocol/mutations-ts'
import { DocumentNode } from 'graphql';

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

export function useMutationAndSubscribe<TMutationState = CoreState>(
  mutation: DocumentNode,
  mutationOptions: MutationHookOptions
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
