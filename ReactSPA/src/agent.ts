import { Storage } from "aws-amplify";
import axios, { AxiosResponse } from "axios";
import { fileDownload, getUserToken } from "./helpers";
import { uuid } from "uuidv4";
import { globalState } from "./globalState";
import {
  ICategory,
  IGetProjectResponse,
  IProjectResponse,
  IHomeProject,
  IPostProjectResponse,
  ICreateProjectResponse,
  ICategoryResponse,
  ICreateUser,
  IUser,
  IAxiosResponse,
  IUpdateUserResponse,
  IProject,
  IBuildStep,
  IFile,
} from "./types";

// Configure the global level for aws storage.
// See: https://docs.amplify.aws/lib/storage/configureaccess/q/platform/js
Storage.configure({ level: "protected" });

const http = axios.create({
  baseURL: "https://localhost:5001/",
});

interface IProjectsResponse {
  projects: IHomeProject[];
}

function getProjects() {
  return http
    .get<IHomeProject[]>("/api/projects", {
      transformResponse: [
        // Manually map the response to a Typescript interface.
        (response) => {
          const projectResponse: IProjectsResponse = JSON.parse(response);
          return projectResponse;
        },
      ],
    })
    .then((response) => {
      // handle success
      console.log(response);
      return response;
    })
    .catch((error) => {
      // handle error
      console.log(error);
      return null;
    });
}

function getProject(id: string) {
  return http
    .get<IProjectResponse>("/api/projects/" + id, {
      transformResponse: [
        // Manually map the response to a Typescript interface.
        (response) => {
          const projectResponse: IGetProjectResponse = JSON.parse(response);
          return projectResponse;
        },
      ],
    })
    .then((response) => {
      // handle success
      console.log(response);
      return response;
    })
    .catch((error) => {
      // handle error
      console.log(error);
      return null;
    });
}

async function createProject(project: IProject) {
  console.log(project);

  // Upload File to S3
  const s3FileUpload = async (file: File) => {
    const fileName = uuid() + "-" + file.name;
    try {
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
  const s3FilesUpload = (files: File[]) => {
    return files.map(async (file) => {
      const key = await s3FileUpload(file);
      return {
        fileName: file.name,
        key: key,
        identityId: globalState.identityId.value,
        size: file.size,
      } as IFile;
    });
  };

  async function convertBuildStep(step: IBuildStep) {
    // Upload all the build step images and files to S3
    const bsImageObjList = await Promise.all(
      s3FilesUpload(step.uploadedImages)
    );
    const bsFileAttachmentObjList = await Promise.all(
      s3FilesUpload(step.uploadedFiles)
    );

    // Return the build step
    return {
      title: step.title,
      description: step.description,
      images: bsImageObjList,
      files: bsFileAttachmentObjList,
    };
  }

  const bsPromiseArr = project.buildSteps.map(convertBuildStep);

  const buildSteps = await Promise.all(bsPromiseArr);

  // Upload all the project images and files to S3
  const projectImageObjList = await Promise.all(
    s3FilesUpload(project.uploadedImages)
  );
  const projectFileObjList = await Promise.all(
    s3FilesUpload(project.uploadedFiles)
  );

  const newProject = {
    title: project.title,
    description: project.description,
    categoryId: project.categoryId,
    userId: globalState.identityId.value,
    buildSteps: buildSteps,
    images: projectImageObjList,
    files: projectFileObjList,
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
        transformResponse: [
          (response: any) => {
            const projectResponse: IPostProjectResponse = JSON.parse(response);
            return projectResponse;
          },
        ],
      }
    );
    console.log("response:", response); // TODO: for development
    return response;
  } catch (error) {
    console.log(error);
    return null;
  }
}

function downloadFile(url: string, filename: string) {
  // TOOD: removing his for now becaues Axios is configured to add it.
  //       In the future this will probably point to a different url on Amazon s3.
  const newUrl = url.replace("localhost:8000", "");
  http
    .get(newUrl, {
      responseType: "blob",
      headers: {
        Authorization: `Bearer ${getUserToken()}`,
      },
    })
    .then((res) => {
      fileDownload(res.data, filename);
    })
    .catch((error) => {
      console.log(error);
      return null;
    });
}

async function getProjectCategories() {
  try {
    const cats = await http.get<ICategory[]>("/api/categories", {
      // Manually map the response to a Typescript interface.
      transformResponse: [
        (response: any) => {
          const categoryResponse: ICategoryResponse = JSON.parse(response);
          return categoryResponse;
        },
      ],
    });
    return cats;
  } catch (err) {
    console.log(err);
    return null;
  }
}

async function getImage(id: string) {
  try {
    const image = await http.get("api/images/" + id, {
      responseType: "blob",
    });
    return image;
  } catch (err) {
    console.log(err);
    return null;
  }
}

async function getUser(sub: string) {
  try {
    const response = await http.get<IUser>("/api/users/" + sub, {
      headers: {
        "Content-type": "application/json",
        Authorization: `Bearer ${getUserToken()}`,
      },
      // Manually map the response to a Typescript interface.
      transformResponse: [
        (response: any) => {
          const resp: IAxiosResponse = JSON.parse(response);
          return resp;
        },
      ],
    });
    return response;
  } catch (err) {
    console.log(err);
    return null;
  }
}

async function createUser(id: string, username: string) {
  try {
    // Create a user opject to send to the api
    const newUser = {
      identityId: id,
      username: username,
    };

    const response = await http.post<ICreateUser>("/api/users", newUser, {
      headers: {
        "Content-type": "application/json",
        Authorization: `Bearer ${getUserToken()}`,
      },
      // Manually map the response to a Typescript interface.
      transformResponse: [
        (response: any) => {
          const resp: IAxiosResponse = JSON.parse(response);
          return resp;
        },
      ],
    });
    return response;
  } catch (err) {
    console.log(err);
    return null;
  }
}

async function updateUser(user: IUser) {
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

async function userExists(identityId: string) {
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

export {
  http,
  createProject,
  createUser,
  getProjects,
  getProject,
  downloadFile,
  getProjectCategories,
  getImage,
  getUser,
  updateUser,
  userExists,
};
