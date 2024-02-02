import {useAuth} from "../AuthProvider/AuthProvider";
import {Navigate} from "react-router-dom";
import BcNavbar from "../BcNavbar/BcNavbar";
import React from "react";
import Content from "../Content/Content";
import {Container} from "react-bootstrap";


function ContentPage( {firestore, auth, storage}) {
    const { currentUser } = useAuth();

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
                        backgroundImage: 'url("/img/content.png")',
                        backgroundSize: '100% auto',
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
                        maxHeight: '100vh',  // Set the maximum height you desire
                        overflowY: 'auto',
                    }}>
                        <Content firestore={firestore} auth={auth} storage={storage}/>
                    </Container>
                </div>
            </div>
        )
    }

}

export default ContentPage;
