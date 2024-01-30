import BcNavbar from "../BcNavbar/BcNavbar";
import {Navigate} from "react-router-dom";

import { useAuth } from '../AuthProvider/AuthProvider'

import Review from "../Review/Review";

function Home( {firestore, auth}) {
    const { currentUser } = useAuth();


    // If no user is logged in, redirect to the login page
    if (currentUser === null) {
        return <Navigate to="/login"/>;
    } else if ((!currentUser.verifBooks) && (!currentUser.verifArticles)) {
        return (
            <Review />
        )
    } else {

        return (
            <div>
                <BcNavbar firestore={firestore}
                          auth={auth}/>
                <div style={{
                    backgroundImage: 'url("/img/home01.png")',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center center',
                    height: '100vh',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}>
                    Hello {auth.currentUser.displayName}
                </div>
            </div>

        )
    }

}

export default Home;
