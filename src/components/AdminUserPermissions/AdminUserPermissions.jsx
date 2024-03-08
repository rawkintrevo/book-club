import { useAuth } from "../AuthProvider/AuthProvider";
import {Card, Form, Row, Col, Button} from "react-bootstrap";
import React, { useState, useEffect } from "react";
import { collection, updateDoc, doc, onSnapshot } from 'firebase/firestore';
import AdminSetModModal from "../AdminSetModModal/AdminSetModModal";


function AdminUserPermissions( {firestore, auth}) {
    const { currentUser } = useAuth();
    const [users, setUsers] = useState([]); // State to store user data
    const [loading, setLoading] = useState(true);

    const [modalStates, setModalStates] = useState({});

    // Function to toggle modal for a specific user
    const toggleModalForUser = (userId) => {
        setModalStates(prevState => ({
            ...prevState,
            [userId]: !prevState[userId] || false // If the state is undefined, set it to false
        }));
    };
    // Fetch user data from Firestore
    useEffect(() => {
        // Define a reference to the 'users' collection in Firestore
        const userCollectionRef = collection(firestore, 'users');

        // Set up a real-time listener using onSnapshot
        const unsubscribe = onSnapshot(userCollectionRef, (snapshot) => {

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

    return (
        <Card bg="light" text="dark" style={{ opacity: 0.9, margin: '20px', borderRadius: '10px' }}>
                    <Card.Title style={{
                        backgroundColor: 'grey',
                        color: 'dark',
                        padding: '10px',
                        marginTop: '0',
                        marginBottom: '10px',
                        borderRadius: '5px',
                    }}>Admin - User Permissions</Card.Title>
                    <Card.Body>
                        <div>
                            <Row key={"header"}>
                                <Col md={9} lg={9}><div style={{ textAlign: 'left' }}>
                                    <b>Name and Area of Expertise</b>
                                </div></Col>
                                <Col md={1} lg={1}><b>Super</b></Col>
                                <Col md={1} lg={1}><b>Mod</b></Col>
                                <Col md={1} lg={1}><b>Clubs</b></Col>
                                <hr/>
                            </Row>
                        </div>
                        {loading ? (
                            <p>Loading user data...</p>
                        ) : (
                            <div>
                                {users.map((user) => (
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
                                                    id={`isSuperSwitch-${user.id}`}
                                                    checked={user.isSU}
                                                    onChange={() => handleToggle(user.id, 'isSU')}
                                                />
                                            </Form.Group>
                                        </Col>
                                        <Col md={1} lg={1}>
                                            <Form.Group>
                                                <Form.Check
                                                    type="switch"
                                                    id={`isModSwitch-${user.id}`}
                                                    checked={user.isMod}
                                                    onChange={() => handleToggle(user.id, 'isMod')}
                                                />
                                            </Form.Group>
                                        </Col>
                                        <Col md={1} lg={1} style={{ marginBottom: '10px' }}>
                                            {(currentUser.isSU || currentUser.isMod) &&
                                                (user.isMod) && (
                                                <div>
                                                    <Button onClick={() => toggleModalForUser(user.id)} className="mb-3">Deputize</Button>
                                                    <AdminSetModModal
                                                        firestore={firestore}
                                                        user={user}
                                                        show={modalStates[user.id]}
                                                        handleClose={() => toggleModalForUser(user.id)}
                                                    />
                                                </div>
                                            )}
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

export default AdminUserPermissions;
