import React from 'react'
import Modal from 'react-bootstrap/Modal'
import Button from 'react-bootstrap/Button'
import Spinner from 'react-bootstrap/Spinner'

// TODO: add interface for props
function UploadingProjectModal(props: any) {

    const checkStyle = {
        color: 'green'
    }
    
    function title() {
        if (props.successful === true) {
            return (
                <>
                    <i className="fas fa-check mr-2" style={checkStyle}></i>
                    Project Uploaded Successful
                </>
            )
        } else {
            return (
                <>
                    <Spinner className="mr-2" animation="border" variant="primary" />
                    Uploading Project
                </>
            )
        }
    }

    function uploadIcon() {
        if (props.successful === true) {
            return (
                <i className="fas fa-check mr-2" style={checkStyle}></i>
            )
        } else {
            return (
                <Spinner className="mr-2" animation="border" size="sm" variant="primary" />
            )
        }
    }

    function modalFooter() {
        if (props.successful === true) {
            return (
                <Modal.Footer>
                    <Button onClick={props.onHide}>Ok</Button>
                </Modal.Footer>
            )
        } else {
            <></>
        }
    }

    return (
        <Modal
            show={props.show}
            onHide={props.handleClose}
            backdrop="static"
            keyboard={false}
            aria-labelledby="contained-modal-title-vcenter"
            centered
        >
            <Modal.Header>

                <Modal.Title id="contained-modal-title-vcenter">
                    {title()}
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <ul className="list-unstyled">
                    <li>{uploadIcon()}Images</li>
                    <li>{uploadIcon()}Files</li>
                    <li>{uploadIcon()}Project</li>
                </ul>
            </Modal.Body>
            {modalFooter()}
        </Modal>
    );
}

export default UploadingProjectModal;