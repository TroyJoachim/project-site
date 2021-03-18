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
import { getProject, downloadFile, getImage } from "./agent";
import { IFile, IProjectModel, IBuildStepModel, LoadingState } from "./types";
import { localizeDateTime } from "./helpers";
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
  const emptyProject: IProjectModel = {
    id: "",
    name: "",
    subcategory_id: "",
    subcategory: "", // Temporary, need to update api to subcategory_id
    description: "",
    creation_datetime: "",
    image_ids: [],
    image_urls: [],
    file_attachments: [],
    build_steps: [],
  };
  const project = useHookstate<IProjectModel>(emptyProject);

  useEffect(() => {
    getProject(props.match.params.id).then((response) => {
      if (!response) return;
      if (response.status === 200 && response.data) {
        const p = response.data;

        // Convert build step response into page model
        const buildStepPromiseArr = p.build_steps.map(async (bs) => {
          return {
            order: 0,
            name: bs.name,
            description: bs.description,
            image_ids: bs.image_ids,
            image_urls: [],
            file_attachments: bs.file_attachments,
          };
        });

        Promise.all(buildStepPromiseArr).then((buildSteps) => {
          const convertProject = {
            id: p.id,
            name: p.name,
            subcategory_id: p.subcategory_id,
            subcategory: p.subcategory,
            description: p.description,
            creation_datetime: p.creation_datetime,
            image_ids: p.image_ids,
            image_urls: [],
            file_attachments: p.file_attachments,
            build_steps: buildSteps,
          };
          project.set(convertProject);
        });
      }
    });
  }, []); // Note: Empty array at the end ensures that this is only performed once during mount

  return <MainContentArea project={project} />;
}

function MainContentArea(props: { project: State<IProjectModel> }) {
  let { path } = useRouteMatch();

  return (
    <Container fluid className="container-xxl">
      <Row>
        <PageSideNav
          //buildSteps={props.project.build_steps.map((bs) => bs.name)}
          sideNavType={SideNavType.Project}
        />
        <Col lg={8} className="ms-lg-auto px-md-4">
          <div className="d-flex flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
            <h2>{props.project.name.get()}</h2>
            <div className="ml-auto">
              Created By: <a href="#">Troy Joachim</a> on{" "}
              {localizeDateTime(props.project.creation_datetime.get())}
              <Button
                variant="primary"
                size="sm"
                className="ml-2 mb-2"
                as={Link}
                to={"/edit-project/" + props.project.id.get()}
              >
                Edit
              </Button>
            </div>
          </div>

          <Card>
            <DisplayImages
              imageIds={props.project.image_ids.get()}
              imageUrls={props.project.image_urls}
            />
          </Card>

          <PillNav />

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
                  <FileList files={props.project.file_attachments.get()} />
                </Card.Body>
              </Card>
            </Route>
            <Route path={`${path}/build-log`}>
              <BuildLog buildSteps={props.project.build_steps} />
            </Route>
          </Switch>
        </Col>
      </Row>
    </Container>
  );
}

function DisplayImages(props: {
  imageIds: string[];
  imageUrls: State<string[]>;
}) {
  const state = useHookstate(props.imageUrls);
  const loadingState = useHookstate(LoadingState.Loading);
  useEffect(() => {
    // Get images if it's not already saved in state.
    if (state.get().length === 0) {
      console.log("Getting images from server");
      const imagesPromiseArr = props.imageIds.map(async (id: string) => {
        // TODO: better error handling if getImage fails
        let objectURL = "";
        const response = await getImage(id);
        if (response) {
          objectURL = URL.createObjectURL(response.data);
        }
        return objectURL;
      });
      Promise.all(imagesPromiseArr)
        .then((response) => {
          state.set(response);
          loadingState.set(LoadingState.Completed);
        })
        .catch((err) => {
          console.log("DisplayImages getImage error:", err);
          loadingState.set(LoadingState.Failed);
        });
    }
    console.log("Already have images");
    loadingState.set(LoadingState.Completed);
  }, [props.imageIds]);

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

  const loadingStyle = {
    margin: 0,
    position: "absolute",
    top: "50%",
    left: "45%",
    msTransform: "translateY(-50%)",
    transform: "translateY(-50%)",
    color: "#fff",
  } as React.CSSProperties;

  if (loadingState.get() === LoadingState.Loading) {
    return (
      <div
        className="bg-secondary"
        style={{ height: "400px", position: "relative" }}
      >
        <div style={loadingStyle}>
          <Spinner className="m-1" animation="grow" />
          <Spinner className="m-1" animation="grow" />
          <Spinner className="m-1" animation="grow" />
        </div>
      </div>
    );
  }
  if (loadingState.get() === LoadingState.Failed) {
    return <div>Error loading image</div>;
  }
  if (state.get().length > 1) {
    return (
      <Carousel>
        {state.get().map((imageUrl) => (
          <Carousel.Item>
            <div
              className="bg-secondary"
              style={{
                height: "400px",
                position: "relative",
              }}
            >
              <img src={imageUrl} style={imgStyle} />
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
        <img src={state[0].get()} style={imgStyle} />
      </div>
    );
  }
}

function PillNav() {
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

function BuildLog(props: { buildSteps: State<IBuildStepModel[]> }) {
  const buildStepArr = props.buildSteps.map((bs, index) => (
    <ImageCard key={index} buildStep={bs} />
  ));

  return <>{buildStepArr}</>;
}

function Description(props: { text: string }) {
  function parseHtml() {
    if (props.text) {
      const json = JSON.parse(props.text);
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

//   function fileList() {
//     const tableRow = props.files.map((file: IFile, i) => (
//       <tr key={i}>
//         <td>{file.file_name}</td>
//         <td>TODO</td>
//         <td>
//           <Button
//             variant="success"
//             size="sm"
//             className="float-right"
//             onClick={() => downloadFile(file.link, file.file_name)}
//           >
//             <i className="fas fa-download"></i>
//           </Button>
//         </td>
//       </tr>
//     ));

//     return tableRow;
//   }

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
        {/* <tbody>{fileList()}</tbody> */}
      </Table>
      <Button variant="primary" className={"float-right " + tableHidden}>
        <i className="fas fa-download mr-1"></i>Download all
      </Button>
    </div>
  );
}

function ImageCard(props: { buildStep: State<IBuildStepModel> }) {
  let category = useHookstate("img-desc");

  function imageCardCategory() {
    switch (category.get()) {
      case "img-comments":
        return <ImageCardComments />;

      case "img-files":
        return (
          <ImageCardFiles files={props.buildStep.file_attachments.get()} />
        );

      default:
        return <Description text={props.buildStep.description.get()} />;
    }
  }

  return (
    <Card className="mb-5">
      <DisplayImages
        imageIds={props.buildStep.image_ids.get()}
        imageUrls={props.buildStep.image_urls}
      />
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
