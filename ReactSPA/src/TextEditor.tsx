import React from "react";
import { useHookstate, StateMethods, Downgraded } from "@hookstate/core";
import { Editor } from "react-draft-wysiwyg";
import { EditorState, convertToRaw } from "draft-js";
import "../node_modules/react-draft-wysiwyg/dist/react-draft-wysiwyg.css";

interface ITextEditor {
    description: StateMethods<string>;
    editorState: StateMethods<EditorState>;
    validated: boolean;
    hasText: (value: boolean) => void;
}
function TextEditor(props: ITextEditor) {
    // scoped state is optional for performance
    // could have used props.state everywhere instead
    const description = useHookstate(props.description);

    // Downgrade the Project files property
    // https://hookstate.js.org/docs/performance-managed-rendering#downgraded-plugin
    props.editorState.attach(Downgraded);

    const onEditorStateChange = (newEditorState: any) => {
        props.editorState.set(newEditorState);
        const contentState = newEditorState.getCurrentContent();
        props.hasText(contentState.hasText());

        // TODO: We probably should just save the raw json object into the database.
        if (contentState) {
            description.set(JSON.stringify(convertToRaw(contentState)));
        }
    };

    // Checks if the form validation is needed and description text has been entered.
    const invalidDesc =
        props.validated === true &&
        !props.editorState.get().getCurrentContent().hasText();
    function feedback() {
        if (invalidDesc) {
            return (
                <div className="invalid-feedback" style={{ display: "block" }}>
                    Please enter a project description.
                </div>
            );
        } else {
            <></>;
        }
    }

    return (
        <>
            <Editor
                editorState={props.editorState.get()}
                toolbarStyle={{
                    border: "none",
                    borderBottom: "1px solid #dee2e6",
                }}
                wrapperStyle={
                    invalidDesc
                        ? { border: "1px solid red" }
                        : { border: "1px solid #dee2e6" }
                }
                onEditorStateChange={onEditorStateChange}
                editorStyle={{ padding: "0 10px", minHeight: "15rem" }}
                toolbar={{
                    options: [
                        "inline",
                        "blockType",
                        "fontSize",
                        "list",
                        "textAlign",
                        "link",
                        "remove",
                        "history",
                    ],
                }}
            />
            {feedback()}
        </>
    );
}

export default TextEditor;
