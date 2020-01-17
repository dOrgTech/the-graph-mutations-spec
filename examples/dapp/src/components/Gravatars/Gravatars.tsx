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
import {State} from 'gravatar-mutations/dist';
import {useMutationAndSubscribe} from '@graphprotocol/mutations-apollo-react'

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
  
  const {executeMutation: succesfulUpdate, subscriptionData, loadingMutation: {loading}} = useMutationAndSubscribe<State>(
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

    const {executeMutation: failedUpdate, subscriptionData: failSubData} = useMutationAndSubscribe<State>(
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

  console.log("Success Case: ", subscriptionData)
  console.log("Failure Case: ", failSubData)

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
            <Button size="small" color="primary" variant="outlined" onClick={succesfulUpdate}>
              Update Name
            </Button>
            <Button size="small" color="secondary" variant="outlined" onClick={failedUpdate}>
              Update Name
            </Button>
          </CardActions>): null
        }
      </CardActionArea>
      {(loading && subscriptionData.progress !== 100)? 
        (<LinearProgress variant="determinate" value={subscriptionData.progress? subscriptionData.progress: 0}></LinearProgress>): null}
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
