import { useState, useEffect } from 'react';
import { Modal, Button, Badge } from 'react-bootstrap';
import { collection, doc, updateDoc, getDoc, getDocs } from 'firebase/firestore';
import {useAuth} from "../AuthProvider/AuthProvider";

const AddToClubModal = ({ firestore, article, show, handleClose }) => {
    const {currentUser} = useAuth();
    const [clubs, setClubs] = useState([]);
    const [articleClubs, setArticleClubs] = useState([]);

    useEffect(() => {
        if (currentUser.isSU) {
            const fetchClubs = async () => {
                const clubsCollectionRef = collection(firestore, 'clubs');
                const clubsSnapshot = await getDocs(clubsCollectionRef);
                const clubsData = clubsSnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setClubs(clubsData);
                console.log('AddToClubModal.clubs', clubsData);
                setArticleClubs(article.clubs || []);
            };
            fetchClubs();
        } else if (currentUser.isMod) {
            setClubs(currentUser.modOf)
            console.log('addToClubModel.currentUser.modOf', currentUser.modOf);
            setArticleClubs(article.clubs || []);
        } else {
            console.log("user has no clubs");

        }



    }, [firestore, article, currentUser.isSU, currentUser.modOf, currentUser.isMod]);


    const handleClubClick = async (clubId) => {
        const articleRef = doc(firestore, 'content', article.id);
        const clubDocRef = doc(firestore, 'clubs', clubId);

        let updatedArticleClubs;

        if (articleClubs.includes(clubId)) {
            // Remove the club from the article's clubs array
            updatedArticleClubs = articleClubs.filter(id => id !== clubId);

            // Remove the article from the club's content field array
            const clubDocSnapshot = await getDoc(clubDocRef);
            const clubData = clubDocSnapshot.data();
            const updatedContent = clubData.content.filter(item => item.id !== article.id);

            // Update the club document with the modified content field array
            await updateDoc(clubDocRef, { content: updatedContent });
        } else {
            // Add the club to the article's clubs array
            updatedArticleClubs = [...articleClubs, clubId];

            // Get the current article data
            const articleDocSnapshot = await getDoc(articleRef);
            const articleData = articleDocSnapshot.data();

            // Construct the object representing the article
            const articleObject = {
                id: article.id,
                title: articleData.title,
                author: articleData.author,
                avg_rating: articleData.avg_rating,
                n_saves: articleData.n_saves,
                views: articleData.views,
                created: articleData.created,
                type: article.type,
            };

            // Add the article object to the club's content field array
            const clubDocSnapshot = await getDoc(clubDocRef);
            const clubData = clubDocSnapshot.data();
            const updatedContent = [...clubData.content, articleObject];

            // Update the club document with the modified content field array
            await updateDoc(clubDocRef, { content: updatedContent });
        }

        // Update the article document with the modified clubs array
        await updateDoc(articleRef, { clubs: updatedArticleClubs });

        // Update state
        setArticleClubs(updatedArticleClubs);
    };


    return (
        <Modal show={show} onHide={handleClose}>
            <Modal.Header closeButton>
                <Modal.Title>Add to Club</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {clubs.map(club => (
                    <Badge
                        key={club.id}
                        bg={articleClubs.includes(club.id) ? 'primary' : 'secondary'}
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

export default AddToClubModal;
