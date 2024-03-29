import { useEffect, createRef } from "react";
import { useHookstate, State } from "@hookstate/core";
import { globalState } from "./globalState";
import draftToHtml from "draftjs-to-html";
import ReactHtmlParser from "react-html-parser";
import { localizeDateTime, downloadBlob, humanFileSize } from "./helpers";
import { Storage } from "aws-amplify";
import { useScroll } from "./hooks";
import PageAppBar from "./PageAppBar";

import {
  Link as RouterLink,
  Switch,
  Route,
  useRouteMatch,
  useHistory,
  useLocation,
} from "react-router-dom";
import CommentCard from "./CommentCard";
import PageNav from "./PageNav";
import {
  IFile,
  IProject,
  IBuildStep,
  IUser,
  SideNavCategory,
  SideNavType,
} from "./types";
import {
  getProject,
  likeProject,
  unlikeProject,
  collectProject,
  uncollectProject,
} from "./agent";

// Material UI
import { makeStyles } from "@material-ui/core/styles";
import { green } from "@material-ui/core/colors";
import ThumbUpIcon from "@material-ui/icons/ThumbUp";
import CollectionsIcon from "@material-ui/icons/Collections";
import ShareIcon from "@material-ui/icons/Share";
import Avatar from "@material-ui/core/Avatar";
import Grid from "@material-ui/core/Grid";
import Container from "@material-ui/core/Container";
import Typography from "@material-ui/core/Typography";
import Paper from "@material-ui/core/Paper";
import Link from "@material-ui/core/Link";
import Carousel from "react-material-ui-carousel";
import Button from "@material-ui/core/Button";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
import Divider from "@material-ui/core/Divider";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableContainer from "@material-ui/core/TableContainer";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import GetAppIcon from "@material-ui/icons/GetApp";
import Box from "@material-ui/core/Box";

// Page styles
const useStyles = makeStyles((theme) => ({
  titleWrapper: {
    marginBottom: "10px",
  },
  titleText: {
    display: "flex",
  },
  titleRightColumn: {
    marginLeft: "10px",
    width: "100%",
  },
  topButtons: {
    marginBottom: "5px",
    "&:after": {
      // ClearFix
      content: '""',
      clear: "both",
      display: "table",
    },
  },
  editProjectBtn: {
    float: "right",
  },
  image: {
    maxHeight: "100%",
    maxWidth: "100%",
    width: "auto",
    height: "auto",
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    margin: "auto",
  },
  pageNavIcon: {
    marginRight: "2px",
  },
  active: {
    backgroundColor: theme.palette.action.selected,
  },
  centerPageNav: {
    margin: "10px 0",
  },
  paper: {
    padding: "20px",
  },
  divider: {
    margin: "10px 0",
  },
  content: {
    flexGrow: 1,
    marginTop: "20px",
    marginBottom: "20px",
    [theme.breakpoints.up("md")]: {
      transition: theme.transitions.create("margin", {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
      }),
      marginLeft: 240,
    },
    [theme.breakpoints.down("sm")]: {
      transition: theme.transitions.create("margin", {
        easing: theme.transitions.easing.easeOut,
        duration: theme.transitions.duration.enteringScreen,
      }),
      marginLeft: 0,
    },
  },
  downloadBtn: {
    float: "right",
  },
  thDownload: {
    textAlign: "right",
  },
  buildStepTabs: {
    flexGrow: 1,
    width: "100%",
    backgroundColor: theme.palette.background.paper,
  },
  iconActive: {
    color: green[500],
  },
}));

function a11yProps(index: any) {
  return {
    id: `simple-tab-${index}`,
    "aria-controls": `simple-tabpanel-${index}`,
  };
}

