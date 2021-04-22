import React from "react";
import { useHookstate, State, none } from "@hookstate/core";
import { humanFileSize } from "./helpers";
import { IFakeFile } from "./types";

import { makeStyles } from "@material-ui/core/styles";
import Button from "@material-ui/core/Button";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableContainer from "@material-ui/core/TableContainer";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";

// Page styles
const useStyles = makeStyles((theme) => ({
  btnFloatRight: {
    float: "right",
  },
  displayNone: {
    display: "none",
  }
}));

export default function FileUpload(props: {
  files: State<File[]>;
  fakeFiles: State<IFakeFile[]>;
}) {
  const files = useHookstate(props.files);
  const fakeFiles = useHookstate(props.fakeFiles);
  const inputField = React.useRef<HTMLInputElement>(null);
  const classes = useStyles();

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

  function fileListItem(i: number, file: any) {
    return (
      <TableRow key={i}>
        <TableCell>{file.name}</TableCell>
        <TableCell>{humanFileSize(file.size)}</TableCell>
        <TableCell>
          <Button
            variant="contained"
            color="secondary"
            size="small"
            className={classes.btnFloatRight}
            onClick={() => handleFileDelete(file.name)}
          >
            X
          </Button>
        </TableCell>
      </TableRow>
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
  const tableHidden =
    files.length || fakeFiles.length > 0 ? "" : classes.displayNone;

  return (
    <div className="mt-4">
      <div className="mb-3">
        <h5 className="d-inline-block mb-0">Project Files</h5>
        <Button
          variant="contained"
          color="primary"
          size="small"
          className={classes.btnFloatRight}
          onClick={showOpenFileDlg}
        >
          Upload Files
        </Button>
      </div>
      <TableContainer>
        <Table size="small" className={tableHidden}>
          <TableHead>
            <TableRow>
              <TableCell>File Name</TableCell>
              <TableCell>Size</TableCell>
              <TableCell className={classes.btnFloatRight}>Remove</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>{fakeFileList().concat(fileList())}</TableBody>
        </Table>
      </TableContainer>
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
