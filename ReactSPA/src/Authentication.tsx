import React, { MouseEvent, useRef } from "react";
import { Auth, CognitoUser } from "@aws-amplify/auth";
import Amplify from "aws-amplify";
import { useHistory } from "react-router-dom";
import awsconfig from "./aws-exports";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Button from "react-bootstrap/Button";
import Card from "react-bootstrap/Card";
import Form from "react-bootstrap/Form";
import { useHookstate, State } from "@hookstate/core";
import { Formik, useFormik } from "formik";
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

// }

interface LoginState {
    user: CognitoUser | any;
    username: string | null;
}

function Authentication() {
    const state = useHookstate<LoginState>({ user: null, username: null });

    return (
        <Container style={{ maxWidth: "700px" }}>
            <Row>
                <Col>
                    <Switch>
                        <Route path="/sign-in">
                            <SignIn state={state} />
                        </Route>
                        <Route path="/create-account">
                            <SignUp state={state} />
                        </Route>
                        <Route path="/confirm-account">
                            <ConfirmSignUp username={state.username.get()} />
                        </Route>
                        <Route path="/forgot-password">
                            <ForgotPassword />
                        </Route>
                        <Route path="/new-password">
                            <RequireNewPassword user={state.user.get()} />
                        </Route>
                        <Route path="/confirm-sign-in">
                            <ConfirmSignIn user={state.user.get()} />
                        </Route>
                    </Switch>
                </Col>
            </Row>
        </Container>
    );
}

function SignIn(props: { state: State<LoginState> }) {
    const history = useHistory();
    const loadingState = useHookstate<boolean>(false);
    interface Values {
        username: string;
        password: string;
    }
    const schema = yup.object().shape({
        username: yup.string().required(),
        password: yup.string().required(),
    });

    const formik = useFormik({
        validationSchema: schema,
        validateOnChange: false,
        initialValues: {
            username: "",
            password: "",
        },
        onSubmit: async (values: Values) => {
            console.log(values);

            loadingState.set(true);
            try {
                const user = await Auth.signIn(
                    values.username,
                    values.password
                );
                console.log(user);
                if (
                    user.challengeName === "SMS_MFA" ||
                    user.challengeName === "SOFTWARE_TOKEN_MFA"
                ) {
                    console.log("confirm user with " + user.challengeName);
                    //this.changeState('confirmSignIn', user);
                    props.state.user.set(user);
                    history.replace("/confirm-sign-in");
                } else if (user.challengeName === "NEW_PASSWORD_REQUIRED") {
                    console.log("require new password", user.challengeParam);
                    //this.changeState('requireNewPassword', user);
                    props.state.user.set(user);
                    history.push("/new-password");
                } else {
                    //this.checkContact(user);
                    // TODO: Route to the home page for now. Not sure if this is needed.
                    history.push("/");
                }
            } catch (err) {
                if (err.code === "UserNotConfirmedException") {
                    console.log("the user is not confirmed");
                    //this.changeState('confirmSignUp', { values.username });
                    props.state.username.set(values.username);
                    history.push("confirm-account");
                } else if (err.code === "PasswordResetRequiredException") {
                    console.log("the user requires a new password");
                    //this.changeState('forgotPassword', { values.username });
                    props.state.username.set(values.username);
                    history.push("/forgot-password");
                } else {
                    //this.error(err);
                    // TODO
                }
            } finally {
                loadingState.set(false);
            }
        },
    });

    return (
        <>
            <h2 className="my-4">Sign In</h2>
            <Card>
                <Card.Body>
                    <Form noValidate onSubmit={formik.handleSubmit}>
                        <Form.Group controlId="username">
                            <Form.Label>Username</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Enter Username"
                                onChange={formik.handleChange}
                                value={formik.values.username}
                                isInvalid={!!formik.errors.username}
                            />
                            <Form.Control.Feedback type="invalid">
                                {formik.errors.username}
                            </Form.Control.Feedback>
                        </Form.Group>

                        <Form.Group controlId="password">
                            <Form.Label>Password</Form.Label>
                            <Form.Control
                                type="password"
                                placeholder="Enter Password"
                                autoComplete="on"
                                onChange={formik.handleChange}
                                value={formik.values.password}
                                isInvalid={!!formik.errors.password}
                            />
                            <Form.Control.Feedback type="invalid">
                                {formik.errors.password}
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
                            variant="mint"
                            type="submit"
                            className="float-right"
                            disabled={loadingState.get()}
                        >
                            SIGN IN
                        </Button>
                    </Form>
                </Card.Body>
            </Card>
            <h5 className="my-3">
                No account? <Link to="/Create-account">Create account</Link>
            </h5>
        </>
    );
}

