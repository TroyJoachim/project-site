import React, { useEffect, useState } from "react";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import Collapse from "react-bootstrap/Collapse";
import { useHookstate, State } from "@hookstate/core";
import {
  createComment,
  getProjectComments,
  getBuildStepComments,
  deleteComment,
  createChildComment,
  getChildComments,
  deleteChildComment,
  editComment,
  editChildComment,
} from "./agent";
import { IChildComment, IComment } from "./types";
import { localizeDateTime } from "./helpers";
import { commentState, childCommentState } from "./state";
import { useRecoilState } from "recoil";
import { Link as RouterLink } from "react-router-dom";
import { globalState } from "./globalState";
import { createStyles, makeStyles, Theme } from "@material-ui/core/styles";
import TextField from "@material-ui/core/TextField";
import { default as MButton } from "@material-ui/core/Button";
import Link from "@material-ui/core/Link";
import Avatar from "@material-ui/core/Avatar";
import Typography from "@material-ui/core/Typography";
import { default as MCollapse } from "@material-ui/core/Collapse";
import Box from "@material-ui/core/Box";

// Styles
const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      "& .MuiTextField-root": {
        margin: theme.spacing(1),
        width: "100%",
      },
    },
    addCommentBtns: {
      textAlign: "right",
    },
    addCommentCancel: {
      marginRight: "5px",
    },
    commentWrapper: {
      display: "flex",
      marginTop: "10px",
    },
    commentRightColumn: {
      marginLeft: "10px",
      width: "100%",
    },
    commentFrom: {
      display: "flex",
      alignItems: "baseline",
    },
    commentFromUser: {
      fontSize: "1.2em",
      fontWeight: 500,
      marginRight: "5px",
    },
    collapse: {
      width: "100%",
    },
    childComments: {
      paddingLeft: "10px",
    },
    link: {
      marginRight: "15px",
    },
    commentLinkGroup: {
      margin: "5px 0 10px 0",
    },
    childCommentLinkGroup: {
      marginTop: "5px",
    },
  })
);

function AddComment(props: {
  projectId?: number;
  buildStepId?: number;
  toggleReply: State<boolean>;
  commentCreated: () => void;
}) {
  let id = "";
  if (props.projectId) {
    id = "project-" + props.projectId.toString();
  }
  if (props.buildStepId) {
    id = "buildstep-" + props.buildStepId.toString();
  }
  const [comments, setComments] = useRecoilState(commentState(id));
  const text = useHookstate("");
  const loading = useHookstate(false);
  const toggleReply = useHookstate(props.toggleReply);
  const classes = useStyles();

  function handleEnterText(elem: React.ChangeEvent<HTMLTextAreaElement>) {
    text.set(elem.target.value);
  }

  function handleCancel() {
    toggleReply.set(false);
  }

  async function handleOnSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    event.stopPropagation();

    // Submit the form
    const response = await createComment(
      text.value,
      props.projectId ? props.projectId : null,
      props.buildStepId ? props.buildStepId : null
    );

    console.log(response);
    if (response && response.status == 200) {
      setComments(response.data);
      text.set("");
      props.commentCreated();
    }
  }

  return (
    <form
      className={classes.root}
      noValidate
      autoComplete="off"
      onSubmit={handleOnSubmit}
    >
      <TextField
        id="standard-multiline-flexible"
        label="Add Comment"
        multiline
        rowsMax={4}
        value={text.value}
        onChange={handleEnterText}
      />
      <div className={classes.addCommentBtns}>
        <MButton
          variant="contained"
          size="small"
          className={classes.addCommentCancel}
          onClick={handleCancel}
          disabled={loading.value}
        >
          Cancel
        </MButton>
        <MButton
          variant="contained"
          size="small"
          color="primary"
          type="submit"
          disabled={loading.value}
        >
          Reply
        </MButton>
      </div>
    </form>
  );
}

