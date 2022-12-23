import React, { Fragment, useEffect, useState } from 'react'
import { getToken } from "../../utils/helper"
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import axios from '../../axios'
import Header from '../header'
import SideBar from '../sidebar'
import { ToastContainer } from 'react-toastify';

function Layout() {
    const navigate = useNavigate()
    const location = useLocation()
    const [show, setShow] = useState(false)
    const [user, setUser] = useState({})
    let token = getToken()

    useEffect(() => {
        if (token) {
            axios.defaults.headers.common['Authorization'] = token
        }
        else {
            navigate('/login')
        }
    }, [])

    useEffect(() => {
        if (token) {
            axios.get('/user/profile')
                .then(response => {
                    setUser(response?.data?.data)
                    setShow(true)
                })
                .catch(err => {
                    setShow(true)
                })
        }
    }, [])

    useEffect(() => {
        if (
            location.pathname !== '/all-criterions' &&
            !location.pathname.includes('criterion/add-details') &&
            !location.pathname.includes('criterion/update-details') &&
            !location.pathname.includes('criterion/details/view')
        ) {
            localStorage.setItem('selected_criterion', '')
            localStorage.setItem('selected_sub_criterion', '')
        }
    }, [location.pathname])

    if (show && !user?.status) {
        return (
            <>
                <Header user={user} hide={true} />
                <div style={{ width: '100%', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <h3>Your Account Is Not Activated, Please Contact Your Admin!</h3>
                </div>
            </>
        )
    }
    return (
        <Fragment>
            {
                show && (
                    <>
                        <Header user={user} />
                        <SideBar user={user} />
                        <main id="main" class="main">
                            <section class="section dashboard">
                                <Outlet context={user} />
                            </section>
                            <ToastContainer />
                        </main>
                    </>
                )
            }

        </Fragment>
    )
}

export default Layout