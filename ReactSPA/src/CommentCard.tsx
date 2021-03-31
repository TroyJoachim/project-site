import React, { useEffect } from "react";

import Button from "react-bootstrap/Button";
import ButtonGroup from "react-bootstrap/ButtonGroup";
import Form from "react-bootstrap/Form";
import Collapse from "react-bootstrap/Collapse";
import { useHookstate, State, StateMethods } from "@hookstate/core";
import { createComment, getComments } from "./agent";
import { IComment } from "./types";

function AddComment(props: {
  parentId?: number;
  projectId?: number;
  buildStepId?: number;
  comments: State<IComment[]>;
}) {
  const comments = useHookstate(props.comments);
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
      props.parentId ? props.parentId : null,
      props.projectId ? props.projectId : null,
      props.buildStepId ? props.buildStepId : null
    );
    console.log(response);
    if (response && response.status == 201) {
      comments.merge([response.data]);
    }
  }

  return (
    <Form className="pt-2" onSubmit={handleOnSubmit}>
      <Form.Control
        as="textarea"
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

// A recursive function to show a comment and nested comments
function Comment(props: { comment: State<IComment>; parentId?: number }) {
  const comment = useHookstate(props.comment);
  const toggleChildren = useHookstate(false);
  const replyState = useHookstate(false);
  const reportState = useHookstate(false);

  const nestedComments = comment.children.value ? (
    comment.children.map((comment, i) => (
      <Comment key={i} comment={comment} parentId={comment.id.value} />
    ))
  ) : (
    <></>
  );

  function getChildCount() {
    return comment.children.length.toString();
  }

  function setToggle(toggleBtn: string, value: boolean) {
    switch (toggleBtn) {
      case "reply":
        replyState.set(value);
        toggleChildren.set(false);
        reportState.set(false);
        break;

      case "report":
        reportState.set(value);
        toggleChildren.set(false);
        replyState.set(false);
        break;

      // children
      default:
        toggleChildren.set(value);
        // close the other ones
        replyState.set(false);
        reportState.set(false);
        break;
    }
  }

  // If there aren't any children then we need to hide the View Replies link
  function displayChildrenLink() {
    return comment.children.length === 0
      ? "btn btn-link d-none"
      : "btn btn-link";
  }

  return (
    <>
      <div className="comment d-flex flex-row mt-3">
        <div
          style={{
            width: "40px",
            height: "40px",
          }}
          className="mr-3 bg-secondary d-flex flex-shrink-0 flex-column"
        />
        <div className="comment-body flex-grow-1 flex-column">
          <div className="d-flex flex-row">
            <a href="#">
              <h6 className="d-flex justify-content-start mr-2 d-inline">
                {comment.username.value}
              </h6>
            </a>
            <span className="font-weight-light" style={{ fontSize: ".8rem" }}>
              {comment.editedAt.value}
            </span>
          </div>

          <div className="d-flex flex-row">
            <p className="mb-1">{comment.text.value}</p>
          </div>
          <div className="d-flex flex-column">
            <div className="d-flex flex-row">
              {comment.children.value ? (
                <button
                  className={displayChildrenLink()}
                  type="button"
                  onClick={() => setToggle("children", !toggleChildren.value)}
                >
                  {"View " + getChildCount() + " replies"}
                </button>
              ) : (
                <></>
              )}
              <button
                className="btn btn-link"
                type="button"
                onClick={() => setToggle("reply", !replyState.value)}
              >
                Reply
              </button>
              <button
                className="btn btn-link"
                type="button"
                onClick={() => setToggle("report", !reportState.value)}
              >
                Report
              </button>
            </div>
            <div className="d-flex flex-row">
              <Collapse in={reportState.value}>
                <div>
                  <ReportComment />
                </div>
              </Collapse>
            </div>
            <div className="d-flex flex-row">
              <Collapse in={replyState.value}>
                <div className="flex-fill">
                  <AddComment
                    parentId={comment.id.value}
                    comments={comment.children}
                  />
                </div>
              </Collapse>
            </div>
            <div className="d-flex flex-row">
              <Collapse in={toggleChildren.value}>
                <div>{nestedComments}</div>
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
  const comments = useHookstate<IComment[]>([]);
  useEffect(() => {
    const getCommentFunc = async (id: number) => {
      const response = await getComments(id);

      console.log(response);
      if (response && response.status == 200) {
        comments.set(response.data);
      }
    };
    if (props.projectId) {
      getCommentFunc(props.projectId);
    }
    if (props.buildStepId) {
      getCommentFunc(props.buildStepId);
    }
  }, []);

  const commentList = comments.map((comment, i) => (
    <Comment key={i} comment={comment} />
  ));

  return (
    <>
      {comments.length > 0 ? (
        commentList
      ) : (
        <AddComment
          projectId={props.projectId}
          buildStepId={props.buildStepId}
          comments={comments}
        />
      )}
    </>
  );
}
