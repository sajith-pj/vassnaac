import React, { useRef, useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "../../axios";
import { getToken } from "../../utils/helper"
import { FormGroup, Label, Input, FormFeedback, Button } from "reactstrap";
import { isRequired } from "../../utils/validators";
import "./login.scss"
import Logo from "../../assets/logo.png"
import { ToastContainer, toast } from 'react-toastify';
import logo1 from "../../assets/header_logo1.png"

const Login = () => {
  let token = getToken()

  const navigate = useNavigate();
  const usernameInput = useRef();
  const passswordInput = useRef();
  const [loginDetails, setLoginDetails] = useState({
    username: "",
    password: "",
  });
  const [err, setErr] = useState({});
  const [loader, setLoader] = useState(false);

  useEffect(() => {
    if (token) {
      navigate('/')
    }
  }, []);

  const handleChange = (event) => {
    setLoginDetails({
      ...loginDetails,
      [event.target.name]: event.target.value,
    });
    setErr({ ...err, [event.target.name]: '' })
  };

  const validateForm = () => {
    let obj = {
      username: isRequired(loginDetails.username),
      password: isRequired(loginDetails.password),
    }

    if (obj.username || obj.password) {
      setErr(obj)
      return false
    } else {
      setErr({})
      return true
    }
  };

  const loginFormSubmit = (event) => {
    event.preventDefault();
    let isValid = validateForm();
    if (isValid) {
      setLoader(true);
      axios
        .post("/token", { ...loginDetails })
        .then((response) => {
          if (response?.data?.access) {
            localStorage.setItem(
              "accessToken",
              "Bearer " + response.data.access
            );
            localStorage.setItem(
              "refresToken",
              "Bearer " + response.data.refresh
            );
            navigate("/", { replace: true });
          }
        })
        .catch((err) => {
          toast.error('Invalid credentials', {
            position: "top-right",
            autoClose: 2000,
            hideProgressBar: true,
            closeOnClick: false,
            pauseOnHover: false,
            draggable: false,
            progress: undefined,
          });
          setLoader(false);
        });
    }
  };

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
          <img src={logo1} className="naac-head" height='55px' width='50px' alt="logo" />
          {/* <h1 className="naac-head">NAAC</h1> */}
          <div className="head"><h4>Login</h4></div>
          <form onSubmit={loginFormSubmit}>
            <FormGroup >
              <Label>
                User Name
              </Label>
              <Input
                type="text"
                ref={usernameInput}
                value={loginDetails.username}
                name="username"
                onChange={handleChange}
                id="username"
                invalid={err?.username}
              />
              <FormFeedback>{err?.username}</FormFeedback>
            </FormGroup>
            <FormGroup >
              <Label>
                Password
              </Label>
              <Input
                type="password"
                ref={passswordInput}
                value={loginDetails.password}
                name="password"
                onChange={handleChange}
                id="password"
                invalid={err?.password}
              />
              <FormFeedback>{err?.password}</FormFeedback>
            </FormGroup>

            <Link
              to="/password-reset"
              className="forgot"
            >
              Forgot Password ?
            </Link>
            <div className="mt-3">
              <Button
                type='submit'
                color="primary"
                className="login-btn"
                disabled={loader}
              >
                {loader ? "Loading..." : "Login"}
              </Button>
            </div>

            <p className="mt-1">
              Don't have an account yet?{' '}
              <Link to="/sign-up" style={{ color: "blue" }}>
                Sign Up
              </Link>
            </p>
          </form>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
};
export default Login
