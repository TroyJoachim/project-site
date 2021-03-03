// TODO: This page is copied and modified from the CreateProject page.
// It would probably be better to abstract the common logic from the two pages.
// For now I'm just duplicating them to save time and get the protoype working.

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
import { convertFiles } from "./helpers";
import {
    ICategory,
    ISubcategory,
    IEditProjectModel,
    IEditProjectBuildStepModel,
} from "./types";
import { getProject, getProjectCategories, getImage } from "./agent";
import {
    EditorState,
    RawDraftContentState,
    ContentState,
    convertFromRaw,
} from "draft-js";

function EditProject(props: any) {
    const initModel: IEditProjectModel = {
        id: "",
        name: "",
        description: "",
        subcategory_id: "",
        subcategory: "", // Temporary, need to update api to subcategory_id
        creation_datetime: "",
        image_ids: [],
        images: [],
        build_steps: [],
        files: [],
    };

    // Hookstate
    const project = useHookstate<IEditProjectModel>(initModel);
    const showModal = useHookstate(false);
    const modalSuccess = useHookstate(false);
    const projectCategories = useHookstate<ICategory[]>([]);
    const projectCategoryId = useHookstate("");
    const validated = useHookstate(false);
    const descHasText = useHookstate(false);
    const modalRoute = useHookstate("");
    const formErrors = useHookstate<string[]>([]);
    const editorState = useHookstate(EditorState.createEmpty());
    const history = useHistory();

    useEffect(() => {
        getProjectCategories().then((response) => {
            if (response && response.status === 200) {
                const categories: ICategory[] = response.data;
                projectCategories.set(categories);
            }
        });

        getProject(props.match.params.id).then((response) => {
            if (!response) return;
            if (response.status === 200 && response.data) {
                const p = response.data;

                // Convert build step response into page model
                const buildStepPromiseArr = p.build_steps.map(async (bs) => {
                    const files = convertFiles(bs.file_attachments);

                    // Convert to IEditProjectBuildStepModel
                    return {
                        order: 0,
                        name: bs.name,
                        description: bs.description,
                        images: [],
                        image_ids: bs.image_ids,
                        files: files,
                    };
                });

                Promise.all(buildStepPromiseArr).then((buildSteps) => {
                    // Convert IFile to File
                    const files = convertFiles(p.file_attachments);

                    // Convert to IEditProjectModel
                    const convertProject = {
                        id: p.id,
                        name: p.name,
                        subcategory_id: p.subcategory_id,
                        subcategory: p.subcategory,
                        description: p.description,
                        creation_datetime: p.creation_datetime,
                        images: [],
                        image_ids: p.image_ids,
                        files: files,
                        build_steps: buildSteps,
                    };
                    project.set(convertProject);

                    // Update the text editor state
                    updateEditorState(project.description.get());
                });
            }
        });
    }, []); // Note: Empty array at the end ensures that this is only performed once during mount

    function updateEditorState(stateStr: string) {
        const rawState: RawDraftContentState = JSON.parse(stateStr);
        const cs: ContentState = convertFromRaw(rawState);
        const es: EditorState = EditorState.createWithContent(cs);
        editorState.set(es);
    }

    function addBuildStepClick() {
        const order = project.build_steps.get().length + 1;

        const newBuildStep: IEditProjectBuildStepModel = {
            order: order,
            name: "",
            description: "",
            image_ids: [],
            images: [],
            files: [],
        };
        project.build_steps.merge([newBuildStep]);
    }

    const handleSubmit = (event: any) => {
        event.preventDefault();
        event.stopPropagation();

        // Clear the previous form errors
        formErrors.set([]);

        // Check for a project description
        if (!descHasText.get()) {
            formErrors.merge(["Please correct the errors below."]);
            validated.set(true);
            console.log("Missing desciption");
        } else {
            console.log("The form has been validated.");
            // Show uploading modal
            showModal.set(true);
            validated.set(true);

            // Downgrade the state.
            // This is because Hookstate wraps the state in a proxy type that needs to be removed before adding Files to FormData.
            // This is done when posting to the api. See https://hookstate.js.org/docs/performance-managed-rendering#downgraded-plugin
            project.attach(Downgraded);

            // Submit form
            // createProject(project.get(), projectCategoryId.get()).then(
            //     (response: any) => {
            //         if (response) {
            //             if (response.status === 200) {
            //                 console.log(response.status);
            //                 modalSuccess.set(true);
            //                 modalRoute.set(
            //                     "/project/" + response.data.project_id
            //                 );
            //             } else {
            //                 // TODO: handle error
            //                 modalSuccess.set(false);
            //             }
            //         }
            //     }
            // );
        }
    };

    function handleOnHide() {
        if (modalSuccess.get()) {
            history.push(modalRoute.get());
        }
        showModal.set(false);
    }

    function buildCategoryDropdown() {
        function mapSubcategories(subcats: ISubcategory[]) {
            return subcats.map((sc, index) => (
                <option key={index} value={sc.id} label={sc.name}>
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
        event.preventDefault();
        const selectedId = event.target.value;

        // Gets the category name from the category_id
        // I'm not sure if we really need to to this yet. I was just trying to keep the state in sync.
        const category = projectCategories
            .get()
            .flatMap((cat) => cat.subcategories)
            .find((subcat) => subcat.id === selectedId);
        const categoryName = category ? category.name : "";

        // Update the state
        project.subcategory.set(categoryName);
        project.subcategory_id.set(selectedId);
    }

    // Checks if the project description has text
    function hasText(result: boolean) {
        descHasText.set(result);
    }

    return (
        <Container fluid className="container-xxl">
            <Row>
                <PageSideNav
                    buildSteps={project.build_steps.map((bs) => bs.name.get())}
                    sideNavType={SideNavType.EditProject}
                />
                <Col lg={8}>
                    <Row className="mb-3">
                        <Col>
                            <h3 className="mt-3 d-inline-block">
                                Edit Project
                            </h3>
                        </Col>
                        <Col>
                            <ButtonGroup
                                aria-label="Basic example"
                                className="mt-3 float-right"
                            >
                                <Button variant="secondary">Cancel</Button>
                                <Button
                                    variant="primary"
                                    type="submit"
                                    form="main-form"
                                >
                                    Save
                                </Button>
                            </ButtonGroup>
                        </Col>
                    </Row>
                    <UploadingProjectModal
                        show={showModal.get()}
                        onHide={handleOnHide}
                        successful={modalSuccess.get()}
                    />
                    <FormValidationAlert errors={formErrors.get()} />
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
                                        onChange={(e) =>
                                            project.name.set(e.target.value)
                                        }
                                        value={project.name.get()}
                                        required
                                        type="text"
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
                                        value={project.subcategory_id.get()}
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
                                    images={project.images}
                                    imageIds={project.image_ids.get()}
                                    validated={false}
                                />
                                <div className="mt-3">
                                    <TextEditor
                                        editorState={editorState}
                                        description={project.description}
                                        hasText={hasText}
                                        validated={validated.get()}
                                    />
                                </div>
                                <FileUpload files={project.files} />
                            </Form>
                        </Card.Body>
                    </Card>
                    <BuildSteps buildSteps={project.build_steps} />
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

interface FormValidationAlertProps {
    errors: string[];
}

function FormValidationAlert(props: FormValidationAlertProps) {
    if (props.errors.length > 0) {
        const errorList = props.errors;
        return (
            <div>
                {errorList.map((err, index) => (
                    <Alert key={index} variant="danger">
                        {err}
                    </Alert>
                ))}
            </div>
        );
    }
    return <></>;
}

function BuildSteps(props: {
    buildSteps: State<IEditProjectBuildStepModel[]>;
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
        <BuildStep key={index} buildStep={buildStep} reorder={reorderSteps} />
    ));

    return <>{steps}</>;
}

function BuildStep(props: {
    buildStep: State<IEditProjectBuildStepModel>;
    reorder: () => void;
}) {
    // scoped state is optional for performance
    // could have used props.state everywhere instead
    const buildStep = useHookstate(props.buildStep);

    function createContentState(stateStr: string) {
        if (buildStep.description.get() === "") {
            return ContentState.createFromText("");
        } else {
            const rawState: RawDraftContentState = JSON.parse(stateStr);
            return convertFromRaw(rawState);
        }
    }
    const contentState = createContentState(buildStep.description.get());
    const editorState = useHookstate(
        EditorState.createWithContent(contentState)
    );

    // TODO: see if this is needed. It came over from the Project page.
    // Convert IFiles and add them to the state.
    // buildStep.files.set(convertFiles(buildStep.file_attachments.get()));

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
                <Form id="main-form">
                    <Form.Group controlId="formProjectTitle">
                        <Form.Label>Build Step Title</Form.Label>
                        <Form.Control
                            onChange={(e) => buildStep.name.set(e.target.value)}
                            value={buildStep.name.get()}
                            type="text"
                            placeholder="Enter a build step title here"
                        />
                    </Form.Group>
                    <ImageUpload imageIds={buildStep.image_ids.get()} images={buildStep.images} validated={false} />
                    <div className="mt-3">
                        <TextEditor
                            description={buildStep.description}
                            editorState={editorState}
                            validated={false}
                            hasText={() => {}}
                        />
                    </div>
                </Form>
                <FileUpload files={buildStep.files} />
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

export default EditProject;