function SignUp(props: { state: State<LoginState> }) {
    const history = useHistory();
    const loadingState = useHookstate(false);
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

    const formik = useFormik({
        validationSchema: schema,
        validateOnChange: false,
        initialValues: {
            username: "",
            password: "",
            email: "",
        },
        onSubmit: async (values: Values) => {
            console.log(values);

            loadingState.set(true);
            try {
                const data = await Auth.signUp({
                    username: values.username,
                    password: values.password,
                    attributes: { email: values.email },
                });

                //this.changeState("confirmSignUp", data.user.username);
                props.state.username.set(data.user.getUsername());
                history.push("/confirm-account");
            } catch (err) {
                //this.error(err);
                // TODO
                console.log(err);
            } finally {
                loadingState.set(false);
            }
        },
    });

    return (
        <>
            <h2 className="my-4">Create Account</h2>
            <Card>
                <Card.Body>
                    <Form noValidate onSubmit={formik.handleSubmit}>
                        <Form.Group controlId="username">
                            <Form.Label>Username</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Enter Username"
                                onChange={formik.handleChange}
                                value={formik.values.username}
                                isInvalid={!!formik.errors.username}
                            />
                            <Form.Control.Feedback type="invalid">
                                {formik.errors.username}
                            </Form.Control.Feedback>
                        </Form.Group>

                        <Form.Group controlId="password">
                            <Form.Label>Password</Form.Label>
                            <Form.Control
                                type="password"
                                placeholder="Enter Password"
                                onChange={formik.handleChange}
                                value={formik.values.password}
                                isInvalid={!!formik.errors.password}
                            />
                            <Form.Control.Feedback type="invalid">
                                {formik.errors.password}
                            </Form.Control.Feedback>
                        </Form.Group>

                        <Form.Group controlId="email">
                            <Form.Label>Email Address</Form.Label>
                            <Form.Control
                                type="email"
                                placeholder="Enter Email"
                                onChange={formik.handleChange}
                                value={formik.values.email}
                                isInvalid={!!formik.errors.email}
                            />
                            <Form.Control.Feedback type="invalid">
                                {formik.errors.email}
                            </Form.Control.Feedback>
                        </Form.Group>

                        <Button
                            variant="mint"
                            type="submit"
                            className="float-right"
                            disabled={loadingState.get()}
                        >
                            CREATE ACCOUNT
                        </Button>
                    </Form>
                </Card.Body>
            </Card>
            <h5 className="my-3">
                Have account? <Link to="/sign-in">Sign in</Link>
            </h5>
        </>
    );
}

