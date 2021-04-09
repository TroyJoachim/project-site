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
    console.log(response);
    return response;
  } catch (error) {
    console.log(error);
  }
}

export async function createProject(project: IProject) {
  console.log(project);

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

  // Upload Files to S3
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

  async function convertBuildStep(step: IBuildStep) {
    // Upload all the build step images and files to S3
    const bsImageObjList = await Promise.all(
      s3FilesUpload(step.uploadedImages, true)
    );
    const bsFileAttachmentObjList = await Promise.all(
      s3FilesUpload(step.uploadedFiles, false)
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
  const projectImageObjList = await Promise.all(
    s3FilesUpload(project.uploadedImages, true)
  );
  const projectFileObjList = await Promise.all(
    s3FilesUpload(project.uploadedFiles, false)
  );

  const newFileList = projectImageObjList.concat(projectFileObjList);

  const newProject = {
    title: project.title,
    description: project.description,
    categoryId: project.categoryId,
    userId: globalState.identityId.value,
    buildSteps: buildSteps,
    files: newFileList,
  };

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
