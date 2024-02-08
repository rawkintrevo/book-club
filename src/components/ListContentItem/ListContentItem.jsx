import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faFile, faQuestionCircle} from "@fortawesome/free-regular-svg-icons";
import {faBook, faBookOpen, faFile as farFile} from "@fortawesome/free-solid-svg-icons";
import {Col, Row} from "react-bootstrap";
import {Link} from "react-router-dom";


function ListContentItem({ firestore, auth, by, currentUser, article, contentReadMap }) {
    const renderIcon = (article) => {
        const isRead = contentReadMap.hasOwnProperty(article.id) || false;
        if (article.type === 'article') {
            if (isRead) {
                return <FontAwesomeIcon icon={faFile} style={{ marginLeft: '5px' }} />
            } else {
                return <FontAwesomeIcon icon={farFile} style={{ marginLeft: '5px' }} />
            }
        } else if (article.type === 'book') {
            if (isRead) {
                return <FontAwesomeIcon icon={faBookOpen} style={{ marginLeft: '5px' }} />
            } else {
                return <FontAwesomeIcon icon={faBook} style={{ marginLeft: '5px' }} />
            }

        } else {
            return <FontAwesomeIcon icon={faQuestionCircle}style={{ marginLeft: '5px' }} />
        }
    }

    return (
        <Row key={article.id}>
            <Col md={8} lg={8}>
                <div style={{ textAlign: 'left' }}>
                    <p>
                        {renderIcon(article)}
                        &nbsp; <Link to={'/content/' + article.id}><b>{article.title}</b></Link>
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
    )
}

export default ListContentItem
