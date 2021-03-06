import React from "react";
import { createUser } from "./agent";

function TestPage() {
    async function agentCreateUser() {
        const result = await createUser("foobar", "FooBar");
        console.log(result);
    }

    return (
        <div>
            <button onClick={agentCreateUser}>Create user</button>
        </div>
    );
}

export default TestPage;
