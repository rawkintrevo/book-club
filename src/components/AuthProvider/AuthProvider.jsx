import React, { useState, useEffect, useContext, createContext } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { getDoc, doc } from 'firebase/firestore';



// Create an Authentication context
const AuthContext = createContext();

// Create a custom hook for using the Auth context
export function useAuth() {
    return useContext(AuthContext);
}

// Create an AuthProvider component to wrap your entire app with the Auth context
export function AuthProvider({ auth, firestore, children }) {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);

   const loadUserData = async (user) => {
        if (user) {
            const userDocRef = doc(firestore, 'users', user.uid);

            try {
                const docSnap = await getDoc(userDocRef);
                if (docSnap.exists()) {
                    const userData = docSnap.data();
                    setCurrentUser(userData);
                }
            } catch (error) {
                console.error('Error loading user data:', error);
            }
        }
    };

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setCurrentUser(user);
            setLoading(false);
            console.log("AuthProvider.onAuthStateChanged")

            loadUserData(user);
        });

        return unsubscribe;
        // eslint-disable-next-line
    }, [auth]);

    const value = {
        currentUser
        // Add any other functions or properties you need
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
}

export default AuthProvider;
