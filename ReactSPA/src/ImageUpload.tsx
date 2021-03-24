import React, { useEffect } from "react";
import {
    DragDropContext,
    Droppable,
    Draggable,
    DropResult,
} from "react-beautiful-dnd";
import Button from "react-bootstrap/Button";
import Card from "react-bootstrap/Card";
import { useHookstate, State, Downgraded, none } from "@hookstate/core";
import { notEmpty } from "./helpers";

// Source: https://github.com/atlassian/react-beautiful-dnd/blob/master/docs/about/examples.md

// a little function to help us with reordering the result
const reorder = (list: File[], startIndex: any, endIndex: any) => {
    const result = Array.from(list);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);

    return result;
};

interface UploadSvgProps {
    fill: string;
    height: string;
    width: string;
}

function UploadSvg(props: UploadSvgProps) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            enableBackground="new 0 0 24 24"
            height={props.height}
            viewBox="0 0 24 24"
            width={props.width}
        >
            <rect fill="none" height="100%" width="100%" />
            <path
                fill={props.fill}
                d="M3,4V1h2v3h3v2H5v3H3V6H0V4H3z M6,10V7h3V4h7l1.83,2H21c1.1,0,2,0.9,2,2v12c0,1.1-0.9,2-2,2H5c-1.1,0-2-0.9-2-2V10H6z M13,19c2.76,0,5-2.24,5-5s-2.24-5-5-5s-5,2.24-5,5S10.24,19,13,19z M9.8,14c0,1.77,1.43,3.2,3.2,3.2s3.2-1.43,3.2-3.2 s-1.43-3.2-3.2-3.2S9.8,12.23,9.8,14z"
            />
        </svg>
    );
}

function ImageUpload(props: {
    images: State<File[]>;
    imageIds?: string[];
    validated: boolean;
}) {
    const imgArr = useHookstate(props.images);
    const hoverImg = useHookstate<string | null>(null);

    const inputField = React.useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (props.imageIds) {
            // const imageUrlsPromiseArr = props.imageIds.map(async (id) => {
            //     // TODO: Need better error handling if getImage fails
            //     const imageResponse = await getImage(id);
            //     if (imageResponse) {
            //         // Convert images to Image type
            //         const newFile = new File([imageResponse.data], id);
            //         return newFile;
            //     }
            //     return null; // else
            // });

            // Promise.all(imageUrlsPromiseArr).then((result) => {
            //     // Filter out the empty values
            //     const images: File[] = result.filter(notEmpty);

            //     imgArr.set(images);
            // });
        }
    }, [props.imageIds]);

    // Downgrade the state because Draggable has issues with Hookstate's proxy type.
    imgArr.attach(Downgraded);
    hoverImg.attach(Downgraded);

    const isValid = props.validated && imgArr.length === 0;

    function borderClass() {
        if (isValid) {
            return "border border-danger";
        } else {
            return "border";
        }
    }

    function feedback() {
        if (isValid) {
            return (
                <div className="invalid-feedback" style={{ display: "block" }}>
                    Please upload at least one image.
                </div>
            );
        } else {
            <></>;
        }
    }

    return (
        <>
            <Card className={borderClass()}>
                <MainImageUpload
                    imgArr={imgArr}
                    hoverImg={hoverImg}
                    inputField={inputField}
                />
                <SortableImageList
                    imgArr={imgArr}
                    hoverImg={hoverImg}
                    inputField={inputField}
                />
            </Card>
            {feedback()}
        </>
    );
}

function MainImageUpload(props: {
    imgArr: State<File[]>;
    hoverImg: State<string | null>;
    inputField: React.RefObject<HTMLInputElement>;
}) {
    const imgArr = props.imgArr;
    const hoverImg = props.hoverImg;

    function displayMainImage() {
        const uploadCardStyle = {
            position: "absolute",
            left: "50%",
            top: "50%",
            WebkitTransform: "translate(-50%, -50%)",
            transform: "translate(-50%, -50%)",
            fontSize: "2em",
            textAlign: "center",
        } as React.CSSProperties;

        const defaultImg = (
            <div style={uploadCardStyle}>
                <UploadSvg fill="lightgray" height="50%" width="50%" />
                <Button variant="primary" className="d-block mx-auto my-2">
                    Upload Images
                </Button>
            </div>
        );

        let hoverImage = null;
        if (hoverImg.value) {
            hoverImage = imgArr.get().find((i) => i.name === hoverImg.get());
        }
        return hoverImage // If there is a hover image set
            ? mainImage(hoverImage)
            : imgArr.length > 0 // Else, if there are images
            ? mainImage(imgArr[0].get()) // load the first image
            : defaultImg;
    }

    function handleFileSelection(event: React.ChangeEvent<HTMLInputElement>) {
        // Note: The FileList type does not support array operations. You have to instantiate an array from the type; otherwise, offset notation is the only way to access.
        const files = event.target.files;
        if (files) {
            // Collect all images
            let allImages = Array.from(files).concat(imgArr.get());

            // Keep only distinct images
            let distinctImages = allImages.filter(
                (thing, i, arr) => arr.findIndex((t) => t.name === thing.name) === i
            );

            // Add the images to the state.
            imgArr.set(distinctImages);
        }
    }

    function mainImage(file: File) {
        const imgStyle = {
            maxHeight: "100%",
            maxWidth: "100%",
            width: "auto",
            height: "auto",
            position: "absolute",
            top: 0,
            bottom: 0,
            left: 0,
            right: 0,
            margin: "auto",
            padding: "15px",
        } as React.CSSProperties;

        let symLinks = URL.createObjectURL(file);

        return <img src={symLinks} style={imgStyle} />;
    }

    const cardStyle = {
        minHeight: "20em",
        width: "100%",
        outline: "3px dashed lightgray",
        outlineOffset: "-15px",
        position: "relative",
        display: "inline-block",
        borderRadius: "4px",
    } as React.CSSProperties;

    function showOpenFileDlg() {
        if (props.inputField && props.inputField.current) {
            props.inputField.current.click();
        }
    }

    return (
        // TODO: Figure out why this onClick doesn't work after an image is added.
        <div className={"bg-light"} style={cardStyle} onClick={showOpenFileDlg}>
            {displayMainImage()}
            <input
                type="file"
                id="file"
                ref={props.inputField}
                style={{ display: "none" }}
                multiple={true}
                onChange={(e) => handleFileSelection(e)}
            />
        </div>
    );
}

