import React, { useEffect } from "react";
import { useHookstate, Downgraded, State, none } from "@hookstate/core";
import { useHistory, useLocation } from "react-router-dom";
import ImageUpload from "./ImageUpload";
import TextEditor from "./TextEditor";
import FileUpload from "./FileUpload";
import UploadingProjectModal from "./UploadingProjectModal";
import {
  IBuildStep,
  IProject,
  IUser,
  ICategory,
  IFile,
  IFakeFile,
  SideNavType,
} from "./types";
import { editProject, getProjectCategories, getProject } from "./agent";
import { Storage } from "aws-amplify";
import { EditorState, convertFromRaw, RawDraftContentState } from "draft-js";
import PageNav from "./PageNav";
import { useScroll } from "./hooks";

// Material UI
import { makeStyles } from "@material-ui/core/styles";
import Snackbar from "@material-ui/core/Snackbar";
import Container from "@material-ui/core/Container";
import Paper from "@material-ui/core/Paper";
import Typography from "@material-ui/core/Typography";
import ButtonGroup from "@material-ui/core/ButtonGroup";
import Box from "@material-ui/core/Box";
import Grid from "@material-ui/core/Grid";
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";

// Page styles
const useStyles = makeStyles((theme) => ({
  content: {
    marginTop: "20px",
    flexGrow: 1,
    [theme.breakpoints.up("md")]: {
      transition: theme.transitions.create("margin", {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
      }),
      marginLeft: 240,
    },
    [theme.breakpoints.down("sm")]: {
      transition: theme.transitions.create("margin", {
        easing: theme.transitions.easing.easeOut,
        duration: theme.transitions.duration.enteringScreen,
      }),
      marginLeft: 0,
    },
  },
  topButtons: {
    float: "right",
  },
  pageTitle: {
    paddingRight: "20px",
  },
  paper: {
    padding: "20px",
  },
  bsPaper: {
    padding: "20px",
    marginTop: "3rem",
  },
  formControlRoot: {
    width: "100%",
  },
  categorySelect: {
    marginBottom: "20px",
  },
  inputProjectTitle: {
    marginBottom: "20px",
  },
  bsDeleteBtn: {
    marginTop: "10px",
  },
}));

