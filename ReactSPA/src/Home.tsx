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
import { getProjects, getImage } from "./agent";
import { IHomeProject, IS3Image } from "./types";
import { Storage } from "aws-amplify";

function Home() {
    const projects = useHookstate<IHomeProject[]>([]);
    useEffect(() => {
        // getProjects().then((response) => {
        //     if (response && response.status === 200) {
        //         const projectsResp = response.data.map((project) => {
        //             return {
        //                 id: project.id,
        //                 name: project.name,
        //                 sub_category: project.sub_category,
        //                 images: project.images,
        //                 image: "",
        //             };
        //         });
        //         projects.set(projectsResp);
        //     }
        // });
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
    const state = useHookstate(props.project);
    useEffect(() => {
        // Get the image if it's not already saved in state.
        if (!state.image.get()) {
            // TODO: aws s3 image upload stuff
            // const mainImage: IS3Image = JSON.parse(project.images[0]);

            // const signedUrl = await Storage.get(mainImage.key, {
            //     level: "protected",
            //     identityId: mainImage.id,
            // });

            // Just get the first image for now.
            getImage(state.images[0].get()).then((response) => {
                if (response && response.status == 200) {
                    const objectURL = URL.createObjectURL(response.data);
                    state.image.set(objectURL);

                    console.log("Got project image from server.");
                }
            });
        }
    }, [state]);

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

    return (
        <Card
            className="m-2 d-inline-block"
            style={{ width: "301px", height: "325px" }}
        >
            <div
                className="bg-secondary"
                style={{
                    width: "300px",
                    height: "169px",
                    position: "relative",
                }}
                onClick={() =>
                    history.push("/project/" + props.project.id.get())
                }
            >
                <img src={props.project.image.get()} style={imgStyle} />
            </div>
            <Card.Body>
                <a href="#" className="mr-1">
                    <img className="card-avatar" src={avatar} />
                </a>
                <Link to={"/project/" + props.project.id.get()}>
                    <h6 className="d-inline-block mb-auto align-middle ms-2">
                        {props.project.name.get()}
                    </h6>
                </Link>
                <ButtonGroup className="ml-1 mt-5">
                    <Button variant="outline-primary">
                        <i
                            className="fas fa-share-alt mr-1"
                            aria-hidden="true"
                        ></i>
                        Share
                    </Button>
                    <Button variant="outline-primary">
                        <i
                            className="fas fa-archive mr-1"
                            aria-hidden="true"
                        ></i>
                        Collect
                    </Button>
                    <Button variant="outline-primary">
                        <i
                            className="fas fa-thumbs-up mr-1"
                            aria-hidden="true"
                        ></i>
                        Like
                    </Button>
                </ButtonGroup>
            </Card.Body>
        </Card>
    );
}

export default Home;
