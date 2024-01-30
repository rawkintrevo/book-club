import {Card, Container} from "react-bootstrap";

function Review()  {

    return (
        <div
            style={{
                backgroundImage: 'url("/img/review.png")',
                backgroundSize: 'cover',
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
                borderRadius: '10px'
            }}>
                <Card bg="light" text="dark" style={{ opacity: 0.9, margin: '20px', borderRadius: '10px' }}>
                    <Card.Title style={{
                        backgroundColor: 'grey', // Dark gray background color
                        color: 'dark',        // White text color
                        padding: '10px',       // Padding for spacing
                        marginTop: '0',     // Margin above the text
                        marginBottom: '10px',  // Margin below the text
                        borderRadius: '5px',   // Border radius for rounded corners
                    }}>Your Application is being reviewed. </Card.Title>
                    <Card.Body>
                        Please be patient. Check back soon.
                    </Card.Body>
                </Card>
            </Container>
        </div>
    )
}

export default Review;
