import React, { useEffect } from "react";
import { useHookstate, State } from "@hookstate/core";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Card from "react-bootstrap/Card";
import Button from "react-bootstrap/Button";
import ButtonGroup from "react-bootstrap/ButtonGroup";
import { Link, useHistory } from "react-router-dom";
import avatar from "./images/empty-avatar.png";
import { getProjects, likeProject, unlikeProject } from "./agent";
import { IHomeProject } from "./types";
import { Storage } from "aws-amplify";
import { globalState } from "./globalState";

function Home() {
  const projects = useHookstate<IHomeProject[]>([]);
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
    // TODO: Map projectArr
    <Container id="home_page_main_container" className="container-xxl py-5">
      <Row>
        <Col className="home_page_col">{projectList()}</Col>
      </Row>
    </Container>
  );
}

function ProjectCard(props: { project: State<IHomeProject> }) {
  const project = useHookstate(props.project);
  const gState = useHookstate(globalState);
  const avatarUrl = useHookstate("");
  useEffect(() => {
    // Get the image if it's not already saved in state.
    if (project.image.value != null && !project.imageUrl.value) {
      // Get the project image from S3
      // Storage.get(state.image.key.value, {
      //   level: "protected",
      //   identityId: state.image.identityId.value,
      // })
      //   .then((url: any) => {
      //     state.imageUrl.set(url);
      //   })
      //   .catch((error) => console.log(error));
    }
    if (!avatarUrl.value) {
      // Get the project image from S3
      Storage.get("user-avatar.png", {
        level: "protected",
        identityId: project.user.identityId.value,
      })
        .then((url: any) => {
          avatarUrl.set(url);
        })
        .catch((error) => console.log(error));
    }
  }, [project.image.value]);

  const history = useHistory();
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

  async function handleLike(projectId: number) {
    // Check if the user is signed in, if not then send them to the sign-in page.
    if (!gState.isAuthenticated.value) {
      console.log("User not signed in")
      history.push("/sign-in");
      return;
    }
    // Make sure we have the identityId
    if (!gState.identityId.value) return;

    if (!project.liked.value) {
      const response = await likeProject(projectId, gState.identityId.value);

      if (response && response.status === 204) {
        console.log("Project Liked", projectId);
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

  const imageUrl =
    project.image.key && project.image.key.value
      ? "https://d1sam1rvgl833u.cloudfront.net/fit-in/300x169/protected/" +
        project.image.identityId.value +
        "/" +
        project.image.key.value
      : "";

  return (
    <Card
      className="m-2 d-inline-block"
      style={{ width: "301px", height: "300px" }}
    >
      <div
        className="bg-secondary"
        style={{
          width: "300px",
          height: "169px",
          position: "relative",
        }}
        onClick={() => history.push("/project/" + project.id.get())}
      >
        <img src={imageUrl} style={imgStyle} />
      </div>
      <Card.Body className="home-card-body">
        <h6>
          <a href="#" className="mr-1">
            <img
              className="card-avatar"
              src={avatarUrl.value ? avatarUrl.value : avatar}
            />
          </a>
          <Link
            to={"/project/" + project.id.get()}
            className="align-middle home-project-title"
          >
            {project.title.get()}
          </Link>
        </h6>

        <ButtonGroup className="ml-1 mt-3">
          <Button variant="outline-primary">
            <i className="fas fa-share-alt mr-1" aria-hidden="true"></i>
            Share
          </Button>
          <Button variant="outline-primary">
            <i className="fas fa-archive mr-1" aria-hidden="true"></i>
            Collect
          </Button>
          <Button
            variant={project.liked.value ? "outline-success" : "outline-primary"}
            onClick={() => handleLike(project.id.value)}
          >
            <i className="fas fa-thumbs-up mr-1" aria-hidden="true"></i>
            {project.liked.value ? "Liked" : "Like"}
          </Button>
        </ButtonGroup>
      </Card.Body>
    </Card>
  );
}

export default Home;
