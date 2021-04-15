import { useEffect } from "react";
import { useHookstate, State } from "@hookstate/core";
import { globalState } from "./globalState";
import Button from "react-bootstrap/Button";
import Card from "react-bootstrap/Card";
import Table from "react-bootstrap/Table";
import Nav from "react-bootstrap/Nav";
import draftToHtml from "draftjs-to-html";
import CommentCard from "./CommentCard";
import ReactHtmlParser from "react-html-parser";
import {
  IFile,
  IProject,
  IBuildStep,
  IUser,
  IComment,
  SideNavType,
} from "./types";
import { localizeDateTime, downloadBlob, humanFileSize } from "./helpers";
import { Storage } from "aws-amplify";
import {
  Link,
  NavLink,
  Switch,
  Route,
  useRouteMatch,
  useHistory,
} from "react-router-dom";
import {
  getProject,
  likeProject,
  unlikeProject,
  collectProject,
  uncollectProject,
} from "./agent";

import { default as MContainer } from "@material-ui/core/Container";
import Typography from "@material-ui/core/Typography";
import Paper from "@material-ui/core/Paper";
import { default as MLink } from "@material-ui/core/Link";
import { makeStyles } from "@material-ui/core/styles";
import { default as MCarousel } from "react-material-ui-carousel";
import { default as MButton } from "@material-ui/core/Button";
import ThumbUpIcon from "@material-ui/icons/ThumbUp";
import CollectionsIcon from "@material-ui/icons/Collections";
import Divider from "@material-ui/core/Divider";
import SideNav from "./SideNav";

// Page styles
const useStyles = makeStyles((theme) => ({
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
}));

// If the URL doesn't have the category, then default it to the description category
function defaultCategory(url: any, pathname: string) {
  const categories = ["/description", "/comments", "/files", "/build-log"];
  if (new RegExp(categories.join("|")).test(pathname)) {
    // At least one match
    return pathname;
  } else {
    return `${url}/description`;
  }
}

function Project(props: any) {
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
  let { path } = useRouteMatch();
  const project = useHookstate(props.project);
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

  return (
    <div className={classes.content}>
      <SideNav />
      <MContainer maxWidth="md">
        <Typography variant="h5">{project.title.value}</Typography>
        <Typography variant="subtitle1">
          Created by: <MLink>{project.user.username.value}</MLink> on{" "}
          {localizeDateTime(project.createdAt.value)}
        </Typography>
        <DisplayImages images={project.files} />
        <PillNav
          project={project}
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
              <Typography variant="h5">Description</Typography>
              <Divider className={classes.divider} />
              <CommentCard projectId={project.id.value} />
            </Paper>
          </Route>
          <Route path={`${path}/files`}>
            <Card>
              <Card.Body>
                <h3 className="border-bottom pb-2">Project Files</h3>
                <FileList files={props.project.files.value} />
              </Card.Body>
            </Card>
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
      </MContainer>
    </div>

    // <Container fluid className="container-xxl">
    //   <Row>
    //     <Col lg={8} className="ms-lg-auto px-md-4">
    //       <div className="pt-3 pb-2 mb-3">
    //         <h4>{props.project.title.get()}</h4>
    //         <div>
    //           Created By: <a href="#">Troy Joachim</a> on{" "}
    //           {localizeDateTime(props.project.createdAt.get())}
    //           <Button
    //             variant="primary"
    //             size="sm"
    //             className="float-right"
    //             as={Link}
    //             to={"/edit-project/" + props.project.id.get()}
    //           >
    //             Edit
    //           </Button>
    //         </div>
    //       </div>

    //       <Card>
    //         <DisplayImages images={props.project.files} />
    //       </Card>

    //       <PillNav
    //         project={project}
    //         filesDisabled={filesDisabled()}
    //         buildLogDisabled={buildLogDisabled()}
    //       />

    //     </Col>
    //   </Row>
    // </Container>
  );
}

