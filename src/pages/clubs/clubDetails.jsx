import React, { useEffect, useState } from 'react'
import { Row, Col, Card, CardBody, CardHeader, Table, Nav, NavItem, NavLink, TabContent, TabPane, } from 'reactstrap'
import { Link, useParams } from "react-router-dom";
import axios from '../../axios'

function ClubDetails() {

    const { id } = useParams();
    const [clubData, setClubData] = useState({});
    const [tabVal, setTabVal] = useState('1');

    const getClubDetails = () => {
        axios.get(`/programs/clubs/details/${id}`).then((response) => {
            setClubData(response?.data?.data || {});
        });
    };
    useEffect(() => {
        getClubDetails();
    }, []);

    let { user_details = [] } = clubData
    return (
        <Row>
            <div class="pagetitle">
                <h1>View Club Details</h1>
                <nav>
                    <ol class="breadcrumb">
                        <li class="breadcrumb-item">Features</li>
                        <li class="breadcrumb-item">
                            <Link to='/clubs'>Clubs</Link>
                        </li>
                        <li class="breadcrumb-item active">Details</li>
                    </ol>
                </nav>
            </div>

            <Col xs='12' sm='2'></Col>
            <Col xs='12' sm='8'>

                <Nav tabs>
                    <NavItem>
                        <NavLink
                            className={tabVal === '1' ? "active" : ''}
                            onClick={() => { setTabVal('1') }}
                        >
                            Club details
                        </NavLink>
                    </NavItem>
                    <NavItem>
                        <NavLink
                            className={tabVal === '2' ? "active" : ''}
                            onClick={() => { setTabVal('2') }}
                        >
                            Assigned Users
                        </NavLink>
                    </NavItem>
                </Nav>
                <TabContent activeTab={tabVal}>
                    <TabPane tabId="1">
                        <Card>
                            <CardHeader><b>{clubData?.name}</b></CardHeader>
                            <CardBody>
                                <Table>
                                    <thead>
                                        <tr>
                                            <th>Detail</th>
                                            <th>Value</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td> Code </td>
                                            <td> {clubData?.code} </td>
                                        </tr>

                                        <tr>
                                            <td> Established At </td>
                                            <td> {clubData?.established_at} </td>
                                        </tr>


                                        <tr>
                                            <td> Description </td>
                                            <td> {clubData?.description} </td>
                                        </tr>
                                        <tr>
                                            <td> Status </td>
                                            <td> {clubData?.is_enabled && clubData?.status ? <b> Enabled </b> : <b> Disabled </b>}
                                            </td>
                                        </tr>

                                    </tbody>
                                </Table>
                            </CardBody>
                        </Card>
                    </TabPane>
                    <TabPane tabId="2">
                        <Card>
                            <CardBody>
                                <div style={{ height: '60vh', width: '100%', overflowY: 'auto' }}>

                                    {
                                        user_details && user_details.length > 0 ? (
                                            <Table>
                                                <thead>
                                                    <tr>
                                                        <th>Sl No</th>
                                                        <th>Full Name</th>
                                                        <th>Value</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {
                                                        user_details.map((val, ky) => {
                                                            return (
                                                                <tr key={ky}>
                                                                    <td> {ky + 1} </td>
                                                                    <td> {val?.full_name} </td>
                                                                    <td> {val?.department} </td>
                                                                </tr>
                                                            )
                                                        })
                                                    }
                                                </tbody>
                                            </Table>

                                        )
                                            :
                                            <span style={{marginTop:'20px'}}>No Users Assigned Yet</span>
                                    }
                                </div>
                            </CardBody>
                        </Card>
                    </TabPane>
                </TabContent>
            </Col>
            <Col xs='12' sm='2'></Col>
        </Row>
    )
}

export default ClubDetails