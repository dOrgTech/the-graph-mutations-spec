import React, { useEffect } from 'react'
import Enzyme, { mount } from 'enzyme'
import Adapter from 'enzyme-adapter-react-16'
import { act } from 'react-dom/test-utils'
import { isEqual } from 'lodash'


import { CREATE_TODO, client, statesToPublish } from '../test-utils'
import { useMutation } from '..'

Enzyme.configure({ adapter: new Adapter() })

describe("UseMutation Custom Hook", () => {
  it('Returns states in dispatch order', async () => {

    let mutationResult: any;
    let states: string[] = [];

    function Wrapper() {
      mutationResult = useMutation(CREATE_TODO, {
        client,
        variables: {
          description: "TEST DESCRIPTION",
          asignee: "TEST ASIGNEE"
        }
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