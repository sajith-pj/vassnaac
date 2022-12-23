import React, { useState, useEffect } from 'react'
import axios from '../../axios'
import { Row, Col, Card, CardBody, Table, Button } from 'reactstrap'
import DoneIcon from '../../assets/successIcon.svg'
import Loader from '../../components/loader';
import DeleteIcon from '@material-ui/icons/Delete';
function Notifications() {

    const [loader, setLoader] = useState(true);
    const [notification, setNotifications] = useState([])

    useEffect(() => {
        getNotifications()
    }, [])

    const getNotifications = () => {
        axios.get('user/notifications/list')
            .then(response => {
                setNotifications(response?.data?.data || [])
            }).finally(() => setLoader(false))
    }

    const viewUrl = (notification) => {
        if (notification?.data?.status === "ADMIN_MSG") {
            if (notification?.data?.url)
                window.open(`${notification.data.url}`, '_blank');
        } else {
            window.open(`/criterion/details/view/${notification?.data?.id}/${notification?.data?.criterion}`, '_blank');
        }
    }

    const changeStatus = (notification, mode) => {
        console.log(notification.id);
        setLoader(true)
        let reqBody = {}
        if (mode === "read") {
            reqBody = { is_viewed: true }
        }
        if (mode === "delete") {
            reqBody = { is_deleted: true }
        }

        axios.put(`/user/notifications/details/${notification?.id}`, reqBody)
            .then(response => {
                if (response?.data?.data) {
                    getNotifications()
                }
            }).finally(() => setLoader(false))
    }

    if (loader) {
        return <Loader title={'Notifications'} />
    }
    return (
        <Row className=''>
            <div class="pagetitle">
                <h1>Notifications</h1>
                <h6>View all notifications</h6>
            </div>
            {
                notification.length === 0 &&
                <Col xs='12' className='d-flex justify-content-center mt-4'><h4>No Notifications!</h4></Col>
            }
            <Col xs='12' sm='12'>
                {
                    notification.length !== 0 ?
                        <Card>
                            <CardBody>
                                <Table>
                                    <thead>
                                        <tr>
                                            <th>Criterion</th>
                                            <th>Status</th>
                                            <th>Message</th>
                                            <th>Done By</th>
                                            <th>Date & Time</th>
                                            <th>View</th>
                                            <th>Mark as read</th>
                                            <th>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {
                                            notification.map((val, ky) => {
                                                return (
                                                    <tr key={ky}>
                                                        <td> {val?.data?.criterion} </td>
                                                        <td> {val?.data?.status} </td>
                                                        <td> {val?.message} </td>
                                                        <td> {val?.data?.updated_by} </td>
                                                        <td> {val?.date} </td>
                                                        <td>
                                                            <p
                                                                style={{cursor:'pointer',color:'blue'}}
                                                                className="view_p"
                                                                onClick={() => viewUrl(val)}
                                                            >
                                                                View
                                                            </p>
                                                        </td>
                                                        <td className="flex justify-center items-center">
                                                            {val?.is_viewed === false ? (
                                                                <Button
                                                                    type="button"
                                                                    color='danger' size='sm'
                                                                    onClick={() => changeStatus(val, "read")}
                                                                >
                                                                    Mark as read
                                                                </Button>


                                                            )
                                                                : <img src={DoneIcon} width="20" alt='' />
                                                            }
                                                        </td>
                                                        <td> <DeleteIcon style={{ cursor: 'pointer' }} onClick={() => changeStatus(val, "delete")} /> </td>
                                                    </tr>
                                                )
                                            })
                                        }
                                    </tbody>
                                </Table>
                            </CardBody>
                        </Card>
                        :
                        ''
                }

            </Col>
        </Row>
    )
}

export default Notifications