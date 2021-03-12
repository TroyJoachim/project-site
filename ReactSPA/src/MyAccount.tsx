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

function MyAccount() {
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
      // Update the user values in state
      user.firstName.set(values.firstName);
      user.lastName.set(values.lastName);
      //user.attach(Downgraded);
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
      }
    },
  });

  function feedbackMsg() {
    if (!feedback.show.value) return <></>;

    const msgType = feedback.value.error ? "danger" : "success";
    return (
      <Alert variant={msgType} onClose={() => feedback.show.set(false)} dismissible>
        {feedback.value.message}
      </Alert>
    );
  }

  return (
    <>
      <h3 className="my-3">Personal Information</h3>
      {feedbackMsg()}
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
  const validated = useHookstate(false);
  const initFormFields = {
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  };
  const formFields = useHookstate(initFormFields);
  const formErrors = useHookstate({
    newPassword: "",
    newPasswordInvalid: false,
    confirmPassword: "",
    confirmPasswordInvalid: false,
  });
  // Loading state
  const isChanging = useHookstate(false);
  // Final result
  const showAlert = useHookstate(false);

  // TODO: This could be better. I might look into something like Formik or try to imporve the logic.
  function comparePasswords() {
    if (
      validated.get() &&
      formFields.newPassword.get() !== formFields.confirmPassword.get()
    ) {
      console.log("passwords don't match.");
      formErrors.set({
        newPassword: "Your passwords do not match.",
        newPasswordInvalid: true,
        confirmPassword: "Your passwords do not match.",
        confirmPasswordInvalid: true,
      });
      return false;
    } else {
      formErrors.set({
        newPassword: "Please enter your new password.",
        newPasswordInvalid: false,
        confirmPassword: "Please enter your new password again.",
        confirmPasswordInvalid: false,
      });
      return true;
    }
  }

  function handleNewPassword(e: React.ChangeEvent<HTMLInputElement>) {
    formFields.newPassword.set(e.target.value);
    comparePasswords();
  }

  function handleConfirmPassword(e: React.ChangeEvent<HTMLInputElement>) {
    formFields.confirmPassword.set(e.target.value);
    comparePasswords();
  }

  const handleSubmit = (event: any) => {
    event.preventDefault();
    event.stopPropagation();
    validated.set(true);
    // Clear previous errors
    if (comparePasswords()) {
      // submit form
      validated.set(false);
      isChanging.set(true);
      Auth.currentAuthenticatedUser()
        .then((user) => {
          return Auth.changePassword(
            user,
            formFields.oldPassword.get(),
            formFields.newPassword.get()
          );
        })
        .then((data) => {
          // Clear the form fields
          formFields.set(initFormFields);
          isChanging.set(false);
          showAlert.set(true);
        })
        .catch((err) => console.log(err));
    }
  };

  return (
    <>
      <h3 className="my-3">Update Password</h3>
      <DismissibleAlert
        alertType="success"
        alertMessage="Your password was updated successfully."
        showAlert={showAlert}
      />
      <Form
        noValidate
        validated={validated.get()}
        onSubmit={handleSubmit}
        className="mb-5"
      >
        <Form.Group controlId="old_password">
          <Form.Label>Old Password</Form.Label>
          <Form.Control
            type="password"
            required
            onChange={(e) => formFields.oldPassword.set(e.target.value)}
            disabled={isChanging.get()}
            value={formFields.oldPassword.get()}
          />
          <Form.Control.Feedback type="invalid">
            Please enter your old password.
          </Form.Control.Feedback>
        </Form.Group>
        <Form.Group controlId="new_password">
          <Form.Label>New Password</Form.Label>
          <Form.Control
            type="password"
            required
            isInvalid={formErrors.newPasswordInvalid.get()}
            onChange={handleNewPassword}
            disabled={isChanging.get()}
            value={formFields.newPassword.get()}
          />
          <Form.Control.Feedback type="invalid">
            {formErrors.newPassword.get()}
          </Form.Control.Feedback>
        </Form.Group>
        <Form.Group controlId="confirm_password">
          <Form.Label>Confirm Password</Form.Label>
          <Form.Control
            type="password"
            required
            isInvalid={formErrors.confirmPasswordInvalid.get()}
            onChange={handleConfirmPassword}
            disabled={isChanging.get()}
            value={formFields.confirmPassword.get()}
          />
          <Form.Control.Feedback type="invalid">
            {formErrors.confirmPassword.get()}
          </Form.Control.Feedback>
        </Form.Group>
        <Form.Group className="text-right">
          {isChanging.get() ? (
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

function DismissibleAlert(props: {
  alertType: string;
  alertMessage: string;
  showAlert: State<boolean>;
}) {
  const show = useHookstate(props.showAlert);

  if (show.get()) {
    return (
      <Alert
        variant={props.alertType}
        onClose={() => show.set(false)}
        dismissible
      >
        {props.alertMessage}
      </Alert>
    );
  } else {
    return <></>;
  }
}

export default MyAccount;
