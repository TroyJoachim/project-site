import React, { useEffect } from "react";
import Alert from "react-bootstrap/Alert";
import Button from "react-bootstrap/Button";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Form from "react-bootstrap/Form";
import Col from "react-bootstrap/Col";
import Spinner from "react-bootstrap/Spinner";
import { useHookstate, State } from "@hookstate/core";
import { Auth, CognitoUser } from "@aws-amplify/auth";
import { useFormik } from "formik";
import * as yup from "yup";
import { getUser, updateUser } from "./agent";
import { IUser } from "./types";

export default function MyAccount() {
  return (
    <Container>
      <Row>
        <Col>
          <PersonalInfo />
          <ChangePasswordForm />
        </Col>
      </Row>
    </Container>
  );
}

function PersonalInfo() {
  interface Feedback {
    show: boolean;
    error: boolean;
    message: string;
  }
  interface Values {
    firstName: string;
    lastName: string;
  }

  const feedback = useHookstate<Feedback>({
    show: false,
    error: false,
    message: "",
  });
  const loadingState = useHookstate<boolean>(false);
  const user = useHookstate<IUser>({
    id: 0,
    username: "",
    authId: "",
    firstName: "",
    lastName: "",
    projects: null,
  });

  useEffect(() => {
    // Get user information from API

    async function getUserInfo() {
      try {
        const cognitoUser: CognitoUser = await Auth.currentAuthenticatedUser();
        const attributes = await Auth.userAttributes(cognitoUser);
        const subResult = attributes.find((a) => a.Name === "sub");
        if (!subResult) return;

        const sub = subResult.getValue();
        const response = await getUser(sub);
        if (response && response.status === 200) {
          console.log("User response", response);
          user.set(response.data);
        }
      } catch (error) {
        console.log(error);
      }
    }
    getUserInfo();
  }, []);

  const schema = yup.object().shape({
    firstName: yup.string(),
    lastName: yup.string(),
  });

  const formik = useFormik({
    validationSchema: schema,
    validateOnChange: false,
    enableReinitialize: true,
    initialValues: {
      firstName: user.firstName.get(),
      lastName: user.lastName.get(),
    },
    onSubmit: async (values: Values) => {
      console.log(values);
      loadingState.set(true);
      // Update the user values in state
      user.firstName.set(values.firstName);
      user.lastName.set(values.lastName);
      try {
        // Update user info
        const response = await updateUser(user.get());
        if (response && response.status === 204) {
          feedback.set({
            show: true,
            error: false,
            message: "Your user info has been updated successfully.",
          });
        }
      } catch (error) {
        console.log(error);
        feedback.set({
          show: true,
          error: true,
          message: "Failed to update user information.",
        });
      } finally {
        loadingState.set(false);
      }
    },
  });

  function feedbackAlert() {
    if (!feedback.show.value) return <></>;

    const msgType = feedback.value.error ? "danger" : "success";
    return (
      <Alert
        variant={msgType}
        onClose={() => feedback.show.set(false)}
        dismissible
      >
        {feedback.value.message}
      </Alert>
    );
  }

  return (
    <>
      <h3 className="my-3">Personal Information</h3>
      {feedbackAlert()}
      <Form noValidate onSubmit={formik.handleSubmit}>
        <Form.Group controlId="firstName">
          <Form.Label>First Name</Form.Label>
          <Form.Control
            name="firstName"
            type="text"
            placeholder="Enter your first name"
            onChange={formik.handleChange}
            value={formik.values.firstName}
            isInvalid={!!formik.errors.firstName}
          />
          <Form.Control.Feedback type="invalid">
            {formik.errors.firstName}
          </Form.Control.Feedback>
        </Form.Group>

        <Form.Group controlId="lastName">
          <Form.Label>First Name</Form.Label>
          <Form.Control
            name="lastName"
            type="text"
            placeholder="Enter your last name"
            onChange={formik.handleChange}
            value={formik.values.lastName}
            isInvalid={!!formik.errors.lastName}
          />
          <Form.Control.Feedback type="invalid">
            {formik.errors.lastName}
          </Form.Control.Feedback>
        </Form.Group>

        <div className="text-right">
          <Button variant="mint" type="submit" disabled={loadingState.get()}>
            Save
          </Button>
        </div>
      </Form>
    </>
  );
}

