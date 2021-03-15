import React, { MouseEvent, useRef, useState } from "react";
import { Auth, CognitoUser } from "@aws-amplify/auth";
import Amplify from "aws-amplify";
import { useHistory } from "react-router-dom";
import awsconfig from "./aws-exports";
import Alert from "react-bootstrap/Alert";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Button from "react-bootstrap/Button";
import Card from "react-bootstrap/Card";
import Form from "react-bootstrap/Form";
import { useFormik } from "formik";
import * as yup from "yup";
import { Switch, Route, Link } from "react-router-dom";
import { errorMessage } from "./helpers";
import { createUser } from "./agent";
import { LoginState, ForgotPasswordState } from "./types";
import { authState, forgotPasswordState} from "./state";
import { refreshAuthenticatedUser } from "./globalState";
import {
  RecoilRoot,
  atom,
  selector,
  useRecoilState,
  useRecoilValue,
} from "recoil";

Amplify.configure(awsconfig);

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
              <SignUp />
            </Route>
            <Route path="/confirm-account">
              <ConfirmSignUp />
            </Route>
            <Route path="/forgot-password">
              <ForgotPassword />
            </Route>
            <Route path="/new-password">
              <RequireNewPassword />
            </Route>
            <Route path="/confirm-sign-in">
              <ConfirmSignIn />
            </Route>
          </Switch>
        </Col>
      </Row>
    </Container>
  );
}

function SignIn() {
  const history = useHistory();
  const [state, setState] = useRecoilState<LoginState>(authState);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>("");
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
      setErrorMsg(""); // Clear Alert
      setIsLoading(true);
      try {
        const user = await Auth.signIn(values.username, values.password);
        console.log(user);
        if (
          user.challengeName === "SMS_MFA" ||
          user.challengeName === "SOFTWARE_TOKEN_MFA"
        ) {
          console.log("confirm user with " + user.challengeName);
          state.user.set(user);
          history.replace("/confirm-sign-in");
        } else if (user.challengeName === "NEW_PASSWORD_REQUIRED") {
          console.log("require new password", user.challengeParam);
          state.user.set(user);
          history.push("/new-password");
        } else {
          //this.checkContact(user);
          // TODO: Route to the home page for now. Not sure if this is needed.
          history.push("/");
        }
      } catch (err) {
        if (err.code === "UserNotConfirmedException") {
          console.log("the user is not confirmed");
          setState({ ...state, username: values.username });
          history.push("confirm-account");
        } else if (err.code === "PasswordResetRequiredException") {
          console.log("the user requires a new password");
          setState({ ...state, username: values.username });
          history.push("/forgot-password");
        } else {
          setErrorMsg(errorMessage(err));
          console.log(err);
        }
      } finally {
        setIsLoading(false);
      }
    },
  });

  return (
    <>
      <h2 className="my-4">Sign In</h2>
      {errorMsg ? <Alert variant="danger">{errorMsg}</Alert> : <></>}
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
                <Link to="/forgot-password">Reset password</Link>
              </Form.Text>
            </Form.Group>
            <Button
              variant="mint"
              type="submit"
              className="float-right"
              disabled={isLoading}
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

function SignUp() {
  const history = useHistory();
  const [state, setState] = useRecoilState<LoginState>(authState);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string>("");
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
      setErrorMsg("");
      setIsLoading(true);
      try {
        setState({ ...state, cache: values.password });
        const data = await Auth.signUp({
          username: values.username,
          password: values.password,
          attributes: { email: values.email },
        });

        setState({
          ...state,
          username: data.user.getUsername(),
          cache: values.password,
        });
        history.push("/confirm-account");
      } catch (err) {
        setErrorMsg(errorMessage(err));
        console.log(err);
      } finally {
        setIsLoading(false);
      }
    },
  });

  return (
    <>
      <h2 className="my-4">Create Account</h2>
      {errorMsg ? <Alert variant="danger">{errorMsg}</Alert> : <></>}
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
              disabled={isLoading}
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

function ConfirmSignUp() {
  const history = useHistory();
  const [state, setState] = useRecoilState<LoginState>(authState);
  const inputField = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState(false);
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
    enableReinitialize: true,
    initialValues: {
      username: state.username ? state.username : "",
      code: "",
    },
    onSubmit: async (values: Values) => {
      console.log(values);
      console.log(state);
      setIsLoading(true);
      try {
        await Auth.confirmSignUp(values.username, values.code);
        const cache = state.cache;
        if (cache) {
          await Auth.signIn(values.username, cache);
          setState({ ...state, cache: null });

          refreshAuthenticatedUser();

          // Get the aws identityId of the user
          const credentials = await Auth.currentUserCredentials();

          // Add the new user account to the API
          await createUser(credentials.identityId, values.username);
        }
      } catch (err) {
        console.log(err);
      } finally {
        setIsLoading(false);
        history.replace("/");
      }
    },
  });

  function resend(event: MouseEvent) {
    event.preventDefault();
    if (inputField.current) {
      if (inputField.current.value) {
        setIsLoading(true);
        const username = state.username
          ? state.username
          : inputField.current.value;
        Auth.resendSignUp(username)
          .then(() => console.log("code resent"))
          .catch((err) => console.log(err))
          .finally(() => setIsLoading(false));
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
                disabled={state.username ? true : false}
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
                <a href="#" onClick={resend} className="btn-link">
                  Resend Code
                </a>
              </Form.Text>
            </Form.Group>

            <Button
              variant="mint"
              type="submit"
              className="float-right"
              disabled={isLoading}
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

function SendCode() {
  const [state, setState] = useRecoilState(forgotPasswordState);
  const [isLoading, setIsLoading] = useState<boolean>(false);
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
      console.log(values);
      setIsLoading(true);
      setState({ sent: true, username: values.username });
      Auth.forgotPassword(values.username)
        .then((data) => {
          console.log(data);
        })
        .catch((err) => console.log(err))
        .finally(() => setIsLoading(false));
    },
  });

  return (
    <Form noValidate onSubmit={formik.handleSubmit}>
      <Form.Group controlId="username">
        <Form.Label>Username</Form.Label>
        <Form.Control
          name="username"
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
        disabled={isLoading}
      >
        SEND CODE
      </Button>
    </Form>
  );
}

