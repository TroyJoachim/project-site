import Auth from "@aws-amplify/auth";
import { Hub } from "aws-amplify";
import { createState } from "@hookstate/core";
import { CognitoUserSession } from "amazon-cognito-identity-js";
import { createUser } from "./agent";

interface GlobalState {
    isAuthenticating: boolean;
    isAuthenticated: boolean;
    session: CognitoUserSession | null;
}

// Create global state
const globalState = createState<GlobalState>({
    isAuthenticated: false,
    isAuthenticating: true,
    session: null,
});

const listener = async (data: any) => {
    console.log(data.payload.event);
    switch (data.payload.event) {
        case "signIn":
            console.log("user signed in");
            globalState.isAuthenticated.set(true);
            globalState.isAuthenticating.set(false);
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
    // TODO: check if the function save the user information in the browsers local state.
    globalState.isAuthenticating.set(true);
    try {
        const user = await Auth.currentAuthenticatedUser();
        if (user !== null) {
            console.log(user); // TODO: For dev
            globalState.isAuthenticated.set(true);
            globalState.isAuthenticating.set(false);
        }

        // Get User Token and store it in state.
        Auth.currentSession()
            .then((session) => globalState.session.set(session))
            .catch((err) => console.log(err));
    } catch (error) {
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
