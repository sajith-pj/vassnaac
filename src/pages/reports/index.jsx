import React, { useEffect, useState } from 'react'
import Loader from '../../components/loader';
import { ModalBody, ModalFooter, Button, Input, Label, Row, Col, FormGroup, FormFeedback } from 'reactstrap'
import axios from '../../axios'
import './reports.scss'
import ModalCom from '../../components/modal'
import { toast } from 'react-toastify';
import * as FileSaver from "file-saver";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import dateFormat from 'dateformat';

const reportStatus = [
    "APPROVED",
    "PENDING",
    "REJECTED",
    "REVERTED",
    "OTHER",
    "VERIFIED",
    "DELETED",
];

function Reports() {

    const [loader, setLoader] = useState(true)
    const [loader1, setLoader1] = useState(false)
    const [loader2, setLoader2] = useState(false)
    const [criteriaList, setCriteriaList] = useState([])
    const [subCriterionList, setSubCriterionList] = useState([])
    const [selectedCriteria, setSelectedCriteria] = useState('1')
    const [selectedForReport, setSelectedForReport] = useState('')
    const [showModal, setShowModal] = useState(false)
    const [departmentList, setDepartmentList] = useState([]);
    const [programsList, setProgramsList] = useState([]);
    const [inputValues, setInputValues] = useState({});
    const [err, setErr] = useState(false);
    const [reportData, setReportData] = useState([]);

    useEffect(() => {
        if (criteriaList.length > 0) {
            let crite = criteriaList.filter(val => val.main_id === selectedCriteria)
            setSubCriterionList(crite?.[0]?.sub_criterion || [])
        }
    }, [selectedCriteria])

    useEffect(() => {
        axios.get('/criterion/active-list')
            .then(res => {
                let data = res?.data?.data || []
                setCriteriaList(data)
                setSubCriterionList(data?.[0]?.sub_criterion || [])
            }).finally(() => setLoader(false))
    }, [])

    const changeCriterion = (data) => {
        setSelectedCriteria(data?.main_id)
    }

    const getFeatures = () => {
        setLoader1(true)
        axios.get("/features").then((response) => {
            const { departments, programs } = response?.data?.data;
            setDepartmentList(departments);
            setProgramsList(programs);
        }).finally(() => setLoader1(false))
    };

    const generateReport = (val) => {
        setSelectedForReport(val.criterion_id)
        setShowModal(true)
        if (departmentList.length === 0 || programsList === 0) {
            getFeatures()
        }
    }

    const closeModal = () => {
        setSelectedForReport('')
        setInputValues({})
        setErr(false)
        setLoader2(false)
        setShowModal(false)
    }

    const handleChange = (e) => {
        setInputValues({ ...inputValues, [e.target.name]: e.target.value })
    }

    const submitReportGeneratin = () => {
        // debugger
        if (inputValues?.type) {
            setLoader2(true)
            axios.get("/criterion/reports", {
                    params: {
                        department: inputValues?.department,
                        program: inputValues?.program,
                        paper: inputValues?.paper,
                        status: inputValues?.status,
                        from_date: inputValues?.from_date,
                        to_date: inputValues?.to_date,
                        criteria: selectedForReport,
                    },
                })
                .then((response) => {
                    setLoader2(false);
                    if (response?.data?.data?.length > 0) {
                        setReportData(response?.data?.data);
                        let obj = {...inputValues,criteria:selectedForReport}
                        download(obj, response?.data?.data);
                    } else {
                        toast.warn('Oops, No data found', {
                            position: "top-right",
                            autoClose: 2000,
                        });
                        closeModal()
                    }
                    
                }).catch(() => {
                    toast.error('Oops, Something went wrong', {
                        position: "top-right",
                        autoClose: 2000,
                    });
                    setLoader2(false);
                    closeModal()
                })

        } else setErr(true)
    }

    const download = (reportDetails, data = []) => {
        var type = reportDetails?.type
        if (type === "excel" && data.length > 0) {
            downloadExcelCsv(data, "xlsx");
        }
        if (type === "csv" && data.length > 0) {
            downloadExcelCsv(data, "csv");
        }
        if (type === "pdfImageWithText" && data.length > 0) {
            crateImagePdf(data, type);
        }

        if (type === "pdfWithoutText" && data.length > 0) {
            crateImagePdf(data, type);
        }

        if (type === "pdfFullReport" && data.length > 0) {
            pdfFullReport(reportDetails);
        }

        if (type === "pdfImageOnly" && data.length > 0) {
            pdfFullReport(reportDetails, 'pdfImageOnly');
        }
    };

    const downloadExcelCsv = (apiData, bookType) => {
        let sheetData = [];

        apiData.forEach(({ id, department, program, paper, jdoc, data, logs, created_by, is_active, created_at, ...rest }) => {
            let obj={}
            if(Object.keys(jdoc).length > 0){
                for(let i in jdoc){
                    obj[jdoc[i][0]] = jdoc[i][1]
                }
            }
            sheetData.push({
                ID: id, Department: department?.name,
                Program: program?.name, Paper: paper?.name, ...obj, ...data, ...logs, User: created_by?.username, Active: is_active ? "OK" : "NO",
                Created: created_at ? dateFormat(created_at, "dS, mmmm yyyy") : "", ...rest
            });
        });
        const fileType =
            bookType === "csv"
                ? "text/csv"
                : "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8";
        const fileExtension = `.${bookType}`;
        const ws = XLSX.utils.json_to_sheet(sheetData);
        const wb = { Sheets: { data: ws }, SheetNames: ["data"] };
        const excelBuffer = XLSX.write(wb, { bookType: bookType, type: "array" });
        const data = new Blob([excelBuffer], { type: fileType });
        FileSaver.saveAs(
            data,
            selectedForReport,
            fileExtension
        ); // file name => criterion
    };

    const getImageUrls = (data) => {
        let images = [];
        data.forEach((report) => {
            for (let key in report) {
                if (
                    key === "file1" ||
                    key === "file2" ||
                    key === "file3" ||
                    key === "file4" ||
                    key === "file5"
                ) {
                    if (report[key] !== undefined && report[key] !== null) {
                        let { isImage, extension } = checkFileType(report[key]);
                        if (isImage) {
                            images.push(report[key]);
                        }
                    }
                }
            }
        });
        return images;
    };

    const checkFileType = (url = []) => {
        let extension = url.split("/").pop().split(".").pop();
        if (
            extension === "png" ||
            extension === "jpg" ||
            extension === "jpeg" ||
            extension === "svg"
        ) {
            return {
                isImage: true,
                extension: extension.toUpperCase(),
            };
        }
        return { isImage: false };
    };

    const crateImagePdf = async (reportData, type) => {
        let imageUrls = getImageUrls(reportData);
        let pdf;
        if (type === "pdfImageWithText") {
            pdf = await generatePdfWithText(imageUrls);
        }
        if (type === "pdfWithoutText") {
            pdf = await generatePdfWithoutText(imageUrls);
        }
        pdf.output(
            "save",
            `${selectedForReport}.pdf`
        );
    };

    const generatePdfWithText = async (imageUrls) => {
        const doc = new jsPDF("p", "mm", "a4");
        var widthmm = doc.internal.pageSize.getWidth();
        var heightmm = doc.internal.pageSize.getHeight();
        var pixcel = 3.7795275591
        var width = widthmm * pixcel;
        var height = heightmm * pixcel;
        for (const [i, url] of imageUrls.entries()) {
            const image = await addImageProcess(url);
            if (image.width > width) {
                var widthRatio = width / image.width;
            } else { var widthRatio = 0 }

            if (image.height > height) {
                var heightRatio = height / image.height;
            } else { var heightRatio = 0 }

            if (widthRatio > heightRatio) {
                var ratio = widthRatio
            } else if (heightRatio > widthRatio) {
                var ratio = heightRatio
            } else { var ratio = 1 }

            var image_width = (image.width / pixcel) * ratio
            var image_height = (image.height / pixcel) * ratio

            doc.setFontSize(10)
            doc.text(8, 8, ` Criterion: ${selectedForReport}`);
            doc.text(width - 170, height - 30, `page ${i + 1} of ${imageUrls.length}`)

            doc.addImage(image, "png", 10, 12, image_width - (5 * pixcel), image_height - (5 * pixcel));
            if (i !== imageUrls.length - 1) {
                doc.addPage();
            }
        }
        return doc;
    }

    async function addImageProcess(src) {
        return new Promise((resolve, reject) => {
            let img = new Image();
            img.crossOrigin = "anonymous";
            img.src = src;
            img.onload = () => resolve(img);
            img.onerror = reject;
        });
    }

    async function generatePdfWithoutText(imageUrls) {
        const doc = new jsPDF("p", "mm", "a4");
        var widthmm = doc.internal.pageSize.getWidth();
        var heightmm = doc.internal.pageSize.getHeight();
        var pixcel = 3.7795275591
        var width = widthmm * pixcel;
        var height = heightmm * pixcel;
        for (const [i, url] of imageUrls.entries()) {
            const image = await addImageProcess(url);
            if (image.width > width) {
                var widthRatio = width / image.width;
            } else { var widthRatio = 0 }

            if (image.height > height) {
                var heightRatio = height / image.height;
            } else { var heightRatio = 0 }

            if (widthRatio > heightRatio) {
                var ratio = widthRatio
            } else if (heightRatio > widthRatio) {
                var ratio = heightRatio
            } else { var ratio = 1 }
            var image_width = (image.width / pixcel) * ratio
            var image_height = (image.height / pixcel) * ratio
            doc.addImage(image, "png", 10, 10, image_width - 5 * pixcel, image_height - 5 * pixcel);
            if (i !== imageUrls.length - 1) {
                doc.addPage();
            }
        }
        return doc;
    }

    const pdfFullReport = (reportDetails, pdfImageOnly = false) => {
        console.log('reportDetailsreportDetails',reportDetails)
        let { department = null} = reportDetails
        if (pdfImageOnly) {
            window.open(`/pdf-image-report?criteria=${reportDetails?.criteria}&department=${department}&program${reportDetails?.program}&status${reportDetails?.status}&from_date${reportDetails?.from_date}&to_date${reportDetails?.to_date}&type${reportDetails?.type}`, '_blank');
        } else {
            window.open(`/html-reports?criteria=${reportDetails?.criteria}&department=${department}&program${reportDetails?.program}&status${reportDetails?.status}&from_date${reportDetails?.from_date}&to_date${reportDetails?.to_date}&type${reportDetails?.type}`, '_blank');
        }
    }

    if (loader) return <Loader title={'Reports'} />
    return (
        <Row className='reports'>
            <Col xs='12'>
                <div class="pagetitle">
                    <h1>Reports</h1>
                </div>
            </Col>

            <Col xs='12' className='mt-2'>
                <div className='criterion'>
                    {
                        criteriaList.length > 0 ? criteriaList.map((val, k) => {
                            return (
                                <button
                                    className={`criterion-btn ${selectedCriteria === val.main_id ? 'active' : ''}`}
                                    key={k}
                                    onClick={() => changeCriterion(val)}
                                >
                                    Criteria {val.main_id}
                                </button>
                            )
                        })
                            :
                            ''
                    }
                </div>

                <div className='criterion-mobile'>
                    <Label>Selected Criterion</Label>
                    <Input className='criterion-select' type='select' onChange={(e) => setSelectedCriteria(e.target.value)} name='club' value={selectedCriteria}>
                        {
                            criteriaList.length > 0 ? criteriaList.map((val, ky) => {
                                return (
                                    <option key={ky} value={val.main_id}>Criteria {val.main_id}</option>
                                )
                            }) : ''
                        }
                    </Input>
                </div>
            </Col>

            {
                subCriterionList.length > 0 ?
                    <>
                        <Col xs='12' className='mt-1'>
                            <table className='naac-table'>
                                <tbody className='blue-rows'>
                                    {
                                        subCriterionList.map((val, ky) => {
                                            return (
                                                <tr key={ky}>
                                                    <td> {val.criterion} </td>
                                                    <td style={{ whiteSpace: "unset" }}> {val.question} </td>
                                                    <td>
                                                        <Button size='sm' outline color='primary' onClick={() => generateReport(val)} >Generate</Button>
                                                    </td>
                                                </tr>
                                            )
                                        })
                                    }
                                </tbody>
                            </table>
                        </Col>
                    </>
                    :
                    ''
            }

            {
                showModal && (
                    <ModalCom open={showModal} title={'Generate Report'} toggle={closeModal}>
                        <ModalBody>
                            <Row>
                                <Col xs='12'>
                                    <h6 style={{ color: '#0a41ab' }}>Criteria {selectedForReport}</h6>
                                </Col>
                                {
                                    loader1 ?
                                        <Col xs='12'><Loader /></Col>
                                        :
                                        <>
                                            <Col xs='12'>
                                                <FormGroup>
                                                    <Label>Department</Label>
                                                    <Input type='select' name='department' value={inputValues.department} onChange={handleChange}>
                                                        <option value={''}>Select</option>
                                                        {departmentList.map((data, ky) => {
                                                            return data?.is_enabled ? (
                                                                <option key={ky} value={data.id}>{data.name}</option>
                                                            ) : ''
                                                        })}
                                                    </Input>
                                                </FormGroup>
                                            </Col>
                                            <Col xs='12'>
                                                <FormGroup>
                                                    <Label>Program</Label>
                                                    <Input type='select' name='program' value={inputValues.program} onChange={handleChange}>
                                                        <option value={''}>Select</option>
                                                        {programsList.map((program, ky) => {
                                                            return program.is_enabled &&
                                                                program?.department == inputValues?.department ? (
                                                                <option key={ky} value={program.id}> {program.name} </option>
                                                            ) : ''
                                                        })}
                                                    </Input>
                                                </FormGroup>
                                            </Col>
                                            <Col xs='12'>
                                                <FormGroup>
                                                    <Label>Status</Label>
                                                    <Input type='select' name='status' value={inputValues.status} onChange={handleChange}>
                                                        <option value={''}>Select</option>
                                                        {reportStatus.map((status) => (
                                                            <option value={status}>{status}</option>
                                                        ))}
                                                    </Input>
                                                </FormGroup>
                                            </Col>
                                            <Col xs='12' sm='6'>
                                                <FormGroup>
                                                    <Label>From Date</Label>
                                                    <Input type='date' name='from_date' value={inputValues.from_date} onChange={handleChange} />
                                                </FormGroup>
                                            </Col>
                                            <Col xs='12' sm='6'>
                                                <FormGroup>
                                                    <Label>To Date</Label>
                                                    <Input type='date' name='to_date' value={inputValues.to_date} onChange={handleChange} />
                                                </FormGroup>
                                            </Col>
                                            <Col xs='12'>
                                                <FormGroup>
                                                    <Label>Type</Label>
                                                    <Input type='select' name='type' value={inputValues.type} onChange={handleChange} invalid={err}>
                                                        <option value={''}>Select</option>
                                                        <option value="csv">CSV Data Report</option>
                                                        <option value="excel">Excel Data Report</option>
                                                        <option value="pdfFullReport">PDF - Full Report with Media </option>
                                                        <option value="pdfImageOnly">PDF - Images Only Report </option>
                                                    </Input>
                                                    <FormFeedback>{err ? 'Required' : ''}</FormFeedback>
                                                </FormGroup>
                                            </Col>
                                        </>
                                }
                            </Row>
                        </ModalBody>
                        <ModalFooter>
                            <Button size='sm' disabled={loader2} outline onClick={closeModal}>Close</Button>
                            <Button size='sm' color='success' disabled={loader2} onClick={submitReportGeneratin}>{loader2 ? 'loading..' : 'Create'}</Button>
                        </ModalFooter>
                    </ModalCom>
                )
            }
        </Row>
    )
}

export default Reports