import React, { useState } from "react";

import Button from "react-bootstrap/Button";
import ButtonGroup from "react-bootstrap/ButtonGroup";
import Form from "react-bootstrap/Form";
import Collapse from "react-bootstrap/Collapse";

// TODO: Temporary comment interface. Need to move to agent.ts when api has support
interface IComment {
    username: string;
    date: string;
    text: string;
    children: IComment[];
}

const tempData3: IComment = {
    username: "Mark Harmer",
    date: "Today 1:30PM",
    text:
        "Cras sit amet nibh libero, in gravida nulla. Nulla vel metus scelerisque ante sollicitudin commodo. Cras purus odio, vestibulum in vulputate at, tempus viverra turpis.",
    children: [],
};
const tempData2: IComment = {
    username: "Henry Huffman",
    date: "1 days ago",
    text:
        "Cras sit amet nibh libero, in gravida nulla. Nulla vel metus scelerisque ante sollicitudin commodo. Cras purus odio, vestibulum in vulputate at, tempus viverra turpis.",
    children: [],
};
const tempData1: IComment = {
    username: "Troy Joachim",
    date: "5 days ago",
    text:
        "Cras sit amet nibh libero, in gravida nulla. Nulla vel metus scelerisque ante sollicitudin commodo. Cras purus odio, vestibulum in vulputate at, tempus viverra turpis.",
    children: [tempData2, tempData3],
};
const tempData: IComment[] = [tempData1, tempData3];

function AddComment() {
    return (
        <Form className="pt-2">
            <Form.Control as="textarea" rows={3} />
            <ButtonGroup
                aria-label="Cancel or Reply"
                size="sm"
                className="float-right mt-2"
                style={{ width: "110px" }}
            >
                <Button variant="secondary">Cancel</Button>
                <Button variant="primary">Reply</Button>
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

interface ICommentProps {
    comment: IComment;
}
// A recursive function to show a comment and nested comments
function Comment(props: ICommentProps) {
    const [getToggleChildren, setToggleChildren] = useState(false);
    const [getReplyState, setReplyState] = useState(false);
    const [getReportState, setReportState] = useState(false);

    const nestedComments = props.comment.children.map((comment, i) => {
        return <Comment key={i} comment={comment} />;
    });

    function getChildCount() {
        return props.comment.children.length.toString();
    }

    function setToggle(toggleBtn: string, value: boolean) {
        switch (toggleBtn) {
            case "reply":
                setReplyState(value);
                setToggleChildren(false);
                setReportState(false);
                break;

            case "report":
                setReportState(value);
                setToggleChildren(false);
                setReplyState(false);
                break;

            // children
            default:
                setToggleChildren(value);
                // close the other ones
                setReplyState(false);
                setReportState(false);
                break;
        }
    }

    // If there aren't any children then we need to hide the View Replies link
    function displayChildrenLink() {
        return props.comment.children.length === 0
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
                                {props.comment.username}
                            </h6>
                        </a>
                        <span
                            className="font-weight-light"
                            style={{ fontSize: ".8rem" }}
                        >
                            {props.comment.date}
                        </span>
                    </div>

                    <div className="d-flex flex-row">
                        <p className="mb-1">{props.comment.text}</p>
                    </div>
                    <div className="d-flex flex-column">
                        <div className="d-flex flex-row">
                            <button
                                className={displayChildrenLink()}
                                type="button"
                                onClick={() =>
                                    setToggle("children", !getToggleChildren)
                                }
                            >
                                View {getChildCount()} replies
                            </button>
                            <button
                                className="btn btn-link"
                                type="button"
                                onClick={() =>
                                    setToggle("reply", !getReplyState)
                                }
                            >
                                Reply
                            </button>
                            <button
                                className="btn btn-link"
                                type="button"
                                onClick={() => setToggle("report", !getReportState)}
                            >
                                Report
                            </button>
                        </div>
                        <div className="d-flex flex-row">
                            <Collapse in={getReportState}>
                                <div>
                                    <ReportComment />
                                </div>
                            </Collapse>
                        </div>
                        <div className="d-flex flex-row">
                            <Collapse in={getReplyState}>
                                <div className="flex-fill">
                                    <AddComment />
                                </div>
                            </Collapse>
                        </div>
                        <div className="d-flex flex-row">
                            <Collapse in={getToggleChildren}>
                                <div>{nestedComments}</div>
                            </Collapse>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

function CommentCard() {
    const comments = tempData.map((comment, i) => {
        return <Comment key={i} comment={comment} />;
    });
    return <>{comments}</>;
}

export default CommentCard;
