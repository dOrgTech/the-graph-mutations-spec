import React, {useState} from 'react'
import {
  Card,
  CardContent,
  CardActionArea,
  CardActions,
  CardMedia,
  Grid,
  Typography,
  createStyles,
  withStyles,
  Button,
  LinearProgress,
  Input
} from '@material-ui/core'
import { UPDATE_GRAVATAR_NAME, TEST_TRIPLE_UPDATE } from '../../utils';
import { useMutation } from '@graphprotocol/mutations-apollo-react'

const gravatarStyles = theme =>
  createStyles({
    actionArea: {
      maxWidth: 400,
    },
    image: {
      height: 150,
    },
    displayName: {
      textOverflow: 'ellipsis',
      overflow: 'hidden',
    },
    id: {
      textOverflow: 'ellipsis',
      overflow: 'hidden',
    },
    owner: {
      textOverflow: 'ellipsis',
      overflow: 'hidden',
    },
  })

const Gravatar = ({ classes, id, displayName, imageUrl, owner, client }) => {

  const [name, setName] = useState('')
  
  const [successUpdate, { state: successState, data: successData, loading: successLoading }] = useMutation(
    UPDATE_GRAVATAR_NAME,
    {
      client,
      optimisticResponse: {
        updateGravatarName: {
          id, //Apollo updates cache based on this ID
          imageUrl,
          owner,
          displayName: name,
          __typename: "Gravatar"
        }
      },
      context: {
        fail: false
      },
      variables: {
        id,
        displayName: name
      },
      onError: (error) => {
        alert(error)
      }
    })

    const [failUpdate, { state: failState }] = useMutation(
      UPDATE_GRAVATAR_NAME,
      {
        client,
        optimisticResponse: {
          updateGravatarName: {
            id, //Apollo updates cache based on this ID
            imageUrl,
            owner,
            displayName: name,
            __typename: "Gravatar"
          }
        },
        context: {
          fail: true
        },
        variables: {
          id,
          displayName: name
        },
        onError: (error) => {
          alert(error)
        }
      })

      const [multiUpdate, { state: multiState }] = useMutation(
        TEST_TRIPLE_UPDATE,
        {
          client,
          optimisticResponse: {
            updateGravatarName: {
              id, //Apollo updates cache based on this ID
              imageUrl,
              owner,
              displayName: "Triple updating...",
              __typename: "Gravatar"
            }
          },
          context: {
            fail: false
          },
          variables: {
            id
          },
          onError: (error) => {
            alert(error)
          }
        })

  const handleNameChange = (event: any) => {
    setName(event.target.value)
  }

  return (
  <Grid item>
    <Card>
      <CardActionArea className={classes.actionArea}>
        {imageUrl && (
          <CardMedia className={classes.image} image={imageUrl} title={displayName} />
        )}
        <CardContent>
          <Typography variant="h6" component="h3" className={classes.displayName}>
            {displayName || '—'}
          </Typography>
          <Typography color="textSecondary">ID</Typography>
          <Typography component="p" className={classes.id}>
            {id}
          </Typography>
          <Typography color="textSecondary">Owner</Typography>
          <Typography component="p" className={classes.owner}>
            {owner}
          </Typography>
        </CardContent>
        {((window as any).web3.currentProvider.selectedAddress === owner)? 
          (<CardActions>
            <Input
              placeholder="Type new name..."
              onChange={handleNameChange}></Input>
            <Button size="small" color="primary" variant="outlined" onClick={() => successUpdate()}>
              Success Test
            </Button>
            <Button size="small" color="default" variant="outlined" onClick={() => multiUpdate()}>
              Multi Test
            </Button>
            <Button size="small" color="secondary" variant="outlined" onClick={() => failUpdate()}>
              Failure Test
            </Button>
          </CardActions>): null
        }
      </CardActionArea>
    </Card>
  </Grid>
)}

const StyledGravatar = withStyles(gravatarStyles)(Gravatar)

const gravatarsStyles = theme =>
  createStyles({
    title: {
      marginTop: theme.spacing.unit * 2,
    },
  })

const Gravatars = ({ classes, gravatars, client }) => (
  <Grid container direction="column" spacing={16}>
    <Grid item>
      <Typography variant="title" className={classes.title}>
        {gravatars.length} Gravatars
      </Typography>
    </Grid>
    <Grid item>
      <Grid container direction="row" spacing={16}>
        {gravatars.map(gravatar => (
          <StyledGravatar client={client} key={gravatar.id} {...gravatar} />
        ))}
      </Grid>
    </Grid>
  </Grid>
)

export default withStyles(gravatarsStyles)(Gravatars)
