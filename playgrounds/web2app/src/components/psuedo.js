// TODO: try this way of doing things out, then look into single subscription -> multiple events w/ different data
import { CREATE_TODO } from "../graphql/mutations";
import { useSubscription } from "@apollo/react-hooks";

function useMutationAndSubscribe(mutation, opts) {
  const [requestId, setRequestId] = useState(undefined);
  const [execMutation] = useMutation(mutation, opts);
  const { data: { txHash, mined } = {} } = useSubscription(
    GENERATED_SUBSCRIPTION, // mutation's TX_PROGRESS event
    { variables: { requestId } }
  );

  // MY_CUSTOM_EVENT

  return () => {
    const requestId = generateId();
    setRequestId(requestId);
    execMutation(...opts.variables, requestId);
    return () => progress;
  }
}

function Create() {
  const { executeMutation } = useMutationAndSubscribe(CREATE_TODO,
    {
      optimisticResponse: {
        // TODO
      },
      update(proxy, result) {
        // TODO
      },
      onError(error) {

      }
    }
  );

  function createTODO() {
    const progress = executeMutation()
    this.setState({
      progresses: [ ...this.state.progresses, progress ]
    })
  }
}
