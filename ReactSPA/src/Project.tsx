import React, { useEffect } from "react";
import { useHookstate, State } from "@hookstate/core";
import Button from "react-bootstrap/Button";
import Card from "react-bootstrap/Card";
import Carousel from "react-bootstrap/Carousel";
import Spinner from "react-bootstrap/Spinner";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Table from "react-bootstrap/Table";
import Nav from "react-bootstrap/Nav";
import draftToHtml from "draftjs-to-html";
import CommentCard from "./CommentCard";
import ReactHtmlParser from "react-html-parser";
import { PageSideNav, SideNavType } from "./PageSideNav";
import { getProject } from "./agent";
import { IFile, IProject, IBuildStep, IUser } from "./types";
import { localizeDateTime, downloadBlob, humanFileSize } from "./helpers";
import { Storage } from "aws-amplify";
import {
  Link,
  Switch,
  Route,
  useRouteMatch,
  useLocation,
} from "react-router-dom";

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
    id: 0,
    title: "",
    description: "",
    category: "",
    categoryId: 0,
    createdAt: "",
    editedAt: "",
    images: [],
    uploadedImages: [],
    files: [],
    uploadedFiles: [],
    buildSteps: [],
    user: initUser,
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
    <Container fluid className="container-xxl">
      <Row>
        <PageSideNav
          buildSteps={props.project.buildSteps}
          sideNavType={SideNavType.Project}
        />
        <Col lg={8} className="ms-lg-auto px-md-4">
          <div className="pt-3 pb-2 mb-3">
            <h4>{props.project.title.get()}</h4>
            <div>
              Created By: <a href="#">Troy Joachim</a> on{" "}
              {localizeDateTime(props.project.createdAt.get())}
              <Button
                variant="primary"
                size="sm"
                className="float-right"
                as={Link}
                to={"/edit-project/" + props.project.id.get()}
              >
                Edit
              </Button>
            </div>
          </div>

          <Card>
            <DisplayImages images={props.project.files} />
          </Card>

          <PillNav
            filesDisabled={filesDisabled()}
            buildLogDisabled={buildLogDisabled()}
          />

          <Switch>
            <Route exact path={path}>
              <Card>
                <Card.Body>
                  <h3 className="border-bottom pb-2">Description</h3>
                  <Description text={props.project.description.get()} />
                </Card.Body>
              </Card>
            </Route>
            <Route path={`${path}/description`}>
              <Card>
                <Card.Body>
                  <h3 className="border-bottom pb-2">Description</h3>
                  <Description text={props.project.description.get()} />
                </Card.Body>
              </Card>
            </Route>
            <Route path={`${path}/comments`}>
              <Card>
                <Card.Body>
                  <h3 className="border-bottom pb-2">Comments</h3>
                  <CommentCard />
                </Card.Body>
              </Card>
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
                <BuildLog buildSteps={props.project.buildSteps} />
              ) : (
                <></>
              )}
            </Route>
          </Switch>
        </Col>
      </Row>
    </Container>
  );
}

function DisplayImages(props: { images: State<IFile[]> }) {
  const state = useHookstate(props.images);

  // Image style that keeps all the different size images inside the parent div.
  // Need to make sure that the parent div is set to position relative.
  const imgStyle = {
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
  } as React.CSSProperties;

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
      <Carousel>
        {state
          .filter((file) => file.isImage.value === true)
          .map((file) => (
            <Carousel.Item>
              <div
                className="bg-secondary"
                style={{
                  height: "400px",
                  position: "relative",
                }}
              >
                <img
                  src={imageUrl(file.identityId.value, file.key.value)}
                  style={imgStyle}
                />
              </div>
            </Carousel.Item>
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
            state.length > 0
              ? imageUrl(state[0].get().identityId, state[0].get().key)
              : ""
          }
          style={imgStyle}
        />
      </div>
    );
  }
}

function PillNav(props: { filesDisabled: boolean; buildLogDisabled: boolean }) {
  let { url } = useRouteMatch();
  const location = useLocation();

  return (
    <Nav
      variant="pills"
      activeKey={defaultCategory(url, location.pathname)}
      className="p-3"
    >
      <Nav.Item>
        <Nav.Link
          eventKey={`${url}/description`}
          as={Link}
          to={`${url}/description`}
          replace
        >
          Description
        </Nav.Link>
      </Nav.Item>
      <Nav.Item>
        <Nav.Link
          eventKey={`${url}/comments`}
          as={Link}
          to={`${url}/comments`}
          replace
        >
          Comments
        </Nav.Link>
      </Nav.Item>
      <Nav.Item>
        <Nav.Link
          eventKey={`${url}/files`}
          as={Link}
          to={`${url}/files`}
          replace
          disabled={props.filesDisabled}
        >
          files
        </Nav.Link>
      </Nav.Item>
      <Nav.Item>
        <Nav.Link
          eventKey={`${url}/build-log`}
          as={Link}
          to={`${url}/build-log`}
          replace
          disabled={props.buildLogDisabled}
        >
          Build Log
        </Nav.Link>
      </Nav.Item>
      <Nav.Item>
        <Nav.Link>
          <i className="fas fa-thumbs-up"></i> Like
        </Nav.Link>
      </Nav.Item>
      <Nav.Item>
        <Nav.Link>
          <i className="fas fa-archive"></i> Collect
        </Nav.Link>
      </Nav.Item>
    </Nav>
  );
}

function BuildLog(props: { buildSteps: State<IBuildStep[]> }) {
  const buildStepArr = props.buildSteps.map((bs, index) => (
    <ImageCard key={index} buildStep={bs} />
  ));

  return <>{buildStepArr}</>;
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
  let category = useHookstate("img-desc");

  function imageCardCategory() {
    switch (category.get()) {
      case "img-comments":
        return <ImageCardComments />;

      case "img-files":
        return <ImageCardFiles files={props.buildStep.files.get()} />;

      default:
        return <Description text={props.buildStep.description.get()} />;
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

function ImageCardComments() {
  return <CommentCard />;
}

function ImageCardFiles(props: { files: IFile[] }) {
  return <FileList files={props.files} />;
}

export default Project;