function AddChildComment(props: {
  parentId: number;
  inReplyTo?: string;
  toggleReply: State<boolean>;
  childCommentCreated: () => void;
}) {
  const [childComments, setChildComments] = useRecoilState(
    childCommentState(props.parentId)
  );
  const text = useHookstate("");
  const loading = useHookstate(false);
  const toggleReply = useHookstate(props.toggleReply);
  const classes = useStyles();

  function handleEnterText(elem: React.ChangeEvent<HTMLTextAreaElement>) {
    text.set(elem.target.value);
  }

  function handleCancel() {
    toggleReply.set(false);
  }

  async function handleOnSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    event.stopPropagation();

    // Submit the form
    const response = await createChildComment(
      text.value,
      props.parentId,
      props.inReplyTo
    );
    console.log(response);
    if (response && response.status == 200) {
      setChildComments(response.data);
      console.log(response);
      text.set("");
      props.childCommentCreated();
    }
  }

  return (
    <form
      className={classes.root}
      noValidate
      autoComplete="off"
      onSubmit={handleOnSubmit}
    >
      <TextField
        id="standard-multiline-flexible"
        label="Add Comment"
        multiline
        rowsMax={4}
        value={text.value}
        onChange={handleEnterText}
      />
      <div className={classes.addCommentBtns}>
        <MButton
          variant="contained"
          size="small"
          className={classes.addCommentCancel}
          onClick={handleCancel}
          disabled={loading.value}
        >
          Cancel
        </MButton>
        <MButton
          variant="contained"
          size="small"
          color="primary"
          type="submit"
          disabled={loading.value}
        >
          Reply
        </MButton>
      </div>
    </form>
  );
}

// function ReportComment(props: {
//   commentId: number;
//   toggleReport: State<boolean>;
// }) {
//   const toggleReport = useHookstate(props.toggleReport);
//   const loading = useHookstate(false);

//   function handleCancel() {
//     toggleReport.set(false);
//   }

//   async function handleReport() {
//     loading.set(true);
//     const response = await reportComment(props.commentId);

//     if (response && response.status === 204) {
//       // Update the state and disable the button
//     }
//     loading.set(false);
//   }

//   return (
//     <Form className="mt-2">
//       <p>Report this comment as spam or inappropriate?</p>
//       <Button
//         variant="secondary"
//         size="sm"
//         className="mr-2"
//         onClick={handleCancel}
//       >
//         Cancel
//       </Button>
//       <Button variant="primary" size="sm" onClick={handleReport}>
//         Report
//       </Button>
//     </Form>
//   );
// }

// function ReportChildComment(props: {
//   childCommentId: number;
//   toggleReport: State<boolean>;
// }) {
//   const toggleReport = useHookstate(props.toggleReport);
//   const loading = useHookstate(false);

//   function handleCancel() {
//     toggleReport.set(false);
//   }

//   async function handleReport() {
//     const response = await reportComment(props.childCommentId);

//     if (response && response.status === 204) {
//       // Do something
//     }
//   }

//   return (
//     <Form className="mt-2">
//       <p>Report this comment as spam or inappropriate?</p>
//       <Button
//         variant="secondary"
//         size="sm"
//         className="mr-2"
//         onClick={handleCancel}
//       >
//         Cancel
//       </Button>
//       <Button variant="primary" size="sm" onClick={handleReport}>
//         Report
//       </Button>
//     </Form>
//   );
// }

function DeleteComment(props: {
  id: number;
  projectId?: number;
  buildStepId?: number;
  toggleDelete: State<boolean>;
  commentDeleted: () => void;
}) {
  // TODO: This should never be the case
  let id = "";
  if (props.projectId) {
    id = "project-" + props.projectId.toString();
  }
  if (props.buildStepId) {
    id = "buildstep-" + props.buildStepId.toString();
  }
  const [comments, setComments] = useRecoilState(commentState(id));
  const toggleDelete = useHookstate(props.toggleDelete);
  const classes = useStyles();

  async function handleDelete() {
    const response = await deleteComment(props.id);

    console.log(response);
    if (response && response.status === 204) {
      const newComments = comments.filter((c) => c.id !== props.id);
      setComments(newComments);
      props.commentDeleted();
    }
  }

  function handleCancel() {
    toggleDelete.set(false);
  }

  return (
    <Form>
      <p>Delete this comment?</p>
      <MButton
        variant="contained"
        size="small"
        className={classes.addCommentCancel}
        onClick={handleCancel}
      >
        Cancel
      </MButton>
      <MButton
        variant="contained"
        size="small"
        color="secondary"
        onClick={handleDelete}
      >
        Delete
      </MButton>
    </Form>
  );
}

