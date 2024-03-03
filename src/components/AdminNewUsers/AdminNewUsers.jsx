import {Card, Form, Row, Col, Button} from "react-bootstrap";
import { useState, useEffect } from "react";
import { collection, updateDoc, doc, onSnapshot } from 'firebase/firestore';



function AdminNewUsers( {firestore, auth}) {
    const [users, setUsers] = useState([]); // State to store user data
    const [loading, setLoading] = useState(true);

    // Fetch user data from Firestore
    useEffect(() => {
        // Define a reference to the 'users' collection in Firestore
        const userCollectionRef = collection(firestore, 'users');

        // Set up a real-time listener using onSnapshot
        const unsubscribe = onSnapshot(userCollectionRef, (snapshot) => {
            console.log('Admin.firestoreRead')
            const userData = [];
            snapshot.forEach((doc) => {
               userData.push( {id: doc.id, ...doc.data() });
            });
            setUsers(userData);
            setLoading(false);
        });

        // Clean up the listener when the component unmounts
        return () => unsubscribe();
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

    const handleDone = async (userId) => {
        try {
            const userDocRef = doc(firestore, 'users', userId);
            const userDocData = { reviewed: true }; // Set the 'reviewed' field to true
            await updateDoc(userDocRef, userDocData);
        } catch (error) {
            console.error(`Error marking user with ID ${userId} as reviewed:`, error);
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
                    }}>Admin - Review New Users</Card.Title>
                    <Card.Body>
                        <div>
                            <Row key={"header"}>
                                <Col md={9} lg={9}><div style={{ textAlign: 'left' }}>
                                    <b>Name and Area of Expertise</b>
                                </div></Col>
                                <Col md={1} lg={1}><b>Books</b></Col>
                                <Col md={1} lg={1}><b>Articles</b></Col>
                                <Col md={1} lg={1}></Col>
                                <hr/>
                            </Row>
                        </div>
                        {loading ? (
                            <p>Loading user data...</p>
                        ) : (
                            <div>
                                {users.filter((user) => !user.reviewed).map((user) => (
                                    <Row key={user.id}>
                                        <Col md={9} lg={9}>
                                            <div style={{ textAlign: 'left' }}>
                                                <p>{user.verificationName}, {user.aoe}</p>
                                            </div>
                                        </Col>
                                        <Col md={1} lg={1}>
                                            <Form.Group>

                                                <Form.Check
                                                    type="switch"
                                                    id={`verifBooksSwitch-${user.id}`}
                                                    checked={user.verifBooks}
                                                    onChange={() => handleToggle(user.id, 'verifBooks')}
                                                />
                                            </Form.Group>
                                        </Col>
                                        <Col md={1} lg={1}>
                                            <Form.Group>
                                                <Form.Check
                                                    type="switch"
                                                    id={`verifArticlesSwitch-${user.id}`}
                                                    checked={user.verifArticles}
                                                    onChange={() => handleToggle(user.id, 'verifArticles')}
                                                />
                                            </Form.Group>
                                        </Col>
                                        <Col md={1} lg={1} style={{ marginBottom: '10px' }}>
                                            <Button variant="success"
                                                    onClick={() => handleDone(user.id)}>Done</Button>
                                        </Col>
                                        <hr/>
                                    </Row>


                                ))}
                            </div>
                        )}
                    </Card.Body>
                </Card>
    );

}

export default AdminNewUsers;
