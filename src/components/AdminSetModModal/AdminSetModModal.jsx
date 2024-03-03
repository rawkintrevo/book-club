import { useState, useEffect } from 'react';
import { Modal, Button, Badge } from 'react-bootstrap';
import { collection, doc, updateDoc, getDoc, getDocs } from 'firebase/firestore';
import {useAuth} from "../AuthProvider/AuthProvider";

const AdminSetModModal = ({ firestore, user, show, handleClose }) => {
    const {currentUser} = useAuth();
    const [clubs, setClubs] = useState([]);
    const [userClubs, setUserClubs] = useState([]);


    useEffect(() => {
        if (currentUser.isSU) {
            console.log('AdminSetModModal.useEffect.currentUser.isSU');
            const fetchClubs = async () => {
                const clubsCollectionRef = collection(firestore, 'clubs');
                const clubsSnapshot = await getDocs(clubsCollectionRef);
                const clubsData = clubsSnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setClubs(clubsData);
                setUserClubs(user.modOf || []);
            };
            fetchClubs();
        } else if (user.isMod) {
            setClubs(user.modOf);
            console.log('addToClubModel.user.modOf', user.modOf);
            setUserClubs(user.modOf || []);
        } else {
            console.log("user has no clubs");

        }



    }, [firestore, user, currentUser.isSU, user.modOf, currentUser.isMod]);


    const handleClubClick = async (clubId) => {
        const userRef = doc(firestore, 'users', user.id);
        const clubDocRef = doc(firestore, 'clubs', clubId);

        let updatedModOf;

        if (userClubs.some(userClub => userClub.id === clubId)) {
            // Remove the club from the user's clubs array
            updatedModOf = userClubs.filter(item => item.id !== clubId);

            // Remove the user from the club's mods field array
            const clubDocSnapshot = await getDoc(clubDocRef);
            const clubData = clubDocSnapshot.data();
            const updatedContent = clubData.content.filter(item => item.id !== user.id);

            // Update the club document with the modified content field array
            await updateDoc(clubDocRef, { mods: updatedContent });
        } else {


            // Get the current user data
            const userDocSnapshot = await getDoc(userRef);
            const userData = userDocSnapshot.data();
            

            // Add the user object to the club's content field array
            const clubDocSnapshot = await getDoc(clubDocRef);
            const clubData = clubDocSnapshot.data();
            const updatedContent = [...clubData.content, userData];

            // Add the club to the user's modOf array
            updatedModOf = [...userClubs, {id: clubId,
                name: clubData.name,
                desc: clubData.desc}];
            // Update the club document with the modified content field array
            await updateDoc(clubDocRef, { mods: updatedContent });
        }

        // Update the user document with the modified clubs array
        await updateDoc(userRef, { modOf: updatedModOf });

        // Update state
        setUserClubs(updatedModOf);
    };


    return (
        <Modal show={show} onHide={handleClose}>
            <Modal.Header closeButton>
                <Modal.Title>Deputize {user.displayName} as Mod of Club</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {clubs.map(club => (
                    <Badge
                        key={club.id}
                        bg={userClubs.some(userClub => userClub.id === club.id) ? 'primary' : 'secondary'}
                        className="me-2 mb-2"
                        onClick={() => handleClubClick(club.id)}
                        style={{ cursor: 'pointer' }}
                    >
                        {club.name}
                    </Badge>
                ))}
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={handleClose}>
                    Close
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default AdminSetModModal;
