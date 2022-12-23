import React, { useEffect, useState, useRef,} from "react";
import axios from '../../axios'
import { useSearchParams } from 'react-router-dom';
import Loader from '../../components/loader';
import ComponentToPrint from "./componentToPrint";
import ReactToPrint from 'react-to-print';
import { toast } from 'react-toastify';
import { Button, Row, Col, } from 'reactstrap'

const HtmlReports = () => {
    const [loader, setLoader] = useState(false)
    const [searchParams] = useSearchParams();
    const [reportData, setReportData] = useState([]);

    const params = {
        criteria: searchParams.get('criteria'),
        department: searchParams.get('department'),
        program: searchParams.get('program'),
        paper: searchParams.get('paper'),
        status: searchParams.get('status'),
        from_date: searchParams.get('from_date'),
        to_date: searchParams.get('to_date')
    }

    const getReportData = () => {
        axios
            .get("/criterion/reports", {
                params: params
            })
            .then((response) => {
                setLoader(false);
                if (response?.data?.data?.length > 0) {
                    setReportData(response?.data?.data);
                } else {
                    toast.warn('Oops, No data found', {
                        position: "top-right",
                        autoClose: 2000,
                    });
                }
            });
    };

    useEffect(() => {
        getReportData();
    }, []);

    const componentRef = useRef();

    if (loader) return <Loader />
    return (
        <Row>
            <Col xs='12'>
                <div class="pagetitle">
                    <h1>Criterion</h1>
                </div>
            </Col>
            {
                reportData.length > 0 ?
                    <Col xs='12'>
                        <ReactToPrint
                            trigger={() => <Button size="sm" type="button" color="primary"> Generate PDF</Button>}
                            content={() => componentRef.current}
                        />
                    </Col>
                    : ''
            }


            <Col xs='12' className="mt-3">
                <ComponentToPrint ref={componentRef} reportData={reportData} />
            </Col>

        </Row>
    )
}

export default HtmlReports