import { useAuth } from "../AuthProvider/AuthProvider";
import { Navigate } from "react-router-dom";
import React, { useState } from "react";
import {Tabs, Tab, Container} from 'react-bootstrap';

import BcNavbar from "../BcNavbar/BcNavbar";
import CreateFromUpload from "../CreateFromUpload/CreateFromUpload";
import CreateFromUrl from "../CreateFromURL/CreateFromUrl";



function Create( {firestore, auth, storage}) {
    const { currentUser } = useAuth();
    const [activeTab, setActiveTab] = useState('upload'); // Initial active tab

    const handleTabSelect = (selectedTab) => {
        setActiveTab(selectedTab); // Update the active tab when a tab is selected
    };

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
                        backgroundImage: 'url("/img/create.png")',
                        backgroundSize: '100% auto',
                        backgroundPosition: 'center bottom',
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
                    }}>
                        <Tabs
                            id="create-tabs"
                            activeKey={activeTab}
                            onSelect={handleTabSelect}
                            style={{
                                backgroundColor: 'rgba(255, 255, 255, 0.7)',
                                margin: '20px',
                                borderRadius: '10px',
                            }}
                        >
                            <Tab eventKey="upload" title="Upload">
                                {activeTab === 'upload' && <CreateFromUpload storage={storage}/>}
                            </Tab>
                            <Tab eventKey="url" title="URL">
                                {activeTab === 'url' && <CreateFromUrl />}
                            </Tab>
                        </Tabs>
                    </Container>
                </div>
            </div>
        );
    }
}

export default Create;
