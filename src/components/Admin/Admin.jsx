import { useAuth } from "../AuthProvider/AuthProvider";
import { Navigate } from "react-router-dom";
import { Container, Tab, Tabs} from "react-bootstrap";
import { useState } from "react";
import BcNavbar from "../BcNavbar/BcNavbar";
import AdminNewUsers from "../AdminNewUsers/AdminNewUsers";
import AdminUserPermissions from "../AdminUserPermissions/AdminUserPermissions";



function Admin( {firestore, auth}) {

    const { currentUser } = useAuth();
    const [selectedTab, setSelectedTab] = useState('newUsers');

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
                    backgroundImage: 'url("/img/admin.png")',
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
                }}>
                    <Tabs
                        id="admin-tabs"
                        activeKey={selectedTab}
                        onSelect={(key) => setSelectedTab(key)}
                        style={{ marginTop: '20px' }}
                    >
                        <Tab eventKey="newUsers" title="New Users">
                            <AdminNewUsers firestore={firestore} auth={auth} />
                        </Tab>
                        <Tab eventKey="userPermissions" title="User Permissions">
                            <AdminUserPermissions firestore={firestore} auth={auth} />

                        </Tab>
                    </Tabs>
                </Container>
            </div>
            </div>
        );
    }
}

export default Admin;
