import React from 'react'
import { Row, Col, Spinner } from 'reactstrap';

function Loader({ title }) {
    return (
        <Row>
            {
                title && (
                    <div class="pagetitle">
                        <h1>{title}</h1>
                    </div>
                )
            }

            <Col xs='12'>
                <div style={{ width: '100%', height: '50vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Spinner>Loading...</Spinner>
                </div>
            </Col>
        </Row>
    )
}

export default Loader