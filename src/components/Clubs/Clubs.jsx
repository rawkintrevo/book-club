import {useAuth} from "../AuthProvider/AuthProvider";
import {Navigate} from "react-router-dom";
import Review from "../Review/Review";
import BcNavbar from "../BcNavbar/BcNavbar";
import {Button, Card, Container} from "react-bootstrap";
import ListClubs from "../ListClubs/ListClubs";
import {useState} from "react";
import CreateClubModal from "../CreateClubModal/CreateClubModal";




function Clubs({firestore, auth, storage}) {
    const {currentUser} = useAuth();
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    const toggleModal = () => {
        setIsCreateModalOpen(!isCreateModalOpen);
    };

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
                    backgroundPosition: 'center top',
                    height: '100vh',
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
                            }}>What do you want to learn?</Card.Title>

                            <ListClubs firestore={firestore}
                                       auth={auth}
                                       currentUser={currentUser}
                                       userId={currentUser.id}
                            />
                        </Card>
                        {currentUser.isSU && (
                            <>
                                <Button onClick={toggleModal}>Create New Club</Button>
                                <CreateClubModal isOpen={isCreateModalOpen} toggle={toggleModal} firestore={firestore} />
                            </>
                        )}
                    </Container>
                </div>
            </div>

        )
    }

}

export default Clubs;