export default function Project(props: any) {
  const initUser: IUser = {
    username: "",
    identityId: "",
    firstName: "",
    lastName: "",
    avatarImgKey: "",
    projects: null,
  };

  const initProject: IProject = {
    id: props.match.params.id,
    title: "",
    description: "",
    category: "",
    categoryId: 0,
    createdAt: "",
    editedAt: "",
    images: [],
    uploadedImages: [],
    files: [],
    fakeFiles: [],
    uploadedFiles: [],
    buildSteps: [],
    user: initUser,
    liked: false,
    collected: false,
  };

  const project = useHookstate<IProject>(initProject);

  useEffect(() => {
    getProject(props.match.params.id).then((response) => {
      if (!response) return;
      if (response.status === 200 && response.data) {
        // Set the value in state
        project.set(response.data);
      }
    });
  }, []); // Note: Empty array at the end ensures that this is only performed once during mount

  return <MainContentArea project={project} />;
}

function MainContentArea(props: { project: State<IProject> }) {
  const project = useHookstate(props.project);
  const gState = useHookstate(globalState);
  let { path } = useRouteMatch();
  const history = useHistory();
  const classes = useStyles();

  // Checks if there are any files and if they are files and not images.
  const filesDisabled = () => {
    const filesFound =
      props.project.files.filter((f) => f.isImage.value === false).length > 0;

    if (props.project.files == null && !filesFound) {
      return true;
    }
    return false;
  };

  // Checks if there are any build steps
  const buildLogDisabled = () => {
    const oneBuildStep = props.project.buildSteps.length > 0;
    if (props.project.buildSteps && !oneBuildStep) {
      return true;
    }
    return false;
  };

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

  function handleEditClick() {
    history.push("/edit-project/" + project.id.value.toString());
  }

  // Check if the comment belongs to the logged in user
  const isThem = () =>
    gState.identityId.value === project.user.identityId.value;

  const images = project.files.value.filter((f) => f.isImage);
  const avatarUrl =
    "https://d1sam1rvgl833u.cloudfront.net/fit-in/40x40/protected/" +
    props.project.user.identityId.value +
    "/user-avatar.png";

  return (
    <div>
      <PageAppBar />

      <div className={classes.content}>
        <PageNav project={project} navType={SideNavType.Project} />
        <Container maxWidth="md">
          <Grid container className={classes.titleWrapper}>
            <Grid item sm={7}>
              <div className={classes.titleText}>
                <Link component={RouterLink} to="/">
                  <Avatar alt={project.user.username.value} src={avatarUrl} />
                </Link>
                <div className={classes.titleRightColumn}>
                  <Typography variant="h5">{project.title.value}</Typography>
                  <Typography variant="subtitle1">
                    Created by:{" "}
                    <Link component={RouterLink} to="/">
                      {project.user.username.value}
                    </Link>{" "}
                    on {localizeDateTime(project.createdAt.value)}
                  </Typography>
                </div>
              </div>
            </Grid>
            <Grid item sm={5}></Grid>
          </Grid>
          <div className={classes.topButtons}>
            <Button
              color="primary"
              className={project.liked.value ? classes.iconActive : ""}
              onClick={() => handleLike(project.id.value)}
            >
              <ThumbUpIcon className={classes.pageNavIcon} />{" "}
              {project.liked.value ? "Liked" : "Like"}
            </Button>
            <Button
              color="primary"
              className={project.collected.value ? classes.iconActive : ""}
              onClick={() => handleCollect(project.id.value)}
            >
              <CollectionsIcon className={classes.pageNavIcon} />{" "}
              {project.collected.value ? "Collected" : "Collect"}
            </Button>
            <Button
              color="primary"
              //className={project.collected.value ? classes.iconActive : ""}
              //onClick={() => handleCollect(project.id.value)}
            >
              <ShareIcon className={classes.pageNavIcon} />
              Share
            </Button>
            {isThem() ? (
              <Button
                variant="contained"
                color="primary"
                size="small"
                className={classes.editProjectBtn}
                onClick={handleEditClick}
              >
                Edit
              </Button>
            ) : (
              <></>
            )}
          </div>

          <DisplayImages images={images} />

          <PillNav
            filesDisabled={filesDisabled()}
            buildLogDisabled={buildLogDisabled()}
          />

          <Switch>
            <Route exact path={path}>
              <Paper className={classes.paper}>
                <Typography variant="h5">Description</Typography>
                <Divider className={classes.divider} />
                <Description text={project.description.value} />
              </Paper>
            </Route>
            <Route path={`${path}/description`}>
              <Paper className={classes.paper}>
                <Typography variant="h5">Description</Typography>
                <Divider className={classes.divider} />
                <Description text={project.description.value} />
              </Paper>
            </Route>
            <Route path={`${path}/comments`}>
              <Paper className={classes.paper}>
                <Typography variant="h5">Comments</Typography>
                <Divider className={classes.divider} />
                <CommentCard projectId={project.id.value} />
              </Paper>
            </Route>
            <Route path={`${path}/files`}>
              <Paper className={classes.paper}>
                <Typography variant="h5">Project Files</Typography>
                <Divider className={classes.divider} />
                <FileList files={props.project.files.value} />
              </Paper>
            </Route>
            <Route path={`${path}/build-log`}>
              {props.project.buildSteps.value ? (
                props.project.buildSteps.map((bs, index) => (
                  <ImageCard key={index} buildStep={bs} />
                ))
              ) : (
                <></>
              )}
            </Route>
          </Switch>
        </Container>
      </div>
    </div>
  );
}

