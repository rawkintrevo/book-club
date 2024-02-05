import { useAuth } from "../AuthProvider/AuthProvider";
import { Navigate } from "react-router-dom";
import {Card, Container, Form, Button} from "react-bootstrap";
import { useState } from "react";
import {  ref, uploadBytesResumable } from 'firebase/storage';

import BcNavbar from "../BcNavbar/BcNavbar";



function Create( {firestore, auth, storage}) {
    const { currentUser } = useAuth();

    const [selectedFile, setSelectedFile] = useState(null);

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
                    console.log('Upload progress: ' + progress + '%');
                });

                await uploadTask;

                // Redirect the user to the desired URL
                window.location.href = '/content/' + doc_uid;

                console.log('File uploaded successfully');
            } catch (error) {
                // Handle upload error (optional)
                console.error('Upload error:', error);
            }
        }
    };

    if (currentUser === null) {
        return <Navigate to="/login" />;
    } else if (!currentUser.verifAdmin) {
        return <Navigate to="/" />;
    } else {
        return (
            <div>
                <BcNavbar firestore={firestore}
                          auth={auth}/>

                <div
                    style={{
                        backgroundImage: 'url("/img/create.png")',
                        backgroundSize: '100% auto',
                        backgroundPosition: 'center bottom',
                        height: '100vh',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    <Container style={{
                        backgroundColor: 'rgba(255, 255, 255, 0.7)',
                        margin: '20px',
                        borderRadius: '10px',
                    }}>
                        <Card bg="light" text="dark" style={{ opacity: 0.9, margin: '20px', borderRadius: '10px' }}>
                            <Card.Title style={{
                                backgroundColor: 'grey',
                                color: 'dark',
                                padding: '10px',
                                marginTop: '0',
                                marginBottom: '10px',
                                borderRadius: '5px',
                            }}>Upload</Card.Title>
                            <Card.Body>
                                <Form>
                                    <Form.Group controlId="fileInput" style={{ marginBottom: '20px'}}>
                                        <Form.Label>Select File</Form.Label>
                                        <Form.Control type="file" onChange={handleFileChange} />
                                    </Form.Group>
                                    <Button variant="primary" onClick={handleUpload}>
                                        Upload
                                    </Button>
                                </Form>
                            </Card.Body>
                        </Card>
                    </Container>
                </div>
            </div>
        );
    }
}

export default Create;
