import { useEffect } from "react";
import { useHookstate, State } from "@hookstate/core";
import { useHistory, Link as RouterLink } from "react-router-dom";
import {
  getProjects,
  likeProject,
  unlikeProject,
  collectProject,
  uncollectProject,
} from "./agent";
import { IHomeProject } from "./types";
import { globalState } from "./globalState";
import Card from "@material-ui/core/Card";
import CardHeader from "@material-ui/core/CardHeader";
import CardActions from "@material-ui/core/CardActions";
import CardMedia from "@material-ui/core/CardMedia";
import Avatar from "@material-ui/core/Avatar";
import IconButton from "@material-ui/core/IconButton";
import Grid from "@material-ui/core/Grid";
import { makeStyles } from "@material-ui/core/styles";
import Container from "@material-ui/core/Container";
import { red, green } from "@material-ui/core/colors";
import ShareIcon from "@material-ui/icons/Share";
import ThumbUpIcon from "@material-ui/icons/ThumbUp";
import CollectionsIcon from "@material-ui/icons/Collections";
import Typography from "@material-ui/core/Typography";
import Link from "@material-ui/core/Link";
import Box from "@material-ui/core/Box";

const useStyles = makeStyles((theme) => ({
  icon: {
    marginRight: theme.spacing(2),
  },
  iconActive: {
    color: green[500],
  },
  cardGrid: {
    paddingTop: theme.spacing(8),
    paddingBottom: theme.spacing(8),
    minHeight: "100%",
  },
  card: {
    height: "100%",
    display: "flex",
    flexDirection: "column",
  },
  cardMedia: {
    paddingTop: "56.25%", // 16:9
  },
  cardTitle: {
    maxWidth: "210px",
  },
  cardContent: {
    flexGrow: 1,
  },
  avatar: {
    backgroundColor: red[500],
  },
}));

export default function Home() {
  const projects = useHookstate<IHomeProject[]>([]);
  const classes = useStyles();

  useEffect(() => {
    getProjects().then((response) => {
      if (response && response.status === 200) {
        projects.set(response.data);
      }
    });
  }, []); // Note: Empty array at the end ensures that this is only performed once during mount

  function projectList() {
    const list = projects.map((project, index) => {
      return <ProjectCard key={index} project={project} />;
    });

    return <>{list}</>;
  }

  return (
    <Container className={classes.cardGrid} maxWidth="lg">
      <Grid container spacing={3}>
        {projectList()}
      </Grid>
    </Container>
  );
}

function ProjectCard(props: { project: State<IHomeProject> }) {
  const project = useHookstate(props.project);
  const gState = useHookstate(globalState);
  const history = useHistory();
  const classes = useStyles();

  async function handleLike(projectId: number) {
    // Check if the user is signed in, if not then send them to the sign-in page.
    if (!gState.isAuthenticated.value) {
      console.log("User not signed in");
      history.push("/sign-in");
      return;
    }
    // Make sure we have the identityId
    if (!gState.identityId.value) return;

    if (!project.liked.value) {
      const response = await likeProject(projectId, gState.identityId.value);

      if (response && response.status === 204) {
        console.log("Project liked", projectId);
        project.liked.set(true);
      }
    } else {
      const response = await unlikeProject(projectId, gState.identityId.value);

      if (response && response.status === 204) {
        console.log("Project unliked", projectId);
        project.liked.set(false);
      }
    }
  }

  async function handleCollect(projectId: number) {
    // Check if the user is signed in, if not then send them to the sign-in page.
    if (!gState.isAuthenticated.value) {
      console.log("User not signed in");
      history.push("/sign-in");
      return;
    }
    // Make sure we have the identityId
    if (!gState.identityId.value) return;

    if (!project.collected.value) {
      const response = await collectProject(projectId, gState.identityId.value);

      if (response && response.status === 204) {
        console.log("Project collected", projectId);
        project.collected.set(true);
      }
    } else {
      const response = await uncollectProject(
        projectId,
        gState.identityId.value
      );

      if (response && response.status === 204) {
        console.log("Project uncollected", projectId);
        project.collected.set(false);
      }
    }
  }

  const imageUrl =
    project.image.key && project.image.key.value
      ? "https://d1sam1rvgl833u.cloudfront.net/fit-in/300x169/protected/" +
        project.image.identityId.value +
        "/" +
        project.image.key.value
      : "";

  const avatarUrl =
    "https://d1sam1rvgl833u.cloudfront.net/protected/" +
    project.user.identityId.value +
    "/user-avatar.png";

  return (
    <Grid item key={project.id.value} xs={12} sm={6} md={4} lg={3}>
      <Card className={classes.card}>
        <RouterLink to={"/project/" + project.id.value.toString()}>
          <CardMedia
            className={classes.cardMedia}
            image={imageUrl}
            title={project.title.value}
          />
        </RouterLink>
        <CardHeader
          avatar={
            <Avatar
              aria-label="recipe"
              className={classes.avatar}
              src={avatarUrl}
              alt={project.user.username.value}
            ></Avatar>
          }
          title={
            <Link
              component={RouterLink}
              to={"/project/" + project.id.value.toString()}
            >
              <Typography className={classes.cardTitle} noWrap>
                {project.title.value}
              </Typography>
            </Link>
          }
          subheader={project.user.username.value}
        />
        <CardActions disableSpacing>
          <IconButton aria-label="share" title="Share">
            <ShareIcon />
          </IconButton>
          <IconButton
            aria-label="collect"
            title="Collect"
            onClick={() => handleCollect(project.id.value)}
            className={project.collected.value ? classes.iconActive : ""}
          >
            <CollectionsIcon />
          </IconButton>
          <IconButton
            aria-label="like"
            title="Like"
            onClick={() => handleLike(project.id.value)}
            className={project.liked.value ? classes.iconActive : ""}
          >
            <ThumbUpIcon />
          </IconButton>
        </CardActions>
      </Card>
    </Grid>
  );
}
