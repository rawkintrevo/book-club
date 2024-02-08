import BcNavbar from "../BcNavbar/BcNavbar";
import {Navigate} from "react-router-dom";

import { useAuth } from '../AuthProvider/AuthProvider'

import Review from "../Review/Review";
import { Card, Container } from "react-bootstrap";
import ListArticles from "../ListArticles/ListArticles";

function Home( {firestore, auth}) {
    const { currentUser } = useAuth();


    // If no user is logged in, redirect to the login page
    if (currentUser === null) {
        return <Navigate to="/login"/>;
    } else if ((!currentUser.verifBooks) && (!currentUser.verifArticles)) {
        return (
            <Review />
        )
    } else {

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
                        <Card bg="light" text="dark" style={{ opacity: 0.9, margin: '20px', borderRadius: '10px' }}>
                            <Card.Title style={{
                                backgroundColor: 'grey',
                                color: 'dark',
                                padding: '10px',
                                marginTop: '0',
                                marginBottom: '10px',
                                borderRadius: '5px',
                            }}>Welcome back {auth.currentUser.displayName}</Card.Title>
                            <ListArticles firestore={firestore} auth={auth} currentUser={currentUser}/>
                        </Card>
                    </Container>
                </div>
            </div>

        )
    }

}

export default Home;