function ChangePasswordForm() {
  interface Values {
    oldPassword: string;
    newPassword: string;
    confirmPassword: string;
  }
  interface Feedback {
    show: boolean;
    error: boolean;
    message: string;
  }
  // Loading state
  const loading = useHookstate(false);
  // Final result
  const feedback = useHookstate<Feedback>({
    show: false,
    error: false,
    message: "",
  });

  const schema = yup.object().shape({
    oldPassword: yup.string(),
    newPassword: yup
      .string()
      .required()
      .matches(
        /^(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})/,
        "Must Contain 8 Characters, One Number and One Special Case Character"
      ),
    confirmPassword: yup
      .string()
      .oneOf([yup.ref("newPassword")], "Password does not match")
      .required(),
  });

  const formik = useFormik({
    validationSchema: schema,
    validateOnChange: false,
    enableReinitialize: true,
    initialValues: {
      oldPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
    onSubmit: async (values: Values) => {
      console.log(values);
      loading.set(true);
      try {
        const user = await Auth.currentAuthenticatedUser();
        await Auth.changePassword(user, values.oldPassword, values.newPassword);

        feedback.set({
          show: true,
          error: false,
          message: "Your password has been updated successfully",
        });
        // Reset the form
        formik.resetForm();
      } catch (error) {
        console.log(error);
        feedback.set({
          show: true,
          error: true,
          message: "Error updating password",
        });
      } finally {
        loading.set(false);
      }
    },
  });

  function feedbackAlert() {
    if (!feedback.show.value) return <></>;

    const msgType = feedback.value.error ? "danger" : "success";
    return (
      <Alert
        variant={msgType}
        onClose={() => feedback.show.set(false)}
        dismissible
      >
        {feedback.value.message}
      </Alert>
    );
  }

  return (
    <>
      <h3 className="my-3">Update Password</h3>
      {feedbackAlert()}
      <Form noValidate onSubmit={formik.handleSubmit} className="mb-5">
        <Form.Group controlId="oldPassword">
          <Form.Label>Old Password</Form.Label>
          <Form.Control
            name="oldPassword"
            type="password"
            placeholder="Enter your current password"
            onChange={formik.handleChange}
            disabled={loading.get()}
            value={formik.values.oldPassword}
            isInvalid={!!formik.errors.oldPassword}
          />
          <Form.Control.Feedback type="invalid">
            {formik.errors.oldPassword}
          </Form.Control.Feedback>
        </Form.Group>

        <Form.Group controlId="newPassword">
          <Form.Label>New Password</Form.Label>
          <Form.Control
            name="newPassword"
            type="password"
            placeholder="Enter your new password"
            onChange={formik.handleChange}
            disabled={loading.get()}
            value={formik.values.newPassword}
            isInvalid={!!formik.errors.newPassword}
          />
          <Form.Control.Feedback type="invalid">
            {formik.errors.newPassword}
          </Form.Control.Feedback>
        </Form.Group>

        <Form.Group controlId="confirmPassword">
          <Form.Label>Confirm Password</Form.Label>
          <Form.Control
            name="confirmPassword"
            type="password"
            placeholder="Re-enter your new password"
            onChange={formik.handleChange}
            value={formik.values.confirmPassword}
            disabled={loading.get()}
            isInvalid={!!formik.errors.confirmPassword}
          />
          <Form.Control.Feedback type="invalid">
            {formik.errors.confirmPassword}
          </Form.Control.Feedback>
        </Form.Group>

        <Form.Group className="text-right">
          {loading.get() ? (
            <Button disabled>
              <Spinner
                as="span"
                animation="border"
                size="sm"
                role="status"
                aria-hidden="true"
                className="mr-1"
              />
              Updating
            </Button>
          ) : (
            <Button type="submit">Save</Button>
          )}
        </Form.Group>
      </Form>
    </>
  );
}
