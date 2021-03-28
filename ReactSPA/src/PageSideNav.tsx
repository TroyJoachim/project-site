import React from "react";
import Button from "react-bootstrap/Button";
import Col from "react-bootstrap/Col";
import Nav from "react-bootstrap/Nav";
import { useHookstate, State } from "@hookstate/core";
import { Link, useRouteMatch, useLocation } from "react-router-dom";
import { IBuildStep } from "./types";

export enum SideNavType {
  Project,
  CreateProject,
  EditProject,
}

function PageSideNav(props: {
  buildSteps: State<IBuildStep[]>;
  sideNavType: SideNavType;
}) {
  const state = useHookstate(props.buildSteps);
  const menuOpen = useHookstate(false);
  const { url } = useRouteMatch();
  const location = useLocation();

  // Removes the dash if there is no description
  const name = (stepName: string, index: number) =>
    stepName !== "" ? stepName : "Step " + (index + 1).toString();

  const steps = state.map((step, index) => (
    <Nav.Link key={index} className="ml-4 border-left">
      Step {name(step.title.value, index)}
    </Nav.Link>
  ));

  const openBtnStyle = {
    position: "fixed",
    top: 6,
    zIndex: 10,
    borderRadius: "0 5px 5px 0",
    height: "45px",
  } as React.CSSProperties;

  const menuOpenStyle = {
    width: "250px",
    zIndex: 100,
  } as React.CSSProperties;

  const menuCloseStyle = {
    width: 0,
    zIndex: 100,
  } as React.CSSProperties;

  const closeBtn = {
    position: "absolute",
    top: 0,
    right: "10px",
    fontSize: "36px",
    marginLeft: "50px",
    color: "#e8e8e8",
    textDecoration: "none",
  } as React.CSSProperties;

  const pageMenuStyle = {
    display: "block",
  } as React.CSSProperties;

  function menuStyle() {
    return menuOpen.get() ? menuOpenStyle : menuCloseStyle;
  }

  // If the URL doesn't have the category, then default it to the description category
  function defaultCategory(url: any, pathname: string) {
    const categories = [
      "/main",
      "/description",
      "/comments",
      "/files",
      "/build-log",
    ];
    if (new RegExp(categories.join("|")).test(pathname)) {
      // At least one match
      return pathname;
    } else {
      if (props.sideNavType === SideNavType.Project) {
        return `${url}/description`;
      } else {
        return `${url}/main`;
      }
    }
  }

  function menuItems() {
    if (props.sideNavType === SideNavType.Project) {
      return (
        <>
          <Nav.Link
            eventKey={`${url}/description`}
            as={Link}
            to={`${url}/description`}
            replace
          >
            Description
          </Nav.Link>
          <Nav.Link
            eventKey={`${url}/comments`}
            as={Link}
            to={`${url}/comments`}
            replace
          >
            Comments
          </Nav.Link>
          <Nav.Link
            eventKey={`${url}/files`}
            as={Link}
            to={`${url}/files`}
            replace
          >
            Files
          </Nav.Link>
        </>
      );
    } else {
      return (
        <Nav.Link eventKey={`${url}/main`} as={Link} to={`${url}/main`} replace>
          Main
        </Nav.Link>
      );
    }
  }

  return (
    <>
      <Button
        id="page-menu-open-btn"
        variant="secondary"
        size="sm"
        style={openBtnStyle}
        onClick={() => menuOpen.set(!menuOpen.get())}
      >
        <i className="fas fa-chevron-right"></i>
      </Button>
      <Col
        md={3}
        lg={2}
        id="project-page-side-nav"
        className="sidebar d-lg-block"
        style={menuStyle()}
      >
        <button
          id="page-menu-close-btn"
          className="btn btn-link"
          style={closeBtn}
          type="button"
          onClick={() => menuOpen.set(!menuOpen.get())}
        >
          X
        </button>
        <div className="sticky-top pt-3">
          <Nav
            id="page-menu"
            style={pageMenuStyle}
            activeKey={defaultCategory(url, location.pathname)}
          >
            {menuItems()}
            <Nav.Link
              eventKey={`${url}/build-log`}
              as={Link}
              to={`${url}/build-log`}
              replace
            >
              Build Log
            </Nav.Link>
            {steps}
          </Nav>
        </div>
      </Col>
    </>
  );
}

export { PageSideNav };
