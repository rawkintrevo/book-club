import { useAuth } from "../AuthProvider/AuthProvider";
import { Navigate } from "react-router-dom";
import {Card, Container, Form, Row, Col} from "react-bootstrap";
import { useState, useEffect } from "react";
import { collection, getDocs, updateDoc, doc } from 'firebase/firestore';


function Admin( {firestore, auth}) {
    const { currentUser } = useAuth();
    const [users, setUsers] = useState([]); // State to store user data
    const [loading, setLoading] = useState(true);

    // Fetch user data from Firestore
    useEffect(() => {
        const fetchData = async () => {
            try {
                const userCollection = collection(firestore, 'users');
                const snapshot = await getDocs(userCollection);
                const userData = [];
                snapshot.forEach((doc) => {
                    userData.push({ id: doc.id, ...doc.data() });
                });
                setUsers(userData);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching user data:', error);
            }
        };

        fetchData();
    }, [firestore]);

    // Function to handle switch toggle
    const handleToggle = async (userId, field) => {
        try {
            const userDocRef = doc(firestore, 'users', userId);
            const userDocData = { [field]: !users.find(user => user.id === userId)[field] }; // Toggle the field
            await updateDoc(userDocRef, userDocData);
        } catch (error) {
            console.error(`Error updating ${field} for user with ID ${userId}:`, error);
        }
    };

    if (currentUser === null) {
        return <Navigate to="/login" />;
    } else if (!currentUser.verifAdmin) {
        return <Navigate to="/" />;
    } else {
        return (
            <div
                style={{
                    backgroundImage: 'url("/img/admin.png")',
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
                        }}>Admin</Card.Title>
                        <Card.Body>
                            {loading ? (
                                <p>Loading user data...</p>
                            ) : (
                                <div>
                                    {users.map((user) => (
                                        <Row key={user.id}>
                                            <Col md={6} lg={4}>
                                                <div className="text-left">
                                                    <p>{user.verificationName} - {user.aoe}</p>
                                                </div>
                                            </Col>
                                            <Col md={3} lg={4}>
                                                <Form.Group>
                                                    <Form.Label>Verify Books</Form.Label>
                                                    <Form.Check
                                                        type="switch"
                                                        id={`verifBooksSwitch-${user.id}`}
                                                        checked={user.verifBooks}
                                                        onChange={() => handleToggle(user.id, 'verifBooks')}
                                                    />
                                                </Form.Group>
                                            </Col>
                                            <Col md={3} lg={4}>
                                                <Form.Group>
                                                    <Form.Label>Verify Articles</Form.Label>
                                                    <Form.Check
                                                        type="switch"
                                                        id={`verifArticlesSwitch-${user.id}`}
                                                        checked={user.verifArticles}
                                                        onChange={() => handleToggle(user.id, 'verifArticles')}
                                                    />
                                                </Form.Group>
                                            </Col>
                                        </Row>

                                    ))}
                                </div>
                            )}
                        </Card.Body>
                    </Card>
                </Container>
            </div>
        );
    }
}

export default Admin;
