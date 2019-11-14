import React, { useState } from 'react'
import { Button, Card, Image } from 'semantic-ui-react'

const TodoCard = ({ props: { id, asignee, description, completed } }) => {

  const [completedTodo, completeTodo] = useState('');

  return (
    <Card fluid>
      <Card.Content>
        <Card.Header># {id}</Card.Header>
        <Card.Meta>Assigned to {asignee}</Card.Meta>
        <Card.Description>
          {description}
        </Card.Description>
      </Card.Content>
      <Card.Content extra>
        <div className='ui two buttons'>
          <Button basic color='green'>
            Mark as completed
            </Button>
        </div>
      </Card.Content>
    </Card>
  )
}

export default TodoCard