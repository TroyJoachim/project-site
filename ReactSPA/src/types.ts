import { CognitoUser } from "@aws-amplify/auth";

export interface ITempBuildStep {
  order: number;
  name: string;
  description: string;
  images: IImage[];
  files: File[];
}

export interface ITempProject {
  id: string;
  name: string;
  description: string;
  subcategory_id: string;
  subcategory: string; // Temporary, need to update api to subcategory_id
  build_steps: ITempBuildStep[];
  images: IImage[];
  files: File[];
}

export interface IEditProjectModel {
  id: string;
  name: string;
  description: string;
  subcategory_id: string;
  subcategory: string; // Temporary, need to update api to subcategory_id
  creation_datetime: string;
  image_ids: string[];
  images: IImage[];
  build_steps: IEditProjectBuildStepModel[];
  files: File[];
}

export interface IHomeProject {
  id: string;
  name: string;
  sub_category: string;
  images: string[];
  image: string;
}

export interface IProject {
  id: number;
  title: string;
  description: string;
  category: string;
  categoryId: number;
  buildSteps: IBuildStep[];
  images: IImage[];
  uploadedImages: Image[];
  files: IFile[];
  uploadedFiles: File[];
  user: IUser;
}

export interface IImage {
  fileName: string;
  identityId: string;
  path: string;
  size: number;
}

export interface Image {
  id: string;
  content: File;
}

export interface IFile {
  fileName: string;
  identityId: string;
  path: string;
  size: number;
}

export interface IBuildStep {
  order: number;
  title: string;
  description: string;
  images: IImage[];
  uploadedImages: Image[];
  files: File[];
  uploadedFiles: File[];
}

export interface ICategory {
  id: string;
  name: string; 
  subcategories: ICategory[];
}

export interface IBuildStepResponse {
  name: string;
  description: string;
  image_ids: string[];
  file_attachments: IFile[];
}

export interface IBuildStepModel {
  order: number;
  name: string;
  description: string;
  image_ids: string[];
  image_urls: string[];
  file_attachments: IFile[];
}

export interface IProjectModel {
  id: string;
  name: string;
  description: string;
  subcategory_id: string;
  subcategory: string; // Temporary, need to update api to subcategory_id
  creation_datetime: string;
  image_ids: string[];
  image_urls: string[];
  build_steps: IBuildStepModel[];
  file_attachments: IFile[];
}

export interface IEditProjectBuildStepModel {
  order: number;
  name: string;
  description: string;
  image_ids: string[];
  images: IImage[];
  files: File[];
}

export interface IEditProjectModel {
  id: string;
  name: string;
  description: string;
  subcategory_id: string;
  subcategory: string; // Temporary, need to update api to subcategory_id
  creation_datetime: string;
  image_ids: string[];
  images: IImage[];
  build_steps: IEditProjectBuildStepModel[];
  files: File[];
}

export interface IS3Image {
  key: string;
  id: string;
}

export interface IProjectResponse {
  id: string;
  name: string;
  description: string;
  subcategory_id: string;
  subcategory: string; // Temporary, need to update api to subcategory_id
  creation_datetime: string;
  build_steps: IBuildStepResponse[];
  image_ids: string[];
  file_attachments: IFile[];
}

export interface IGetProjectResponse {
  status: number;
  data: IProjectResponse;
}

export interface ICreateProjectResponse {
  project_id: string;
}

export interface IPostProjectResponse {
  status: number;
  data: ICreateProjectResponse;
}

export interface ICategoryResponse {
  status: number;
  data: ICategory;
}

export interface IUser {
  username?: string;
  identityId: string;
  firstName?: string;
  lastName?: string;
  avatarImgKey?: string;
  projects: string[] | null;
}

export enum LoadingState {
  Loading,
  Completed,
  Failed,
}

export interface ICreateUser {
  identityId: string;
  username: string;
  avatarPath: string;
  firstName: string;
  lastName: string;
}

export interface IAxiosResponse {
  status: number;
  data: IUser | ICreateUser;
}

export interface IUpdateUserResponse {
  status: number;
  data: IUser;
}

export interface LoginState {
  user: CognitoUser | any;
  username: string | null;
  cache: string | null;
}

export interface ForgotPasswordState {
  sent: boolean;
  username: string;
}
