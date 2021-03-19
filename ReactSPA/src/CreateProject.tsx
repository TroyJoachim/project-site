import React, { useEffect } from "react";
import { useHookstate, Downgraded, State, none } from "@hookstate/core";
import { useHistory } from "react-router-dom";
import Alert from "react-bootstrap/Alert";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import ButtonGroup from "react-bootstrap/ButtonGroup";
import Button from "react-bootstrap/Button";
import Card from "react-bootstrap/Card";
import Form from "react-bootstrap/Form";
import ImageUpload from "./ImageUpload";
import TextEditor from "./TextEditor";
import FileUpload from "./FileUpload";
import UploadingProjectModal from "./UploadingProjectModal";
import { PageSideNav, SideNavType } from "./PageSideNav";
import { EditorState } from "draft-js";
import { IBuildStep, IProject, IUser, ICategory } from "./types";
import { createProject, getProjectCategories } from "./agent";

function CreateProject() {
  const initUser: IUser = {
    username: "",
    identityId: "",
    firstName: "",
    lastName: "",
    avatarImgKey: "",
    projects: null,
  };

  const initModel: IProject = {
    id: 0,
    title: "",
    description: "",
    category: "",
    categoryId: 0,
    images: [],
    uploadedImages: [],
    files: [],
    uploadedFiles: [],
    buildSteps: [],
    user: initUser,
  };

  // Hookstate
  const project = useHookstate<IProject>(initModel);
  const showModal = useHookstate(false);
  const modalSuccess = useHookstate(false);
  const projectCategories = useHookstate<ICategory[]>([]);
  const validated = useHookstate(false);
  const descHasText = useHookstate(false);
  const formValidationErrors = useHookstate(false);
  const hasImage = useHookstate(false);
  const modalRoute = useHookstate("");
  const editorState = useHookstate(EditorState.createEmpty());
  const history = useHistory();

  project.images.attach(Downgraded);

  useEffect(() => {
    getProjectCategories().then((response) => {
      if (response && response.status === 200) {
        projectCategories.set(response.data);
      }
    });
  }, []); // Note: Empty array at the end ensures that this is only performed once during mount

  function addBuildStepClick() {
    const order = project.buildSteps.get().length + 1;

    const initBuildStep: IBuildStep = {
      order: order,
      title: "",
      description: "",
      images: [],
      uploadedImages: [],
      files: [],
      uploadedFiles: [],
    };
    project.buildSteps.merge([initBuildStep]);
  }

  function handleSubmit(event: any) {
    event.preventDefault();
    event.stopPropagation();
    validated.set(true);
    formValidationErrors.set(false);

    // Validate the project title
    if (project.title.value.length === 0) {
      formValidationErrors.set(true);
      console.log("Missing project title");
    }

    // Validate category dropdown
    if (project.categoryId.value === 0) {
      formValidationErrors.set(true);
      console.log("Category not selected");
    }

    // Check if at least on image has been selected
    if (project.uploadedImages.length === 0) {
      formValidationErrors.set(true);
      console.log("Missing project image");
      hasImage.set(false);
    } else {
      hasImage.set(true);
    }

    // Check for a project description
    if (!descHasText.get()) {
      formValidationErrors.set(true);
      console.log("Missing desciption");
    }

    // If there are build steps
    if (project.buildSteps.length > 0) {
      // Check if all the build steps have a title and at least one image.
      const bsResult = project.buildSteps.map((bs) => {
        return bs.title.get().length > 0 && bs.uploadedImages.get().length > 0;
      });

      // Check if any return false, meaning that one of the build steps failed validation.
      const result = bsResult.includes(false);
      // If one failed validation.
      if (result) formValidationErrors.set(true);
      // Build Step validation passed
    }

    if (!formValidationErrors.get()) {
      console.log("The form has been validated.");
      // Show uploading modal
      showModal.set(true);

      // Downgrade the state. This is required because the File/Blob has issue with the
      // Proxy type that Hookstate uses. This remove the Proxy type.
      project.attach(Downgraded);

      // Submit form
      createProject(project.get())
        .then((response: any) => {
          if (response && response.status === 201) {
            console.log(response.status);
            modalSuccess.set(true);
            modalRoute.set("/project/" + response.data.project_id);
          } else {
            // TODO: handle error
            modalSuccess.set(false);
          }
        })
    }
  }

  function handleOnHide() {
    if (modalSuccess.get()) {
      history.push(modalRoute.get());
    }
    showModal.set(false);
  }

  function buildCategoryDropdown() {
    function mapSubcategories(subcats: ICategory[]) {
      return subcats.map((sc, index) => (
        <option key={index} value={sc.id}>
          {sc.name}
        </option>
      ));
    }

    return projectCategories.get().map((cat, index) => (
      <optgroup key={index} label={cat.name}>
        {mapSubcategories(cat.subcategories)}
      </optgroup>
    ));
  }

  function handleDropdownSelect(event: React.ChangeEvent<HTMLSelectElement>) {
    console.log(event.target.value);
    project.categoryId.set(parseInt(event.target.value));
  }

  return (
    <Container fluid className="container-xxl">
      <Row>
        <PageSideNav
          //buildSteps={project.build_steps.map((bs) => bs.name)}
          //state={project}
          sideNavType={SideNavType.EditProject}
        />
        <Col lg={8}>
          <Row className="mb-3">
            <Col>
              <h3 className="mt-3 d-inline-block">Create Project</h3>
            </Col>
            <Col>
              <ButtonGroup
                aria-label="Basic example"
                className="mt-3 float-right"
              >
                <Button variant="danger">Cancel</Button>
                <Button variant="primary">Preview</Button>
                <Button variant="success" type="submit" form="main-form">
                  Publish
                </Button>
              </ButtonGroup>
            </Col>
          </Row>
          <UploadingProjectModal
            show={showModal.get()}
            onHide={handleOnHide}
            successful={modalSuccess.get()}
          />
          {validated.get() && formValidationErrors.get() ? (
            <Alert variant="danger">Please fix the form errors below.</Alert>
          ) : (
            <></>
          )}

          <Card id="#main_card">
            <Card.Body>
              <Form
                id="main-form"
                noValidate
                validated={validated.get()}
                onSubmit={handleSubmit}
              >
                <Form.Group controlId="formProjectTitle">
                  <Form.Label>Project Title</Form.Label>
                  <Form.Control
                    onChange={(e) => project.title.set(e.target.value)}
                    required
                    type="text"
                    placeholder="Enter a project title here"
                  />
                  <Form.Control.Feedback type="invalid">
                    Please enter a project title.
                  </Form.Control.Feedback>
                </Form.Group>

                <Form.Group controlId="formProjectCategory">
                  <Form.Label>Project Category</Form.Label>
                  <Form.Control
                    as="select"
                    required
                    onChange={handleDropdownSelect}
                    defaultValue=""
                  >
                    <option disabled value="">
                      -- select an option --
                    </option>
                    {buildCategoryDropdown()}
                  </Form.Control>
                  <Form.Control.Feedback type="invalid">
                    Please select a project category.
                  </Form.Control.Feedback>
                </Form.Group>

                <ImageUpload
                  images={project.uploadedImages}
                  validated={validated.get()}
                />
                <div className="mt-3">
                  <TextEditor
                    description={project.description}
                    editorState={editorState}
                    hasText={(result) => descHasText.set(result)}
                    validated={validated.get()}
                  />
                </div>
                <FileUpload files={project.uploadedFiles} />
              </Form>
            </Card.Body>
          </Card>
          <BuildSteps
            buildSteps={project.buildSteps}
            validated={validated.get()}
          />
          <Button
            variant="outline-primary"
            className="float-right my-3"
            onClick={addBuildStepClick}
          >
            + Add Build Step
          </Button>
        </Col>
      </Row>
    </Container>
  );
}

