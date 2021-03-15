import { Storage } from "aws-amplify";
import axios, { AxiosResponse } from "axios";
import { fileDownload, getUserToken, getIdentityId } from "./helpers";
import { uuid } from "uuidv4";
import {
  ITempProject,
  ITempBuildStep,
  Image,
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

async function createProject(project: ITempProject, subcategoryId: string) {
  console.log(project);

  // S3 file uploads
  // TODO: Not using yet. I was testing direct s3 file uploads.
  async function uploadFileToS3(file: File | Image) {
    // Check the type
    function isFile(file: File | Image): file is File {
      return (file as File) !== undefined;
    }

    async function uploadFile(
      fileName: string,
      contentType: string
    ): Promise<string> {
      try {
        const result: any = await Storage.put(fileName, file, {
          contentType: contentType,
        });
        console.log(result);
        return result.key;
      } catch (err) {
        console.log(err);
        // TODO: error handling
        return "err";
      }
    }

    if (isFile(file)) {
      // Create a unique file name.
      // TODO:
      // Research if this is needed. If names are the same on s3, then the image will overwrite the old one
      // with the same name. This is both good and bad. It's good because it reduces duplicate images, but
      // it's bad because someone uploads a different image with the same name. Each users images will be stored
      // in their own folder on s3, so only they will be effected by the duplicate name.
      const fileName = uuid() + "." + file.name.split(".").pop();
      return uploadFile(fileName, file.type);
    } else {
      const fileName = uuid() + "." + file.content.name.split(".").pop();
      return uploadFile(fileName, file.content.type);
    }
  }

  const id = await getIdentityId();

  const toFileObj = (key: string) => {
    const obj = {
      key: key,
      userId: id,
    };

    // TODO: storing a json string for now until we update the db schema.
    return JSON.stringify(obj);
  };

  async function convertBuildStep(step: ITempBuildStep) {
    // upload build step files to the server
    const promiseFileArr = step.files.map(async (file: File) => {
      const response: AxiosResponse = await uploadFiles(
        "/api/attachment_files",
        file
      );
      return response.data.file_attachment_id;
    });

    // Upload build step images to the server
    const promiseImageArr = step.images.map(async (file: Image) => {
      const response: AxiosResponse = await uploadFiles(
        "/api/images",
        file.content
      );
      return response.data.image_id;
    });

    // S3 file uploading
    // const promiseS3ImageUploadArr = step.images.map(async (file: Image) => {
    //     return await uploadFileToS3(file);
    // });

    // const promiseS3FileUploadArr = step.files.map(async (file: File) => {
    //     return await uploadFileToS3(file);
    // });

    // When all the Promises have been resolved
    const bsImageIds = await Promise.all(promiseImageArr);
    const bsfileAttachmentIds = await Promise.all(promiseFileArr);

    // S3 file uploads
    // const bsImageKeys = await Promise.all(promiseS3ImageUploadArr);
    // const bsFileAttachmentKeys = await Promise.all(promiseS3FileUploadArr);
    // Create an image and file object to store in the db
    // const imageObjectArr = bsImageKeys.map(toFileObj);
    // const fileObjectArr = bsFileAttachmentKeys.map(toFileObj);

    // Return the build step
    return {
      name: step.name,
      description: step.description,
      image_ids: bsImageIds,
      file_attachment_ids: bsfileAttachmentIds,
    };
  }

  async function uploadFiles(url: string, file: File) {
    console.log(file);
    var formData = new FormData();
    formData.append("file", file, file.name);

    return await http.post(url, formData, {
      headers: {
        "content-type": "multipart/form-data",
        Authorization: `Bearer ${getUserToken()}`,
      },
    });
  }

  const bsPromiseArr = project.build_steps.map(convertBuildStep);
  const projectPromise = Promise.all(bsPromiseArr).then(async (result) => {
    const promiseFileArr = project.files.map(async (file: File) => {
      const response: AxiosResponse = await uploadFiles(
        "/api/attachment_files",
        file
      );
      return response.data.file_attachment_id;
    });

    const promiseImageArr = project.images.map(async (file: Image) => {
      const response: AxiosResponse = await uploadFiles(
        "/api/images",
        file.content
      );
      return response.data.image_id;
    });

    // const promiseS3ImageUploadArr = project.images.map(
    //     async (file: Image) => {
    //         return await uploadFileToS3(file);
    //     }
    // );

    // const promiseS3FileUploadArr = project.files.map(async (file: File) => {
    //     return await uploadFileToS3(file);
    // });

    const projectImageIds = await Promise.all(promiseImageArr);
    const projectFileAttachmentIds = await Promise.all(promiseFileArr);

    // S3 file uploads
    // const projectImageKeys = await Promise.all(promiseS3ImageUploadArr);
    // const projectFileKeys = await Promise.all(promiseS3FileUploadArr);

    return {
      name: project.name,
      description: project.description,
      subcategory_id: subcategoryId,
      image_ids: projectImageIds,
      build_steps: result,
      file_attachment_ids: projectFileAttachmentIds,
    };
  });

  async function uploadProject(result: any) {
    return await http.post<ICreateProjectResponse>("/api/projects", result, {
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
    });
  }

  const result = await projectPromise;
  try {
    const response = await uploadProject(result);
    console.log("response: ", response); // TODO: for development
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
};
