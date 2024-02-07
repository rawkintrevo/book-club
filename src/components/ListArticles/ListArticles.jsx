import { collection, query, orderBy, limit, startAfter, getDocs, where } from 'firebase/firestore';
import { useState, useEffect } from 'react';
import {Button, Card, Col, Row} from 'react-bootstrap';
import {Link} from "react-router-dom";

// ... (import statements)

function ListArticles({ firestore, auth, by, currentUser }) {
  // State to store the list of articles and the last document to paginate
  const [articles, setArticles] = useState([]);
  const [lastDocument, setLastDocument] = useState(null);

  useEffect(() => {
    console.log('ListArticles.useEffect()')
    const fetchArticles = async () => {
      const articlesCollection = collection(firestore, 'content');

      // Query the "articles" collection, order by some field (e.g., timestamp), and limit to 10 items
      let q = query(articlesCollection, orderBy('created', 'desc'), limit(10));
      if (by === "user") {
        q = query(
            articlesCollection,
            where('created_by.id', '==', currentUser.id),
            orderBy('created', 'desc'),
            limit(10)
        );
      }

      try {
        const querySnapshot = await getDocs(q);

        const newArticles = [];

        querySnapshot.forEach((doc) => {
          // Add article data to the list
          newArticles.push({ id: doc.id, ...doc.data() });
        });

        // Update the state with the new articles and set the last document for pagination
        setArticles(newArticles);
        setLastDocument(querySnapshot.docs[querySnapshot.docs.length - 1]);
      } catch (error) {
        console.error('Error fetching articles:', error);
      }
    };

    fetchArticles();
  }, [firestore, by, currentUser]);

  // Function to load more articles
  const loadMoreArticles = async () => {
    if (lastDocument) {
      const articlesCollection = collection(firestore, 'content');
      const q = query(articlesCollection, orderBy('created', 'desc'), startAfter(lastDocument), limit(10));

      try {
        const querySnapshot = await getDocs(q);

        const newArticles = [];

        querySnapshot.forEach((doc) => {
          newArticles.push({ id: doc.id, ...doc.data() });
        });

        // Append the new articles to the existing list
        setArticles([...articles, ...newArticles]);

        // Update the last document for further pagination
        setLastDocument(querySnapshot.docs[querySnapshot.docs.length - 1]);
      } catch (error) {
        console.error('Error fetching more articles:', error);
      }
    }
  };

  // Rest of your component code here

  return (
      <div>
        {/* ... (existing code) */}

        <Card.Body>
          <div>
            <Row key={"header"}>
              <Col md={8} lg={8}><div style={{ textAlign: 'left' }}>
                <b>Title</b>/Author(s)
              </div></Col>

              <Col md={1} lg={1}><b>Rating</b></Col>
              <Col md={1} lg={1}><b>Saves</b></Col>
              <Col md={1} lg={1}><b>Views</b></Col>
              <Col md={1} lg={1}><b>Created</b></Col>
              <hr/>
            </Row>
          </div>
          {/* Render the list of articles */}
          {articles.map((article) => (
                // <li key={article.id}>{article.title}</li>
              <Row key={article.id}>
                <Col md={8} lg={8}>
                  <div style={{ textAlign: 'left' }}>
                    <p>
                      <Link to={'/content/' + article.id}><b>{article.title}</b></Link>
                    </p>
                    <p style={{ fontSize: '0.6rem' }}>
                      {article.author}
                    </p>
                  </div>
                </Col>

                <Col md={1} lg={1}>
                  {article.avg_rating}
                </Col>
                <Col md={1} lg={1} style={{ marginBottom: '10px' }}>
                  {article.n_saves}
                </Col>
                <Col md={1} lg={1} style={{ marginBottom: '10px' }}>
                  {article.views}
                </Col>
                <Col md={1} lg={1}>
                  {article.created.toDate().toLocaleDateString()}
                </Col>
                <hr/>
              </Row>
              ))}
          {/* Button to load more articles */}
          {lastDocument && (
              <Button varient="primary" onClick={loadMoreArticles}>Next Page</Button>
          )}
        </Card.Body>
      </div>
  );
}

export default ListArticles;