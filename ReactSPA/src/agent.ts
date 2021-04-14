import { Storage } from "aws-amplify";
import axios from "axios";
import { getUserToken } from "./helpers";
import { uuid } from "uuidv4";
import { globalState } from "./globalState";
import {
  ICategory,
  ICreateProjectResponse,
  ICreateUser,
  IUser,
  IProject,
  IBuildStep,
  IFile,
  IComment,
  IChildComment,
} from "./types";

// Configure the global level for aws storage.
// See: https://docs.amplify.aws/lib/storage/configureaccess/q/platform/js
Storage.configure({ level: "protected" });

const http = axios.create({
  baseURL: "https://localhost:5001/",
});

// Upload File to S3
const s3FileUpload = async (file: File) => {
  try {
    const fileName = uuid() + "-" + file.name;
    const result: any = await Storage.put(fileName, file, {
      level: "protected",
      contentType: file.type,
    });
    console.log(result);
    return result.key;
  } catch (err) {
    console.log(err);
    // TODO: error handling
    return "err";
  }
};

// Helper: Upload Files to S3
const s3FilesUpload = (files: File[], isImage: boolean) => {
  return files.map(async (file) => {
    const key = await s3FileUpload(file);
    return {
      fileName: file.name,
      key: key,
      isImage: isImage,
      size: file.size,
    } as IFile;
  });
};

export async function getProjects() {
  try {
    const response = await http.get("/api/projects", {
      headers: {
        Authorization: `Bearer ${getUserToken()}`,
        "Content-type": "application/json",
      },
    });

    console.log(response);
    return response;
  } catch (error) {
    console.log(error);
  }
}

export async function getProject(id: string) {
  try {
    const response = await http.get<IProject>("/api/projects/" + id, {
      headers: {
        Authorization: `Bearer ${getUserToken()}`,
        "Content-type": "application/json",
      },
    });

    return response;
  } catch (error) {
    console.log(error);
  }
}

async function uploadProject(project: IProject) {
  async function convertBuildStep(step: IBuildStep) {
    // Upload all the build step images and files to S3
    const bsImageObjList = await Promise.all(
      s3FilesUpload(step.uploadedImages ? step.uploadedImages : [], true)
    );
    const bsFileAttachmentObjList = await Promise.all(
      s3FilesUpload(step.uploadedFiles ? step.uploadedFiles : [], false)
    );

    const newFileList = bsImageObjList.concat(bsFileAttachmentObjList);

    // Return the build step
    return {
      title: step.title,
      description: step.description,
      files: newFileList,
    };
  }

  const bsPromiseArr = project.buildSteps.map(convertBuildStep);
  const buildSteps = await Promise.all(bsPromiseArr);

  // Upload all the project images and files to S3
  const projectImageObjList: IFile[] = [];
  const projectFileObjList: IFile[] = [];

  if (project.uploadedImages) {
    const result = await Promise.all(
      s3FilesUpload(project.uploadedImages, true)
    );
    projectImageObjList.concat(result);
  }

  if (project.uploadedFiles) {
    const result = await Promise.all(
      s3FilesUpload(project.uploadedFiles, false)
    );
    projectFileObjList.concat(result);
  }

  const newFileList = projectImageObjList.concat(projectFileObjList);

  const newProject = {
    title: project.title,
    description: project.description,
    categoryId: project.categoryId,
    userId: globalState.identityId.value,
    buildSteps: buildSteps,
    files: newFileList,
  };

  return newProject;
}

export async function createProject(project: IProject) {
  console.log(project);
  const newProject = await uploadProject(project);

  try {
    const response = await http.post<ICreateProjectResponse>(
      "/api/projects",
      JSON.stringify(newProject),
      {
        headers: {
          "Content-type": "application/json",
          Authorization: `Bearer ${getUserToken()}`,
        },
        // Manually map the response to a Typescript interface.
        transformResponse: [(response: any) => JSON.parse(response)],
      }
    );
    console.log("response:", response); // TODO: for development
    return response;
  } catch (error) {
    console.log(error);
    return null;
  }
}

