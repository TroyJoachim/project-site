import React, { useEffect } from "react";
import Amplify from "aws-amplify";
import { AmplifyAuthenticator } from "@aws-amplify/ui-react";
import { useHistory } from "react-router-dom";
import { AuthState, onAuthUIStateChange } from "@aws-amplify/ui-components";
import awsconfig from "./aws-exports";

Amplify.configure(awsconfig);

function SignIn() {
    const history = useHistory();
    useEffect(() => {
        onAuthUIStateChange((nextAuthState, authData) => {
            if (nextAuthState === AuthState.SignedIn) {
                // Go back to the previous page on successful sign in. 
                history.goBack();
            }
        });
    }, []);

    return <AmplifyAuthenticator />;
}

export default SignIn;
