import React, {useState} from 'react'
import { Button, Card, Image } from 'semantic-ui-react'

const TodoCard = () => {
    
    const [completedTodo, completeTodo] = useState('');

    return (
    <Card>
      <Card.Content>
        <Image
          floated='right'
          size='mini'
          src='https://react.semantic-ui.com/images/avatar/large/steve.jpg'
        />
        <Card.Header>Steve Sanders</Card.Header>
        <Card.Meta>Friends of Elliot</Card.Meta>
        <Card.Description>
          Steve wants to add you to the group
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
)}

export default TodoCard