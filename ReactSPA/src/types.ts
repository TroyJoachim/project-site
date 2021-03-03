export interface ITempBuildStep {
    order: number;
    name: string;
    description: string;
    images: Image[];
    files: File[];
}

export interface ITempProject {
    id: string;
    name: string;
    description: string;
    subcategory_id: string;
    subcategory: string; // Temporary, need to update api to subcategory_id
    build_steps: ITempBuildStep[];
    images: Image[];
    files: File[];
}

export interface IHomeProject {
    id: string;
    name: string;
    description: string;
    sub_category: string;
    images: string[];
    image: string;
}

export interface Image {
    id: string;
    content: File;
}

export interface IFile {
    id: string;
    file_name: string;
    link: string;
}

export interface IProject {
    id: string;
    name: string;
    description: string;
    subcategory_id: string;
    subcategory: string; // Temporary, need to update api to subcategory_id
    build_steps: IBuildStep[];
    image_ids: string[];
    images: Image[];
    file_attachments: IFile[];
    files: File[];
}

export interface IBuildStep {
    order: number;
    name: string;
    description: string;
    image_ids: string[];
    images: Image[];
    file_attachments: IFile[];
    files: File[];
}

export interface ISubcategory {
    id: string;
    name: string;
}

export interface ICategory {
    id: string;
    name: string;
    subcategories: ISubcategory[];
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
    images: Image[];
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
    images: Image[];
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

export enum LoadingState {
    Loading,
    Completed,
    Failed,
}
