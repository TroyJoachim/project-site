import React, { useEffect } from "react";
import Button from "react-bootstrap/Button";
import ButtonGroup from "react-bootstrap/ButtonGroup";
import Form from "react-bootstrap/Form";
import Collapse from "react-bootstrap/Collapse";
import { useHookstate } from "@hookstate/core";
import {
  createComment,
  getComments,
  deleteComment,
  createChildComment,
  getChildComments,
} from "./agent";
import { IChildComment, IComment } from "./types";
import { localizeDateTime } from "./helpers";
import { commentState, childCommentState } from "./state";
import { useRecoilState } from "recoil";
import { Link } from "react-router-dom";

function AddComment(props: {
  projectId?: number;
  buildStepId?: number;
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

  function handleEnterText(elem: React.ChangeEvent<HTMLTextAreaElement>) {
    text.set(elem.target.value);
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
      console.log(response);
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
      <ButtonGroup
        aria-label="Cancel or Reply"
        size="sm"
        className="float-right mt-2"
        style={{ width: "110px" }}
      >
        <Button variant="secondary">Cancel</Button>
        <Button variant="primary" type="submit" disabled={loading.value}>
          Reply
        </Button>
      </ButtonGroup>
    </Form>
  );
}

function AddChildComment(props: {
  parentId: number;
  inReplyTo?: string;
  childCommentCreated: () => void;
}) {
  const [childComments, setChildComments] = useRecoilState(
    childCommentState(props.parentId)
  );
  const text = useHookstate("");
  const loading = useHookstate(false);

  function handleEnterText(elem: React.ChangeEvent<HTMLTextAreaElement>) {
    text.set(elem.target.value);
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
      <ButtonGroup
        aria-label="Cancel or Reply"
        size="sm"
        className="float-right mt-2"
        style={{ width: "110px" }}
      >
        <Button variant="secondary">Cancel</Button>
        <Button variant="primary" type="submit" disabled={loading.value}>
          Reply
        </Button>
      </ButtonGroup>
    </Form>
  );
}

function ReportComment() {
  return (
    <Form className="mt-2">
      <p>Report this comment as spam or inappropriate?</p>
      <Button variant="secondary" size="sm" className="mr-2">
        Cancel
      </Button>
      <Button variant="primary" size="sm">
        Report
      </Button>
    </Form>
  );
}

function DeleteComment(props: {
  id: number;
  projectId?: number;
  buildStepId?: number;
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

  async function handleDelete() {
    const response = await deleteComment(props.id);

    console.log(response);
    if (response && response.status === 204) {
      const newComments = comments.filter((c) => c.id !== props.id);
      setComments(newComments);
      props.commentDeleted();
    }
  }

  return (
    <Form className="mt-2">
      <p>Delete this comment?</p>
      <Button variant="secondary" size="sm" className="mr-2">
        Cancel
      </Button>
      <Button variant="danger" size="sm" onClick={handleDelete}>
        Delete
      </Button>
    </Form>
  );
}

// A recursive function to show a comment and nested comments
function Comment(props: {
  comment: IComment;
  projectId?: number;
  buildStepId?: number;
}) {
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

  function handleToggleReport() {
    toggleReport.set(!toggleReport.value);
    // close the other ones
    toggleChildren.set(false);
    toggleReply.set(false);
    toggleDelete.set(false);
  }

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
                className="btn btn-link"
                type="button"
                onClick={handleToggleReply}
              >
                Reply
              </button>
              <button
                className="btn btn-link"
                type="button"
                onClick={handleToggleReport}
              >
                Report
              </button>
              <button
                className="btn btn-link"
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
                    commentDeleted={handleCommentDeleted}
                  />
                </div>
              </Collapse>
            </div>
            <div className="d-flex flex-row">
              <Collapse in={toggleReport.value} className="w-100">
                <div>
                  <ReportComment />
                </div>
              </Collapse>
            </div>
            <div className="d-flex flex-row">
              <Collapse in={toggleReply.value} className="w-100">
                <div className="flex-fill">
                  <AddChildComment
                    parentId={props.comment.id}
                    childCommentCreated={handleChildCommentCreated}
                  />
                </div>
              </Collapse>
            </div>
            <div className="d-flex flex-row border-left border-success pl-2">
              <Collapse in={toggleChildren.value} className="w-100">
                <div>
                  {loadChildren.value ? (
                    <ChildComments parentId={props.comment.id} />
                  ) : (
                    <>Loading...</>
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

function ChildComments(props: { parentId: number }) {
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
          parentId={childComment.id}
          childComment={childComment}
        />
      ))}
    </>
  ) : (
    <div>Loading...</div>
  );
}

function ChildComment(props: {
  parentId: number;
  childComment: IChildComment;
}) {
  // Setup state
  const toggleReply = useHookstate(false);
  const toggleReport = useHookstate(false);
  const toggleDelete = useHookstate(false);

  function handleToggleReply() {
    toggleReply.set(!toggleReply.value);
    // close the other ones
    toggleReport.set(false);
    toggleDelete.set(false);
  }

  function handleToggleReport() {
    toggleReport.set(!toggleReport.value);
    // close the other ones
    toggleReply.set(false);
    toggleDelete.set(false);
  }

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
                className="btn btn-link"
                type="button"
                onClick={handleToggleReply}
              >
                Reply
              </button>
              <button
                className="btn btn-link"
                type="button"
                onClick={handleToggleReport}
              >
                Report
              </button>
              <button
                className="btn btn-link"
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
                    id={props.childComment.id}
                    commentDeleted={handleCommentDeleted}
                  />
                </div>
              </Collapse>
            </div>
            <div className="d-flex flex-row">
              <Collapse in={toggleReport.value} className="w-100">
                <div>
                  <ReportComment />
                </div>
              </Collapse>
            </div>
            <div className="d-flex flex-row">
              <Collapse in={toggleReply.value} className="w-100">
                <div className="flex-fill">
                  <AddChildComment
                    parentId={props.parentId}
                    inReplyTo={
                      props.childComment.inReplyTo
                        ? props.childComment.inReplyTo.identityId
                        : undefined
                    }
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
  // TODO: This should never be the case
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

    const getCommentFunc = async (id: number) => {
      const response = await getComments(id);

      console.log(response);
      if (response && response.status == 200) {
        //comments.set(response.data);
        //const commentTree = createDataTree(response.data);

        setComments(response.data);
      }
    };
    if (props.projectId) {
      getCommentFunc(props.projectId);
    }
    if (props.buildStepId) {
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
              commentCreated={handleAddComment}
            />
          </div>
        </Collapse>
      </div>
      {comments.map((comment, i) => (
        <Comment key={i} projectId={projectId} comment={comment} />
      ))}
    </>
  );
}