export async function editProject(project: IProject) {
  // Remove project images from S3
  async function removefilesFromS3(
    files: IFile[],
    uploadedImages: File[],
    uploadedFiles: File[]
  ) {
    // find images that are not in the files list
    const originalImages = files.filter((f) => f.isImage);
    const originalFiles = files.filter((f) => !f.isImage);

    const removedImages = originalImages.filter(
      (f) => !uploadedImages.map((ui) => ui.name).includes(f.fileName)
    );

    const newImages = uploadedImages.filter(
      (f) => !originalImages.map((oi) => oi.fileName).includes(f.name)
    );

    const removedFiles = originalFiles.filter(
      (f) => !project.fakeFiles.map((uf) => uf.name).includes(f.fileName)
    );

    const newFiles = uploadedFiles.filter(
      (f) => !originalFiles.map((oi) => oi.fileName).includes(f.name)
    );

    // TODO: For testing
    console.log("Removed Images", removedImages);
    console.log("New Images", newImages);
    console.log("Removed Files", removedFiles);
    console.log("New Files", newFiles);

    const filesToRemove = removedImages.concat(removedFiles);

    // Remove project files from S3
    filesToRemove.forEach(async (ri) => {
      try {
        const response = await Storage.remove(ri.key, {
          level: "protected",
        });
        // TODO: Figure out how to handle a failed response
        console.log(response);
      } catch (error) {
        console.log(error);
      }
    });

    return {
      removedImage: removedImages,
      removedFiles: removedFiles,
      addedImages: newImages,
      addedFiles: newFiles,
    };
  }

  // Remove Project images from S3
  const projectFileResult = await removefilesFromS3(
    project.files ? project.files : [],
    project.uploadedImages ? project.uploadedImages : [],
    project.uploadedFiles ? project.uploadedFiles : []
  );

  // Remove the images from the Project
  if (project.uploadedImages) {
    const updatedProjectImages = project.uploadedImages.filter((ui) =>
      projectFileResult.removedImage.map((ri) => ri.fileName).includes(ui.name)
    );

    // Update the Project object with the new and removed images
    project.uploadedImages = updatedProjectImages.concat(
      projectFileResult.addedImages
    );
    console.log("Updating Project object images");
  }

  if (project.uploadedFiles) {
    // Remove the files from the project
    const updatedProjectFiles = project.uploadedFiles.filter((uf) =>
      projectFileResult.removedFiles.map((rf) => rf.fileName).includes(uf.name)
    );

    // Update the Project object with the new and removed files
    project.uploadedFiles = updatedProjectFiles.concat(
      projectFileResult.addedFiles
    );
    console.log("Updating Project object files");
  }

  // Remove build step files from S3
  project.buildSteps.forEach(async (bs) => {
    const buildStepResult = await removefilesFromS3(
      bs.files ? bs.files : [],
      bs.uploadedImages ? bs.uploadedImages : [],
      bs.uploadedFiles ? bs.uploadedFiles : []
    );

    // Remove the images from the build step
    if (bs.uploadedImages) {
      const updatedBSImages = bs.uploadedImages.filter((ui) =>
        buildStepResult.removedImage.map((ri) => ri.fileName).includes(ui.name)
      );

      // Update the Project object with the new and removed images
      project.uploadedImages = updatedBSImages.concat(
        buildStepResult.addedImages
      );
    }

    // Remove the files from the build step
    if (bs.uploadedFiles) {
      const updatedBSFiles = project.uploadedFiles.filter((uf) =>
        buildStepResult.removedFiles.map((rf) => rf.fileName).includes(uf.name)
      );

      // Update the build step object with the new and removed files
      project.uploadedFiles = updatedBSFiles.concat(buildStepResult.addedFiles);
    }
  });

  const newProject = await uploadProject(project);

  console.log(newProject);
  // try {
  //   // TODO: Check the type on this
  //   const response = await http.put<ICreateProjectResponse>(
  //     "/api/projects",
  //     JSON.stringify(newProject),
  //     {
  //       headers: {
  //         "Content-type": "application/json",
  //         Authorization: `Bearer ${getUserToken()}`,
  //       },
  //       // Manually map the response to a Typescript interface.
  //       transformResponse: [(response: any) => JSON.parse(response)],
  //     }
  //   );
  //   console.log("response:", response); // TODO: for development
  //   return response;
  // } catch (error) {
  //   console.log(error);
  //   return null;
  // }
}

