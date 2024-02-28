import React, { useState } from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter, Button, Form, FormGroup, Label, Input } from 'reactstrap';
import {doc, setDoc} from 'firebase/firestore';

import { v4 as uuidv4 } from 'uuid';
const CreateClubModal = ({ isOpen, toggle, firestore }) => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');

    const handleCreate = async () => {
        try {
            // Generate UUID for the new document
            const newId = uuidv4();

            // Reference to the document with newId
            const clubDocRef = doc(firestore, 'clubs', newId);

            // Add document to Firestore with specified id
            await setDoc(clubDocRef, {
                id: newId,
                name: name,
                desc: description,
                content: []
            });

            // Reset fields and close modal
            setName('');
            setDescription('');
            toggle();
        } catch (error) {
            console.error('Error creating club: ', error);
        }
    };

    return (
        <Modal isOpen={isOpen} toggle={toggle}>
            <ModalHeader toggle={toggle}>Create New Club</ModalHeader>
            <ModalBody>
                <Form>
                    <FormGroup>
                        <Label for="clubName">Name</Label>
                        <Input
                            type="text"
                            id="clubName"
                            value={name}
                            onChange={e => setName(e.target.value)}
                            placeholder="Enter club name"
                        />
                    </FormGroup>
                    <FormGroup>
                        <Label for="clubDescription">Description</Label>
                        <Input
                            type="textarea"
                            id="clubDescription"
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                            placeholder="Enter club description"
                        />
                    </FormGroup>
                </Form>
            </ModalBody>
            <ModalFooter>
                <Button color="primary" onClick={handleCreate}>Create</Button>{' '}
                <Button color="secondary" onClick={toggle}>Cancel</Button>
            </ModalFooter>
        </Modal>
    );
};

export default CreateClubModal;