function UpdatePassword() {
  const state = useRecoilValue<ForgotPasswordState>(forgotPasswordState);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const history = useHistory();
  interface Values {
    code: string;
    password: string;
  }
  const schema = yup.object().shape({
    code: yup.string().required(),
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
      username: "",
      code: "",
      password: "",
    },
    onSubmit: (values: Values) => {
      console.log(values);
      setIsLoading(true);
      Auth.forgotPasswordSubmit(state.username, values.code, values.password)
        .then((data) => {
          console.log(data);
          // Sign the user in
          Auth.signIn(state.username, values.password)
            .then(() => history.push("/"))
            .catch((err) => console.log(err));
        })
        .catch((err) => console.log(err))
        .finally(() => setIsLoading(false));
    },
  });

  return (
    <>
      <Form noValidate onSubmit={formik.handleSubmit}>
        <Form.Group controlId="code">
          <Form.Label>Code</Form.Label>
          <Form.Control
            name="code"
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

        <Form.Group controlId="password">
          <Form.Label>New Password</Form.Label>
          <Form.Control
            name="password"
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
          disabled={isLoading}
        >
          UPDATE
        </Button>
      </Form>
    </>
  );
}

function ForgotPassword() {
  const [state, setState] = useRecoilState<ForgotPasswordState>(forgotPasswordState);
  return (
    <>
      <h2 className="my-4">Forgot Password</h2>
      <Card>
        <Card.Body>
          {state.sent ? (
            <UpdatePassword />
          ) : (
            <SendCode />
          )}
        </Card.Body>
      </Card>
      <h6 className="my-3">
        <Link to="/sign-in">Back to Sign In</Link>
      </h6>
    </>
  );
}

function RequireNewPassword() {
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

            <Button variant="mint" type="submit" className="float-right">
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

function ConfirmSignIn() {
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

            <Button variant="mint" type="submit" className="float-right">
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