function DeleteChildComment(props: {
  id: number;
  parentId: number;
  toggleDelete: State<boolean>;
  commentDeleted: () => void;
}) {
  const [childComments, setChildComments] = useRecoilState(
    childCommentState(props.parentId)
  );
  const toggleDelete = useHookstate(props.toggleDelete);
  const classes = useStyles();

  async function handleDelete() {
    const response = await deleteChildComment(props.id);

    console.log(response);
    if (response && response.status === 204) {
      const newComments = childComments.filter((cc) => cc.id !== props.id);
      setChildComments(newComments);
      props.commentDeleted();
    }
  }

  function handleCancel() {
    toggleDelete.set(false);
  }

  return (
    <Form>
      <p>Delete this comment?</p>
      <MButton
        variant="contained"
        size="small"
        className={classes.addCommentCancel}
        onClick={handleCancel}
      >
        Cancel
      </MButton>
      <MButton
        variant="contained"
        size="small"
        color="secondary"
        onClick={handleDelete}
      >
        Delete
      </MButton>
    </Form>
  );
}

function Comment(props: {
  comment: IComment;
  projectId?: number;
  buildStepId?: number;
}) {
  let id = "";
  if (props.projectId) {
    id = "project-" + props.projectId.toString();
  }
  if (props.buildStepId) {
    id = "buildstep-" + props.buildStepId.toString();
  }
  const [comments, setComments] = useRecoilState(commentState(id));
  const toggleChildren = useHookstate(false);
  const toggleReply = useHookstate(false);
  const toggleReport = useHookstate(false);
  const toggleDelete = useHookstate(false);
  const loadChildren = useHookstate(false);
  const editingMode = useHookstate(false);
  const editText = useHookstate(props.comment.text);
  const isLoading = useHookstate(false);
  const gState = useHookstate(globalState);
  const classes = useStyles();

  function handleToggleChildren() {
    toggleChildren.set(!toggleChildren.value);
    // close the other ones
    toggleReply.set(false);
    toggleReport.set(false);
    toggleDelete.set(false);

    // This will get sent to true so it loads the children.
    loadChildren.set(true);
  }

  function handleToggleReply() {
    toggleReply.set(!toggleReply.value);
    // close the other ones
    toggleChildren.set(false);
    toggleReport.set(false);
    toggleDelete.set(false);
  }

  // function handleToggleReport() {
  //   toggleReport.set(!toggleReport.value);
  //   // close the other ones
  //   toggleChildren.set(false);
  //   toggleReply.set(false);
  //   toggleDelete.set(false);
  // }

  function handleToggleDelete() {
    toggleDelete.set(!toggleDelete.value);
    // close the other ones
    toggleReport.set(false);
    toggleChildren.set(false);
    toggleReply.set(false);
  }

  function handleEdit() {
    editingMode.set(!editingMode.value);
  }

  // Close the reply form and show the child comments
  function handleChildCommentCreated() {
    toggleReply.set(false);
    toggleChildren.set(true);

    // This will get sent to true so it loads the children.
    loadChildren.set(true);

    // Increment the child comment count by 1
    const newCommentList = comments.map((c) => {
      if (c.id === props.comment.id) {
        return { ...c, childCount: c.childCount + 1 };
      } else {
        return c;
      }
    });
    setComments(newCommentList);
  }

  function handleCommentDeleted() {
    toggleDelete.set(false);
  }

  function handleEnterEditText(elem: React.ChangeEvent<HTMLTextAreaElement>) {
    editText.set(elem.target.value);
  }

  function handleCancelEdit() {
    editingMode.set(false);
  }

  async function handleOnSubmitEdit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    event.stopPropagation();

    isLoading.set(true);
    const response = await editComment(props.comment.id, editText.value);

    console.log(response);
    if (response && response.status === 204) {
      // Update the text value for the comment in state
      const newCommentList = comments.map((c) => {
        if (c.id === props.comment.id) {
          return { ...c, text: editText.value };
        } else {
          return c;
        }
      });
      setComments(newCommentList);
      editingMode.set(false);
    }
    isLoading.set(false);
  }

  // Check if the comment belongs to the logged in user
  const isThem = () =>
    gState.identityId.value === props.comment.user.identityId;

  const avatarUrl =
    "https://d1sam1rvgl833u.cloudfront.net/fit-in/40x40/protected/" +
    props.comment.user.identityId +
    "/user-avatar.png";

  return (
    <>
      <div className={classes.commentWrapper}>
        <Avatar alt={props.comment.user.username} src={avatarUrl} />
        <div className={classes.commentRightColumn}>
          <div className={classes.commentFrom}>
            <Link>
              <span className={classes.commentFromUser}>
                {props.comment.user.username}
              </span>
            </Link>
            <span className="font-weight-light" style={{ fontSize: ".8rem" }}>
              {localizeDateTime(props.comment.editedAt)}
            </span>
          </div>

          {editingMode.value ? (
            <form
              className={classes.root}
              noValidate
              autoComplete="off"
              onSubmit={handleOnSubmitEdit}
            >
              <TextField
                id="standard-multiline-flexible"
                label="Edit Comment"
                multiline
                rowsMax={4}
                value={editText.value}
                onChange={handleEnterEditText}
              />
              <div className={classes.addCommentBtns}>
                <MButton
                  variant="contained"
                  size="small"
                  className={classes.addCommentCancel}
                  onClick={handleCancelEdit}
                  disabled={isLoading.value}
                >
                  Cancel
                </MButton>
                <MButton
                  variant="contained"
                  size="small"
                  color="primary"
                  type="submit"
                  disabled={isLoading.value}
                >
                  Update
                </MButton>
              </div>
            </form>
          ) : (
            <Typography variant="body1">{props.comment.text}</Typography>
          )}

          <div className={classes.commentLinkGroup}>
            {props.comment.childCount > 0 ? (
              <Link className={classes.link} onClick={handleToggleChildren}>
                {"View " + props.comment.childCount.toString() + " replies"}
              </Link>
            ) : (
              <></>
            )}

            {gState.isAuthenticated.value ? (
              <Link className={classes.link} onClick={handleToggleReply}>
                Reply
              </Link>
            ) : (
              <></>
            )}

            {isThem() ? (
              <Link className={classes.link} onClick={handleEdit}>
                Edit
              </Link>
            ) : (
              <></>
            )}

            {isThem() ? (
              <Link className={classes.link} onClick={handleToggleDelete}>
                Delete
              </Link>
            ) : (
              <></>
            )}
          </div>

          <div style={{ display: "flex" }}>
            <MCollapse
              in={toggleDelete.value}
              classes={{ container: classes.collapse }}
            >
              <DeleteComment
                id={props.comment.id}
                projectId={props.projectId}
                buildStepId={props.buildStepId}
                toggleDelete={toggleDelete}
                commentDeleted={handleCommentDeleted}
              />
            </MCollapse>
          </div>
          <div style={{ display: "flex", width: "100%" }}>
            <MCollapse
              in={toggleReply.value}
              classes={{ container: classes.collapse }}
            >
              <AddChildComment
                parentId={props.comment.id}
                toggleReply={toggleReply}
                childCommentCreated={handleChildCommentCreated}
              />
            </MCollapse>
          </div>
          <Box
            style={{ display: "flex", width: "100%" }}
            borderLeft={1}
            borderColor="primary.main"
            className={classes.childComments}
          >
            <MCollapse
              in={toggleChildren.value}
              classes={{ container: classes.collapse }}
            >
              {loadChildren.value ? (
                <ChildComments
                  parentId={props.comment.id}
                  projectId={props.projectId}
                  buildStepId={props.buildStepId}
                />
              ) : (
                <></>
              )}
            </MCollapse>
          </Box>
        </div>
      </div>
    </>
  );
}