function DisplayImages(props: { images: State<IFile[]> }) {
  const state = useHookstate(props.images);
  const classes = useStyles();

  // const loadingStyle = {
  //   margin: 0,
  //   position: "absolute",
  //   top: "50%",
  //   left: "45%",
  //   msTransform: "translateY(-50%)",
  //   transform: "translateY(-50%)",
  //   color: "#fff",
  // } as React.CSSProperties;

  const imageUrl = (identityId: string, key: string) =>
    "https://d1sam1rvgl833u.cloudfront.net/fit-in/0x400/protected/" +
    identityId +
    "/" +
    key;

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
  if (state.value && state.value.length > 1) {
    return (
      <MCarousel interval={10000}>
        {state
          .filter((file) => file.isImage.value === true)
          .map((file) => (
            <div
              className="bg-secondary"
              style={{
                height: "400px",
                position: "relative",
              }}
            >
              <img
                src={imageUrl(file.identityId.value, file.key.value)}
                className={classes.image}
              />
            </div>
          ))}
      </MCarousel>
    );
  } else {
    return (
      <div
        className="bg-secondary"
        style={{ height: "400px", position: "relative" }}
      >
        <img
          src={
            state.length > 0
              ? imageUrl(state[0].get().identityId, state[0].get().key)
              : ""
          }
          className={classes.image}
        />
      </div>
    );
  }
}

function PillNav(props: {
  project: State<IProject>;
  filesDisabled: boolean;
  buildLogDisabled: boolean;
}) {
  let { url } = useRouteMatch();
  const gState = useHookstate(globalState);
  const project = useHookstate(props.project);
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

  return (
    <div className={classes.centerPageNav}>
      <MButton
        color="primary"
        component={NavLink}
        to={`${url}/description`}
        activeClassName={classes.active}
      >
        Description
      </MButton>
      <MButton
        color="primary"
        component={NavLink}
        to={`${url}/comments`}
        replace
      >
        Comments
      </MButton>
      <MButton
        color="primary"
        component={NavLink}
        to={`${url}/files`}
        replace
        disabled={props.filesDisabled}
      >
        Files
      </MButton>
      <MButton
        color="primary"
        component={NavLink}
        to={`${url}/build-log`}
        replace
        disabled={props.buildLogDisabled}
      >
        Build Steps
      </MButton>
      <MButton color="primary" onClick={() => handleLike(project.id.value)}>
        <ThumbUpIcon className={classes.pageNavIcon} />{" "}
        {project.liked.value ? "Liked" : "Like"}
      </MButton>
      <MButton color="primary" onClick={() => handleCollect(project.id.value)}>
        <CollectionsIcon className={classes.pageNavIcon} />{" "}
        {project.collected.value ? "Collected" : "Collect"}
      </MButton>
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
  // Hides the table if there are no files
  const tableHidden = props.files.length > 0 ? "" : "d-none";

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
        <tr key={i}>
          <td>{file.fileName}</td>
          <td>{humanFileSize(file.size)}</td>
          <td>
            <Button
              variant="success"
              size="sm"
              className="float-right"
              onClick={() =>
                downloadFile(file.key, file.identityId, file.fileName)
              }
            >
              <i className="fas fa-download"></i>
            </Button>
          </td>
        </tr>
      ));
    return tableRow;
  }

  return (
    <div className="mt-4">
      <Table responsive hover size="sm" className={tableHidden}>
        <thead className="thead-light">
          <tr>
            <th>File Name</th>
            <th>Size</th>
            <th className="text-right">Download</th>
          </tr>
        </thead>
        <tbody>{fileList()}</tbody>
      </Table>
      <Button variant="primary" className={"float-right " + tableHidden}>
        <i className="fas fa-download mr-1"></i>Download all
      </Button>
    </div>
  );
}

function ImageCard(props: { buildStep: State<IBuildStep> }) {
  const category = useHookstate("img-desc");
  const buildStep = useHookstate(props.buildStep);

  function imageCardCategory() {
    switch (category.get()) {
      case "img-comments":
        return <CommentCard buildStepId={buildStep.id.value} />;

      case "img-files":
        return <ImageCardFiles files={props.buildStep.files.value} />;

      default:
        return <Description text={props.buildStep.description.value} />;
    }
  }

  return (
    <Card className="mb-5">
      <DisplayImages images={props.buildStep.files} />
      <Card.Body>
        <Nav variant="tabs" className="my-2" defaultActiveKey="img-desc">
          <Nav.Item>
            <Nav.Link
              eventKey="img-desc"
              onClick={() => category.set("img-desc")}
            >
              Description
            </Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link
              eventKey="img-comments"
              onClick={() => category.set("img-comments")}
            >
              Comments
            </Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link
              eventKey="img-files"
              onClick={() => category.set("img-files")}
            >
              Files
            </Nav.Link>
          </Nav.Item>
        </Nav>
        {imageCardCategory()}
      </Card.Body>
    </Card>
  );
}

function ImageCardFiles(props: { files: IFile[] }) {
  return <FileList files={props.files} />;
}

export default Project;
