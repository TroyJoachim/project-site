import React, { useEffect } from "react";
import { useHookstate } from "@hookstate/core";
import { Link } from "react-router-dom";
import Navbar from "react-bootstrap/Navbar";
import Nav from "react-bootstrap/Nav";
import NavDropdown from "react-bootstrap/NavDropdown";
import Form from "react-bootstrap/Form";
import { getProjectCategories } from "./agent";
import { ICategory } from "./types";
import { globalState, signOut } from "./globalState";

function TopNav() {
  const categories = useHookstate<ICategory[]>([]);
  const gState = useHookstate(globalState);

  useEffect(() => {
    // getProjectCategories().then((response) => {
    //   if (response && response.status === 200) {
    //     categories.set(response.data);
    //   }
    // });
  }, []); // Note: Empty array at the end ensures that this is only performed once during mount

  function buildCategoryDropdown() {
    function mapSubcategories(subcats: ICategory[]) {
      return subcats.map((sc, i) => (
        <NavDropdown.Item key={sc.name + i.toString()}>
          {sc.name}
        </NavDropdown.Item>
      ));
    }

    return categories.map((cat, i) => [
      <NavDropdown.Item key={i} className="bg-light font-weight-bold">
        {cat.name.get()}
      </NavDropdown.Item>,
      mapSubcategories(cat.subcategories.get()),
    ]);
  }

  function signInLink() {
    if (gState.isAuthenticated.get()) {
      return (
        <NavDropdown id="user_account_dropdown" title="Account" alignRight>
          <NavDropdown.Item as={Link} to={"/my-account/" + gState.username.get()}>
            My Account
          </NavDropdown.Item>
          <NavDropdown.Item onClick={signOut}>Sign Out</NavDropdown.Item>
        </NavDropdown>
      );
    } else {
      return (
        <Nav.Link as={Link} to="/sign-in" className="text-nowrap">
          Sign In
        </Nav.Link>
      );
    }
  }

  return (
    <Navbar expand="lg" className="main_navbar">
      <Navbar.Brand as={Link} className="mx-auto" to="/">
        React-Bootstrap
      </Navbar.Brand>
      <Navbar.Toggle aria-controls="basic-navbar-nav" />
      <Navbar.Collapse id="basic-navbar-nav">
        <Nav className="mr-auto">
          <NavDropdown title="Categories" id="basic-nav-dropdown">
            {buildCategoryDropdown()}
          </NavDropdown>
        </Nav>
        <Form className="mx-2 my-auto d-inline w-100">
          <Form.Control type="text" placeholder="Search" />
        </Form>
        <Nav className="ml-auto">
          <Nav.Link as={Link} to="/create-project">
            Create
          </Nav.Link>
          {signInLink()}
        </Nav>
      </Navbar.Collapse>
    </Navbar>
  );
}

export default TopNav;
