import React, { useState, useEffect, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import Logo from "../../assets/logo.png"
import { getToken } from "../../utils/helper"
import { Label, Input, FormFeedback, Button, Row, Col, } from "reactstrap";
import { isRequired, validateEmail } from "../../utils/validators";
import "./signup.scss"
import ReCAPTCHA from "react-google-recaptcha";
import axios from '../../axios'
import { ToastContainer, toast } from 'react-toastify';
import logo1 from "../../assets/header_logo1.png"
import PermissionContext from "../../store/permissionContext"

function SignUp() {
    let token = getToken()
    const navigate = useNavigate();
    const ctx = useContext(PermissionContext);
    let isSignupAllowed = ctx?.permissions?.allow_signup || false
    let enable_captha = ctx?.permissions?.enable_captha || false

    const [err, setErr] = useState({});
    const [loader, setLoader] = useState(false);
    const [signUpDetails, setSignUpDetails] = useState({
        username: "",
        first_name: "",
        last_name: "",
        designation: "",
        user_scope: "TEACHER",
        department: "",
        phone_number: "",
        email: "",
        password: "",
        password2: ""
    });
    const [captchaChecked, setCapcthaChecked] = useState(false)
    const [captchaErr, setCapcthaErr] = useState('')
    const [departmentList, setDepartmentList] = useState([])

    useEffect(() => {
        if (token) {
            navigate('/')
        }
        getDepartmentList()
    }, []);

    const getDepartmentList = () => {
        axios.get("/programs/department/list").then((response) => {
            setDepartmentList(response?.data?.data);
        });
    };

    const handleChange = (event) => {
        setSignUpDetails({
            ...signUpDetails,
            [event.target.name]: event.target.value,
        });
        if (['password', 'password2'].includes(event.target.name)) {
            setErr({ ...err, password: '', password2: '' })
        } else {
            setErr({ ...err, [event.target.name]: '' })
        }
    };

    const signupFormSubmit = (event) => {
        event.preventDefault();
        let isValid = validateForm()
        if (!captchaChecked && enable_captha) {
            setCapcthaErr('Verify Captcha')
        }
        if (!enable_captha) {
            if (isValid && captchaChecked) {
                registerUser()
            }
        } else {
            if (isValid) {
                registerUser()
            }
        }

    }

    const validateForm = () => {
        let obj = {
            username: isRequired(signUpDetails.username),
            first_name: isRequired(signUpDetails.first_name),
            last_name: isRequired(signUpDetails.last_name),
            designation: isRequired(signUpDetails.designation),
            user_scope: isRequired(signUpDetails.user_scope),
            department: isRequired(signUpDetails.phone_number),
            phone_number: isRequired(signUpDetails.phone_number),
            email: validateEmail(signUpDetails.email),
            password: isRequired(signUpDetails.password),
            password2: isRequired(signUpDetails.password2)
        }
        let check = Object.values(obj).some((val) => val !== '')
        if (check) {
            setErr(obj)
            return false
        }
        if (signUpDetails?.phone_number && signUpDetails.phone_number.length < 10) {
            setErr({ ...obj, phone_number: 'Invalid number' })
            return false
        }

        if (signUpDetails?.password && (/^(?=.*\d)(?=.*[!@#$%^&*])(?=.*[a-z])(?=.*[A-Z]).{8,}$/.test(signUpDetails.password)) === false) {
            let msg = 'password must contain at least eight characters, at least one number and both lower and uppercase letters and special characters'
            setErr({ ...obj, password: msg })
            return false
        }

        if (signUpDetails?.password && signUpDetails?.password2 && signUpDetails?.password !== signUpDetails?.password2) {
            setErr({
                ...obj,
                password: 'Password & Confirm password should be same',
                password2: 'Password & Confirm password should be same',
            })
            return false
        }
        setErr(err)
        return true


    }
    const registerUser = () => {
        setLoader(true)
        axios.post('/register', signUpDetails)
            .then(response => {
                toast.success('SignUp completed successfully', {
                    position: "top-right",
                    autoClose: 2000,
                    hideProgressBar: true,
                    closeOnClick: false,
                    pauseOnHover: false,
                    draggable: false,
                    progress: undefined,
                });
                setTimeout(() => {
                    navigate("/login");
                }, 2000)
            })
            .catch(error => {
                setLoader(false)
                let msgData = error?.response?.data?.data || {}
                setErr(msgData)
            })
    }

    const captchaChange = () => {
        setCapcthaChecked(true)
        setCapcthaErr('')
    }

    return (
        <div className="signup-container">
            <div className="signup-right">
                <div>
                    <img
                        src={Logo}
                        className='logo'
                        alt=""
                    />
                </div>
            </div>
            <div className="signup-left">
                <div className="signup-form">
                    <img src={logo1} className="naac-head" height='55px' width='50px' alt="logo" />
                    <div className="head"><h4>Sign Up</h4></div>
                    {
                        isSignupAllowed ?
                            <form onSubmit={signupFormSubmit}>
                                <Row>
                                    <Col xs='12' sm='6' className="mt-1">
                                        <Label>
                                            User Name
                                        </Label>
                                        <Input
                                            type="text"
                                            value={signUpDetails.username}
                                            name="username"
                                            onChange={handleChange}
                                            id="username"
                                            invalid={err?.username}
                                        />
                                        <FormFeedback>{err?.username}</FormFeedback>
                                    </Col>

                                    <Col xs='12' sm='6' className="mt-1">
                                        <Label>
                                            First Name
                                        </Label>
                                        <Input
                                            type="text"
                                            value={signUpDetails.first_name}
                                            name="first_name"
                                            onChange={handleChange}
                                            id="first_name"
                                            invalid={err?.first_name}
                                        />
                                        <FormFeedback>{err?.first_name}</FormFeedback>
                                    </Col>

                                    <Col xs='12' sm='6' className="mt-1">
                                        <Label>
                                            Last Name
                                        </Label>
                                        <Input
                                            type="text"
                                            value={signUpDetails.last_name}
                                            name="last_name"
                                            onChange={handleChange}
                                            id="last_name"
                                            invalid={err?.last_name}
                                        />
                                        <FormFeedback>{err?.last_name}</FormFeedback>
                                    </Col>

                                    <Col xs='12' sm='6' className="mt-1">
                                        <Label>
                                            Email
                                        </Label>
                                        <Input
                                            type="email"
                                            value={signUpDetails.email}
                                            name="email"
                                            onChange={handleChange}
                                            id="email"
                                            invalid={err?.email}
                                        />
                                        <FormFeedback>{err?.email}</FormFeedback>
                                    </Col>

                                    <Col xs='12' sm='6' className="mt-1">
                                        <Label>
                                            Phone No.
                                        </Label>
                                        <Input
                                            type="number"
                                            value={signUpDetails.phone_number}
                                            name="phone_number"
                                            onChange={handleChange}
                                            id="phone_number"
                                            invalid={err?.phone_number}
                                        />
                                        <FormFeedback>{err?.phone_number}</FormFeedback>
                                    </Col>

                                    <Col xs='12' sm='6' className="mt-1">
                                        <Label>
                                            Designation
                                        </Label>
                                        <Input
                                            type="select"
                                            value={signUpDetails.designation}
                                            name="designation"
                                            onChange={handleChange}
                                            id="designation"
                                            invalid={err?.designation}
                                        >
                                            <option value="">Select</option>
                                            <option value="PRINCIPAL"> Principal</option>
                                            <option value="AST_PROFESSOR"> Assistant Professor</option>
                                            <option value="ACT_PROFESSOR"> Associate Professor</option>
                                            <option value="TECH_STAFF"> Technical Staff</option>
                                            <option value="ADMIN_STAFF"> Administrative Staff</option>
                                            <option value="HOD"> HOD</option>
                                        </Input>
                                        <FormFeedback>{err?.designation}</FormFeedback>
                                    </Col>

                                    <Col xs='12' sm='6' className="mt-1">
                                        <Label>
                                            Department
                                        </Label>
                                        <Input
                                            type="select"
                                            value={signUpDetails.department}
                                            name="department"
                                            onChange={handleChange}
                                            id="department"
                                            invalid={err?.department}
                                        >
                                            <option value="">Select</option>
                                            {departmentList.map((department, ky) => (
                                                <option key={ky} value={department.id}>{department.name}</option>
                                            ))}
                                        </Input>
                                        <FormFeedback>{err?.department}</FormFeedback>
                                    </Col>

                                    <Col xs='12' sm='6' className="mt-1">
                                        <Label>
                                            Password
                                        </Label>
                                        <Input
                                            type="password"
                                            value={signUpDetails.password}
                                            name="password"
                                            onChange={handleChange}
                                            id="password"
                                            invalid={err?.password}
                                        />
                                        <FormFeedback>{err?.password}</FormFeedback>
                                    </Col>

                                    <Col xs='12' sm='6' className="mt-1">
                                        <Label>
                                            Confirm Password
                                        </Label>
                                        <Input
                                            type="password"
                                            value={signUpDetails.password2}
                                            name="password2"
                                            onChange={handleChange}
                                            id="password2"
                                            invalid={err?.password2}
                                        />
                                        <FormFeedback>{err?.password2}</FormFeedback>
                                    </Col>

                                    {
                                        enable_captha ?
                                            <Col xs='12' sm='6' className="mt-2">
                                                <ReCAPTCHA
                                                    sitekey={process.env.REACT_APP_RECAPTCHA_SITE_KEY}
                                                    onChange={captchaChange}
                                                />
                                                {captchaErr && <span style={{ fontSize: '12px' }} className="text-danger">{captchaErr}</span>}
                                            </Col>
                                            : ''
                                    }


                                    <Col xs='12' className="mt-3">
                                        <Button
                                            type='submit'
                                            color="primary"
                                            className="signup-btn"
                                            disabled={loader}
                                        >
                                            Submit
                                        </Button>
                                    </Col>

                                    <Col xs='12' className="mt-1">
                                        <span className='text-sm'>By signup, you will agree to the <Link to='/terms-conditions/TOS' style={{ color: "blue" }}> Terms & Conditions </Link></span>
                                    </Col>
                                    <Col xs='12' className="mt-1">
                                        <span className='text-sm'>Already have an account?<Link to='/login' style={{ color: "blue" }}> Login </Link></span>
                                    </Col>
                                </Row>
                            </form>
                            :
                            'No Permission!'
                    }

                </div>
            </div>
            <ToastContainer />
        </div>
    )
}

export default SignUp