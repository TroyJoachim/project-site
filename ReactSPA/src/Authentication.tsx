import React from "react";
import Auth from "@aws-amplify/auth";
import Amplify from "aws-amplify";
import { AmplifyAuthenticator } from "@aws-amplify/ui-react";
import { useHistory } from "react-router-dom";
import { AuthState } from "@aws-amplify/ui-components";
import awsconfig from "./aws-exports";
import { createUser } from "./agent";

import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import ButtonGroup from "react-bootstrap/ButtonGroup";
import Button from "react-bootstrap/Button";
import Card from "react-bootstrap/Card";
import Form from "react-bootstrap/Form";
import { useHookstate } from "@hookstate/core";
import { Formik } from "formik";
import * as yup from "yup";
import { Switch, Route, Link } from "react-router-dom";

Amplify.configure(awsconfig);

// function SignIn() {
//     const history = useHistory();

//     async function doWork() {
//         try {
//             // Get the user information and save it to our backend.
//             const user = await Auth.currentAuthenticatedUser();
//             if (!user) {
//                 console.log("signUp - no authenticated user found.");
//                 return;
//             }
//             const id = user.attributes.sub;
//             const username = user.attributes.username;

//             // Post the new user account to the API.
//             console.log("Creating user account on API");
//             const result = await createUser(id, username);
//             console.log(result);
//         } catch (error) {
//             console.log(error);
//             // TODO: handle error
//         }
//     }

//     const handleAuthStateChange = ((nextAuthState:any, authData:any) => {
//             console.log(nextAuthState);
//             console.log(authData);
//             if (nextAuthState === AuthState.SignedIn) {
//                 // Go back to the previous page on successful sign in.
//                 history.goBack();
//             }
//       });

//     return <AmplifyAuthenticator handleAuthStateChange={handleAuthStateChange} />;
// }

function Authentication() {
    return (
        <Container style={{ maxWidth: "700px" }}>
            <Row>
                <Col>
                    <Switch>
                        <Route path="/sign-in">
                            <SignIn />
                        </Route>
                        <Route path="/create-account">
                            <CreateAccount />
                        </Route>
                        <Route path="/confirm-account">
                            <ConfirmSignUp />
                        </Route>
                        <Route path="/forgot-password">
                            <ForgotPassword />
                        </Route>
                        <Route path="/new-password">
                            <NewPassword />
                        </Route>
                        <ForgotPassword />
                    </Switch>
                </Col>
            </Row>
        </Container>
    );
}

function SignIn() {
    interface Values {
        username: string;
        password: string;
    }
    const schema = yup.object().shape({
        username: yup.string().required(),
        password: yup.string().required(),
    });

    function handleSubmit(values: Values) {
        // Do work
        console.log(values);
    }

    return (
        <>
            <h2 className="my-4">Sign In</h2>
            <Card>
                <Card.Body>
                    <Formik
                        validationSchema={schema}
                        onSubmit={handleSubmit}
                        initialValues={{
                            username: "",
                            password: "",
                        }}
                    >
                        {({
                            handleSubmit,
                            handleChange,
                            handleBlur,
                            values,
                            touched,
                            isValid,
                            errors,
                        }) => (
                            <Form noValidate onSubmit={handleSubmit}>
                                <Form.Group controlId="username">
                                    <Form.Label>Username</Form.Label>
                                    <Form.Control
                                        type="text"
                                        placeholder="Enter Username"
                                        onChange={handleChange}
                                        value={values.username}
                                        isInvalid={!!errors.username}
                                    />
                                    <Form.Control.Feedback type="invalid">
                                        {errors.username}
                                    </Form.Control.Feedback>
                                </Form.Group>

                                <Form.Group controlId="password">
                                    <Form.Label>Password</Form.Label>
                                    <Form.Control
                                        type="password"
                                        placeholder="Enter Password"
                                        onChange={handleChange}
                                        value={values.password}
                                        isInvalid={!!errors.password}
                                    />
                                    <Form.Control.Feedback type="invalid">
                                        {errors.password}
                                    </Form.Control.Feedback>
                                </Form.Group>
                                <Form.Group controlId="forgot-password-text">
                                    <Form.Text className="text-muted">
                                        Forgot your password?{" "}
                                        <Link to="/forgot-password">
                                            Reset password
                                        </Link>
                                    </Form.Text>
                                </Form.Group>
                                <Button
                                    variant="primary"
                                    type="submit"
                                    className="float-right"
                                >
                                    SIGN IN
                                </Button>
                            </Form>
                        )}
                    </Formik>
                </Card.Body>
            </Card>
            <h5 className="my-3">
                No account? <Link to="/Create-account">Create account</Link>
            </h5>
        </>
    );
}

