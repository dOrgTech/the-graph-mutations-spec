import React from 'react'
import { Card } from 'semantic-ui-react'
import CompleteButton from './CompleteButton';
import DeleteButton from './DeleteButton';

const TodoCard = ({ todo: { id, asignee, description, completed } }) => {

  return (
    <Card fluid>
      <Card.Content>
        <Card.Header>
          # {id}
          <DeleteButton props={id}></DeleteButton>
        </Card.Header>
        <Card.Meta>Assigned to {asignee}</Card.Meta>
        <Card.Description>
          {description}
        </Card.Description>
      </Card.Content>
      <Card.Content extra>
        <div className='ui two buttons'>
          <CompleteButton props={{completed, id}}></CompleteButton>
        </div>
      </Card.Content>
    </Card>
  )
}

export default TodoCard