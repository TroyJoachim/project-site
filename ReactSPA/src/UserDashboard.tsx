import React from "react";
import Card from 'react-bootstrap/Card';
import Container from 'react-bootstrap/Container';
import Button from 'react-bootstrap/Button';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import Navbar from 'react-bootstrap/Navbar';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Nav from 'react-bootstrap/Nav';
import {
    Link,
    Switch,
    Route,
    useRouteMatch,
    useLocation,
} from "react-router-dom";


// If the URL doesn't have the category, then default it to the my-projects category
function defaultCategory(url: any, pathname: string) {
    const categories = [ "/my-projects", "/collections", "/likes" ]
    if (new RegExp(categories.join("|")).test(pathname)) {
        // At least one match
        return pathname
    } else {
        return `${url}/my-projects`
    }
}

function UserDashboard() {
    return (
        <div>
            <TopNav />
            <MainContentArea />
        </div>
    )
}

function TopNav() {
    let { url } = useRouteMatch();
    const location = useLocation();

    return (
        <Navbar sticky="top" id="project-page-top-nav" className="project_page_top_nav">
            <Nav variant="pills" activeKey={defaultCategory(url, location.pathname)}>
                <Nav.Item>
                    <Nav.Link eventKey={`${url}/my-projects`} as={Link} to={`${url}/my-projects`}>
                        My Projects
                    </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                    <Nav.Link eventKey={`${url}/collections`} as={Link} to={`${url}/collections`}>
                        Collections
                    </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                    <Nav.Link eventKey={`${url}/likes`} as={Link} to={`${url}/likes`}>
                        Likes
                    </Nav.Link>
                </Nav.Item>
            </Nav>
        </Navbar>
    )
}

function SideNav() {
    const { url } = useRouteMatch();
    const location = useLocation();

    return (
        <Col md={3} lg={2} id="project-page-side-nav" className="sidebar d-lg-block collapse">
            <div className="sticky-top pt-3">
                <Nav className="flex-column" activeKey={defaultCategory(url, location.pathname)}>
                    <Nav.Link eventKey={`${url}/my-projects`} as={Link} to={`${url}/my-projects`}>
                        My Projects
                    </Nav.Link>
                    <Nav.Link eventKey={`${url}/collections`} as={Link} to={`${url}/collections`}>
                        Collections
                    </Nav.Link>
                    <Nav.Link eventKey={`${url}/likes`} as={Link} to={`${url}/likes`}>
                        Likes
                    </Nav.Link>
                </Nav>
            </div>
        </Col>
    )
}

function MainContentArea() {
    let { path } = useRouteMatch();

    return(
        <Container fluid className="container-xxl">
            <Row>
                <SideNav />
                <Col md={9} lg={10} className="ms-lg-auto px-md-4">
                    <Switch>
                        <Route exact path={path}>
                            <MyProjects />
                        </Route>
                        <Route path={`${path}/my-projects`}>
                            <MyProjects />
                        </Route>
                        <Route path={`${path}/collections`}>
                            <Collections />
                        </Route>
                        <Route path={`${path}/likes`}>
                            <Likes />
                        </Route>
                    </Switch>
                </Col>
            </Row>
        </Container>
    )
};

function MyProjects() {
    return(
        <div>
            <div className="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
                <h2>My Projects</h2>
            </div>
            <ProjectCard />
            <ProjectCard />
            <ProjectCard />
            <ProjectCard />
            <ProjectCard />
        </div>
    )
}

function Collections() {
    return(
        <div>
            <div className="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
                <h2>Collections</h2>
            </div>
            <ProjectCard />
            <ProjectCard />
            <ProjectCard />
        </div>
    )
}

function Likes() {
    return(
        <div>
            <div className="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
                <h2>Likes</h2>
            </div>
            <ProjectCard />
            <ProjectCard />
        </div>
    )
}

function ProjectCard() {
    return (
        <Card className="m-2 d-inline-block" style={{ width: '301px', height: "400px" }}>
            <div className="bg-secondary" style={{ width: "300px", height: "200px" }}></div>
            <Card.Body>
                <a href="#" className="mr-1"><img className="card-avatar" src="http://127.0.0.1:8000/public/images/empty-avatar.png" /></a>
                <Link to="/project/1"><h6 className="d-inline-block mb-auto align-middle ms-2">Example Project Name</h6></Link>
                <Card.Text className="mt-2">
                    Some quick example text to build on the card title and make up the bulk of
                    the card's content.
                </Card.Text>
                <ButtonGroup className="ml-1 mt-1">
                    <Button variant="outline-primary"><i className="fas fa-share-alt mr-1" aria-hidden="true"></i>Share</Button>
                    <Button variant="outline-primary"><i className="fas fa-archive mr-1" aria-hidden="true"></i>Collect</Button>
                    <Button variant="outline-primary"><i className="fas fa-thumbs-up mr-1" aria-hidden="true"></i>Like</Button>
                </ButtonGroup>
            </Card.Body>
        </Card>
    )
}

export default UserDashboard;