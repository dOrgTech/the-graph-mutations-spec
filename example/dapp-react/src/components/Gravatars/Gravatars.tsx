import React, {useState} from 'react'
import {
  Card,
  CardContent,
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
import { cloneDeep } from 'lodash'
import { UPDATE_GRAVATAR_NAME, TEST_TRIPLE_UPDATE, DELETE_GRAVATAR, GRAVATARS_QUERY } from '../../queries';
import { useMutation } from '@graphprotocol/mutations-apollo-react'

const gravatarStyles = theme =>
  createStyles({
    actionArea: {
      maxWidth: 300,
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

const Gravatar = ({ classes, id, displayName, imageUrl, owner, client, devMode}) => {

  const [name, setName] = useState('')

  const [executeUpdate, { loading, state: { updateGravatarName: mutationState } }] = useMutation(
    UPDATE_GRAVATAR_NAME,
    {
      client,
      variables: {
        id,
        displayName: name
      },
      optimisticResponse: {
        updateGravatar: {
          id,
          displayName: name,
          owner,
          imageUrl,
          __typename: "Gravatar"
        }
      },
      update: (proxy, result) => {
        const data: any = cloneDeep(proxy.readQuery({
          query: GRAVATARS_QUERY,
          variables: {
            where: {},
            orderBy: "displayName",
          }
        }, true))

        if (result.data && result.data.updateGravatar) {
          for(let i = 0; i < data.gravatars.length; i++){
            if(data.gravatars[i].owner === owner){
              data.gravatars[i] = result.data.updateGravatar;
              break;
            }
          }
        }

        proxy.writeQuery({
          query: GRAVATARS_QUERY,
          data,
          variables: {
            where: {},
            orderBy: "displayName"
          }
        })

      },
      onError: (error) => {
        alert(error)
      }
    })

  const [executeDelete] = useMutation(
    DELETE_GRAVATAR,
    {
      client,
      optimisticResponse: {
        deleteGravatar: true
      },
      update: (proxy, result) => {
        const data: any = cloneDeep(proxy.readQuery({
          query: GRAVATARS_QUERY,
          variables: {
            where: {},
            orderBy: "displayName",
          }
        }, true))

        if (result.data && result.data.deleteGravatar) {
          data.gravatars = data.gravatars.filter(gravatar => gravatar.owner !== owner)
        }

        proxy.writeQuery({
          query: GRAVATARS_QUERY,
          data,
          variables: {
            where: {},
            orderBy: "displayName"
          }
        })

      },
      onError: (error) => {
        alert(error)
      }
    })

  const [multiUpdate] = useMutation(
    TEST_TRIPLE_UPDATE,
    {
      client,
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
        <div className={classes.actionArea}>
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
          {((window as any).web3.currentProvider.selectedAddress === owner) ?
            devMode ?
              (
                <CardActions>
                  <Input
                    placeholder="Type new name..."
                    onChange={handleNameChange}></Input>
                  <Button size="small" color="primary" variant="outlined" onClick={() => executeUpdate()}>
                    Update
              </Button>
                  <Button size="small" color="default" variant="outlined" onClick={() => multiUpdate()}>
                    Multi Query
              </Button>
                </CardActions>
              )
              : (
                <CardActions>
                  <Input
                    placeholder="Type new name..."
                    onChange={handleNameChange}></Input>
                  <Button size="small" color="primary" variant="outlined" onClick={() => executeUpdate()}>
                    Update
              </Button>
                  <Button size="small" color="secondary" variant="outlined" onClick={() => executeDelete()}>
                    Delete
              </Button>
                </CardActions>
              ) : null
          }
          {
            loading && (window as any).web3.currentProvider.selectedAddress === owner ? (
              <LinearProgress
                variant="determinate"
                value={mutationState && mutationState.progress ? mutationState.progress : 0}
              >
              </LinearProgress>
            ) : null
          }
        </div>
      </Card>
    </Grid>
  )
}

const StyledGravatar = withStyles(gravatarStyles)(Gravatar)

const gravatarsStyles = theme =>
  createStyles({
    title: {
      marginTop: theme.spacing.unit * 2,
    },
  })

const Gravatars = ({ classes, gravatars, client, devMode }) => (
  <Grid container direction="column" spacing={16}>
    <Grid item>
      <Typography variant="title" className={classes.title}>
        {gravatars.length} Gravatars
      </Typography>
    </Grid>
    <Grid item>
      <Grid container direction="row" spacing={16}>
        {gravatars.map(gravatar => (
          <StyledGravatar client={client} key={gravatar.id} {...gravatar} devMode={devMode} />
        ))}
      </Grid>
    </Grid>
  </Grid>
)

export default withStyles(gravatarsStyles)(Gravatars)