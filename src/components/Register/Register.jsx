import { useState } from 'react';
import { useNavigate } from "react-router-dom";
import {Button, Card, Container, Form} from "react-bootstrap";
import { doc, setDoc } from 'firebase/firestore';

function Register( {auth, firestore}) {
    // const [error, setError] = useState(null);
    // setError(null);
    const navigate = useNavigate();
    const currentUser = auth.currentUser
    const [displayName, setDisplayName] = useState(currentUser.displayName || '');
    const [verificationName, setVerificationName] = useState(currentUser.displayName || '');
    const [aoe, setAOE] = useState("")
    const handleSubmit = async (e) => {
        e.preventDefault();

        // Create an object with updated profile data
        const updatedProfile = {
            displayName,
            verificationName,
            aoe,
            id : currentUser.uid,
            email: currentUser.email,
            photoURL : currentUser.photoURL,
            reviewed : false,
            verifBooks : false,
            verifArticles : false,
            verifAdmin : false,
            content: {
                saved: {},
                created : {},
                read : {},
                rated : {}
            },
        };

        try {
            // Set the updated profile data in the "users" collection
            await setDoc(doc(firestore, 'users', currentUser.uid), updatedProfile, { merge: true });

            alert('Registered successfully!');
            navigate('/');
        } catch (error) {
            console.error('Error updating profile:', error);
            alert('Failed to register profile. Please try again later.');
        }
    };

    return (
        <div
            style={{
                backgroundImage: 'url("/img/register.png")',
                backgroundSize: 'cover',
                backgroundPosition: 'center center',
                height: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
            }}
        >
            <Container style={{
                backgroundColor: 'rgba(255, 255, 255, 0.7)',
                margin: '20px',
                borderRadius: '10px'
            }}>
                <Card bg="light" text="dark" style={{ opacity: 0.9, margin: '20px', borderRadius: '10px' }}>
                    <Card.Title style={{
                        backgroundColor: 'grey', // Dark gray background color
                        color: 'dark',        // White text color
                        padding: '10px',       // Padding for spacing
                        marginTop: '0',     // Margin above the text
                        marginBottom: '10px',  // Margin below the text
                        borderRadius: '5px',   // Border radius for rounded corners
                    }}>Register</Card.Title>
                    <Card.Body>
                        {/*{error && <p>{error}</p>}*/}
                        <Form onSubmit={handleSubmit}>
                            <Form.Group controlId="displayName" className="mb-3">
                                <Form.Label><b>Display Name</b> - The name others will see.</Form.Label>
                                <Form.Control
                                    type="text"
                                    placeholder="Enter your display name"
                                    value={displayName}
                                    onChange={(e) => setDisplayName(e.target.value)}
                                />
                            </Form.Group>

                            <Form.Group controlId="verificationName" className="mb-3">
                                <Form.Label><b>Verification Name</b> - The name the admins will use to decide if you're a friend or nah.</Form.Label>
                                <Form.Control
                                    type="text"
                                    placeholder="Enter your verification name"
                                    value={verificationName}
                                    onChange={(e) => setVerificationName(e.target.value)}
                                />
                            </Form.Group>

                            <Form.Group controlId="aoe" className="mb-3">
                                <Form.Label><b>Area of Expertise</b> - Briefly. I don't want your entire CV here. (Will be public).</Form.Label>
                                <Form.Control
                                    type="text"
                                    placeholder="What are you bringing to the club?"
                                    value={aoe}
                                    onChange={(e) => setAOE(e.target.value)}
                                />
                            </Form.Group>

                            <Button variant="primary" type="submit">
                                Request Access
                            </Button>
                        </Form>

                    </Card.Body>
                </Card>
            </Container>
        </div>
    );
}

export default Register
