import React, { useState } from "react";
import { Row, Col, Card, CardBody, Input, Label, Button, FormFeedback } from 'reactstrap'
import axios from "../../axios";
import { useOutletContext } from 'react-router-dom'
import { isRequired } from "../../utils/validators";
import { toast } from 'react-toastify';

function ChangePassword() {
    let userDetails = useOutletContext()
    const [passwordDetails, setPasswordDetails] = useState({
        old_password: "",
        password: "",
        password2: "",
    });
    const [err, setErr] = useState({})
    const [loading,setLoading]=useState(false)

    const handleChange = (e) => {
        setPasswordDetails({ ...passwordDetails, [e.target.name]: e.target.value })
        setErr({ ...err, [e.target.name]: '' })
    }

    const changePassword = () => {

        let obj = {
            old_password: isRequired(passwordDetails.old_password),
            password: isRequired(passwordDetails.password),
            password2: isRequired(passwordDetails.password2)
        }

        if (Object.values(obj).some((val) => val !== '')) {
            setErr(obj)
            return
        }
        if(passwordDetails.password!==passwordDetails.password2){
            setErr({
                old_password: '',
                password: 'Password and Confirm password must be equal',
                password2: 'Password and Confirm password must be equal'
            })
            return
        }

        if(passwordDetails.password){
            let msg='password must contain at least eight characters, at least one number and both lower and uppercase letters and special characters'
            let re= /^(?=.*\d)(?=.*[!@#$%^&*])(?=.*[a-z])(?=.*[A-Z]).{8,}$/
            let chk=re.test(passwordDetails.password)
            if(!chk){
                setErr({
                    old_password: '',
                    password: msg,
                    password2: ''
                })
                return
            }
        }
        setErr({})
        setLoading(true)
        axios.put(`/change_password/${userDetails.id}`, passwordDetails)
            .then((response) => {
                setLoading(false)
                if(response.data.success){
                    toast.success("Password updated successfully", {
                        position: "top-right",
                        autoClose: 2000,
                    })
                    setPasswordDetails({})
                }
            })
            .catch((error) => { 
                let msgData = error?.response?.data?.data || {}
                setErr(msgData)
                setLoading(false)
                toast.error("Password updation failed", {
                    position: "top-right",
                    autoClose: 2000,
                })
            })


    }
    return (
        <>
            <div class="pagetitle">
                <h1>Update Password</h1>
                <h6>Update your password here.</h6>
            </div>

            <Row>
                <Col xs='1' sm='3'></Col>
                <Col xs='10' sm='6'>
                    <Card className='p-1 m-1'>
                        <CardBody>
                            <Label className='mt-2'>Old Password</Label>
                            <Input
                                type='password'
                                name='old_password'
                                value={passwordDetails.old_password}
                                onChange={handleChange}
                                invalid={!!err?.old_password}
                            />
                            <FormFeedback>{err?.old_password}</FormFeedback>
                            <Label className='mt-4'>New Password</Label>
                            <Input
                                type='password'
                                name='password'
                                value={passwordDetails.password}
                                onChange={handleChange}
                                invalid={!!err?.password}
                            />
                            <FormFeedback>{err?.password}</FormFeedback>

                            <Label className="mt-4">Confirm Password</Label>
                            <Input
                                type='password'
                                name='password2'
                                value={passwordDetails.password2}
                                onChange={handleChange}
                                invalid={!!err?.password2}
                            />
                            <FormFeedback>{err?.password2}</FormFeedback>

                            <Button disabled={loading} color="primary" size="sm" className="mt-2" onClick={changePassword}>Update Password</Button>
                        </CardBody>
                    </Card>
                </Col>
                <Col xs='1' sm='3'></Col>
            </Row>
        </>

    )
}

export default ChangePassword