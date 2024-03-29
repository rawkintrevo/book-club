import React, {useEffect, useState} from 'react';
import {doc,
    deleteDoc,
    getDoc, onSnapshot, updateDoc} from 'firebase/firestore';
import {Link, useLocation, useNavigate} from 'react-router-dom';

import {Accordion, Button, Card, Spinner} from "react-bootstrap";
import {getDownloadURL, ref} from 'firebase/storage';
import ContentFooter from "../ContentFooter/ContentFooter";
import {useAuth} from "../AuthProvider/AuthProvider";
import AddToClubModal from "../AddToClubModal/AddToClubModal";
import DiscussModal from "../DiscussModal/DiscussModal";




function Content( {firestore, auth, storage}) {
    const { currentUser } = useAuth();
    const location = useLocation();
    const articleId = location.pathname.split('/').pop(); // Get the 'id' from the URL
    const [link, setLink] = useState(null);
    const [article, setArticle] = useState(null);
    const [activeItem, setActiveItem] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDiscussModalOpen, setIsDiscussModalOpen] = useState(false);
    const [deletionInProgress, setDeletionInProgress] = useState(false);

    const navigate = useNavigate();
    const toggleModal = () => {
        setIsModalOpen(!isModalOpen);
    };

    const toggleDiscussModal = () => {
        setIsDiscussModalOpen(!isDiscussModalOpen)
    }


    const updateContentRead = async (articleId) => {
        const userDocRef = doc(firestore, 'users', currentUser.id);
        const userData = (await getDoc(userDocRef)).data()
        try {
            await updateDoc(userDocRef, {
                // Use FieldValue to merge the new data into the existing map
                'content.read': {
                    ...userData.content.read,
                    [articleId]: true
                }});
            console.log('Content read map updated successfully.');
        } catch (error) {
            console.error('Error updating content read map:', error);
        }
    };

    const handleAccordionClick = (index) => {
        setActiveItem(activeItem === index ? null : index);
        if (index === article.parts.length - 1) {
            console.log("marking document as read")
            updateContentRead(articleId)
        }
    };

    const generateDownloadLink = async (bucketName, keyName) => {
        const fileRef = ref(storage, `gs://${bucketName}/${keyName}`);
        try {
            return await getDownloadURL(fileRef);
        } catch (error) {
            console.error('Error generating download link:', error);
            return null;
        }
    };

    const fetchArticle = () => {
        const articleRef = doc(firestore, 'content', articleId);
        const unsubscribe = onSnapshot(articleRef, async (docSnapshot) => {
            if (docSnapshot.exists()) {
                setArticle(docSnapshot.data());
                const localLink = await generateDownloadLink(docSnapshot.data().s3.bucket, docSnapshot.data().s3.key);
                setLink(localLink);
                return; // Document exists, no need to continue polling
            } else {
                console.log('Document not found');
            }
        });

        // Polling logic (continue polling after a delay, e.g., every 2 seconds)
        const pollInterval = setInterval(async () => {
            console.log("Content.fetchArticle.polling...", articleId)
            try {
                const articleDoc = await getDoc(articleRef);

                if (articleDoc.exists()) {
                    clearInterval(pollInterval); // Stop polling when the document is found
                    setArticle(articleDoc.data());
                    const localLink = await generateDownloadLink(articleDoc.data().s3.bucket, articleDoc.data().s3.key);
                    setLink(localLink);
                }
            } catch (error) {
                console.error('Error fetching article:', error);
            }
        }, 2000); // Poll every 2 seconds

        // Clean up the listener and polling interval when the component unmounts
        return () => {
            unsubscribe();
            clearInterval(pollInterval);
        };
    };


    useEffect(() => {
        const unsubscribe = fetchArticle();

        // Clean up the listener when the component unmounts
        return () => {
            unsubscribe();
        };
        // eslint-disable-next-line
    }, [articleId, firestore, storage]);

    const handleDelete = async () => {
        const articleRef = doc(firestore, 'content', articleId);
        setDeletionInProgress(true);

        try {
            await deleteDoc(articleRef);
            navigate("/")
            console.log('Document successfully deleted!');
        } catch (error) {
            console.error('Erro deleting document: ', error);
        }
    };

    return (
        <div>
            {article ? (
                <Card bg="light" text="dark" style={{opacity: 0.9, margin: '20px', borderRadius: '10px'}}>
                    <Card.Title style={{
                        backgroundColor: 'grey',
                        color: 'dark',
                        padding: '10px',
                        marginTop: '0',
                        marginBottom: '10px',
                        borderRadius: '5px',
                    }}>{article.title ? (article.title) : (<Spinner />)}</Card.Title>
                    <Card.Body style={{ textAlign: 'left' }}>
                        <p>
                            <b>Author(s):</b>&nbsp;
                            {article.author ? (article.author) : (<Spinner />)}
                        </p>
                        {article.journal ? ( <p><b>Journal:</b> {article.journal} </p>
                        ) : null}
                        <p>
                            <b>Created:</b> {article.created.toDate().toLocaleDateString()} &nbsp;
                            {article.created_by ? <><b>by:</b>
                               &nbsp; <Link to={"/user/"+article.created_by.id}>{article.created_by.name}</Link></> : null}

                        </p>
                        <div className="d-flex flex-column align-items-start">
                            {link ? (
                                <Link to={link} target="_blank" download className="mb-3">
                                    <Button variant="primary">
                                        Download File
                                    </Button>
                                </Link>
                            ) : (
                                <Button variant="primary" disabled className="mb-3">
                                    <Spinner
                                        as="span"
                                        animation="grow"
                                        size="sm"
                                        role="status"
                                        aria-hidden="true"
                                        className="me-2"
                                    />
                                    Loading Download Link...
                                </Button>
                            )}
                            <Button onClick={toggleDiscussModal} className="mb-3">Discuss</Button>
                            <DiscussModal
                                firestore={firestore}
                                article={article}
                                currentUser={currentUser}
                                show={isDiscussModalOpen}
                                handleClose={toggleDiscussModal}
                            />


                            {(currentUser.isSU || currentUser.isMod) && (
                                <div>
                                    <Button onClick={toggleModal} className="mb-3">Add to Club</Button>
                                    <AddToClubModal
                                        firestore={firestore}
                                        article={article}
                                        show={isModalOpen}
                                        handleClose={toggleModal}
                                    />
                                    &nbsp;
                                    <Button variant="danger" onClick={handleDelete} className="mb-3">
                                        {deletionInProgress ? (
                                            <Spinner animation="border" role="status">
                                                <span className="visually-hidden">Deleting...</span>
                                            </Spinner>
                                        ) : (
                                            'Delete'
                                        )}
                                    </Button>
                                </div>
                            )}
                        </div>

                        {article.parts !== undefined ? (
                            <Accordion defaultActiveKey={activeItem}>
                                {article.parts.map((part, index) => (
                                    <Accordion.Item eventKey={index} key={index}>
                                        <Accordion.Header
                                            onClick={() => handleAccordionClick(index)}
                                        >
                                            {part.title}
                                        </Accordion.Header>
                                        <Accordion.Body>
                                            {part.summary}
                                        </Accordion.Body>
                                    </Accordion.Item>
                                ))}
                            </Accordion>
                        ) : (<div>
                                <p>Summarizing Document...</p><Spinner animation="border" role="status">
                                <span className="visually-hidden">Processing...</span>
                            </Spinner>
                        </div>
                            )}

                    </Card.Body>
                    <ContentFooter firestore={firestore} auth={auth} storage={storage} articleId={articleId} article={article}/>
                </Card>
            ) : (
                <p>Loading...</p>
                )}
        </div>
        );

}

export default Content;
