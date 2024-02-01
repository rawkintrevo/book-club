import {useAuth} from "../AuthProvider/AuthProvider";
import {Navigate} from "react-router-dom";
import Review from "../Review/Review";
import BcNavbar from "../BcNavbar/BcNavbar";
import {Card, Container} from "react-bootstrap";



function MyStuff( {firestore, auth, storage}) {
    const {currentUser} = useAuth();

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
                    backgroundImage: 'url("/img/mystuff.png")',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center center',
                    height: '100vh',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}>
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
                            }}>Welcome back {auth.currentUser.displayName}</Card.Title>
                            This component is still under construction :/
                        </Card>
                    </Container>
                </div>
            </div>

        )
    }

}

export default MyStuff;
