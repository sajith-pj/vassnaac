import React, { useEffect, useState } from 'react'
import { Row, Col, Card, CardBody, Input, Label, Button, FormFeedback } from 'reactstrap'
import { toast } from 'react-toastify';
import axios from '../../axios'
import { isRequired, validateEmail, validateMobile } from "../../utils/validators";

const designationList = [
    {
        value: "PRINCIPAL",
        title: "PRINCIPAL",
    },
    {
        value: "AST_PROFESSOR",
        title: "ASSISTANT PROFESSOR",
    },
    {
        value: "AST_PROFESSOR",
        title: "ASSOCIATE PROFESSOR",
    },
    {
        value: "AST_PROFESSOR",
        title: "ASSOCIATE PROFESSOR",
    },
    {
        value: "HOD",
        title: "HEAD OF DEPARTMENT",
    },
    {
        value: "TECH_STAFF",
        title: "TECHNICAL STAFF",
    },
    {
        value: "ADMIN_STAFF",
        title: "ADMINISTRATIVE STAFF",
    },
];

function Profile() {
    const [departmentList, setDepartmentList] = useState([]);
    const [loader, setLoader] = useState(false)
    const [userDetails, setUserDetails] = useState({
        username: "",
        first_name: "",
        last_name: "",
        phone_number: "",
        email: "",
        designation: "",
        department: "",
    });
    const [err, setErr] = useState({})

    useEffect(() => {
        getDepartments();
        getUserDetails();
    }, []);

    const getDepartments = () => {
        axios.get("/programs/department/list").then((response) => {
            setDepartmentList(response?.data?.data || []);
        });
    };

    const getUserDetails = () => {
        setLoader(true);
        axios.get("/user/profile").then((response) => {
            setLoader(false);
            setUserDetails({ ...response?.data?.data, department: response?.data?.data?.department?.id || '' });
        });
    };

    const handleChange = (e) => {
        setUserDetails({ ...userDetails, [e.target.name]: e.target.value })
        setErr({ ...err, [e.target.name]: '' })
    }

    const updateUser = () => {
        let errObj = {
            username: isRequired(userDetails.username),
            first_name: isRequired(userDetails.first_name),
            last_name: isRequired(userDetails.last_name),
            email: validateEmail(userDetails.email),
            phone_number: validateMobile(userDetails.phone_number),
            department: isRequired(userDetails.department),
            designation: isRequired(userDetails.designation),
        }
        if (Object.values(errObj).some((val) => val !== '')) {
            setErr(errObj)
            return
        }
        setLoader(true)
        axios.put("/user/profile", { ...userDetails, clubs: userDetails?.clubs?.id })
            .then((response) => {
                toast.success('Profile updated successfully', {
                    position: "top-right",
                    autoClose: 2000,
                });
                setLoader(false)
            })
            .catch((error) => {
                let msgData = err?.response?.data?.data || {}
                setErr(msgData)
                setLoader(false)
            })
    }

    return (
        <Row>
            <div class="pagetitle">
                <h1>Profile</h1>
                <h6>View/Update personal details here</h6>
            </div>

            <Col xs='1' sm='2'></Col>
            <Col xs='12' sm='8'>
                <Card className='p-1 m-1'>
                    <CardBody>
                        <Row>
                            <Col xs='12' sm='6' className='mt-2'>
                                <Label>
                                    User Name
                                </Label>
                                <Input
                                    type="text"
                                    value={userDetails.username}
                                    name="username"
                                    onChange={handleChange}
                                    id="username"
                                    invalid={!!err?.username}
                                    disabled={true}
                                />
                                <FormFeedback>{err?.username}</FormFeedback>
                            </Col>
                            <Col xs='12' sm='6' className='mt-2'>
                                <Label>
                                    First Name
                                </Label>
                                <Input
                                    type="text"
                                    value={userDetails.first_name}
                                    name="first_name"
                                    onChange={handleChange}
                                    id="first_name"
                                    invalid={!!err?.first_name}
                                />
                                <FormFeedback>{err?.first_name}</FormFeedback>
                            </Col>
                            <Col xs='12' sm='6' className='mt-2'>
                                <Label>
                                    last Name
                                </Label>
                                <Input
                                    type="text"
                                    value={userDetails.last_name}
                                    name="last_name"
                                    onChange={handleChange}
                                    id="last_name"
                                    invalid={!!err?.last_name}
                                />
                                <FormFeedback>{err?.last_name}</FormFeedback>
                            </Col>
                            <Col xs='12' sm='6' className='mt-2'>
                                <Label>
                                    email
                                </Label>
                                <Input
                                    type="email"
                                    value={userDetails.email}
                                    name="email"
                                    onChange={handleChange}
                                    id="email"
                                    invalid={!!err?.email}
                                />
                                <FormFeedback>{err?.email}</FormFeedback>
                            </Col>
                            <Col xs='12' sm='6' className='mt-2'>
                                <Label>
                                    Phone.No
                                </Label>
                                <Input
                                    type="number"
                                    min={0}
                                    value={userDetails.phone_number}
                                    name="phone_number"
                                    onChange={handleChange}
                                    id="phone_number"
                                    invalid={!!err?.phone_number}
                                />
                                <FormFeedback>{err?.phone_number}</FormFeedback>
                            </Col>
                            <Col xs='12' sm='6' className='mt-2'>
                                <Label>
                                    Designation
                                </Label>
                                <Input
                                    type="select"
                                    value={userDetails.designation}
                                    name="designation"
                                    onChange={handleChange}
                                    id="designation"
                                    invalid={!!err?.designation}
                                >
                                    <option value=""> Designation </option>
                                    {designationList.map((designation, index) => (
                                        <option key={index} value={designation.value}>
                                            {designation.title}
                                        </option>
                                    ))}
                                </Input>
                                <FormFeedback>{err?.designation}</FormFeedback>
                            </Col>
                            <Col xs='12' sm='6' className='mt-2'>
                                <Label>
                                    Department
                                </Label>
                                <Input
                                    type="select"
                                    value={userDetails?.department}
                                    name="department"
                                    onChange={handleChange}
                                    id="department"
                                    invalid={!!err?.department}
                                    disabled={true}
                                >
                                    <option value=""> Department </option>
                                    {departmentList.map((department, ky) => (
                                        <option key={ky} value={department.id}> {department.name} </option>
                                    ))}
                                </Input>
                                <FormFeedback>{err?.department}</FormFeedback>
                            </Col>

                            <Col xs='12' className='d-flex justify-content-end'>
                                <Button disabled={loader} color="primary" size="sm" className="mt-2" onClick={updateUser}>Update</Button>
                            </Col>
                        </Row>
                    </CardBody>
                </Card>
            </Col>
            <Col xs='1' sm='2'></Col>
        </Row>
    )
}

export default Profile