export default function EditProject(props: any) {
  const initUser: IUser = {
    username: "",
    identityId: "",
    firstName: "",
    lastName: "",
    avatarImgKey: "",
    projects: null,
  };

  const initProject: IProject = {
    id: 0,
    title: "",
    description: "",
    category: "",
    categoryId: 0,
    createdAt: "",
    editedAt: "",
    images: [],
    uploadedImages: [],
    files: [],
    fakeFiles: [],
    uploadedFiles: [],
    buildSteps: [],
    user: initUser,
    liked: false,
    collected: false,
  };

  // Setup state
  const project = useHookstate<IProject>(initProject);
  const titleError = useHookstate<{ invalid: boolean; message: string }>({
    invalid: false,
    message: "",
  });
  const categoryError = useHookstate<{ invalid: boolean; message: string }>({
    invalid: false,
    message: "",
  });
  const showModal = useHookstate(false);
  const modalSuccess = useHookstate(false);
  const projectCategories = useHookstate<ICategory[]>([]);
  const validated = useHookstate(false);
  const descHasText = useHookstate(false);
  const formValidationErrors = useHookstate(false);
  const hasImage = useHookstate(false);
  const modalRoute = useHookstate("");
  const editorState = useHookstate(EditorState.createEmpty());
  const showAlert = useHookstate(false);
  const history = useHistory();
  const classes = useStyles();

  // Downgrade image state property because Hookstate can't handle the File type
  project.images.attach(Downgraded);

  useEffect(() => {
    getProjectCategories().then((response) => {
      if (response && response.status === 200) {
        projectCategories.set(response.data);
      }
    });

    function getProjectImages() {
      const images = project.files.value.filter((i) => i.isImage === true);
      images.forEach((image: IFile) => {
        Storage.get(image.key, {
          level: "protected",
          identityId: image.identityId,
          download: true,
        })
          .then((response: any) => {
            // Convert the Blob into a File
            var file = new File([response.Body], image.fileName);
            // Save it in the state
            project.uploadedImages.merge([file]);
          })
          .catch((error) => console.log(error));
      });
    }

    async function convertFiles(files: IFile[]) {
      const newFilePromiseList = files.map(async (file) => {
        try {
          const url: any = await Storage.get(file.key, {
            level: "protected",
            identityId: file.identityId,
          });

          const newFakeFile: IFakeFile = {
            name: file.fileName,
            size: file.size,
            url: url,
          };

          return newFakeFile;
        } catch (error) {
          console.log(error);
        }
      });

      const newFileList = await Promise.all(newFilePromiseList);
      return newFileList;
    }

    function getBuildStepImages(buildStep: State<IBuildStep>) {
      const images = buildStep.files.value.filter((i) => i.isImage === true);
      images.forEach((image: IFile) => {
        Storage.get(image.key, {
          level: "protected",
          identityId: image.identityId,
          download: true,
        })
          .then((response: any) => {
            // Convert the Blob into a File
            var file = new File([response.Body], image.fileName);
            // Save it in the state
            buildStep.uploadedImages.merge([file]);
          })
          .catch((error) => console.log(error));
      });
    }

    getProject(props.match.params.id)
      .then((response) => {
        console.log(response);
        if (response && response.status == 200) {
          project.set(response.data);

          // TODO: Set the null uploadedFiles to an empty list
          project.uploadedFiles.set([]);
        }
      })
      .then(async () => {
        getProjectImages();

        // Decode the project description
        const jsonDescription: RawDraftContentState = JSON.parse(
          atob(project.description.value)
        );

        // Convert the raw json into an editorState
        const newEditorState = EditorState.createWithContent(
          convertFromRaw(jsonDescription)
        );
        editorState.set(newEditorState);

        // Create project files
        const projectFiles = project.files.value.filter(
          (f) => f.isImage === false
        );
        const fileListRaw = await convertFiles(projectFiles);
        // Typescript typeguard to filter undefined
        const fileList = fileListRaw.filter(
          (f: IFakeFile | undefined): f is IFakeFile => !!f
        );
        project.fakeFiles.set(fileList);

        // Get all build step images
        project.buildSteps.map(getBuildStepImages);

        // Convert buildstep files to IFakeFile
        project.buildSteps.forEach(async (buildStep) => {
          const buildStepFiles = buildStep.files.value.filter(
            (f) => f.isImage === false
          );
          const fileListRaw = await convertFiles(buildStepFiles);
          // Typescript typeguard to filter undefined
          const fileList = fileListRaw.filter(
            (f: IFakeFile | undefined): f is IFakeFile => !!f
          );
          buildStep.fakeFiles.set(fileList);
        });
      })
      .catch((error) => console.log(error));
  }, []); // Note: Empty array at the end ensures that this is only performed once during mount

  function addBuildStepClick() {
    const order = project.buildSteps.get().length + 1;

    const initBuildStep: IBuildStep = {
      id: 0,
      order: order,
      title: "",
      titleInvalid: false,
      description: "",
      images: [],
      uploadedImages: [],
      files: [],
      fakeFiles: [],
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
    console.log(descHasText.value);
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
      editProject(project.get()).then((response: any) => {
        console.log(response);
        if (response && response.status === 201) {
          modalSuccess.set(true);
          modalRoute.set("/project/" + response.data.id);
        } else {
          // TODO: handle error
          modalSuccess.set(false);
        }
      });
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
      return subcats.map((sc) => (
        <option key={"subcat-" + sc.id} value={sc.id}>
          {sc.name}
        </option>
      ));
    }

    return projectCategories.value.map((cat) => {
      return (
        <optgroup key={"cat-" + cat.id} label={cat.name}>
          {mapSubcategories(cat.subcategories)}
        </optgroup>
      );
    });
  }

  function handleProjectTitleChange(
    event: React.ChangeEvent<{ value: unknown }>
  ) {
    // if there is an error, then clear in on change.
    if (titleError.invalid.value) {
      titleError.set({ invalid: false, message: "" });
    }
    project.title.set(event.target.value as string);
  }

  function handleAlertClose() {
    showAlert.set(false);
  }

  function handleDropdownSelect(event: React.ChangeEvent<{ value: unknown }>) {
    if (categoryError.invalid.value) {
      categoryError.set({ invalid: false, message: "" });
    }
    project.categoryId.set(parseInt(event.target.value as string));
  }

  return (
    <div className={classes.content}>
      <PageNav project={project} navType={SideNavType.EditProject} />
      <Container maxWidth="md">
        <Box mb={2}>
          <Grid container>
            <Grid item sm={8}>
              <Typography variant="h4" className={classes.pageTitle}>
                Edit Project
              </Typography>
            </Grid>
            <Grid item sm={4}>
              <ButtonGroup
                variant="contained"
                className={classes.topButtons}
                aria-label="cancel preview publish"
              >
                <Button color="secondary">Cancel</Button>
                <Button>Preview</Button>
                <Button color="primary" type="submit" form="main-form">
                  Publish
                </Button>
              </ButtonGroup>
            </Grid>
          </Grid>
        </Box>

        <Paper id="#main_card" className={classes.paper}>
          <form id="main-form" noValidate onSubmit={handleSubmit}>
            <TextField
              error={titleError.invalid.value}
              id="project-title"
              label="Project Title"
              classes={{ root: classes.formControlRoot }}
              className={classes.inputProjectTitle}
              helperText={titleError.message.value}
              onChange={handleProjectTitleChange}
              value={project.title.value}
              required
            />

            <TextField
              className={`${classes.categorySelect} ${classes.formControlRoot}`}
              id="project-category"
              label="Project Category"
              select
              required
              SelectProps={{
                native: true,
              }}
              error={categoryError.invalid.value}
              onChange={handleDropdownSelect}
              value={
                project.categoryId.value === 0 ? "" : project.categoryId.value
              }
              helperText={categoryError.message.value}
            >
              <option value="" disabled></option>
              {buildCategoryDropdown()}
            </TextField>

            <ImageUpload
              images={project.uploadedImages}
              validated={validated.get()}
            />
            <Box marginTop={3}>
              <TextEditor
                description={project.description}
                editorState={editorState}
                hasText={(result) => descHasText.set(result)}
                validated={validated.get()}
              />
            </Box>
            <FileUpload
              files={project.uploadedFiles}
              fakeFiles={project.fakeFiles}
            />
          </form>
        </Paper>
        <BuildSteps
          buildSteps={project.buildSteps}
          validated={validated.get()}
        />
        <Button
          variant="outlined"
          color="primary"
          className="float-right my-3"
          onClick={addBuildStepClick}
        >
          + Add Build Step
        </Button>
      </Container>
      <UploadingProjectModal
        show={showModal.get()}
        onHide={handleOnHide}
        successful={modalSuccess.get()}
      />
      <Snackbar
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        open={showAlert.value}
        onClose={handleAlertClose}
        message="Please fix the form errors below."
        key={"top" + "center"}
        autoHideDuration={10000}
      />
    </div>
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
  const [executeScroll, elRef] = useScroll();
  const classes = useStyles();
  const location = useLocation();

  useEffect(() => {
    if (buildStep.description.value !== "") {
      // Decode the project description
      const jsonDescription: RawDraftContentState = JSON.parse(
        atob(buildStep.description.value)
      );
      // Convert the raw json into an editorState
      const newEditorState = EditorState.createWithContent(
        convertFromRaw(jsonDescription)
      );
      editorState.set(newEditorState);
    }

    console.log("hit");

    if (location.hash === `#${buildStep.id.value}`) executeScroll();
  }, []);

  // TODO: this will need to confirm deletion if there is any information in the buildstep
  function deleteBuildStepClick() {
    // Remove this build step
    buildStep.set(none);

    // Call reorder function
    props.reorder();
  }

  function handleTitleChange(event: React.ChangeEvent<HTMLInputElement>) {
    if (buildStep.titleInvalid.value) {
      buildStep.titleInvalid.set(false);
    }
    buildStep.title.set(event.target.value);
  }

  const titleHelperText = buildStep.titleInvalid.value
    ? "Build Step Title is required."
    : "";

  return (
    <Paper id={buildStep.id.value.toString()} className={classes.bsPaper}>
      <form id="main-form" noValidate>
        <TextField
          id="build-step-title"
          label="Build Step Title"
          classes={{ root: classes.formControlRoot }}
          className={classes.inputProjectTitle}
          error={buildStep.titleInvalid.value}
          helperText={titleHelperText}
          onChange={handleTitleChange}
          value={buildStep.title.value}
          required
        />

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
      </form>
      <FileUpload
        files={buildStep.uploadedFiles}
        fakeFiles={buildStep.fakeFiles}
      />
      <Button
        variant="contained"
        color="secondary"
        className={classes.bsDeleteBtn}
        onClick={deleteBuildStepClick}
      >
        Delete
      </Button>
    </Paper>
  );
}
