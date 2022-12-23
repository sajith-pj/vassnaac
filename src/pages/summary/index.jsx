import React, { useState, useEffect } from 'react'
import axios from '../../axios'
import { Row, Col, CardHeader, CardBody, Card, Table } from 'reactstrap';
import Loader from '../../components/loader';

function Summary() {
    const [loader, setLoader] = useState(true);
    const [approved, setApproved] = useState({});
    const [entered, setEntered] = useState({});

    const getSumary = () => {
        axios.get('/criterion/data-summary')
            .then((response) => {
                let { data_approved, data_enterd } = response?.data?.data || {}
                setApproved({ ...data_approved })
                setEntered({ ...data_enterd })
            }).finally(() => setLoader(false))
    }

    useEffect(() => {
        getSumary();
    }, [])

    if (loader) {
        return <Loader title={'Summary'} />
    }
    return (
        <Row className='Summary'>
            <div class="pagetitle">
                <h1>Summary</h1>
            </div>

            <Col xs='12' sm='6'>
                <Card>
                    <CardHeader>Data Entered</CardHeader>
                    <CardBody>
                        {
                            Object.keys(entered).length > 0 ? (
                                <Table>
                                    <thead>
                                        <tr>
                                            <th>Criterion</th>
                                            <th>Data Entered</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {
                                            Object.keys(entered).map((val,k) => {
                                                return (
                                                    <tr key={k}>
                                                        <td>{val}</td>
                                                        <td>{entered[val]}</td>
                                                    </tr>
                                                )
                                            })
                                        }
                                    </tbody>
                                </Table>
                            ) :
                            'No Data Available'
                        }
                    </CardBody>
                </Card>
            </Col>

            <Col xs='12' sm='6'>
                <Card>
                    <CardHeader>Data Approved</CardHeader>
                    <CardBody>
                        {
                            Object.keys(approved).length > 0 ? (
                                <Table>
                                    <thead>
                                        <tr>
                                            <th>Criterion</th>
                                            <th>Data Approved</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {
                                            Object.keys(approved).map((val,k) => {
                                                return (
                                                    <tr key={k}>
                                                        <td>{val}</td>
                                                        <td>{approved[val]}</td>
                                                    </tr>
                                                )
                                            })
                                        }
                                    </tbody>
                                </Table>
                            )
                            :
                            'No Data Available'
                        }
                    </CardBody>
                </Card>
            </Col>
        </Row>
    )
}

export default Summary