function ChildComments(props: {
  parentId: number;
  projectId?: number;
  buildStepId?: number;
}) {
  // Setup state
  const [childComments, setChildComments] = useRecoilState(
    childCommentState(props.parentId)
  );

  // On component creation
  useEffect(() => {
    const getData = async () => {
      const response = await getChildComments(props.parentId);

      console.log(response);
      if (response && response.status === 200) {
        setChildComments(response.data);
      }
    };
    if (childComments.length === 0) {
      getData();
    }
  }, []);

  return childComments.length > 0 ? (
    <>
      {childComments.map((childComment, i) => (
        <ChildComment
          key={i}
          parentId={props.parentId}
          projectId={props.projectId}
          buildStepId={props.buildStepId}
          childComment={childComment}
        />
      ))}
    </>
  ) : (
    <></>
  );
}

function ChildComment(props: {
  parentId: number;
  projectId?: number;
  buildStepId?: number;
  childComment: IChildComment;
}) {
  // Setup state
  let id = "";
  if (props.projectId) {
    id = "project-" + props.projectId.toString();
  }
  if (props.buildStepId) {
    id = "buildstep-" + props.buildStepId.toString();
  }
  const [comments, setComments] = useRecoilState(commentState(id));
  const [childComments, setChildComments] = useRecoilState(
    childCommentState(props.parentId)
  );
  const toggleReply = useHookstate(false);
  const toggleReport = useHookstate(false);
  const toggleDelete = useHookstate(false);
  const editingMode = useHookstate(false);
  const editText = useHookstate(props.childComment.text);
  const isLoading = useHookstate(false);
  const gState = useHookstate(globalState);
  const classes = useStyles();

  function handleToggleReply() {
    toggleReply.set(!toggleReply.value);
    // close the other ones
    toggleReport.set(false);
    toggleDelete.set(false);
  }

  // function handleToggleReport() {
  //   toggleReport.set(!toggleReport.value);
  //   // close the other ones
  //   toggleReply.set(false);
  //   toggleDelete.set(false);
  // }

  function handleToggleDelete() {
    toggleDelete.set(!toggleDelete.value);
    // close the other ones
    toggleReport.set(false);
    toggleReply.set(false);
  }

  function handleEdit() {
    editingMode.set(!editingMode.value);
  }

  // Close the reply form and show the child comments
  function handleChildCommentCreated() {
    toggleReply.set(false);
  }

  function handleCommentDeleted() {
    toggleDelete.set(false);

    // Increment the child comment count by 1
    const newCommentList = comments.map((c) => {
      if (c.id === props.parentId) {
        return { ...c, childCount: c.childCount - 1 };
      } else {
        return c;
      }
    });
    console.log(newCommentList);
    console.log(comments);
    setComments(newCommentList);
  }

  function handleEnterEditText(elem: React.ChangeEvent<HTMLTextAreaElement>) {
    editText.set(elem.target.value);
  }

  function handleCancelEdit() {
    editingMode.set(false);
  }

  async function handleOnSubmitEdit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    event.stopPropagation();

    isLoading.set(true);
    const response = await editChildComment(
      props.childComment.id,
      editText.value
    );

    console.log(response);
    if (response && response.status === 204) {
      // Update the text value for the comment in state
      const newCommentList = childComments.map((c) => {
        if (c.id === props.childComment.id) {
          return { ...c, text: editText.value };
        } else {
          return c;
        }
      });
      setChildComments(newCommentList);
      editingMode.set(false);
    }
    isLoading.set(false);
  }

  // Check if the comment belongs to the logged in user
  const isThem = () =>
    gState.identityId.value === props.childComment.user.identityId;

  const avatarUrl =
    "https://d1sam1rvgl833u.cloudfront.net/fit-in/40x40/protected/" +
    props.childComment.user.identityId +
    "/user-avatar.png";

  return (
    <>
      <div className={classes.commentWrapper}>
        <Avatar alt={props.childComment.user.username} src={avatarUrl} />
        <div className={classes.commentRightColumn}>
          <div className={classes.commentFrom}>
            <Link>
              <span className={classes.commentFromUser}>
                {props.childComment.user.username}
              </span>
            </Link>
            <span className="font-weight-light" style={{ fontSize: ".8rem" }}>
              {localizeDateTime(props.childComment.editedAt)}
            </span>
          </div>

          {editingMode.value ? (
            <form
              className={classes.root}
              noValidate
              autoComplete="off"
              onSubmit={handleOnSubmitEdit}
            >
              <TextField
                id="standard-multiline-flexible"
                label="Edit Comment"
                multiline
                rowsMax={4}
                value={editText.value}
                onChange={handleEnterEditText}
              />
              <div className={classes.addCommentBtns}>
                <MButton
                  variant="contained"
                  size="small"
                  className={classes.addCommentCancel}
                  onClick={handleCancelEdit}
                  disabled={isLoading.value}
                >
                  Cancel
                </MButton>
                <MButton
                  variant="contained"
                  size="small"
                  color="primary"
                  type="submit"
                  disabled={isLoading.value}
                >
                  Update
                </MButton>
              </div>
            </form>
          ) : (
            <Typography variant="body1">{editText.value}</Typography>
          )}

          <div className={classes.childCommentLinkGroup}>
            {gState.isAuthenticated.value ? (
              <Link className={classes.link} onClick={handleToggleReply}>
                Reply
              </Link>
            ) : (
              <></>
            )}

            {isThem() ? (
              <Link className={classes.link} onClick={handleEdit}>
                Edit
              </Link>
            ) : (
              <></>
            )}

            {isThem() ? (
              <Link className={classes.link} onClick={handleToggleDelete}>
                Delete
              </Link>
            ) : (
              <></>
            )}
          </div>

          <div style={{ display: "flex" }}>
            <MCollapse
              in={toggleDelete.value}
              classes={{ container: classes.collapse }}
            >
              <DeleteChildComment
                id={props.childComment.id}
                parentId={props.parentId}
                toggleDelete={toggleDelete}
                commentDeleted={handleCommentDeleted}
              />
            </MCollapse>
          </div>
          <div style={{ display: "flex", width: "100%" }}>
            <MCollapse
              in={toggleReply.value}
              classes={{ container: classes.collapse }}
            >
              <AddChildComment
                parentId={props.childComment.id}
                toggleReply={toggleReply}
                childCommentCreated={handleChildCommentCreated}
              />
            </MCollapse>
          </div>
        </div>
      </div>
    </>
  );
}

