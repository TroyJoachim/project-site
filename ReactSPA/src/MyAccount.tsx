import React from "react";
import Alert from "react-bootstrap/Alert";
import Button from "react-bootstrap/Button";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Form from "react-bootstrap/Form";
import Col from "react-bootstrap/Col";
import Spinner from "react-bootstrap/Spinner";
import { useHookstate, State } from "@hookstate/core";
import Auth from "@aws-amplify/auth";

function MyAccount() {
    const validated = useHookstate(false);

    const handleSubmit = (event: any) => {
        const form = event.currentTarget;
        if (form.checkValidity() === false) {
            event.preventDefault();
            event.stopPropagation();
        }

        validated.set(true);
    };
    return (
        <Container>
            <Row>
                <Col>
                    <h3 className="my-3">Personal Information</h3>
                    <Form
                        noValidate
                        validated={validated.get()}
                        onSubmit={handleSubmit}
                        className="mb-5"
                    >
                        <Form.Row>
                            <Form.Group
                                as={Col}
                                sm={12}
                                md={6}
                                controlId="fname"
                            >
                                <Form.Label>First Name</Form.Label>
                                <Form.Control
                                    type="text"
                                    required
                                    placeholder="First Name"
                                />
                                <Form.Control.Feedback type="invalid">
                                    Please enter your first name.
                                </Form.Control.Feedback>
                            </Form.Group>
                            <Form.Group
                                as={Col}
                                sm={12}
                                md={6}
                                controlId="lname"
                            >
                                <Form.Label>Last Name</Form.Label>
                                <Form.Control
                                    type="text"
                                    required
                                    placeholder="Last Name"
                                />
                                <Form.Control.Feedback type="invalid">
                                    Please enter your last name
                                </Form.Control.Feedback>
                            </Form.Group>
                        </Form.Row>
                        <Form.Row>
                            <Form.Group
                                as={Col}
                                sm={12}
                                md={6}
                                controlId="email"
                            >
                                <Form.Label>Email</Form.Label>
                                <Form.Control
                                    type="email"
                                    required
                                    placeholder="Email"
                                />
                                <Form.Control.Feedback type="invalid">
                                    Please enter your email address.
                                </Form.Control.Feedback>
                            </Form.Group>
                            <Form.Group
                                as={Col}
                                sm={12}
                                md={6}
                                controlId="username"
                            >
                                <Form.Label>Username</Form.Label>
                                <Form.Control
                                    type="text"
                                    required
                                    placeholder="Username"
                                />
                                <Form.Control.Feedback type="invalid">
                                    Please enter a username.
                                </Form.Control.Feedback>
                            </Form.Group>
                        </Form.Row>
                        <Form.Group className="text-right">
                            <Button type="submit">Save</Button>
                        </Form.Group>
                    </Form>
                    <ChangePasswordForm />
                </Col>
            </Row>
        </Container>
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
                        onChange={(e) =>
                            formFields.oldPassword.set(e.target.value)
                        }
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
                        <Button type="submit">
                            Save
                        </Button>
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