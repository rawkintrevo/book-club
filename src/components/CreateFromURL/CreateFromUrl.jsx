import { useAuth } from "../AuthProvider/AuthProvider";
import {Card, Form, Button, Spinner} from "react-bootstrap";
import React, { useState } from "react";
import { getFunctions, httpsCallable } from "firebase/functions";
import { useNavigate } from 'react-router-dom';



function CreateFromUrl({ firestore, auth, storage }) {
    const { currentUser } = useAuth();
    const navigate = useNavigate();

    const functions = getFunctions();
    const downloadAndUpload = httpsCallable(functions, 'downloadAndUpload');


    const [url, setUrl] = useState(''); // State to capture the URL input

    const [fetchStarted, setFetchStarted] = useState(false)
    const handleUrlChange = (event) => {
        setUrl(event.target.value); // Update the URL input field value
    };

    const handleUpload = async () => {
        if (url) {
            try {
                const user_uid = currentUser.id;
                const { v4: uuidv4 } = require('uuid');
                const doc_uid = uuidv4();
                setFetchStarted(true);
                // Invoke the Firebase Cloud Function 'fromUrl' with the URL and currentUser.id as parameters
                const result = await downloadAndUpload({ url: url, userId: user_uid, docId: doc_uid });
                console.log('result: ', result)
                if (result.data.success) {
                    // Handle success (e.g., navigate to the created content)
                    navigate('/content/' + doc_uid);
                } else {
                    // Handle failure or error from the Cloud Function
                    console.error('Cloud Function error:', result.error);
                }
            } catch (error) {
                // Handle other errors
                console.error('Error:', error);
            }
        }
    };

    return (
        <Card bg="light" text="dark" style={{ opacity: 0.9, margin: '20px', borderRadius: '10px' }}>
            <Card.Title style={{
                backgroundColor: 'grey',
                color: 'dark',
                padding: '10px',
                marginTop: '0',
                marginBottom: '10px',
                borderRadius: '5px',
            }}>Create Via URL</Card.Title>
            <Card.Body>
                <Form>
                    <Form.Group controlId="urlInput" style={{ marginBottom: '20px'}}>
                        <Form.Label>Enter URL</Form.Label>
                        <Form.Control
                            type="text"
                            placeholder="Enter URL"
                            value={url}
                            onChange={handleUrlChange}
                        />
                    </Form.Group>
                    {fetchStarted ? (
                        <Spinner />
                    ) : (
                        <Button variant="primary" onClick={handleUpload}>
                            Fetch
                        </Button>
                    )}
                </Form>
            </Card.Body>
        </Card>
    );
}

export default CreateFromUrl;