function DisplayImages(props: { images: IFile[] }) {
  const classes = useStyles();
  const images = props.images;

  // const loadingStyle = {
  //   margin: 0,
  //   position: "absolute",
  //   top: "50%",
  //   left: "45%",
  //   msTransform: "translateY(-50%)",
  //   transform: "translateY(-50%)",
  //   color: "#fff",
  // } as React.CSSProperties;

  // if (isLoading.value) {
  //   return (
  //     <div
  //       className="bg-secondary"
  //       style={{ height: "400px", position: "relative" }}
  //     >
  //       <div style={loadingStyle}>
  //         <Spinner className="m-1" animation="grow" />
  //         <Spinner className="m-1" animation="grow" />
  //         <Spinner className="m-1" animation="grow" />
  //       </div>
  //     </div>
  //   );
  // }

  const imageUrl = (identityId: string, key: string) =>
    "https://d1sam1rvgl833u.cloudfront.net/fit-in/0x400/protected/" +
    identityId +
    "/" +
    key;

  if (images && images.length > 1) {
    return (
      <Carousel interval={10000}>
        {images
          .filter((file) => file.isImage === true)
          .map((file, index) => (
            <div
              key={index}
              className="bg-secondary"
              style={{
                height: "400px",
                position: "relative",
              }}
            >
              <img
                key={index}
                src={imageUrl(file.identityId, file.key)}
                className={classes.image}
              />
            </div>
          ))}
      </Carousel>
    );
  } else {
    return (
      <div
        className="bg-secondary"
        style={{ height: "400px", position: "relative" }}
      >
        <img
          src={
            images.length > 0
              ? imageUrl(images[0].identityId, images[0].key)
              : ""
          }
          className={classes.image}
        />
      </div>
    );
  }
}

function PillNav(props: { filesDisabled: boolean; buildLogDisabled: boolean }) {
  const { url } = useRouteMatch();
  const location = useLocation();
  const classes = useStyles();

  // Helper to conver the location path into the category enum
  const category = () => {
    if (location.pathname.includes("comments")) {
      return SideNavCategory.Comments;
    }
    if (location.pathname.includes("files")) {
      return SideNavCategory.Files;
    }
    if (location.pathname.includes("build-log")) {
      return SideNavCategory.BuildLog;
    }
    return SideNavCategory.Description;
  };

  return (
    <div className={classes.centerPageNav}>
      <Tabs
        value={category()}
        className={classes.centerPageNav}
        indicatorColor="primary"
        textColor="primary"
        variant="scrollable"
        scrollButtons="auto"
        aria-label="Select build step category"
      >
        <Tab
          label="Description"
          {...a11yProps(0)}
          component={RouterLink}
          to={`${url}/description`}
        />
        <Tab
          label="Comments"
          {...a11yProps(1)}
          component={RouterLink}
          to={`${url}/comments`}
        />
        <Tab
          label="Files"
          {...a11yProps(2)}
          component={RouterLink}
          to={`${url}/files`}
          disabled={props.filesDisabled}
        />
        <Tab
          label="Build Log"
          {...a11yProps(3)}
          component={RouterLink}
          to={`${url}/build-log`}
          disabled={props.buildLogDisabled}
        />
      </Tabs>
    </div>
  );
}