function ConfirmSignUp(props: { username: string | null }) {
    const history = useHistory();
    const inputField = useRef<HTMLInputElement>(null);
    interface Values {
        username: string;
        code: string;
    }
    const schema = yup.object().shape({
        username: yup.string().required(),
        code: yup.string().required(),
    });

    const formik = useFormik({
        validationSchema: schema,
        validateOnChange: false,
        initialValues: {
            username: props.username ? props.username : "",
            code: "",
        },
        onSubmit: (values: Values) => {
            console.log(values);
            Auth.confirmSignUp(values.username, values.code)
                .then(() => history.push("/"))
                .catch((err) => console.log(err));
        },
    });

    function resend(event: MouseEvent) {
        event.preventDefault();
        if (inputField.current) {
            if (inputField.current.value) {
                const username = props.username
                    ? props.username
                    : inputField.current.value;
                Auth.resendSignUp(username)
                    .then(() => console.log("code resent"))
                    .catch((err) => console.log(err));
            } else {
                formik.setFieldError("username", "Username is required");
            }
        }
    }

    return (
        <>
            <h2 className="my-4">Confirm Email</h2>
            <Card>
                <Card.Body>
                    <Form noValidate onSubmit={formik.handleSubmit}>
                        <Form.Group controlId="username">
                            <Form.Label>Username</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Enter your username"
                                ref={inputField}
                                onChange={formik.handleChange}
                                value={formik.values.username}
                                isInvalid={!!formik.errors.username}
                            />
                            <Form.Control.Feedback type="invalid">
                                {formik.errors.username}
                            </Form.Control.Feedback>
                        </Form.Group>

                        <Form.Group controlId="confirmationcode">
                            <Form.Label>Confirmation Code</Form.Label>
                            <Form.Control
                                type="text"
                                name="code"
                                placeholder="Enter your code"
                                onChange={formik.handleChange}
                                value={formik.values.code}
                                isInvalid={!!formik.errors.code}
                            />
                            <Form.Control.Feedback type="invalid">
                                {formik.errors.code}
                            </Form.Control.Feedback>
                        </Form.Group>

                        <Form.Group controlId="lostcodetext">
                            <Form.Text className="text-muted">
                                Lost your code?{" "}
                                <a
                                    href="#"
                                    onClick={resend}
                                    className="btn-link"
                                >
                                    Resend Code
                                </a>
                            </Form.Text>
                        </Form.Group>

                        <Button
                            variant="mint"
                            type="submit"
                            className="float-right"
                        >
                            CONFIRM
                        </Button>
                    </Form>
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

    const formik = useFormik({
        validationSchema: schema,
        validateOnChange: false,
        initialValues: {
            username: "",
        },
        onSubmit: (values: Values) => {
            // Do work
            console.log(values);
        },
    });

    return (
        <>
            <h2 className="my-4">Forgot Password</h2>
            <Card>
                <Card.Body>
                    <Form noValidate onSubmit={formik.handleSubmit}>
                        <Form.Group controlId="username">
                            <Form.Label>Username</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Enter your username"
                                onChange={formik.handleChange}
                                value={formik.values.username}
                                isInvalid={!!formik.errors.username}
                            />
                            <Form.Control.Feedback type="invalid">
                                {formik.errors.username}
                            </Form.Control.Feedback>
                        </Form.Group>

                        <Button
                            variant="mint"
                            type="submit"
                            className="float-right"
                        >
                            SEND CODE
                        </Button>
                    </Form>
                </Card.Body>
            </Card>
            <h6 className="my-3">
                <Link to="/sign-in">Back to Sign In</Link>
            </h6>
        </>
    );
}

function RequireNewPassword(props: { user: any }) {
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

    const formik = useFormik({
        validationSchema: schema,
        validateOnChange: false,
        initialValues: {
            password: "",
        },
        onSubmit: (values: Values) => {
            // Do work
            console.log(values);
        },
    });

    return (
        <>
            <h2 className="my-4">Require New Password</h2>
            <Card>
                <Card.Body>
                    <Form noValidate onSubmit={formik.handleSubmit}>
                        <Form.Group controlId="password">
                            <Form.Label>New Password</Form.Label>
                            <Form.Control
                                type="password"
                                placeholder="Enter your new password"
                                onChange={formik.handleChange}
                                value={formik.values.password}
                                isInvalid={!!formik.errors.password}
                            />
                            <Form.Control.Feedback type="invalid">
                                {formik.errors.password}
                            </Form.Control.Feedback>
                        </Form.Group>

                        <Button
                            variant="mint"
                            type="submit"
                            className="float-right"
                        >
                            CHANGE
                        </Button>
                    </Form>
                </Card.Body>
            </Card>
            <h6 className="my-3">
                <Link to="/sign-in">Back to Sign In</Link>
            </h6>
        </>
    );
}

function ConfirmSignIn(props: { user: any }) {
    interface Values {
        code: string;
    }
    const schema = yup.object().shape({
        code: yup.string().required(),
    });

    const formik = useFormik({
        validationSchema: schema,
        validateOnChange: false,
        initialValues: {
            code: "",
        },
        onSubmit: (values: Values) => {
            // Do work
            console.log(values);
        },
    });

    return (
        <>
            <h2 className="my-4">Confirm Sign In</h2>
            <Card>
                <Card.Body>
                    <Form noValidate onSubmit={formik.handleSubmit}>
                        <Form.Group controlId="confirmationcode">
                            <Form.Label>Confirmation Code</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Enter your code"
                                onChange={formik.handleChange}
                                value={formik.values.code}
                                isInvalid={!!formik.errors.code}
                            />
                            <Form.Control.Feedback type="invalid">
                                {formik.errors.code}
                            </Form.Control.Feedback>
                        </Form.Group>

                        <Button
                            variant="mint"
                            type="submit"
                            className="float-right"
                        >
                            CONFIRM
                        </Button>
                    </Form>
                </Card.Body>
            </Card>
            <h6 className="my-3">
                <Link to="/sign-in">Back to Sign In</Link>
            </h6>
        </>
    );
}

export default Authentication;
