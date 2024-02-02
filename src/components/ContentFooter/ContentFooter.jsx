import {Button, Card, ToggleButton, ToggleButtonGroup} from "react-bootstrap";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faFrown, faMeh, faSmile} from "@fortawesome/free-solid-svg-icons";
import React, {useEffect, useState} from 'react';
import {useAuth} from "../AuthProvider/AuthProvider";
import { doc, getDoc, updateDoc } from 'firebase/firestore';


function ContentFooter( {firestore, auth, storage, articleId, article}) {
    const { currentUser } = useAuth();
    const [selectedRating, setSelectedRating] = useState(null);
    const [userData, setUserData] = useState(currentUser)
    useEffect(() => {
        // Check if currentUser is available
        if (currentUser) {
            // Construct the Firestore document reference with currentUser.id
            const userDocRef = doc(firestore, 'users', currentUser.id);

            // Fetch the user document
            const loadUserData = async () => {
                try {
                    const docSnap = await getDoc(userDocRef);
                    if (docSnap.exists()) {
                        setUserData(docSnap.data());
                    } else {
                        console.error('User document does not exist.');
                    }
                } catch (error) {
                    console.error('Error loading user data:', error);
                }
            };

            loadUserData(); // Call the function to load user data
        }
    }, [currentUser, firestore]); // Include currentUser and firestore in the dependency array


    useEffect(() => {
        // Check if currentUser and content ratings exist
        if (userData && userData.content && userData.content.rated) {
            const rated = userData.content.rated;
            // Check if articleId exists in ratings
            if (rated.hasOwnProperty(articleId)) {
                setSelectedRating(rated[articleId].value);
            }
        }
    }, [userData, articleId]); // Include articleId in the dependency array

    const handleRatingChange = async (value) => {
        // Check if currentUser is available
        if (currentUser) {
            const userId = currentUser.id;

            // Construct the Firestore document reference
            const userDocRef = doc(firestore, 'users', userId);


            try {
                // Fetch the user document to check if it exists
                const userDocSnapshot = await getDoc(userDocRef);
                if (userDocSnapshot.exists()) {
                    // If the user document exists, update the ratings
                    // Construct the path to the rated object
                    const ratedObjectPath = `content.rated.${articleId}`;
                    const currentRatings = userDocSnapshot.get('content.rated');
                    // Check if the rated object already exists
                    if (currentRatings.hasOwnProperty(articleId)) {
                        const updateObject = {
                            [`${ratedObjectPath}.value`]: value,
                        };
                        // Update the existing rated object's value
                        await updateDoc(userDocRef, updateObject);
                    } else {
                        // Create a new rated object
                        currentRatings[articleId] = {
                            title: article.title,
                            id: articleId,
                            value: value,
                        };
                        // Write the updated map back to Firestore
                        await updateDoc(userDocRef, {
                            'content.rated': currentRatings,
                        });
                    }
                    setSelectedRating(value);
                }
            } catch (error) {
                console.error('Error updating Firestore document:', error);
            }

            const articleDocRef = doc(firestore,
                'content',
                articleId);

            try {
                // Fetch the article document with the 'ratings' and 'avg_rating' fields
                const articleDocSnapshot = await getDoc(articleDocRef, {
                    fieldPaths: ['ratings', 'avg_rating']
                });

                if (articleDocSnapshot.exists()) {
                    const articleData = articleDocSnapshot.data();

                    // Check if the user's ID exists in the ratings list
                    const userRatingIndex = articleData.ratings.findIndex(
                        (rating) => userData.id in rating
                    );

                    // If user's ID exists, update the existing rating
                    if (userRatingIndex !== -1) {
                        articleData.ratings[userRatingIndex][userData.id] = value;
                    }
                    // If user's ID doesn't exist, add a new rating
                    else {
                        const newRating = {
                            [userData.id]: value
                        };
                        articleData.ratings.push(newRating);
                    }

                    // Calculate the average rating
                    let totalRating = 0;
                    articleData.ratings.forEach((rating) => {
                        for (const key in rating) {
                            totalRating += rating[key];
                        }
                    });
                    const avgRating = totalRating / articleData.ratings.length;

                    // Update the 'ratings' and 'avg_rating' fields in Firestore
                    await updateDoc(articleDocRef, {
                        ratings: articleData.ratings,
                        avg_rating: avgRating
                    });
                } else {
                    console.error('Article document does not exist.');
                }
            } catch (error) {
                console.error('Error updating article document:', error);
            }
        }
    };

    return (
        <Card.Footer>
            <ToggleButtonGroup
                type={"radio"}
                style={{ marginBottom: '10px' }}
                name="rating"
                value={selectedRating}
                onChange={handleRatingChange}>
                <ToggleButton id="+1" value={1} variant="outline-success"><FontAwesomeIcon icon={faSmile} /></ToggleButton>
                <ToggleButton id="0" value={0} variant="outline-warning"><FontAwesomeIcon icon={faMeh} /></ToggleButton>
                <ToggleButton id="-1" value={-1} variant="outline-danger"><FontAwesomeIcon icon={faFrown} /></ToggleButton>
            </ToggleButtonGroup><br/>
            <Button>Save</Button>
        </Card.Footer>
    )
}

export default ContentFooter
