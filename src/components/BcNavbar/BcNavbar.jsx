import React from 'react';
import {Navbar, Nav, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useAuth } from '../AuthProvider/AuthProvider'
import { signOut } from 'firebase/auth';

function BcNavbar( {auth, firestore}) {
    const { currentUser } = useAuth(); // Replace with your authentication context

    const handleLogout = async () => {

        try {
            // Sign out the user using Firebase v9
            await signOut(auth);

            // You can also redirect the user to a specific page after logout if needed
            // For example, you can use history.push('/login') here
        } catch (error) {
            console.error('Error logging out:', error);
        }
    };

    return (
        <Navbar bg="dark" variant="dark" expand="lg">
            <Navbar.Brand>
                <Link to="/" className="navbar-brand">
                    {window.innerWidth > 576 ? 'The Aboriginal Armadillo Book Club' : 'AA Book Club'}
                </Link>
                {/*<NavbarText>*/}
                {/*    {auth.currentUser.displayName}*/}
                {/*</NavbarText>*/}
            </Navbar.Brand>
            <Navbar.Toggle aria-controls="basic-navbar-nav" />
            <Navbar.Collapse id="basic-navbar-nav">
                <Nav className="ml-auto">
                    <Nav.Link as={Link} to="/clubs">
                        Clubs
                    </Nav.Link>
                    <Nav.Link as={Link} to="/">
                        Find new stuff
                    </Nav.Link>
                    <Nav.Link as={Link} to="/mystuff">
                        My Stuff
                    </Nav.Link>
                    <Button variant="outline-light" as={Link} to="/upload">Create</Button>
                    {currentUser && currentUser.isSU && (
                        <Nav.Link as={Link} to="/admin">
                            Admin
                        </Nav.Link>
                    )}
                    {currentUser ? (
                        <Button variant="outline-light" onClick={handleLogout}>
                            Logout
                        </Button>
                    ) : (
                        <Nav.Link as={Link} to="/login">
                            Login
                        </Nav.Link>
                    )}
                </Nav>
            </Navbar.Collapse>
        </Navbar>
    );
}

export default BcNavbar;
