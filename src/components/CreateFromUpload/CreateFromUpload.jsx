import { useAuth } from "../AuthProvider/AuthProvider";
import {Card, Form, Button, ProgressBar} from "react-bootstrap";
import React, { useState } from "react";
import {  ref, uploadBytesResumable } from 'firebase/storage';
import { useNavigate } from 'react-router-dom';

function CreateFromUpload({firestore, auth, storage}) {
    const { currentUser } = useAuth();
    const navigate = useNavigate();

    const [selectedFile, setSelectedFile] = useState(null);
    const [uploadProgress, setUploadProgress] = useState(0);

    const handleFileChange = (event) => {
        const selectedFile = event.target.files[0];

        if (selectedFile) {
            const fileName = selectedFile.name;
            if (!fileName.endsWith('.pdf') && !fileName.endsWith('.epub')) {
                alert('At this time only PDF and EPUB files are accepted.');
                event.target.value = ''; // Clear the file input
                setSelectedFile(null); // Clear the selected file
                return;
            }

            setSelectedFile(selectedFile);
        }
    };


    const handleUpload = async () => {
        if (selectedFile) {
            try {
                const storageRef = ref(storage);

                const user_uid = currentUser.id
                const { v4: uuidv4 } = require('uuid');
                const doc_uid = uuidv4();
                const fileNameParts = selectedFile.name.split(".");
                const fileExtension = fileNameParts[fileNameParts.length - 1];

                const fileRef = ref(storageRef, user_uid + '/'+ doc_uid + '.' + fileExtension);

                const uploadTask = uploadBytesResumable(fileRef, selectedFile);

                uploadTask.on('state_changed', (snapshot) => {
                    // Handle progress updates (optional)
                    const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                    setUploadProgress(progress);
                });

                await uploadTask;

                console.log('Create.handleUpload.doc_uid', doc_uid);
                setTimeout(() => {
                    // Redirect the user to the desired URL
                    navigate('/content/' + doc_uid);

                }, 2500); // 1000 milliseconds (1 second) delay


                console.log('File uploaded successfully');
            } catch (error) {
                // Handle upload error (optional)
                console.error('Upload error:', error);
            }
        }
    };

    return (

            <Card bg="light" text="dark" style={{ opacity: 0.9, margin: '20px', borderRadius: '10px' }}>
                <Card.Title style={{
                    backgroundColor: 'grey',
                    color: 'dark',
                    padding: '10px',
                    // marginTop: '0',
                    marginBottom: '10px',
                    borderRadius: '5px',
                }}>Create via Upload</Card.Title>
                <Card.Body>
                    <Form>
                        <Form.Group controlId="fileInput" style={{ marginBottom: '20px'}}>
                            <Form.Label>Select File</Form.Label>
                            <Form.Control type="file" onChange={handleFileChange} />
                        </Form.Group>
                        {uploadProgress > 0 ? (
                            <ProgressBar
                                now={uploadProgress}
                                label={`${uploadProgress}%`}
                                animated
                                striped
                                variant="info"
                                style={{ marginBottom: '20px' }}
                            />
                        ) : <Button variant="primary" onClick={handleUpload}>
                            Upload
                        </Button> }
                    </Form>
                </Card.Body>
            </Card>

        );
}

export default CreateFromUpload;
