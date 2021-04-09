import React from "react";
import { useHookstate, State, none } from "@hookstate/core";
import Button from "react-bootstrap/Button";
import Table from "react-bootstrap/Table";
import { humanFileSize } from "./helpers";
import { IFakeFile } from "./types";

export default function FileUpload(props: {
  files: State<File[]>;
  fakeFiles: State<IFakeFile[]>;
}) {
  const files = useHookstate(props.files);
  const fakeFiles = useHookstate(props.fakeFiles);
  const inputField = React.useRef<HTMLInputElement>(null);

  const deleteButtonStyle = {
    padding: ".1rem .5rem",
  };

  function showOpenFileDlg() {
    if (inputField && inputField.current) {
      inputField.current.click();
    }
  }

  function handleFileSelection(e: React.ChangeEvent<HTMLInputElement>) {
    const fileList = e.target.files;
    console.log(fileList);
    // Add the Files from the FileList to the state.
    if (fileList) {
      files.merge(Array.from(fileList));
    }

    console.log("FileUpload after handleFileSelection", files.get());
  }

  function handleFileDelete(fileName: string) {
    // Gets the index of the file that we want to delete
    const index = files.get().findIndex((file: File) => file.name === fileName);

    // Remove the file from the File array
    files[index].set(none);

    // Clear the input field when all the files have been removed
    if (inputField && inputField.current) {
      inputField.current.value = "";
    }
  }

  function fileListItem(index: number, file: any) {
    return (
      <tr key={index}>
        <td>{file.name}</td>
        <td>{humanFileSize(file.size)}</td>
        <td>
          <Button
            variant="danger"
            size="sm"
            className="float-right"
            style={deleteButtonStyle}
            onClick={() => handleFileDelete(file.name)}
          >
            X
          </Button>
        </td>
      </tr>
    );
  }

  function fileList() {
    if (files.length) {
      return files.value.map((file: File, index) => fileListItem(index, file));
    } else {
      return [];
    }
  }

  function fakeFileList() {
    if (fakeFiles.length) {
      return fakeFiles.value.map((file: IFakeFile, index) =>
        fileListItem(index, file)
      );
    } else {
      return [];
    }
  }

  // Hides the table if there are no files
  const tableHidden = files.length || fakeFiles.length > 0 ? "" : "d-none";

  return (
    <div className="mt-4">
      <div className="mb-3">
        <h5 className="d-inline-block mb-0">Project Files</h5>
        <Button
          variant="primary"
          size="sm"
          className="float-right"
          onClick={showOpenFileDlg}
        >
          Upload Files
        </Button>
      </div>
      <Table responsive hover size="sm" className={tableHidden}>
        <thead className="thead-light">
          <tr>
            <th>File Name</th>
            <th>Size</th>
            <th className="text-right">Remove</th>
          </tr>
        </thead>
        <tbody>{fakeFileList().concat(fileList())}</tbody>
      </Table>
      <input
        type="file"
        id="file"
        ref={inputField}
        style={{ display: "none" }}
        multiple={true}
        onChange={handleFileSelection}
      />
    </div>
  );
}
