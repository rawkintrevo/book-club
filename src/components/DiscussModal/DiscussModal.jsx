import React, { useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import { addDoc,
    collection,
    getDoc,
    serverTimestamp,
    setDoc,
    updateDoc, doc } from 'firebase/firestore';


const DiscussModal = ({ firestore, article, show, handleClose, currentUser }) => {
    const [commentText, setCommentText] = useState('');


    const handleAddComment = async () => {
        try {
            const commentData = {
                user: {
                    name: currentUser.displayName,
                    id: currentUser.id
                },
                created_at: `${(new Date()).toLocaleString()}`,
                content: commentText
            };

            const articleRef = doc(firestore, 'content', article.id);
            const articleDoc = await getDoc(articleRef);

            console.log('adding comment data: ', commentData)
            if (articleDoc.exists()) {
                const articleData = articleDoc.data();
                if (articleData.comments) {
                    await updateDoc(articleRef, {
                        comments: [...articleData.comments, commentData]
                    });
                } else {
                    await updateDoc(articleRef, {
                        comments: [commentData]
                    });
                }
            } else {
                await setDoc(articleRef, { comments: [commentData] });
            }


            setCommentText('');
        } catch (error) {
            console.error('Error adding comment:', error);
        }
    };

    return (
        <Modal show={show} onHide={handleClose}>
            <Modal.Header closeButton>
                <Modal.Title>Discuss {article.title}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <ul>
                    {article.comments &&
                        article.comments.map((comment, index) => (
                            <li key={index}>
                                <p>
                                    <strong>{comment.user.name}</strong> - {comment.created_at}
                                </p>
                                <p>{comment.content}</p>
                            </li>
                        ))}
                </ul>
                <Form.Group>
                    <Form.Control
                        as="textarea"
                        placeholder="Add your comment..."
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                    />
                </Form.Group>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={handleClose}>
                    Close
                </Button>
                <Button variant="primary" onClick={handleAddComment}>
                    Add Comment
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default DiscussModal;