function CreateAccount() {
    interface Values {
        username: string;
        password: string;
        email: string;
    }
    const schema = yup.object().shape({
        username: yup.string().required(),
        password: yup
            .string()
            .required()
            .matches(
                /^(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})/,
                "Must Contain 8 Characters, One Number and One Special Case Character"
            ),
        email: yup.string().email("Invalid email address").required(),
    });

    function handleSubmit(values: Values) {
        // Do work
        console.log(values);
    }

    return (
        <>
            <h2 className="my-4">Create Account</h2>
            <Card>
                <Card.Body>
                    <Formik
                        validationSchema={schema}
                        onSubmit={handleSubmit}
                        initialValues={{
                            username: "",
                            password: "",
                            email: "",
                        }}
                    >
                        {({
                            handleSubmit,
                            handleChange,
                            handleBlur,
                            values,
                            touched,
                            isValid,
                            errors,
                        }) => (
                            <Form noValidate onSubmit={handleSubmit}>
                                <Form.Group controlId="username">
                                    <Form.Label>Username</Form.Label>
                                    <Form.Control
                                        type="text"
                                        placeholder="Enter Username"
                                        onChange={handleChange}
                                        value={values.username}
                                        isInvalid={!!errors.username}
                                    />
                                    <Form.Control.Feedback type="invalid">
                                        {errors.username}
                                    </Form.Control.Feedback>
                                </Form.Group>

                                <Form.Group controlId="password">
                                    <Form.Label>Password</Form.Label>
                                    <Form.Control
                                        type="password"
                                        placeholder="Enter Password"
                                        onChange={handleChange}
                                        value={values.password}
                                        isInvalid={!!errors.password}
                                    />
                                    <Form.Control.Feedback type="invalid">
                                        {errors.password}
                                    </Form.Control.Feedback>
                                </Form.Group>

                                <Form.Group controlId="email">
                                    <Form.Label>Email Address</Form.Label>
                                    <Form.Control
                                        type="email"
                                        placeholder="Enter Email"
                                        onChange={handleChange}
                                        value={values.email}
                                        isInvalid={!!errors.email}
                                    />
                                    <Form.Control.Feedback type="invalid">
                                        {errors.email}
                                    </Form.Control.Feedback>
                                </Form.Group>

                                <Button
                                    variant="primary"
                                    type="submit"
                                    className="float-right"
                                >
                                    CREATE ACCOUNT
                                </Button>
                            </Form>
                        )}
                    </Formik>
                </Card.Body>
            </Card>
            <h5 className="my-3">
                Have account? <Link to="/sign-in">Sign in</Link>
            </h5>
        </>
    );
}

function ConfirmSignUp() {
    interface Values {
        username: string;
        code: string;
    }
    const schema = yup.object().shape({
        username: yup.string().required(),
        code: yup.number().required(),
    });

    function handleSubmit(values: Values) {
        // Do work
        console.log(values);
    }

    return (
        <>
            <h2 className="my-4">Confirm Email</h2>
            <Card>
                <Card.Body>
                    <Formik
                        validationSchema={schema}
                        onSubmit={handleSubmit}
                        initialValues={{
                            username: "",
                            code: "",
                        }}
                    >
                        {({
                            handleSubmit,
                            handleChange,
                            handleBlur,
                            values,
                            touched,
                            isValid,
                            errors,
                        }) => (
                            <Form noValidate onSubmit={handleSubmit}>
                                <Form.Group controlId="username">
                                    <Form.Label>Username</Form.Label>
                                    <Form.Control
                                        type="text"
                                        placeholder="Enter your username"
                                        onChange={handleChange}
                                        value={values.username}
                                        isInvalid={!!errors.username}
                                    />
                                    <Form.Control.Feedback type="invalid">
                                        {errors.username}
                                    </Form.Control.Feedback>
                                </Form.Group>

                                <Form.Group controlId="confirmation-code">
                                    <Form.Label>Confirmation Code</Form.Label>
                                    <Form.Control
                                        type="password"
                                        placeholder="Enter your code"
                                        onChange={handleChange}
                                        value={values.code}
                                        isInvalid={!!errors.code}
                                    />
                                    <Form.Control.Feedback type="invalid">
                                        {errors.code}
                                    </Form.Control.Feedback>
                                </Form.Group>

                                <Form.Group controlId="lost-code-text">
                                    <Form.Text className="text-muted">
                                        Lost your code?{" "}
                                        <Link to="/">Resend Code</Link>
                                    </Form.Text>
                                </Form.Group>

                                <Button
                                    variant="primary"
                                    type="submit"
                                    className="float-right"
                                >
                                    CONFIRM
                                </Button>
                            </Form>
                        )}
                    </Formik>
                </Card.Body>
            </Card>
            <h6 className="my-3">
                <Link to="/sign-in">Back to Sign In</Link>
            </h6>
        </>
    );
}

