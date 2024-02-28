import {useAuth} from "../AuthProvider/AuthProvider";
import {Navigate, useLocation} from "react-router-dom";
import Review from "../Review/Review";
import BcNavbar from "../BcNavbar/BcNavbar";
import {Card, Container} from "react-bootstrap";
import ListArticles from "../ListArticles/ListArticles";

function User( {firestore, auth}) {
    const {currentUser} = useAuth();
    const location = useLocation();
    const userId = location.pathname.split('/').pop();

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
                        <Card bg="light" text="dark" style={{opacity: 0.9, margin: '20px', borderRadius: '10px'}}>
                            <Card.Title style={{
                                backgroundColor: 'grey',
                                color: 'dark',
                                padding: '10px',
                                marginTop: '0',
                                marginBottom: '10px',
                                borderRadius: '5px',
                            }}>Under Construction</Card.Title>
                            <ListArticles firestore={firestore} auth={auth}
                                          currentUser={currentUser} userId={userId}/>
                        </Card>
                    </Container>
                </div>
            </div>

        )
    }
}

export default User;
