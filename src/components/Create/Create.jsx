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
        setSelectedFile(event.target.files[0]);
    };

    const handleUpload = async () => {
        if (selectedFile) {
            try {
                const storageRef = ref(storage);
                const fileRef = ref(storageRef, selectedFile.name);

                const uploadTask = uploadBytesResumable(fileRef, selectedFile);

                uploadTask.on('state_changed', (snapshot) => {
                    // Handle progress updates (optional)
                    const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                    console.log('Upload progress: ' + progress + '%');
                });

                await uploadTask;

                // Handle successful upload (optional)
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
                                    <Form.Group controlId="fileInput">
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
