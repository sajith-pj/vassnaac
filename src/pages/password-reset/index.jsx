import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import axios from "../../axios";
import { getToken } from "../../utils/helper"
import { FormGroup, Label, Input, FormFeedback, Button } from "reactstrap";
import { validateEmail, isRequired } from "../../utils/validators";
import Logo from "../../assets/logo.png"
import { ToastContainer, toast } from 'react-toastify';
import logo1 from "../../assets/header_logo1.png"

const ResetPassword = () => {
  let token = getToken()
  const search = useLocation().search;
  let newToken = new URLSearchParams(search).get("token");

  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [confimValues, setConfirmValues] = useState({
    code: '',
    password: '',
    confirmPassword: ''
  });
  const [err, setErr] = useState('');
  const [confirmErr, setConfirmErr] = useState({
    code: '',
    password: '',
    confirmPassword: ''
  });
  const [confirmPassword, setConfirmPassword] = useState(false)
  const [loader, setLoader] = useState(false);

  useEffect(() => {
    if (token) {
      navigate('/')
    }
  }, []);

  useEffect(() => {
    checkToken()
  }, [])

  const checkToken = () => {
    if (newToken !== undefined && newToken !== null && newToken) {
      setConfirmPassword(true)
      setConfirmValues({ ...confimValues, code: newToken })
    }
  }

  const handleChange = (e) => {
    setEmail(e.target.value)
    setErr('')
  };

  const handleChangeConfirm = (e) => {
    setConfirmValues({ ...confimValues, [e.target.name]: e.target.value })
    setConfirmErr({ ...confirmErr, [e.target.name]: '' })
  };

  const forgotPasswordSubmit = (event) => {
    event.preventDefault();
    let isValid = validateEmail(email)
    if (!isValid) {
      setLoader(true)
      axios.post(`/password_reset`, {
        email: email
      })
        .then((response) => {
          if (response.data) {
            setConfirmPassword(true)
            setLoader(false)
          }
        }).catch((error) => {
          setLoader(false)
          setErr("We couldn't find an account associated with that email. Please try a different e-mail address.")
        })
    }
    else {
      setErr("Enter a valid email")

    }

  }

  const validateForm = () => {
    let obj = {
      code: isRequired(confimValues.code),
      password: isRequired(confimValues.password),
      confirmPassword: isRequired(confimValues.confirmPassword)
    }
    if (obj.code || obj.password || obj.confirmPassword) {
      setConfirmErr(obj)
      return false
    }

    if (confimValues.password && confimValues.confirmPassword) {
      if (confimValues.password !== confimValues.confirmPassword) {
        setConfirmErr({
          code: '',
          password: 'Password and Confirm password are not matching',
          confirmPassword: 'Password and Confirm password are not matching'
        })
        return false
      }
    }
    setConfirmErr({})
    return true

  }
  const confirmPasswordSubmit = (e) => {
    e.preventDefault();
    const isValid = validateForm();
    if (isValid) {
      setLoader(true)
      axios
        .post(`/password_reset/confirm`, {
          token: confimValues.code,
          password: confimValues.password,
        })
        .then((response) => {
          if (response?.data) {
            toast.success('Password Updated Successfully', {
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
          }
        })
        .catch((error) => {
          setLoader(false)
          toast.error('Something went wrong, Please check Token Code and Password', {
            position: "top-right",
            autoClose: 3000,
            hideProgressBar: true,
            closeOnClick: true,
            pauseOnHover: false,
            draggable: false,
            progress: undefined,
          });
        });
    }
  }

  return (
    <div className="login-container">
      <div className="login-right">
        <div>
          <img
            src={Logo}
            className='logo'
            alt=""
          />
        </div>
      </div>
      <div className="login-left">
        <div className="login-form">
          <img src={logo1} style={{marginBottom:'25px'}} className="naac-head" height='55px' width='50px' alt="logo" />
          {/* <h1 className="naac-head">NAAC</h1> */}
          <div className="head"><h4>{confirmPassword ? 'Reset Password' : 'Forgot Password'}</h4></div>
          {
            confirmPassword &&
            <div className="head">
              <span class="text-secondary" style={{ fontSize: '13px' }}>**Enter the Password reset code recieved on email and set new password!</span>
            </div>
          }
          {
            confirmPassword ?
              <form onSubmit={confirmPasswordSubmit}>
                <FormGroup>
                  <Label>
                    Reset Code
                  </Label>
                  <Input
                    type="text"
                    value={confimValues.code}
                    name="code"
                    id="code"
                    onChange={handleChangeConfirm}
                    invalid={confirmErr.code}
                  />
                  <FormFeedback>{confirmErr.code}</FormFeedback>
                </FormGroup>
                <FormGroup>
                  <Label>
                    Password
                  </Label>
                  <Input
                    type="password"
                    value={confimValues.password}
                    name="password"
                    id="password"
                    onChange={handleChangeConfirm}
                    invalid={confirmErr.password}
                  />
                  <FormFeedback>{confirmErr.password}</FormFeedback>
                </FormGroup>
                <FormGroup>
                  <Label>
                    Confirm Password
                  </Label>
                  <Input
                    type="password"
                    value={confimValues.confirmPassword}
                    name="confirmPassword"
                    id="confirmPassword"
                    onChange={handleChangeConfirm}
                    invalid={confirmErr.confirmPassword}
                  />
                  <FormFeedback>{confirmErr.confirmPassword}</FormFeedback>
                </FormGroup>

                <div className="mt-3">
                  <Button
                    type='submit'
                    color="primary"
                    className="login-btn"
                    disabled={loader}
                  >
                    Change Password
                  </Button>
                </div>

                <p className="mt-1">
                  Back to {''}
                  <Link to="/login" style={{ color: "blue" }}>
                    Login
                  </Link>
                </p>
              </form>
              :
              <form onSubmit={forgotPasswordSubmit}>
                <FormGroup >
                  <Label>
                    Email
                  </Label>
                  <Input
                    type="email"
                    value={email}
                    name="email"
                    id="email"
                    onChange={handleChange}
                    invalid={err ? true : false}
                  />
                  <FormFeedback>{err}</FormFeedback>
                </FormGroup>

                <div className="mt-3">
                  <Button
                    type='submit'
                    color="primary"
                    className="login-btn"
                    disabled={loader}
                  >
                    Forgot Password
                  </Button>
                </div>

                <p className="mt-1">
                  Back to {''}
                  <Link to="/login" style={{ color: "blue" }}>
                    Login
                  </Link>
                </p>
              </form>
          }

        </div>
      </div>
      <ToastContainer />
    </div>
  );
};
export default ResetPassword
