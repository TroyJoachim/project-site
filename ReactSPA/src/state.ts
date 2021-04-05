import {
  RecoilRoot,
  atom,
  atomFamily,
  selector,
  useRecoilState,
  useRecoilValue,
} from "recoil";

import {
  LoginState,
  ForgotPasswordState,
  IComment,
  IChildComment,
} from "./types";

// Recoil State Atoms
export const authState = atom<LoginState>({
  key: "authState", // unique ID (with respect to other atoms/selectors)
  default: {
    user: null,
    username: null,
    cache: null,
  }, // default value (aka initial value)
});

export const forgotPasswordState = atom<ForgotPasswordState>({
  key: "authState", // unique ID (with respect to other atoms/selectors)
  default: {
    sent: false,
    username: "",
  }, // default value (aka initial value)
});

export const commentState = atomFamily({
  key: "comment-list",
  default: [] as IComment[],
});

export const childCommentState = atomFamily({
  key: "child-comment-list",
  default: [] as IChildComment[],
});
