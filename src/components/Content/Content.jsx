import React, { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import {Link, Navigate, useLocation} from 'react-router-dom';
import BcNavbar from "../BcNavbar/BcNavbar";
import {Accordion, Button, ButtonGroup, Card, Container, Spinner} from "react-bootstrap";
import {useAuth} from "../AuthProvider/AuthProvider";
import { ref, getDownloadURL } from 'firebase/storage';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSmile, faMeh, faFrown } from '@fortawesome/free-solid-svg-icons';



function Content( {firestore, auth, storage}) {
    const { currentUser } = useAuth();
    const location = useLocation();
    const articleId = location.pathname.split('/').pop(); // Get the 'id' from the URL
    const [link, setLink] = useState(null);
    const [article, setArticle] = useState(null);

    useEffect(() => {

        const generateDownloadLink = async (bucketName, keyName) => {
            const fileRef = ref(storage, `gs://${bucketName}/${keyName}`);

            try {
                const downloadURL = await getDownloadURL(fileRef);
                return downloadURL;
            } catch (error) {
                console.error('Error generating download link:', error);
                return null;
            }
        };
        const fetchArticle = async () => {
            try {
                const articleRef = doc(firestore, 'articles', articleId);
                const articleDoc = await getDoc(articleRef);

                if (articleDoc.exists()) {
                    setArticle(articleDoc.data());

                    console.log(articleDoc.data().s3.bucket,
                        articleDoc.data().s3.key)
                    // eslint-disable-next-line
                    const localLink = await generateDownloadLink(articleDoc.data().s3.bucket, articleDoc.data().s3.key);
                    setLink(localLink);

                } else {
                    console.log('Document not found');
                }
            } catch (error) {
                console.error('Error fetching article:', error);
            }
        };

        fetchArticle();
    }, [articleId, firestore, storage]);



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
                        {article ? (
                            <Card bg="light" text="dark" style={{opacity: 0.9, margin: '20px', borderRadius: '10px'}}>
                                <Card.Title style={{
                                    backgroundColor: 'grey',
                                    color: 'dark',
                                    padding: '10px',
                                    marginTop: '0',
                                    marginBottom: '10px',
                                    borderRadius: '5px',
                                }}>{article.title}</Card.Title>
                                <Card.Body style={{ textAlign: 'left' }}>
                                    <p>
                                        <b>Author(s):</b> {article.author}
                                    </p>
                                    {article.journal ? (
                                        <p>
                                            <b>Journal:</b> {article.journal}
                                        </p>
                                    ) : null}
                                    <p>
                                        <b>Created:</b> {article.created.toDate().toLocaleDateString()}
                                    </p>
                                    <div>
                                        {link ? (
                                            <Link to={link} target="_blank" download>
                                                <Button varient="primary" style={{ marginBottom: '10px' }}>
                                                    Download File
                                                </Button>
                                            </Link>
                                        ) : (
                                            <Button variant="primary" disabled>
                                                <Spinner
                                                    as="span"
                                                    animation="grow"
                                                    size="sm"
                                                    role="status"
                                                    aria-hidden="true"
                                                />
                                                Loading Download Link...
                                            </Button>
                                        )}
                                    </div>
                                    <Accordion defaultActiveKey={null}>
                                        {article.parts.map((part, index) => (
                                            <Accordion.Item key={index}>
                                                <Accordion.Header>{part.title}</Accordion.Header>
                                                <Accordion.Body>{part.summary}</Accordion.Body>
                                            </Accordion.Item>
                                        ))}
                                    </Accordion>
                                </Card.Body>
                                <Card.Footer>
                                    <ButtonGroup style={{ marginBottom: '10px' }}>
                                        <Button variant="success"><FontAwesomeIcon icon={faSmile} /></Button>
                                        <Button variant="warning"><FontAwesomeIcon icon={faMeh} /></Button>
                                        <Button variant="danger"><FontAwesomeIcon icon={faFrown} /></Button>
                                    </ButtonGroup><br/>
                                    <Button>Save</Button>
                                </Card.Footer>
                            </Card>
                        ) : (
                            <p>Loading...</p>
                            )}

                    </Container>
                </div>
            </div>

        );
    }
}

export default Content;