export default function CommentCard(props: {
  projectId?: number;
  buildStepId?: number;
}) {
  let id = "";
  if (props.projectId) {
    id = "project-" + props.projectId.toString();
  }
  if (props.buildStepId) {
    id = "buildstep-" + props.buildStepId.toString();
  }
  const [comments, setComments] = useRecoilState(commentState(id));
  const toggleAddComment = useHookstate(false);
  const gState = useHookstate(globalState);

  useEffect(() => {
    if (comments.length > 0) return;

    // Get project comments
    if (props.projectId) {
      const getCommentFunc = async (id: number) => {
        const response = await getProjectComments(id);

        console.log(response);
        if (response && response.status == 200) {
          setComments(response.data);
        }
      };
      getCommentFunc(props.projectId);
    }

    // Get buildstep comments
    if (props.buildStepId) {
      const getCommentFunc = async (id: number) => {
        const response = await getBuildStepComments(id);

        console.log(response);
        if (response && response.status == 200) {
          setComments(response.data);
        }
      };
      getCommentFunc(props.buildStepId);
    }
  }, []);

  // TODO: remove the possible null value
  const projectId = props.projectId ? props.projectId : 0;

  function handleAddComment() {
    toggleAddComment.set(false);
  }

  return (
    <>
      {gState.isAuthenticated.value ? (
        <AddComment
          projectId={props.projectId}
          buildStepId={props.buildStepId}
          toggleReply={toggleAddComment}
          commentCreated={handleAddComment}
        />
      ) : (
        <Link
          component={RouterLink}
          className="btn btn-link"
          type="button"
          to="/sign-in"
        >
          Sign in to add a comment
        </Link>
      )}

      {comments.map((comment, i) => (
        <Comment
          key={i}
          projectId={projectId}
          buildStepId={props.buildStepId}
          comment={comment}
        />
      ))}
    </>
  );
}