function BuildSteps(props: {
  buildSteps: State<IBuildStep[]>;
  validated: boolean;
}) {
  // scoped state is optional for performance
  // could have used props.state everywhere instead
  const buildSteps = useHookstate(props.buildSteps);

  function reorderSteps() {
    buildSteps.forEach((step) => {
      step.order.set((order) => order + 1);
    });
  }

  const steps = buildSteps.map((buildStep, index) => (
    <BuildStep
      key={index}
      buildStep={buildStep}
      validated={props.validated}
      reorder={reorderSteps}
    />
  ));

  return <>{steps}</>;
}

function BuildStep(props: {
  buildStep: State<IBuildStep>;
  validated: boolean;
  reorder: () => void;
}) {
  // scoped state is optional for performance
  // could have used props.state everywhere instead
  const buildStep = useHookstate(props.buildStep);
  const editorState = useHookstate(EditorState.createEmpty());

  // TODO: this will need to confirm deletion if there is any information in the buildstep
  function deleteBuildStepClick() {
    // Remove this build step
    buildStep.set(none);

    // Call reorder function
    props.reorder();
  }

  return (
    <Card className="mt-4">
      <Card.Body>
        <Form id="main-form" noValidate validated={props.validated}>
          <Form.Group controlId="formProjectTitle">
            <Form.Label>Build Step Title</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter a build step title here"
              required
              onChange={(e) => buildStep.title.set(e.target.value)}
            />
            <Form.Control.Feedback type="invalid">
              Please enter a build step title.
            </Form.Control.Feedback>
          </Form.Group>
          <ImageUpload
            images={buildStep.uploadedImages}
            validated={props.validated}
          />
          <div className="mt-3">
            <TextEditor
              description={buildStep.description}
              editorState={editorState}
              validated={false}
              hasText={() => {}}
            />
          </div>
        </Form>
        <FileUpload files={buildStep.uploadedFiles} />
        <Button
          variant="danger"
          className="mt-3"
          onClick={deleteBuildStepClick}
        >
          Delete
        </Button>
      </Card.Body>
    </Card>
  );
}

export default CreateProject;
