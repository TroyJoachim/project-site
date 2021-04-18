import { atom, atomFamily } from "recoil";
import {
  LoginState,
  ForgotPasswordState,
  IComment,
  IChildComment,
  SideNavCategory,
} from "./types";

// Recoil State Atoms
// IMPORTANT: unique ID (with respect to other atoms/selectors)

export const sideMenuOpenState = atom<boolean>({
  key: "sideMenuState",
  default: false,
});

export const sideMenuCategoryState = atom<{
  category: SideNavCategory;
  buildStep: number;
}>({
  key: "sideMenuState",
  default: { category: SideNavCategory.Description, buildStep: -1 },
});

export const authState = atom<LoginState>({
  key: "authState",
  default: {
    user: null,
    username: null,
    cache: null,
  },
});

export const forgotPasswordState = atom<ForgotPasswordState>({
  key: "authState",
  default: {
    sent: false,
    username: "",
  },
});

export const commentState = atomFamily({
  key: "comment-list",
  default: [] as IComment[],
});

export const childCommentState = atomFamily({
  key: "child-comment-list",
  default: [] as IChildComment[],
});