function ForgotPassword() {
    interface Values {
        username: string;
    }
    const schema = yup.object().shape({
        username: yup.string().required(),
    });

    function handleSubmit(values: Values) {
        // Do work
        console.log(values);
    }

    return (
        <>
            <h2 className="my-4">Forgot Password</h2>
            <Card>
                <Card.Body>
                    <Formik
                        validationSchema={schema}
                        onSubmit={handleSubmit}
                        initialValues={{
                            username: "",
                        }}
                    >
                        {({
                            handleSubmit,
                            handleChange,
                            handleBlur,
                            values,
                            touched,
                            isValid,
                            errors,
                        }) => (
                            <Form noValidate onSubmit={handleSubmit}>
                                <Form.Group controlId="username">
                                    <Form.Label>Username</Form.Label>
                                    <Form.Control
                                        type="text"
                                        placeholder="Enter your username"
                                        onChange={handleChange}
                                        value={values.username}
                                        isInvalid={!!errors.username}
                                    />
                                    <Form.Control.Feedback type="invalid">
                                        {errors.username}
                                    </Form.Control.Feedback>
                                </Form.Group>

                                <Button
                                    variant="primary"
                                    type="submit"
                                    className="float-right"
                                >
                                    SEND CODE
                                </Button>
                            </Form>
                        )}
                    </Formik>
                </Card.Body>
            </Card>
            <h6 className="my-3">
                <Link to="/sign-in">Back to Sign In</Link>
            </h6>
        </>
    );
}

function NewPassword() {
    interface Values {
        password: string;
    }
    const schema = yup.object().shape({
        password: yup
            .string()
            .required()
            .matches(
                /^(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})/,
                "Must Contain 8 Characters, One Number and One Special Case Character"
            ),
    });

    function handleSubmit(values: Values) {
        // Do work
        console.log(values);
    }

    return (
        <>
            <h2 className="my-4">Reset Password</h2>
            <Card>
                <Card.Body>
                    <Formik
                        validationSchema={schema}
                        onSubmit={handleSubmit}
                        initialValues={{
                            password: "",
                        }}
                    >
                        {({
                            handleSubmit,
                            handleChange,
                            handleBlur,
                            values,
                            touched,
                            isValid,
                            errors,
                        }) => (
                            <Form noValidate onSubmit={handleSubmit}>
                                <Form.Group controlId="password">
                                    <Form.Label>New Password</Form.Label>
                                    <Form.Control
                                        type="text"
                                        placeholder="Enter your new password"
                                        onChange={handleChange}
                                        value={values.password}
                                        isInvalid={!!errors.password}
                                    />
                                    <Form.Control.Feedback type="invalid">
                                        {errors.password}
                                    </Form.Control.Feedback>
                                </Form.Group>

                                <Button
                                    variant="primary"
                                    type="submit"
                                    className="float-right"
                                >
                                    CHANGE
                                </Button>
                            </Form>
                        )}
                    </Formik>
                </Card.Body>
            </Card>
            <h6 className="my-3">
                <Link to="/sign-in">Back to Sign In</Link>
            </h6>
        </>
    );
}

export default Authentication;
