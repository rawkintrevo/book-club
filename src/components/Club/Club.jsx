import React, {useEffect, useState} from 'react';
import {doc, getDoc, onSnapshot} from 'firebase/firestore';
import {useLocation} from 'react-router-dom';

import {Card, Container, Spinner} from "react-bootstrap";
import {useAuth} from "../AuthProvider/AuthProvider";
import BcNavbar from "../BcNavbar/BcNavbar";
import ListContentItem from "../ListContentItem/ListContentItem";




function Club( {firestore, auth, storage}) {
    const { currentUser } = useAuth();
    const location = useLocation();
    const clubId = location.pathname.split('/').pop(); // Get the 'id' from the URL
    const [club, setClub] = useState(null);
    const [contentReadMap, setContentReadMap] = useState({})

    useEffect(() => {
        const userDocRef = doc(firestore, 'users', currentUser.id);
        const getContentReadMap = async () => {
            try {
                const docSnapshot = await getDoc(userDocRef);
                if (docSnapshot.exists()) {
                    const userData = docSnapshot.data();
                    const contentRead = userData.content && userData.content.read ? userData.content.read : {};
                    setContentReadMap(contentRead);
                } else {
                    console.log('User document not found.');
                }
            } catch (error) {
                console.error('Error getting content read map:', error);
            }
        };
        getContentReadMap();
    }, [currentUser.id, firestore]); // Empty dependency array ensures this effect runs only once

    const fetchClub = () => {

        const clubRef = doc(firestore, 'clubs', clubId);
        const unsubscribe = onSnapshot(clubRef, async (docSnapshot) => {
            if (docSnapshot.exists()) {
                setClub(docSnapshot.data());
                return; // Document exists, no need to continue polling
            } else {
                console.log('Document not found -clubId:', clubId);
            }
        });

        // Polling logic (continue polling after a delay, e.g., every 2 seconds)
        const pollInterval = setInterval(async () => {
            console.log("Content.fetchClub.polling...", clubId)
            try {
                const clubDoc = await getDoc(clubRef);
                if (clubDoc.exists()) {
                    clearInterval(pollInterval); // Stop polling when the document is found
                    setClub(clubDoc.data());
                }
            } catch (error) {
                console.error('Error fetching club:', error);
            }
        }, 2000); // Poll every 2 seconds

        // Clean up the listener and polling interval when the component unmounts
        return () => {
            unsubscribe();
            clearInterval(pollInterval);
        };
    };


    useEffect(() => {
        const unsubscribe = fetchClub();

        // Clean up the listener when the component unmounts
        return () => {
            unsubscribe();
        };
        // eslint-disable-next-line
    }, [clubId, firestore]);



    return (
        <div>
            <BcNavbar firestore={firestore}
                      auth={auth}/>
            <div style={{
                backgroundImage: 'url("/img/home.png")',
                backgroundSize: 'cover',
                backgroundPosition: 'center top',
                // height: '100vh',
                display: 'flex',
                // alignItems: 'center',
                justifyContent: 'center',
            }}>
                <Container style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.7)',
                    margin: '20px',
                    borderRadius: '10px',
                    paddingTop: '20px'
                }}>
                {club ? (
                    <Card bg="light" text="dark" style={{opacity: 0.9, margin: '20px', borderRadius: '10px'}}>
                        <Card.Title style={{
                            backgroundColor: 'grey',
                            color: 'dark',
                            padding: '10px',
                            marginTop: '0',
                            marginBottom: '10px',
                            borderRadius: '5px',
                        }}>{club.name ? (club.name) : (<Spinner />)}</Card.Title>
                        <Card.Body style={{ textAlign: 'left' }}>
                            <p>
                                <b>Description:</b>&nbsp;
                                {club.desc ? (club.desc) : (<Spinner />)}
                            </p>

                            <div>
                                <b>Content:</b><br/>
                                {club.content.map((article) => (
                                    <ListContentItem key={article.id} article={article} contentReadMap={contentReadMap}/>
                                ))}
                            </div>
                        </Card.Body>

                    </Card>
                ) : (
                    <p>Loading...</p>
                    )}
                </Container>
            </div>
        </div>
        );

}

export default Club;
