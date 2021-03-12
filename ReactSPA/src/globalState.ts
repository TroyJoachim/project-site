import Auth from "@aws-amplify/auth";
import { Hub } from "aws-amplify";
import { createState } from "@hookstate/core";
import { CognitoUserSession } from "amazon-cognito-identity-js";

interface GlobalState {
  isAuthenticating: boolean;
  isAuthenticated: boolean;
  session: CognitoUserSession | null;
  sub: string | null;
}

// Create global state
const globalState = createState<GlobalState>({
  isAuthenticated: false,
  isAuthenticating: true,
  session: null,
  sub: null,
});

const listener = async (data: any) => {
  console.log(data.payload.event);
  switch (data.payload.event) {
    case "signIn":
      console.log("user signed in");
      getAuthenticatedUser();
      break;
    case "signUp":
      console.log("user signed up");
      break;

    case "signOut":
      console.log("user signed out");
      // Reset the global state.
      globalState.set({
        isAuthenticated: false,
        isAuthenticating: false,
        session: null,
        sub: null,
      });
      break;
    case "signIn_failure":
      console.log("user sign in failed");
      break;
    case "tokenRefresh":
      console.log("token refresh succeeded");
      break;
    case "tokenRefresh_failure":
      console.log("token refresh failed");
      break;
    case "configured":
      console.log("the Auth module is configured");
  }
};

Hub.listen("auth", listener);

async function getAuthenticatedUser() {
  console.log("getAuthenticatedUser");
  // TODO: check if the function save the user information in the browsers local state.
  globalState.isAuthenticating.set(true);
  try {
    const user = await Auth.currentAuthenticatedUser();
    if (user !== null) {
      console.log(user);
      globalState.isAuthenticated.set(true);
      globalState.isAuthenticating.set(false);
    }

    // Get the user id
    const attributes = await Auth.userAttributes(user);
    const subResult = attributes.find((a) => a.Name === "sub");
    if (subResult) globalState.sub.set(subResult.getValue());

    // Get User Token and store it in state.
    const session = await Auth.currentSession();
    globalState.session.set(session);
  } catch (error) {
    console.log(error);
    globalState.isAuthenticated.set(false);
    globalState.isAuthenticating.set(false);
  }
}

async function signOut() {
  try {
    await Auth.signOut();
    globalState.isAuthenticated.set(false);
  } catch (error) {
    console.log("error signing out: ", error);
  }
}

export { globalState, getAuthenticatedUser, signOut };
