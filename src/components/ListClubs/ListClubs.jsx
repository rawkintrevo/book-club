// import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
// import {faFile, faQuestionCircle} from "@fortawesome/free-regular-svg-icons";
// import {faBook, faBookOpen, faFile as farFile} from "@fortawesome/free-solid-svg-icons";
import {Col, Row} from "react-bootstrap";
import {Link} from "react-router-dom";
import {useEffect, useState} from "react";
import {collection, onSnapshot} from "firebase/firestore";



function ListClubs({ firestore, auth, currentUser }) {
    const [clubs, setClubs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onSnapshot(collection(firestore, 'clubs'), (snapshot) => {
            const clubsData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setClubs(clubsData);
            setLoading(false);
        }, (error) => {
            console.error('Error fetching clubs: ', error);
        });

        // Cleanup function
        return () => {
            unsubscribe();
            setLoading(true);
        };
    }, [firestore]);

    if (loading) {
        return <p>Loading...</p>;
    }

    return (
        <div>
            <Row>
                <Col md={4} lg={4} className="text-start"><strong>Name</strong></Col>
                <Col md={8} lg={8} className="text-start"><strong>Description</strong></Col>
            </Row>
            {clubs.map(club => (
                <Row key={club.id}>
                    <Col md={4} lg={4} className="text-start">
                        <Link to={'/club/' + club.id}>{club.name}</Link></Col>
                    <Col md={8} lg={8} className="text-start">{club.desc}</Col>
                </Row>
                ))
            }
        </div>
    )
}

export default ListClubs