function Description(props: { text: string }) {
  function parseHtml() {
    if (props.text) {
      const json = JSON.parse(atob(props.text));
      const html = draftToHtml(json);
      return ReactHtmlParser(html);
    } else {
      return <></>;
    }
  }
  return <div>{parseHtml()}</div>;
}

function FileList(props: { files: IFile[] }) {
  const classes = useStyles();

  async function downloadFile(
    key: string,
    identityId: string,
    fileName: string
  ) {
    try {
      const result: any = await Storage.get(key, {
        level: "protected",
        identityId: identityId,
        download: true,
      });

      downloadBlob(result.Body, fileName);
    } catch (error) {
      console.log(error);
    }
  }

  function fileList() {
    const tableRow = props.files
      .filter((file) => file.isImage === false)
      .map((file: IFile, i) => (
        <TableRow key={i}>
          <TableCell>{file.fileName}</TableCell>
          <TableCell>{humanFileSize(file.size)}</TableCell>
          <TableCell>
            <Button
              variant="contained"
              color="primary"
              size="small"
              className={classes.downloadBtn}
              onClick={() =>
                downloadFile(file.key, file.identityId, file.fileName)
              }
            >
              <GetAppIcon />
            </Button>
          </TableCell>
        </TableRow>
      ));
    return tableRow;
  }

  return (
    <TableContainer>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>File Name</TableCell>
            <TableCell>Size</TableCell>
            <TableCell className={classes.thDownload}>Download</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>{fileList()}</TableBody>
      </Table>
    </TableContainer>
  );
}

function TabPanel(props: {
  children?: React.ReactNode;
  index: any;
  value: any;
  p: number;
}) {
  const { children, value, index, p, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box p={p}>{children}</Box>}
    </div>
  );
}

function ImageCard(props: { buildStep: State<IBuildStep> }) {
  const category = useHookstate(0);
  const buildStep = useHookstate(props.buildStep);
  const [executeScroll, elRef] = useScroll();
  const classes = useStyles();
  const location = useLocation();

  // Checks for a matching hash path and scrolls if one is found.
  useEffect(() => {
    if (location.hash === `#${buildStep.id.value}`) executeScroll();
  }, []);

  const handleChange = (event: React.ChangeEvent<{}>, newValue: number) => {
    category.set(newValue);
  };

  const images = props.buildStep.files.value.filter((i) => i.isImage);

  return (
    <div
      id={buildStep.id.value.toString()}
      ref={elRef}
      className={classes.buildStepTabs}
    >
      <Paper>
        <DisplayImages images={images} />
        <Tabs
          value={category.value}
          onChange={handleChange}
          indicatorColor="primary"
          textColor="primary"
          variant="scrollable"
          scrollButtons="auto"
          aria-label="Select build step category"
        >
          <Tab label="Description" {...a11yProps(0)} />
          <Tab label="Comments" {...a11yProps(1)} />
          <Tab label="Files" {...a11yProps(2)} />
        </Tabs>

        <TabPanel value={category.value} index={0} p={3}>
          <Description text={props.buildStep.description.value} />
        </TabPanel>
        <TabPanel value={category.value} index={1} p={3}>
          <CommentCard buildStepId={buildStep.id.value} />
        </TabPanel>
        <TabPanel value={category.value} index={2} p={3}>
          <ImageCardFiles files={props.buildStep.files.value} />
        </TabPanel>
      </Paper>
    </div>
  );
}

function ImageCardFiles(props: { files: IFile[] }) {
  return <FileList files={props.files} />;
}
