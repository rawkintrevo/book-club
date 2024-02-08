import { collection, doc, query, orderBy, limit, getDoc, getDocs, startAfter } from 'firebase/firestore';
import { useState, useEffect } from 'react';
import {Card, Col, Row, Form, Dropdown, DropdownButton, Pagination} from 'react-bootstrap';

import ListContentItem from "../ListContentItem/ListContentItem";

function ListArticles({ firestore, auth, by, currentUser }) {
  useEffect(() => {
    const userDocRef = doc(firestore, 'users', currentUser.id);
    const getContentReadMap = async () => {
      try {
        const docSnapshot = await getDoc(userDocRef);
        if (docSnapshot.exists()) {
          const userData = docSnapshot.data();
          const contentRead = userData.content && userData.content.read ? userData.content.read : {};
          setContentReadMap(contentRead);
        } else {
          console.log('User document not found.');
        }
      } catch (error) {
        console.error('Error getting content read map:', error);
      }
    };

    getContentReadMap();
  }, [currentUser.id, firestore]); // Empty dependency array ensures this effect runs only once

  const [content, setContent] = useState([]);
  const [contentReadMap, setContentReadMap] = useState({})
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10); // Number of items to display per page

  const [orderByVar, setOrderByVar] = useState('created'); // Default value
  const [ascOrDesc, setAscOrDesc] = useState("desc")
  const handleOrderByChange = (value) => {
    setOrderByVar(value);
  };

  const handleAscOrDescChange = (value) => {
    setAscOrDesc(value);
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line
  }, [currentPage, showUnreadOnly, orderByVar, ascOrDesc]);

  async function fetchData() {
    const contentRef = collection(firestore, 'content');
    let contentQuery= query(contentRef,
        orderBy(orderByVar, ascOrDesc), limit(itemsPerPage));;

    if (currentPage !== 1) {
      const lastVisibleContent = content[content.length - 1];
      contentQuery = query(contentRef,
          orderBy(orderByVar, ascOrDesc),
          startAfter(lastVisibleContent[orderByVar]),
          limit(itemsPerPage));
    }
    const readContentIds = Object.keys(contentReadMap);
    const querySnapshot = await getDocs(contentQuery);

    const fetchedContent = [];
    querySnapshot.forEach(doc => {
      const data = { id: doc.id, ...doc.data() };
      if (showUnreadOnly && readContentIds.includes(data.id)) {

        // Skip read content when showUnreadOnly is true
        return;
      }
      fetchedContent.push(data);
    });

    console.log(fetchedContent.length, "new items")
    console.log("fetchedContent: ", fetchedContent)
    setContent(fetchedContent);
  }

  function toggleShowUnreadOnly(value) {
    setShowUnreadOnly(!showUnreadOnly);
  }

  function handlePageChange(page) {
    setCurrentPage(page);
  }

  return (
      <div>
        <Card.Body>
          <div>
            <Row key={"controls"} className="align-items-center">
              <Col md={2} lg={2}>
                <Form.Check
                    type="switch"
                    id="unread-switch"
                    label="Unread Only"
                    checked={showUnreadOnly}
                    onChange={toggleShowUnreadOnly}
                />
              </Col>
              <Col md={6} lg={6}>
                Order By:
                <DropdownButton title={orderByVar} onSelect={handleOrderByChange}>
                  <Dropdown.Item eventKey="created">Created</Dropdown.Item>
                  <Dropdown.Item eventKey="avg_rating">Rating</Dropdown.Item>
                </DropdownButton>
                <DropdownButton title={ascOrDesc} onSelect={handleAscOrDescChange}>
                  <Dropdown.Item eventKey="asc">Ascending</Dropdown.Item>
                  <Dropdown.Item eventKey="desc">Descending</Dropdown.Item>
                </DropdownButton>
              </Col>
            </Row>
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
          {content.map((article) => (
                // <li key={article.id}>{article.title}</li>
              <ListContentItem key={article.id} article={article} contentReadMap={contentReadMap} />
              ))}

        </Card.Body>
        <Card.Footer>
          <Pagination>
            <Pagination.Prev onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} />
            <Pagination.Item active>{currentPage}</Pagination.Item>
            <Pagination.Next onClick={() => handlePageChange(currentPage + 1)} />
          </Pagination>
        </Card.Footer>
      </div>
  );
}

export default ListArticles;
