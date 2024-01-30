import { useState } from 'react';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore, doc, getDoc } from 'firebase/firestore';

import { useNavigate } from "react-router-dom";
import {Card, Container} from "react-bootstrap";

function Login( {auth}) {
    const [error, setError] = useState(null);

    const navigate = useNavigate();

    const checkIfUserExists = async (uid) => {
        const db = getFirestore();
        const userDocRef = doc(db, 'users', uid);

        try {
            const docSnap = await getDoc(userDocRef);
            console.log('User exists:', docSnap.exists());
            return docSnap.exists();
        } catch (error) {
            console.error('Error checking user existence:', error);
            return false;
        }
    };
    const handleSignInWithGoogle = async () => {
        try {
            const provider = new GoogleAuthProvider();
            const result = await signInWithPopup(auth, provider);
            console.log(result);
            const userExists = await checkIfUserExists(result.user.uid);

            if (userExists) {
                navigate('/home')
            } else {
                navigate('/register');
            }
        } catch (error) {
            setError(error.message);
        }
    };

    return (
        <div
            style={{
                backgroundImage: 'url("/img/login.png")',
                backgroundSize: 'cover',
                backgroundPosition: 'center bottom',
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
                    <Card.Body>
                        <h2>Login</h2>
                        {error && <p>{error}</p>}
                        <img
                            src="/img/signin_w_google.svg"
                            alt="Google Sign In"
                            onClick={handleSignInWithGoogle}
                            style={{ cursor: 'pointer' }}
                        />
                    </Card.Body>
                </Card>
            </Container>
        </div>
    );
}

export default Login;
