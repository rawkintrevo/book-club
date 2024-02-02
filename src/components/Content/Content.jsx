import React, { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import {Link, useLocation} from 'react-router-dom';

import {Accordion, Button, Card, Spinner} from "react-bootstrap";
import { ref, getDownloadURL } from 'firebase/storage';
import ContentFooter from "../ContentFooter/ContentFooter";



function Content( {firestore, auth, storage}) {
    const location = useLocation();
    const articleId = location.pathname.split('/').pop(); // Get the 'id' from the URL
    const [link, setLink] = useState(null);
    const [article, setArticle] = useState(null);
    const [activeItem, setActiveItem] = useState(null);

    const handleAccordionClick = (index) => {
        setActiveItem(activeItem === index ? null : index);
    };

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
                const articleRef = doc(firestore, 'content', articleId);
                const articleDoc = await getDoc(articleRef);

                if (articleDoc.exists()) {
                    setArticle(articleDoc.data());
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