export async function getProjectCategories() {
  try {
    const cats = await http.get<ICategory[]>("/api/categories", {
      // Manually map the response to a Typescript interface.
      transformResponse: [(response: any) => JSON.parse(response)],
    });
    return cats;
  } catch (err) {
    console.log(err);
    return null;
  }
}

export async function getUser(sub: string) {
  try {
    const response = await http.get<IUser>("/api/users/" + sub, {
      headers: {
        "Content-type": "application/json",
        Authorization: `Bearer ${getUserToken()}`,
      },
      // Manually map the response to a Typescript interface.
      transformResponse: [(response: any) => JSON.parse(response)],
    });
    return response;
  } catch (err) {
    console.log(err);
    return null;
  }
}

export async function createUser(id: string, username: string) {
  try {
    // Create a user opject to send to the api
    const newUser = {
      identityId: id,
      username: username,
      sub: globalState.sub.value,
    };

    const response = await http.post<ICreateUser>("/api/users", newUser, {
      headers: {
        "Content-type": "application/json",
        Authorization: `Bearer ${getUserToken()}`,
      },
      // Manually map the response to a Typescript interface.
      transformResponse: [(response: any) => JSON.parse(response)],
    });
    return response;
  } catch (err) {
    console.log(err);
    return null;
  }
}

export async function updateUser(user: IUser) {
  console.log(user);
  try {
    const response = await http.put(
      "/api/users/" + user.identityId,
      JSON.stringify(user),
      {
        headers: {
          "Content-type": "application/json",
          Authorization: `Bearer ${getUserToken()}`,
        },
      }
    );
    return response;
  } catch (err) {
    console.log(err);
    return null;
  }
}

export async function userExists(identityId: string) {
  try {
    const response = await http.get("/api/users/userexists/" + identityId, {
      headers: {
        "Content-type": "application/json",
        Authorization: `Bearer ${getUserToken()}`,
      },
    });
    if (response && response.status === 204) return true;
    return false;
  } catch (err) {
    console.log(err);
    return false;
  }
}

export async function likeProject(projectId: number, identityId: string) {
  try {
    const response = await http.post(
      "/api/likes",
      JSON.stringify({ projectId, identityId }),
      {
        headers: {
          "Content-type": "application/json",
          Authorization: `Bearer ${getUserToken()}`,
        },
      }
    );
    return response;
  } catch (err) {
    console.log(err);
    return null;
  }
}

export async function unlikeProject(projectId: number, identityId: string) {
  try {
    const response = await http.put(
      "/api/likes",
      JSON.stringify({ projectId, identityId }),
      {
        headers: {
          "Content-type": "application/json",
          Authorization: `Bearer ${getUserToken()}`,
        },
      }
    );
    return response;
  } catch (err) {
    console.log(err);
    return null;
  }
}

export async function collectProject(projectId: number, identityId: string) {
  try {
    const response = await http.post(
      "/api/collects",
      JSON.stringify({ projectId, identityId }),
      {
        headers: {
          "Content-type": "application/json",
          Authorization: `Bearer ${getUserToken()}`,
        },
      }
    );
    return response;
  } catch (err) {
    console.log(err);
    return null;
  }
}

export async function uncollectProject(projectId: number, identityId: string) {
  try {
    const response = await http.put(
      "/api/collects",
      JSON.stringify({ projectId, identityId }),
      {
        headers: {
          "Content-type": "application/json",
          Authorization: `Bearer ${getUserToken()}`,
        },
      }
    );
    return response;
  } catch (err) {
    console.log(err);
    return null;
  }
}

export async function getProjectComments(projectId: number) {
  try {
    const response = await http.get<IComment[]>(
      "/api/comments/projectcomments/" + projectId.toString(),
      {
        // Manually map the response to a Typescript interface.
        transformResponse: [(response) => JSON.parse(response)],
      }
    );
    return response;
  } catch (err) {
    console.log(err);
    return null;
  }
}

