import React, { useState, useEffect } from 'react'
import axios from '../../axios'
import { Row, Col, } from 'reactstrap';
import './about.scss'
import Loader from '../../components/loader';

function About() {

    const [aboutData, setAboutData] = useState([])
    const [loader, setLoader] = useState(false);

    useEffect(() => {
        setLoader(true)
        getAboutUS()
    }, [])

    const getAboutUS = async () => {
        await axios.get('/adminapp/settings/list')
            .then((response) => {
                setAboutData(response?.data?.data);
            }).finally(() => setLoader(false))
    }

    const settingData = aboutData?.[0] || ''
    if (loader) {
        return <Loader title={'About Us'}/>
    }
    return (
        <Row>
            <div class="pagetitle">
                <h1>About Us</h1>
                <nav>
                    <ol class="breadcrumb">
                        <li class="breadcrumb-item">Others</li>
                        <li class="breadcrumb-item active">About Us</li>
                    </ol>
                </nav>
            </div>
            {
                !settingData &&
                <Col xs='12' className='d-flex justify-content-center'>
                    <h5>No Data Available</h5>
                </Col>
            }

            <Col xs='12'>
                {
                    settingData && (
                        <div className='about-us'>
                            <h1 className='title'> {settingData?.title} </h1>
                            <p> Admin Email : {settingData?.admin_email} </p>
                            <p> Admin Contact : {settingData?.admin_phone} </p>
                            <p> Admin URL : {settingData?.admin_url} </p>
                            <p> Admin Address : {settingData?.admin_address} </p>

                        </div>
                    )
                }
            </Col>

            {
                settingData && (
                    <Col xs='12' className='mt-4'>
                        <h1 className='summ-head'> Quick Summary</h1>
                        <p> <span><i>About Institution :</i></span> {settingData?.description}</p>
                    </Col>
                )
            }
        </Row>
    )
}

export default About