// import { useState } from 'react';
// import { useNavigate } from "react-router-dom";
import {Card, Container} from "react-bootstrap";

function Register( {auth}) {
    // const [error, setError] = useState(null);
    // setError(null);
    // const navigate = useNavigate();


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
                margin: '20px'
            }}>
                <Card bg="light" text="dark" style={{ opacity: 0.9, margin: '20px' }}>
                    <Card.Title>Register</Card.Title>
                    <Card.Body>
                        {/*{error && <p>{error}</p>}*/}
                        Content goes here

                    </Card.Body>
                </Card>
            </Container>
        </div>
    );
}

export default Register
