import { useEffect, useState } from "react";
import Alert from "react-bootstrap/Alert";
import Button from "react-bootstrap/Button";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Form from "react-bootstrap/Form";
import Col from "react-bootstrap/Col";
import Spinner from "react-bootstrap/Spinner";
import { useHookstate } from "@hookstate/core";
import Auth from "@aws-amplify/auth";
import { Storage } from "aws-amplify";
import { useFormik } from "formik";
import * as yup from "yup";
import { getUser, updateUser } from "./agent";
import { IUser } from "./types";
import { globalState } from "./globalState";
import Avatar from "react-avatar-edit";
import avatar from "./images/empty-avatar-65.png";
import { dataURLtoFile } from "./helpers";

export default function MyAccount() {
  return (
    <Container>
      <Row>
        <Col>
          <PersonalInfo />
          <AvatarForm />
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

  const gState = useHookstate(globalState);
  const loadingState = useHookstate<boolean>(false);
  const feedback = useHookstate<Feedback>({
    show: false,
    error: false,
    message: "",
  });
  const user = useHookstate<IUser>({
    username: "",
    identityId: "",
    firstName: "",
    lastName: "",
    projects: null,
  });

  useEffect(() => {
    async function getUserInfo() {
      try {
        if (!gState.identityId.value)
          throw new Error("IdentityId value was missing");

        const response = await getUser(gState.identityId.value);
        if (response && response.status === 200) {
          console.log("User response", response);
          user.set(response.data);
        }
      } catch (error) {
        // TODO: handle error
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
      firstName: user.firstName.value ? user.firstName.value : "",
      lastName: user.lastName.value ? user.lastName.value : "",
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

function AvatarForm() {
  interface Feedback {
    show: boolean;
    error: boolean;
    message: string;
  }

  const gState = useHookstate(globalState);
  const [state, setState] = useState({ preview: "", src: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState<Feedback>({
    show: false,
    error: false,
    message: "",
  });

  useEffect(() => {
    Storage.get("user-avatar.png", {
      level: "protected",
      identityId: gState.identityId.value,
    })
      .then((url: any) => {
        setState({ ...state, preview: url, src: url });
      })
      .catch((error) => console.log(error));
  }, []);

  function onClose() {
    setState({ ...state, preview: "" });
  }

  function onCrop(preview: string) {
    setState({ ...state, preview: preview });
  }

  function onBeforeFileLoad(elem: any) {
    if (elem.target.files[0].size > 71680) {
      alert("File is too big!");
      elem.target.value = "";
    }
  }

  async function uploadAvatar() {
    if (!state.preview) return;

    setIsLoading(true);
    try {
      if (!gState.identityId.value)
        throw new Error("IdentityId value was missing");

      const newFile = dataURLtoFile(state.preview, "user-avatar.png");

      // Returns: {key: user-avatar.png}
      const result: any = await Storage.put("user-avatar.png", newFile, {
        level: "protected",
        contentType: "text/plain",
      });

      console.log(result);

      // Update the user avatar on the API
      const id = gState.identityId.value;
      // const response = await updateUser({
      //   identityId: id,
      //   avatarImgKey: result.key,
      //   projects: null,
      // });

      setFeedback({
        show: true,
        error: false,
        message: "Avatar has been saved!",
      });
    } catch (error) {
      console.log(error);
      // TODO: Not sure if I should output the error or show my own error message
      setFeedback({ show: true, error: true, message: error });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <>
      <h3 className="my-3">User Avatar</h3>
      <div className="my-3">
        <img
          className="avatar"
          src={state.preview ? state.preview : avatar}
          alt="Preview"
        />
      </div>
      <Avatar
        width={325}
        height={200}
        onCrop={onCrop}
        onClose={onClose}
        onBeforeFileLoad={onBeforeFileLoad}
        src={state.src}
        exportSize={65}
      />
      <Button
        variant="mint"
        className="mt-2"
        onClick={uploadAvatar}
        disabled={isLoading}
      >
        Save
      </Button>
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
            <Button variant="mint" disabled>
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
            <Button variant="mint" type="submit">
              Update
            </Button>
          )}
        </Form.Group>
      </Form>
    </>
  );
}