export async function getBuildStepComments(buildStepId: number) {
  try {
    const response = await http.get<IComment[]>(
      "/api/comments/buildstepcomments/" + buildStepId.toString(),
      {
        // Manually map the response to a Typescript interface.
        transformResponse: [(response) => JSON.parse(response)],
      }
    );
    return response;
  } catch (err) {
    console.log(err);
    return null;
  }
}

export async function getChildComments(parentId: number) {
  try {
    const response = await http.get<IChildComment[]>(
      "/api/comments/childcomments/" + parentId.toString(),
      {
        // Manually map the response to a Typescript interface.
        transformResponse: [(response) => JSON.parse(response)],
      }
    );
    return response;
  } catch (err) {
    console.log(err);
    return null;
  }
}

export async function createComment(
  text: string,
  projectId: number | null,
  buildStepId: number | null
) {
  try {
    console.log(buildStepId);
    const response = await http.post<IComment[]>(
      "/api/comments",
      JSON.stringify({
        identityId: globalState.identityId.value,
        text: text,
        projectId: projectId,
        buildStepId: buildStepId,
      }),
      {
        headers: {
          "Content-type": "application/json",
          Authorization: `Bearer ${getUserToken()}`,
        },
        // Manually map the response to a Typescript interface.
        transformResponse: [(response) => JSON.parse(response)],
      }
    );
    return response;
  } catch (err) {
    console.log(err);
    return null;
  }
}

export async function createChildComment(
  text: string,
  parentId: number,
  inReplyTo: string | undefined
) {
  try {
    const response = await http.post<IChildComment[]>(
      "/api/comments/childcomments",
      JSON.stringify({
        identityId: globalState.identityId.value,
        text: text,
        parentId: parentId,
        inReplyTo: inReplyTo,
      }),
      {
        headers: {
          "Content-type": "application/json",
          Authorization: `Bearer ${getUserToken()}`,
        },
        // Manually map the response to a Typescript interface.
        transformResponse: [(response) => JSON.parse(response)],
      }
    );
    return response;
  } catch (err) {
    console.log(err);
    return null;
  }
}

export async function deleteComment(id: number) {
  try {
    const response = await http.delete("/api/comments/" + id.toString(), {
      headers: {
        "Content-type": "application/json",
        Authorization: `Bearer ${getUserToken()}`,
      },
    });
    return response;
  } catch (err) {
    console.log(err);
    return null;
  }
}

export async function deleteChildComment(id: number) {
  try {
    const response = await http.delete(
      "/api/comments/childcomments/" + id.toString(),
      {
        headers: {
          "Content-type": "application/json",
          Authorization: `Bearer ${getUserToken()}`,
        },
      }
    );
    return response;
  } catch (err) {
    console.log(err);
    return null;
  }
}

export async function editComment(id: number, text: string) {
  try {
    const response = await http.put(
      "/api/comments/" + id.toString(),
      JSON.stringify({
        text: text,
      }),
      {
        headers: {
          "Content-type": "application/json",
          Authorization: `Bearer ${getUserToken()}`,
        },
      }
    );
    return response;
  } catch (err) {
    console.log(err);
    return null;
  }
}

export async function editChildComment(id: number, text: string) {
  try {
    const response = await http.put(
      "/api/comments/childcomments/" + id.toString(),
      JSON.stringify({
        text: text,
      }),
      {
        headers: {
          "Content-type": "application/json",
          Authorization: `Bearer ${getUserToken()}`,
        },
      }
    );
    return response;
  } catch (err) {
    console.log(err);
    return null;
  }
}

export async function reportComment(id: number) {
  try {
    const response = await http.put(
      "/api/comments/reportcomments/" + id.toString(),
      {
        headers: {
          "Content-type": "application/json",
          Authorization: `Bearer ${getUserToken()}`,
        },
      }
    );
    return response;
  } catch (err) {
    console.log(err);
    return null;
  }
}

export async function reportChildComment(id: number) {
  try {
    const response = await http.put(
      "/api/comments/reportchildcomments/" + id.toString(),
      {
        headers: {
          "Content-type": "application/json",
          Authorization: `Bearer ${getUserToken()}`,
        },
      }
    );
    return response;
  } catch (err) {
    console.log(err);
    return null;
  }
}
