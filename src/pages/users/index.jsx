import React, { useEffect, useState } from 'react'
import axios from '../../axios'
import DataTable from '../../components/data-table';
import { Button, Row, Col, Input, ModalBody, ModalFooter, FormGroup, Label, FormFeedback } from 'reactstrap';
import { toast } from 'react-toastify';
import ModalCom from '../../components/modal'
import Swal from "sweetalert2";
import { isRequired, validateEmail, validateMobile } from "../../utils/validators";

const designation = [
    "PRINCIPAL",
    "AST_PROFESSOR",
    "ACT_PROFESSOR",
    "TECH_STAFF",
    "ADMIN_STAFF",
    "HOD",
];

const userScope = [
    { value: "ADMIN", text: "Admin" },
    { value: "NAAC_COD", text: "Naac Coordinator" },
    { value: "DEPT_COD", text: "Department" },
    { value: "TEACHER", text: "Teacher" },
    { value: "CLUB", text: "Clubs" },
    { value: "STAFF", text: "Staff" },
    { value: "OTHER", Text: "Other" },
];

function UserList() {

    const [loader, setLoader] = useState(false);
    const [updating, setUpdating] = useState(false);
    const [open, setOpen] = useState(false);
    const [userData, setUserdata] = useState('');
    const [userList, setUserList] = useState([])
    const [filteredUserList, setFilteredUserList] = useState([])
    const [filerVal, setFilterVal] = useState('all')
    const [departmentList, setDepartmentList] = useState([]);
    const [err, setErr] = useState({});

    useEffect(() => {
        getUserList()
        getDepartmentList()
    }, [])

    const getUserList = () => {
        setLoader(true);
        axios.get('/user/list')
            .then((response) => {
                setUserList(response.data.data)
                setFilteredUserList(response.data.data)
                setLoader(false);
            })
            .catch(err => console.error(err))
    }

    const column = [
        { title: "User Name", field: "username" },
        { title: "Name", field: "first_name" },
        { title: "User Scope", field: "user_scope", },
        { title: "Department", field: "department_name", },
        {
            title: "Status", field: "status",
            render: (rowData) => {
                return (
                    <>
                        {
                            rowData.status ?
                                <Button color='danger' size='sm' onClick={() => updateStatus('disable', rowData.id)} >Disable user</Button> :
                                <Button color='success' size='sm' onClick={() => updateStatus('enable', rowData.id)}>Enable user</Button>
                        }
                    </>
                )
            },
        },
    ];

    const getDepartmentList = () => {
        axios.get("/programs/department/list").then((response) => {
            setDepartmentList(response?.data?.data || []);
        });
    };

    const updateStatus = (type, id) => {
        setLoader(true)
        axios.post(`/change-status`, {
            slug: "user",
            objid: id,
            status: type === 'disable' ? false : true,
        })
            .then(response => {
                toast.success('User status updated successfully', {
                    position: "top-right",
                    autoClose: 2000,
                });
                getUserList();
            })
            .catch(() => setLoader(false))
    }
    const filterUser = (e) => {
        let arr = []
        switch (e.target.value) {
            case 'all':
                setFilteredUserList(userList)
                break;
            case 'pending':
                for (let i of userList) {
                    if (i.status === false) {
                        arr.push(i)
                    }
                }
                setFilteredUserList(arr)
                break;
            case 'active':
                for (let i of userList) {
                    if (i.status === true) {
                        arr.push(i)
                    }
                    setFilteredUserList(arr)
                }
                break;
            default:
                setFilteredUserList(userList)
        }
        setFilterVal(e.target.value)
    }

    const updateAll = (type) => {
        setLoader(true)
        axios.post(`/user/all-status`, {
            "status": type === 'activate'
        })
            .then(response => {
                toast.success(`${type === 'activate' ? 'Activated' : 'Disabled'} all user successfully`, {
                    position: "top-right",
                    autoClose: 2000,
                });
                getUserList();
            })
            .catch(() => setLoader(false))

    }

    const edituser = (data) => {
        setUserdata(data)
        setOpen(true)
    }

    const deleteUser = () => {
        Swal.fire({
            icon: "warning",
            text: "Do you want to delete!",
            showCancelButton: true,
            confirmButtonText: "Confirm",
        }).then((result) => {
            if (result.isConfirmed) {
                setUpdating(true)
                axios
                    .delete(`/user/details/${userData.id}`, {})
                    .then((response) => {
                        setUpdating(false)
                        toast.success('User deleted successfully', {
                            position: "top-right",
                            autoClose: 2000,
                        });
                        setOpen(false);
                        setUserdata('')
                        getUserList()
                    }).catch(() => {
                        setUpdating(false)
                        toast.error('User deletion failed', {
                            position: "top-right",
                            autoClose: 2000,
                        })
                    }
                    )

            }
        });
    }

    const resetPassword = (id) => {
        Swal.fire({
            icon: "warning",
            text: `Reset password for ${userData.username} to : Pass@123`,
            showCancelButton: true,
            confirmButtonText: "Confirm",
        }).then((result) => {
            if (result.isConfirmed) {
                setUpdating(true)
                axios.post(`/user/reset-password`, { id }).then(() => {
                    toast.success("Password updated successfully", {
                        position: "top-right",
                        autoClose: 2000,
                    })
                });
            }
        }).finally(() => setUpdating(false))
    };

    const updateHandleChange = (e) => {
        const { name, value, checked } = e.target
        if(name==='is_verified'){
            setUserdata({ ...userData, [name]: checked })
        }
        else if(name==='is_teacher'){
            setUserdata({ ...userData, [name]: checked })
        }
        else{
            setUserdata({ ...userData, [name]: value })
        }
        setErr({ ...err, [name]: '' })
    }

    const updateUser = () => {
        let errObj = {
            username: isRequired(userData.username),
            first_name: isRequired(userData.first_name),
            last_name: isRequired(userData.last_name),
            email: validateEmail(userData.email),
            phone_number: validateMobile(userData.phone_number),
            designation: isRequired(userData.designation),
            department: isRequired(userData.department),
            user_scope: isRequired(userData.user_scope),
        }
        if (Object.values(errObj).some((val) => val !== '')) {
            setErr(errObj)
            return
        } else {
            setUpdating(true)
            axios
                .put(`/user/details/${userData.id}`, userData)
                .then((response) => {
                    toast.success('User details updated successfully', {
                        position: "top-right",
                        autoClose: 2000,
                    });
                    setOpen(false);
                    setUserdata('')
                    getUserList();
                })
                .catch((error) => {
                    let msgData = error?.response?.data?.data || {}
                    setErr(msgData)
                }).finally(()=>setUpdating(false))
        }
    }
    return (
        <Row>
            <div class="pagetitle">
                <h1>All User List</h1>
                <h6>List of registered users with scope as 'END USER', (Both Activated and Pending)</h6>
            </div>
            <Col xs='12' className='d-flex justify-content-end'>
                <Button onClick={() => updateAll('activate')} className='me-2' outline color='success' size='sm'>Activate All</Button>
                <Button onClick={() => updateAll('disable')} className='me-2' outline color='danger' size='sm'>Disable All</Button>
                <Input
                    type='select'
                    size={'sm'}
                    style={{ width: '150px' }}
                    value={filerVal}
                    onChange={filterUser}
                >
                    <option value='all'>All users</option>
                    <option value='pending'>Pending users</option>
                    <option value='active'>Active user</option>
                </Input>
            </Col>
            <Col xs='12'>
                <div className='mt-2'>
                    <DataTable
                        title={"User list"}
                        loading={loader}
                        column={column}
                        data={filteredUserList}
                        edituser={edituser}
                    />
                </div>
            </Col>

            <ModalCom open={open} title={`Update details of ${userData?.username}`} toggle={() => { setOpen(false); setUserdata('') }}>
                <ModalBody>
                    <Row>
                        <Col xs='12' sm='6'>
                            <FormGroup>
                                <Label>User name</Label>
                                <Input type='text' name='username' value={userData?.username} onChange={updateHandleChange} invalid={!!err.username} />
                                <FormFeedback>{err.username}</FormFeedback>
                            </FormGroup>
                        </Col>
                        <Col xs='12' sm='6'>
                            <FormGroup>
                                <Label>First name</Label>
                                <Input type='text' name='first_name' value={userData?.first_name} onChange={updateHandleChange} invalid={!!err.first_name} />
                                <FormFeedback>{err.first_name}</FormFeedback>
                            </FormGroup>
                        </Col>
                        <Col xs='12' sm='6'>
                            <FormGroup>
                                <Label>Last name</Label>
                                <Input type='text' name='last_name' value={userData?.last_name} onChange={updateHandleChange} invalid={!!err.last_name} />
                                <FormFeedback>{err.last_name}</FormFeedback>
                            </FormGroup>
                        </Col>
                        <Col xs='12' sm='6'>
                            <FormGroup>
                                <Label>Email</Label>
                                <Input type='email' name='email' value={userData?.email} onChange={updateHandleChange} invalid={!!err.email} />
                                <FormFeedback>{err.email}</FormFeedback>
                            </FormGroup>
                        </Col>
                        <Col xs='12' sm='6'>
                            <FormGroup>
                                <Label>Phone No.</Label>
                                <Input name='phone_number' type='number' min={0} value={userData?.phone_number} onChange={updateHandleChange} invalid={!!err.phone_number} />
                                <FormFeedback>{err.phone_number}</FormFeedback>
                            </FormGroup>
                        </Col>
                        <Col xs='12' sm='6'>
                            <FormGroup>
                                <Label>Designation</Label>
                                <Input name='designation' type='select' value={userData?.designation} onChange={updateHandleChange} invalid={!!err.designation}>
                                    <option value="" selected disabled>
                                        Designation
                                    </option>
                                    {designation.map((des, ky) => (
                                        <option key={ky} value={des}> {des} </option>
                                    ))}
                                </Input>
                                <FormFeedback>{err.designation}</FormFeedback>
                            </FormGroup>
                        </Col>
                        <Col xs='12' sm='6'>
                            <FormGroup>
                                <Label>Department</Label>
                                <Input name='department' type='select' value={userData?.department} onChange={updateHandleChange} invalid={!!err.department}>
                                    <option value="" selected disabled>
                                        Department
                                    </option>
                                    {departmentList.map((dep, ky) => (
                                        <option key={ky} value={dep.id}> {dep.name} </option>
                                    ))}
                                </Input>
                                <FormFeedback>{err.department}</FormFeedback>
                            </FormGroup>
                        </Col>
                        <Col xs='12' sm='6'>
                            <FormGroup>
                                <Label>Scope</Label>
                                <Input name='user_scope' type='select' value={userData?.user_scope} onChange={updateHandleChange} invalid={!!err.user_scope}>
                                    <option value="" selected disabled>
                                        User Scope
                                    </option>
                                    {userScope.map((scope, ky) => (
                                        <option key={ky} value={scope.value}>{scope.value}</option>
                                    ))}
                                </Input>
                                <FormFeedback>{err.user_scope}</FormFeedback>
                            </FormGroup>
                        </Col>
                        <Col xs='12' sm='6'>
                            <Input type="checkbox" name='is_verified' checked={userData?.is_verified} onChange={updateHandleChange} />
                            {' '}
                            <Label>
                                is verified
                            </Label>
                        </Col>
                        <Col xs='12' sm='6'>
                            <Input type="checkbox" name='is_teacher' checked={userData?.is_teacher} onChange={updateHandleChange} />
                            {' '}
                            <Label>
                                Permission to Switch Role
                            </Label>
                        </Col>
                    </Row>
                </ModalBody>
                <ModalFooter>
                    <Button color='primary' size='sm' disabled={updating} onClick={updateUser}>
                        Update
                    </Button>
                    <Button color='danger' size='sm' disabled={updating} onClick={deleteUser}>
                        Delete
                    </Button>
                    <Button color='info' size='sm' disabled={updating} onClick={() => resetPassword(userData?.id)}>
                        Reset Password
                    </Button>
                    <Button size='sm' onClick={() => { setOpen(false); setUserdata('') }} color="secondary">
                        Close
                    </Button>
                </ModalFooter>
            </ModalCom>
        </Row>
    )
}

export default UserList