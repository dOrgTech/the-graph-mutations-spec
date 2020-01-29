import React, { useEffect } from 'react'
import Enzyme, { mount } from 'enzyme'
import Adapter from 'enzyme-adapter-react-16'
import { act } from 'react-dom/test-utils'
import { isEqual } from 'lodash'


import { TEST_RESOLVER, client, statesToPublish } from '../test-utils'
import { useMutation } from '..'

Enzyme.configure({ adapter: new Adapter() })

describe("UseMutation Custom Hook", () => {

   it('Correctly sets observer object inside context', async () => {

    let mutationResult: any;
    let observerSet = false;

    function Wrapper() {
      mutationResult = useMutation(TEST_RESOLVER, {
        client
      })

      const [_, { data }] = mutationResult

      if(data && data.testResolve){
        observerSet = true
      }

      return null;
    }

    mount(<Wrapper></Wrapper>)

    const [ execute ] = mutationResult

    await act(async () => {
      execute()
    })

    expect(observerSet).toEqual(true)

   })

  it('Returns states in dispatch order', async () => {

    let mutationResult: any;
    let states: string[] = [];

    function Wrapper() {
      mutationResult = useMutation(TEST_RESOLVER, {
        client
      })

      const [_, { state }] = mutationResult

      useEffect(() => {
        if(!isEqual(state, {}))
          states.push(state)
      }, [state])

      return null;
    }

    mount(<Wrapper></Wrapper>)

    const [ execute ] = mutationResult

    await act(async () => {
      execute()
    })

    expect(statesToPublish).toEqual(states)

  })
})