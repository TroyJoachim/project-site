import React, { useEffect } from "react";
import TopNav from "./TopNav";
import Home from "./Home";
import Project from "./Project";
import CreateProject from "./CreateProject";
import EditProject from "./EditProject";
import UserDashboard from "./UserDashboard";
import Footer from "./Footer";
import Authentication from "./Authentication";
import TestPage from "./TestPage";
import MyAccount from "./MyAccount";
import { globalState, getAuthenticatedUser } from "./globalState";
import { useHookstate } from "@hookstate/core";
import {
    BrowserRouter as Router,
    Switch,
    Route,
    Redirect,
} from "react-router-dom";

function ProtectedRoute(props: {
    path: string;
    component: (props: any) => JSX.Element;
}) {
    const gState = useHookstate(globalState);
    if (gState.isAuthenticated.get()) {
        return <Route path={props.path} component={props.component} />;
    } else {
        return <Redirect to={"/sign-in"} />;
    }
}

function App() {
    const gState = useHookstate(globalState);

    useEffect(() => {
        getAuthenticatedUser();
    }, []);

    // Wait for the authentication api to return before loading
    if (!gState.isAuthenticating.get()) {
        return (
            <Router>
                <TopNav />
                <main className="flex-shrink-0">
                    <Switch>
                        <Route exact path="/">
                            <Home />
                        </Route>

                        <Route path="/project/:id" component={Project} />

                        <Route exact path="/test-page">
                            <TestPage />
                        </Route>

                        <Route
                            path={[
                                "/sign-in",
                                "/create-account",
                                "/confirm-account",
                                "/forgot-password",
                                "/new-password",
                            ]}
                        >
                            <Authentication />
                        </Route>

                        <ProtectedRoute
                            path="/create-project"
                            component={CreateProject}
                        />

                        <ProtectedRoute
                            path="/edit-project/:id"
                            component={EditProject}
                        />

                        <ProtectedRoute
                            path="/dashboard/:username"
                            component={UserDashboard}
                        />

                        <ProtectedRoute
                            path="/my-account/:id"
                            component={MyAccount}
                        />
                    </Switch>
                </main>
                <Footer />
            </Router>
        );
    } else {
        return <></>;
    }
}

export default App;