function SortableImageList(props: {
    imgArr: State<File[]>;
    hoverImg: State<string | null>;
    inputField: React.RefObject<HTMLInputElement>;
}) {
    const imgArr = props.imgArr;
    const hoverImg = props.hoverImg;

    const onDragEnd = (dropResult: DropResult) => {
        // dropped outside the list
        if (!dropResult.destination) {
            return;
        }

        const items = reorder(
            imgArr.get(),
            dropResult.source.index,
            dropResult.destination.index
        );

        imgArr.set(items);
    };

    function showOpenFileDlg() {
        console.log("showOpenFileDlg", props.inputField);
        if (props.inputField && props.inputField.current) {
            console.log("hit");
            props.inputField.current.click();
        }
    }

    function removeImage(name: string) {
        const index = imgArr.get().findIndex((img) => img.name === name);
        imgArr[index].set(none);
    }

    function thumbnail(file: File) {
        const divThumbnailStyle = {
            minHeight: "100%",
            width: "100%",
            position: "relative",
            display: "inline-block",
        } as React.CSSProperties;

        const imgThumbnailStyle = {
            maxHeight: "100%",
            maxWidth: "100%",
            width: "auto",
            height: "auto",
            position: "absolute",
            top: 0,
            bottom: 0,
            left: 0,
            right: 0,
            margin: "auto",
        } as React.CSSProperties;

        let symLinks = URL.createObjectURL(file);

        return (
            <div style={divThumbnailStyle}>
                <img src={symLinks} style={imgThumbnailStyle} />
            </div>
        );
    }

    const getItemStyle = (isDragging: any, draggableStyle: any) => ({
        // some basic styles to make the items look a bit nicer
        userSelect: "none",
        padding: 8,
        margin: `0 8px 0 0`,
        height: "100px",
        width: "100px",
        border: "1px solid lightgrey",
        flexShrink: "0",
        position: "relative",

        // change background colour if dragging
        background: isDragging ? "rgb(66, 185, 131)" : "#f8f9fa",

        // styles we need to apply on draggables
        ...draggableStyle,
    });

    const getListStyle = () => ({
        background: "white",
        display: "flex",
        overflow: "auto",
    });

    const deleteBtnStyle = {
        height: "15px",
        width: "15px",
        backgroundColor: "#6c757d",
        position: "absolute",
        top: 0,
        right: 0,
        border: "none",
        color: "#fff",
    } as React.CSSProperties;

    const xStyle = {
        position: "absolute",
        top: "-7px",
        left: "4px",
    } as React.CSSProperties;

    function draggableItems() {
        return imgArr.value.map((item, index) => (
            <Draggable key={item.name} draggableId={item.name} index={index}>
                {(provided, snapshot) => (
                    <div
                        onMouseEnter={() => hoverImg.set(item.name)}
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        style={getItemStyle(
                            snapshot.isDragging,
                            provided.draggableProps.style
                        )}
                    >
                        <button
                            style={deleteBtnStyle}
                            onClick={() => removeImage(item.name)}
                        >
                            <div style={xStyle}>x</div>
                        </button>
                        {thumbnail(item)}
                    </div>
                )}
            </Draggable>
        ));
    }

    return imgArr.length > 0 ? (
        <>
            <Card.Body className="border-top">
                <DragDropContext onDragEnd={onDragEnd}>
                    <Droppable droppableId="droppable" direction="horizontal">
                        {(provided, snapshot) => (
                            <div
                                ref={provided.innerRef}
                                style={getListStyle()}
                                {...provided.droppableProps}
                            >
                                {draggableItems()}
                                {provided.placeholder}
                            </div>
                        )}
                    </Droppable>
                </DragDropContext>
            </Card.Body>
            <Card.Footer>
                Drag to rearrange
                <Button
                    variant="primary"
                    size="sm"
                    className="float-right"
                    onClick={showOpenFileDlg}
                >
                    Upload Images
                </Button>
            </Card.Footer>
        </>
    ) : (
        <></>
    );
}

export default ImageUpload;
