import { Auth, CognitoUser } from "@aws-amplify/auth";
import { createState } from "@hookstate/core";
import { CognitoUserSession } from "amazon-cognito-identity-js";
import { userExists, createUser } from "./agent";

interface GlobalState {
  isAuthenticating: boolean;
  isAuthenticated: boolean;
  session: CognitoUserSession | null;
  identityId: string | null;
  username: string | null;
}

// Create global state
const globalState = createState<GlobalState>({
  isAuthenticating: true,
  isAuthenticated: false,
  session: null,
  identityId: null,
  username: null,
});

// Checks if the user already exists on the API. If they don't then something went wrong during the account creation.
// This function will add the user to the API if they are not found.
async function syncUserAccount(identityId: string, username: string) {
  try {
    // Check if the user exists on the API
    const response = await userExists(identityId);
    if (response) return;

    await createUser(identityId, username);
    // Something else went wrong.
  } catch (error) {
    console.log(error);
  }
}

async function refreshAuthenticatedUser() {
  console.log("refreshAuthenticatedUser");
  // TODO: check if the function save the user information in the browsers local state.
  try {
    const user: CognitoUser = await Auth.currentAuthenticatedUser();
    if (!user) throw new Error("User was empty");
    console.log(user);

    // Get the users identityId and save it to state
    const credentials = await Auth.currentUserCredentials();
    globalState.identityId.set(credentials.identityId);

    // Set the username in global state
    const username = user.getUsername();
    globalState.username.set(username);

    // Get User Token and store it in state.
    const session = await Auth.currentSession();
    globalState.session.set(session);

    // Make sure the user account has been created on the API
    await syncUserAccount(credentials.identityId, username);

    globalState.isAuthenticated.set(true);
  } catch (error) {
    console.log(error);
  }
}

// This function is used at application startup
// If there is a user logged in, it saves their information to the global state.
async function getAuthenticatedUser() {
  console.log("getAuthenticatedUser");
  // TODO: check if the function save the user information in the browsers local state.
  globalState.isAuthenticating.set(true);
  try {
    const user: CognitoUser = await Auth.currentAuthenticatedUser();
    if (!user) throw new Error("User was empty");
    console.log(user);

    // Get the users identityId and save it to state
    const credentials = await Auth.currentUserCredentials();
    globalState.identityId.set(credentials.identityId);

    // Set the username in global state
    const username = user.getUsername();
    globalState.username.set(username);

    // Get User Token and store it in state.
    const session = await Auth.currentSession();
    globalState.session.set(session);

    // Make sure the user account has been created on the API
    await syncUserAccount(credentials.identityId, username);

    globalState.isAuthenticated.set(true);
  } catch (error) {
    console.log(error);
  } finally {
    globalState.isAuthenticating.set(false);
  }
}

async function signOut() {
  try {
    await Auth.signOut();
    globalState.isAuthenticated.set(false);

    globalState.set({
      isAuthenticated: false,
      isAuthenticating: false,
      session: null,
      identityId: null,
      username: null,
    });
  } catch (error) {
    console.log("error signing out: ", error);
  }
}

export { globalState, getAuthenticatedUser, signOut, refreshAuthenticatedUser };
