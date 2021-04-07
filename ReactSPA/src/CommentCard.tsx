import React, { useEffect } from "react";
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
  reportComment,
  reportChildComment,
} from "./agent";
import { IChildComment, IComment } from "./types";
import { localizeDateTime } from "./helpers";
import { commentState, childCommentState } from "./state";
import { useRecoilState } from "recoil";
import { Link } from "react-router-dom";

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
    <Form className="pt-2" onSubmit={handleOnSubmit}>
      <Form.Control
        as="textarea"
        value={text.value}
        rows={3}
        onChange={handleEnterText}
        required
      />
      <div className="float-right mt-2">
        <Button
          variant="secondary"
          size="sm"
          className="mr-2"
          onClick={handleCancel}
        >
          Cancel
        </Button>
        <Button
          variant="primary"
          size="sm"
          type="submit"
          disabled={loading.value}
        >
          Reply
        </Button>
      </div>
    </Form>
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
    <Form className="pt-2" onSubmit={handleOnSubmit}>
      <Form.Control
        as="textarea"
        value={text.value}
        rows={3}
        onChange={handleEnterText}
        required
      />
      <div className="float-right mt-2">
        <Button
          variant="secondary"
          size="sm"
          className="mr-2"
          onClick={handleCancel}
        >
          Cancel
        </Button>
        <Button
          variant="primary"
          size="sm"
          type="submit"
          disabled={loading.value}
        >
          Reply
        </Button>
      </div>
    </Form>
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
    <Form className="mt-2">
      <p>Delete this comment?</p>
      <Button
        variant="secondary"
        size="sm"
        className="mr-2"
        onClick={handleCancel}
      >
        Cancel
      </Button>
      <Button variant="danger" size="sm" onClick={handleDelete}>
        Delete
      </Button>
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
    <Form className="mt-2">
      <p>Delete this comment?</p>
      <Button
        variant="secondary"
        size="sm"
        className="mr-2"
        onClick={handleCancel}
      >
        Cancel
      </Button>
      <Button variant="danger" size="sm" onClick={handleDelete}>
        Delete
      </Button>
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

  // If there aren't any children then we need to hide the View Replies link
  function displayChildrenLink() {
    return props.comment.childCount > 0
      ? "btn btn-link"
      : "btn btn-link d-none";
  }

  const imageUrl =
    "https://d1sam1rvgl833u.cloudfront.net/fit-in/40x40/protected/" +
    props.comment.user.identityId +
    "/user-avatar.png";

  return (
    <>
      <div className="comment d-flex flex-row mt-3">
        <img
          className="public-avatar-img mr-2 d-flex flex-shrink-0 flex-column"
          src={imageUrl}
        />
        <div className="comment-body flex-grow-1 flex-column">
          <div className="d-flex flex-row">
            <a href="#">
              <h6 className="d-flex justify-content-start mr-2 d-inline">
                {props.comment.user.username}
              </h6>
            </a>
            <span className="font-weight-light" style={{ fontSize: ".8rem" }}>
              {localizeDateTime(props.comment.editedAt)}
            </span>
          </div>

          <div className="d-flex flex-row">
            <p className="mb-1">{props.comment.text}</p>
          </div>
          <div
            className="d-flex flex-column comment-children"
            style={{ marginLeft: "-20px" }}
          >
            <div className="d-flex flex-row">
              {props.comment.childCount > 0 ? (
                <button
                  className={displayChildrenLink()}
                  type="button"
                  onClick={handleToggleChildren}
                >
                  {"View " + props.comment.childCount.toString() + " replies"}
                </button>
              ) : (
                <></>
              )}
              <button
                className="btn btn-link btn-link-sm"
                type="button"
                onClick={handleToggleReply}
              >
                Reply
              </button>
              {/* <button
                className="btn btn-link btn-link-sm"
                type="button"
                onClick={handleToggleReport}
              >
                Report
              </button> */}
              <button
                className="btn btn-link btn-link-sm"
                type="button"
                onClick={handleToggleDelete}
              >
                Delete
              </button>
            </div>
            <div className="d-flex flex-row">
              <Collapse in={toggleDelete.value} className="w-100">
                <div>
                  <DeleteComment
                    id={props.comment.id}
                    projectId={props.projectId}
                    buildStepId={props.buildStepId}
                    toggleDelete={toggleDelete}
                    commentDeleted={handleCommentDeleted}
                  />
                </div>
              </Collapse>
            </div>
            {/* <div className="d-flex flex-row">
              <Collapse in={toggleReport.value} className="w-100">
                <div>
                  <ReportComment
                    commentId={props.comment.id}
                    toggleReport={toggleReport}
                  />
                </div>
              </Collapse>
            </div> */}
            <div className="d-flex flex-row">
              <Collapse in={toggleReply.value} className="w-100">
                <div className="flex-fill">
                  <AddChildComment
                    parentId={props.comment.id}
                    toggleReply={toggleReply}
                    childCommentCreated={handleChildCommentCreated}
                  />
                </div>
              </Collapse>
            </div>
            <div className="d-flex flex-row border-left border-success pl-2">
              <Collapse in={toggleChildren.value} className="w-100">
                <div>
                  {loadChildren.value ? (
                    <ChildComments
                      parentId={props.comment.id}
                      projectId={props.projectId}
                      buildStepId={props.buildStepId}
                    />
                  ) : (
                    <></>
                  )}
                </div>
              </Collapse>
            </div>
          </div>
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
  const toggleReply = useHookstate(false);
  const toggleReport = useHookstate(false);
  const toggleDelete = useHookstate(false);

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

  const imageUrl =
    "https://d1sam1rvgl833u.cloudfront.net/fit-in/40x40/protected/" +
    props.childComment.user.identityId +
    "/user-avatar.png";

  return (
    <>
      <div className="comment d-flex flex-row mt-3">
        <img
          className="public-avatar-img mr-2 d-flex flex-shrink-0 flex-column"
          src={imageUrl}
        />
        <div className="comment-body flex-grow-1 flex-column">
          <div className="d-flex flex-row">
            <a href="#">
              <h6 className="d-flex justify-content-start mr-2 d-inline">
                {props.childComment.user.username}
              </h6>
            </a>
            <span className="font-weight-light" style={{ fontSize: ".8rem" }}>
              {localizeDateTime(props.childComment.editedAt)}
            </span>
          </div>

          <div className="d-flex flex-row">
            {props.childComment.inReplyTo ? (
              <Link to="/foobar" className="mr-2">
                @{props.childComment.inReplyTo.username}
              </Link>
            ) : (
              <></>
            )}
            <p className="mb-1">{props.childComment.text}</p>
          </div>
          <div
            className="d-flex flex-column comment-children"
            style={{ marginLeft: "-40px" }}
          >
            <div className="d-flex flex-row">
              <button
                className="btn btn-link btn-link-sm"
                type="button"
                onClick={handleToggleReply}
              >
                Reply
              </button>
              {/* <button
                className="btn btn-link btn-link-sm"
                type="button"
                onClick={handleToggleReport}
              >
                Report
              </button> */}
              <button
                className="btn btn-link btn-link-sm"
                type="button"
                onClick={handleToggleDelete}
              >
                Delete
              </button>
            </div>
            <div className="d-flex flex-row">
              <Collapse in={toggleDelete.value} className="w-100">
                <div>
                  <DeleteChildComment
                    id={props.childComment.id}
                    parentId={props.parentId}
                    toggleDelete={toggleDelete}
                    commentDeleted={handleCommentDeleted}
                  />
                </div>
              </Collapse>
            </div>
            {/* <div className="d-flex flex-row">
              <Collapse in={toggleReport.value} className="w-100">
                <div>
                  <ReportChildComment
                    childCommentId={props.childComment.id}
                    toggleReport={toggleReport}
                  />
                </div>
              </Collapse>
            </div> */}
            <div className="d-flex flex-row">
              <Collapse in={toggleReply.value} className="w-100">
                <div className="flex-fill">
                  <AddChildComment
                    parentId={props.parentId}
                    inReplyTo={props.childComment.user.identityId}
                    toggleReply={toggleReply}
                    childCommentCreated={handleChildCommentCreated}
                  />
                </div>
              </Collapse>
            </div>
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
      <button
        className="btn btn-link"
        type="button"
        onClick={() => toggleAddComment.set(!toggleAddComment.value)}
      >
        Add Comment
      </button>
      <div className="d-flex flex-row">
        <Collapse in={toggleAddComment.value} className="w-100">
          <div className="flex-fill">
            <AddComment
              projectId={props.projectId}
              buildStepId={props.buildStepId}
              toggleReply={toggleAddComment}
              commentCreated={handleAddComment}
            />
          </div>
        </Collapse>
      </div>
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
