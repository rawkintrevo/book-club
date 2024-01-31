import {useState} from "react";
import {Button, Form} from "react-bootstrap";

function FileUpload() {
    const [selectedFile, setSelectedFile] = useState(null);

    const handleFileChange = (event) => {
        setSelectedFile(event.target.files[0]);
    };

    const handleUpload = () => {
        if (selectedFile) {
            const fileRef = storageRef.child(selectedFile.name);
            const uploadTask = fileRef.put(selectedFile);

            uploadTask.on(
                'state_changed',
                (snapshot) => {
                    // Handle progress updates (optional)
                    const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                    console.log('Upload progress: ' + progress + '%');
                },
                (error) => {
                    // Handle upload error (optional)
                    console.error('Upload error:', error);
                },
                () => {
                    // Handle successful upload (optional)
                    console.log('File uploaded successfully');
                }
            );
        }
    };

    return (
        <Form>
            <Form.Group controlId="fileInput">
                <Form.Label>Select File</Form.Label>
                <Form.Control type="file" onChange={handleFileChange} />
            </Form.Group>
            <Button variant="primary" onClick={handleUpload}>
                Upload
            </Button>
        </Form>
    );
}

export default FileUpload
