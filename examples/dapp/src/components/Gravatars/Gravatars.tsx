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
import { UPDATE_GRAVATAR_NAME } from '../../utils';
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
        client,
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

    const [failUpdate, { state: failState, data: failData }] = useMutation(
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
          client,
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

  const handleNameChange = (event: any) => {
    setName(event.target.value)
  }

  console.log("Success Case: ", successData)
  console.log("Failure Case: ", failData)

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
              Update Name
            </Button>
            <Button size="small" color="secondary" variant="outlined" onClick={() => failUpdate()}>
              Update Name
            </Button>
          </CardActions>): null
        }
      </CardActionArea>
      {(successLoading && successState.progress !== 100)? 
        (<LinearProgress variant="determinate" value={successState.progress}></LinearProgress>): null}
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
