import { CognitoUser } from "@aws-amplify/auth";

export enum SideNavType {
  Project,
  CreateProject,
  EditProject,
}

export enum SideNavCategory {
  Description,
  Comments,
  Files,
  BuildLog,
}

export interface IHomeProject {
  id: number;
  title: string;
  category: string;
  image: IFile;
  imageUrl: string;
  user: IUser;
  liked: boolean;
  collected: boolean;
}

export interface IProject {
  id: number;
  title: string;
  description: string;
  category: string;
  categoryId: number;
  createdAt: string;
  editedAt: string;
  buildSteps: IBuildStep[];
  images: IFile[];
  uploadedImages: File[];
  files: IFile[];
  uploadedFiles: File[];
  fakeFiles: IFakeFile[];
  user: IUser;
  liked: boolean;
  collected: boolean;
}

export interface IFile {
  fileName: string;
  identityId: string;
  key: string;
  isImage: boolean;
  size: number;
}

export interface IFakeFile {
  name: string;
  size: number;
  url: string;
}

export interface IBuildStep {
  id: number;
  order: number;
  title: string;
  description: string;
  images: IFile[];
  uploadedImages: File[];
  files: IFile[];
  fakeFiles: IFakeFile[];
  uploadedFiles: File[];
}

export interface ICategory {
  id: string;
  name: string;
  subcategories: ICategory[];
}

export interface ICreateProjectResponse {
  project_id: string;
}

export interface IUser {
  username?: string;
  identityId: string;
  firstName?: string;
  lastName?: string;
  avatarImgKey?: string;
  projects: string[] | null;
}

export interface ICreateUser {
  identityId: string;
  username: string;
  avatarPath: string;
  firstName: string;
  lastName: string;
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

export interface IComment {
  id: number;
  createdAt: string;
  editedAt: string;
  text: string;
  user: IBasicUser;
  parentId: number;
  projectId: number;
  childCount: number;
}

export interface IChildComment {
  id: number;
  createdAt: string;
  editedAt: string;
  text: string;
  user: IBasicUser;
  inReplyTo: IBasicUser;
  parentId: number;
}

export interface IBasicUser {
  identityId: string;
  username: string;
}
