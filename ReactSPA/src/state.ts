import {
  RecoilRoot,
  atom,
  selector,
  useRecoilState,
  useRecoilValue,
} from "recoil";

import { LoginState, ForgotPasswordState } from "./types";

// State
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
