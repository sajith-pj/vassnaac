import React, { useEffect, useState } from 'react'
import { Link, useParams, useNavigate, useOutletContext } from 'react-router-dom'
import { Row, Col, Card, CardHeader, CardBody, Input, Label, CardFooter, Button, FormFeedback, Table } from 'reactstrap';
import axios from '../../axios'
import './criterion.scss'
import { isRequired } from "../../utils/validators";
import ClubModal from './clubModal'
import NewFiledModal from './newFieldModal';
import NewFileModal from './newFileModal';
import { toast } from 'react-toastify';
import DeleteIcon from '@material-ui/icons/Delete';

function UpdateCriterion() {
    const { id = '' } = useParams()
    const navigate = useNavigate()
    let userDetails = useOutletContext()

    const [submitting, setSubmitting] = useState(false)
    const [clubs, setClubs] = useState([]);
    const [criterionDetails, setCriterionDetails] = useState({
        criterion: "",
        criterion_id: "",
        main_id: '',
        sub_id: '',
        final_id: '',
        main_title: "",
        sub_title: "",
        question: "",
        desc: "",
        keywords: "",
        status: true,
        is_active: true,
        is_enabled: true,
        naac_enabled: false,
        iqac_enabled: false,
        dept_enabled: false,
        teacher_enabled: false,
        club_enabled: false,
        static_fields: [
            {
                name: "date",
                type: "date",
                hint: "Choose any date if you don't know exactly",
                minimum: "null",
                maximum: "null",
            },
            {
                name: "Additional Files",
                type: "file",
                hint: "Maximum file size is 48 MB",
                minimum: "null",
                maximum: "null",
            },
            {
                name: "Additional Links",
                type: "url",
                hint: "Outside Resource URL",
                minimum: "null",
                maximum: "null",
            },
        ],
        extra_fields: [],
        user: userDetails?.id
    });
    const [major, setMajor] = useState([])
    const [sub, setSub] = useState([])
    const [final, setFinal] = useState([])
    const [optFields, setOptFields] = useState({ department: false, program: false, paper: false, batch: false })
    const [err, setErr] = useState({
        main_id: '',
        sub_id: '',
        final_id: '',
        main_title: '',
        sub_title: '',
        question: ''
    })
    const [selectedClubs, setSelectedClubs] = useState([])
    const [showClubModal, setShowClubModal] = useState(false)
    const [showFieldModal, setShowFieldModal] = useState(false)
    const [showFileModal, setShowFiledModal] = useState(false)
    const [extraNormalFields, setExtraNormalFields] = useState([])
    const [extraFileFields, setExtraFileFields] = useState([])

    useEffect(() => {
        getEnalbledClubs();
        populateMajorData()

    }, []);

    useEffect(() => {
        if (criterionDetails?.main_id) {
            let arr = []
            for (let i = 1; i <= 20; i++) {
                let obj = {}
                obj.value = `${criterionDetails?.main_id}.${i}`
                obj.id = i
                arr.push(obj)
            }
            setSub(arr)
        } else {
            setCriterionDetails({ ...criterionDetails, main_id: '' })
        }
    }, [criterionDetails?.main_id])

    useEffect(() => {
        if (criterionDetails?.sub_id && criterionDetails?.main_id) {
            let arr = []
            for (let i = 1; i <= 50; i++) {
                let obj = {}
                obj.value = `${criterionDetails?.main_id}.${criterionDetails?.sub_id}.${i}`
                obj.id = i
                arr.push(obj)
            }
            setFinal(arr)
        }
    }, [criterionDetails?.sub_id,criterionDetails?.main_id])

    const populateMajorData = () => {
        let arr = []
        for (let i = 1; i <= 10; i++) {
            let obj = {}
            obj.value = i
            obj.id = i
            arr.push(obj)
        }
        setMajor(arr)
    }

    const getEnalbledClubs = () => {
        axios.get("/programs/clubs/list").then((res) => {
            setClubs(res?.data?.data || []);
        });
    };

    const handleChange = (e) => {
        const { name, value, checked } = e.target
        if (['status', 'club_enabled', 'teacher_enabled', 'dept_enabled', 'iqac_enabled', 'naac_enabled'].includes(name)) {
            setCriterionDetails({ ...criterionDetails, [name]: checked })
        } else {
            setCriterionDetails({ ...criterionDetails, [name]: value })
            setErr({ ...err, [name]: '' })
        }
    }

    const handleChangeOptional = (e) => {
        const { name, checked } = e.target
        setOptFields({ ...optFields, [name]: checked })
    }

    const submitCriterion = () => {
        let err = {
            main_id: isRequired(criterionDetails.main_id),
            sub_id: isRequired(criterionDetails.sub_id),
            final_id: isRequired(criterionDetails.final_id),
            main_title: isRequired(criterionDetails.main_title),
            sub_title: isRequired(criterionDetails.sub_title),
            question: isRequired(criterionDetails.question)
        }
        if (Object.values(err).some((val) => val !== '')) {
            setErr(err)
            window.scrollTo(0, 0)
            return
        }
        setSubmitting(true)
        let optionalFields = [
            {
                hint: "Select Your Department",
                maximum: "null",
                minimum: "null",
                name: "department",
                status: optFields.department,
                type: "select",
            },
            {
                hint: "Select Program",
                maximum: "null",
                minimum: "null",
                name: "program",
                status: optFields.program,
                type: "select",
            },
            {
                hint: "Select Subject",
                maximum: "null",
                minimum: "null",
                name: "paper",
                status: optFields.paper,
                type: "select",
            },
            {
                hint: "Select Batch",
                maximum: "null",
                minimum: "null",
                name: "batch",
                status: optFields.batch,
                type: "select",
            },
        ]
        let c_id = `c${criterionDetails?.main_id}_${criterionDetails?.sub_id}_${criterionDetails?.final_id}`
        let crit = `${criterionDetails?.main_id}.${criterionDetails?.sub_id}.${criterionDetails?.final_id}`
        let data = { ...criterionDetails, optional_fields: optionalFields,criterion_id: c_id, criterion: crit, clubs: selectedClubs, index_no: `${criterionDetails.main_id}${criterionDetails.sub_id}.${criterionDetails.final_id}` }
        data.extra_fields = [...extraNormalFields, ...extraFileFields]
        if (id) {

        } else {
            axios
                .post("/criterion/details/list", data)
                .then((res) => {
                    toast.success('Criterion added successfully', {
                        position: "top-right",
                        autoClose: 2000,
                    });
                    resetDatas()
                })
                .catch((err) => {
                    let msg = err?.response?.data?.message?.criterion?.[0] || 'Oops, Something went wrong!!'
                    toast.error(msg, {
                        position: "top-right",
                        autoClose: 2000,
                    });
                })
                .finally(() => setSubmitting(false))
        }

    }

    const handleChangeClub = (id) => {
        let arr = [...selectedClubs]
        if (arr.includes(id)) {
            arr = arr.filter((val) => val !== id)
            setSelectedClubs(arr)
        }
        else {
            arr.push(id)
            setSelectedClubs(arr)
        }
    }

    const resetDatas = () => {
        setSelectedClubs([])
        setOptFields({ department: false, program: false, paper: false, batch: false })
        setCriterionDetails({
            criterion: "",
            criterion_id: "",
            main_id: '',
            sub_id: '',
            final_id: '',
            main_title: "",
            sub_title: "",
            question: "",
            desc: "",
            keywords: "",
            status: true,
            is_active: true,
            is_enabled: true,
            naac_enabled: false,
            iqac_enabled: false,
            dept_enabled: false,
            teacher_enabled: false,
            club_enabled: false,
            enabledClubs: [],
            static_fields: [
                {
                    name: "date",
                    type: "date",
                    hint: "Choose any date if you don't know exactly",
                    minimum: "null",
                    maximum: "null",
                },
                {
                    name: "Additional Files",
                    type: "file",
                    hint: "Maximum file size is 48 MB",
                    minimum: "null",
                    maximum: "null",
                },
                {
                    name: "Additional Links",
                    type: "url",
                    hint: "Outside Resource URL",
                    minimum: "null",
                    maximum: "null",
                },
            ],
            extra_fields: [],
            user: userDetails?.id
        });
        setSub([])
        setFinal([])
        setExtraNormalFields([])
        setExtraFileFields([])
    }

    const openNewFieldModal = () => {
        setShowFieldModal(true)
    }

    const recieveNewField = (data) => {
        let arr = [...extraNormalFields, data]
        setExtraNormalFields(arr)
    }

    const recieveFileField = (data) => {
        setExtraFileFields([...extraFileFields, ...data])
    }

    const openNewFileModal = () => {
        if (extraFileFields.length === 4) {
            toast.warning('Maximum file fields are added', {
                position: "top-right",
                autoClose: 2000,
            });
            return
        }
        setShowFiledModal(true)
    }

    const deleteField = (name, id) => {
        if (['file2', 'file3', 'file4', 'file5'].includes(name)) {
            let arr = [...extraFileFields]
            setExtraFileFields(arr.filter((val) => val.name_id !== id))
        } else {
            let arr = [...extraNormalFields]
            setExtraNormalFields(arr.filter((val) => val.name_id !== id))
        }
    }

    return (
        <Row>
            <div class="pagetitle">
                {id ? <h1>Update Criterion</h1> : <h1>Add Criterion</h1>}
                <nav>
                    <ol class="breadcrumb">
                        <li class="breadcrumb-item">Admin Tools</li>
                        <li class="breadcrumb-item"><Link to='/criterion-settings'>Criterions</Link></li>
                        <li class="breadcrumb-item active">{id ? 'Update Criterion' : ' Add Criterion'}</li>
                    </ol>
                </nav>
            </div>

            <Col xs='12'>
                <Card>
                    <CardHeader>Add New Criterion</CardHeader>
                    <CardBody>
                        <Row>
                            <Col xs='12' sm='3' className='mt-2'>
                                <Label>Major</Label>
                                <Input onChange={handleChange} invalid={!!err?.main_id} type='select' name='main_id' value={criterionDetails?.main_id}>
                                    <option value={''}>Select</option>
                                    {
                                        major.length > 0 ? major.map((val, k) => {
                                            return <option key={k} value={val.id}>{val.value}</option>
                                        }) : ''
                                    }
                                </Input>
                                <FormFeedback>{err?.main_id}</FormFeedback>
                            </Col>
                            <Col xs='12' sm='3' className='mt-2'>
                                <Label>Sub</Label>
                                <Input type='select' invalid={!!err?.sub_id} onChange={handleChange} name='sub_id' value={criterionDetails?.sub_id}>
                                    <option value={''}>Select</option>
                                    {
                                        sub.length > 0 ? sub.map((val, k) => {
                                            return <option key={k} value={val.id}>{val.value}</option>
                                        }) : ''
                                    }
                                </Input>
                                <FormFeedback>{err?.sub_id}</FormFeedback>
                            </Col>
                            <Col xs='12' sm='3' className='mt-2'>
                                <Label>Final</Label>
                                <Input type='select' invalid={!!err?.final_id} name='final_id' onChange={handleChange} value={criterionDetails?.final_id}>
                                    <option value={''}>Select</option>
                                    {
                                        final.length > 0 ? final.map((val, k) => {
                                            return <option key={k} value={val.id}>{val.value}</option>
                                        }) : ''
                                    }
                                </Input>
                                <FormFeedback>{err?.final_id}</FormFeedback>
                            </Col>

                            <Col xs='12' sm='3' className='mt-2'>
                                <Label style={{ visibility: 'hidden' }}>Final</Label>
                                <Input type='text' disabled name='major' value={`C ${criterionDetails?.main_id}.${criterionDetails?.sub_id}.${criterionDetails?.final_id}`} />
                            </Col>

                            <Col xs='12' sm='6' className='mt-2'>
                                <Label>Main title</Label>
                                <Input type='text' invalid={!!err?.main_title} name='main_title' value={criterionDetails?.main_title} onChange={handleChange} />
                                <FormFeedback>{err?.main_title}</FormFeedback>
                            </Col>

                            <Col xs='12' sm='6' className='mt-2'>
                                <Label>Sub title</Label>
                                <Input type='text' invalid={!!err?.sub_title} name='sub_title' value={criterionDetails?.sub_title} onChange={handleChange} />
                                <FormFeedback>{err?.sub_title}</FormFeedback>
                            </Col>
                            <Col xs='12' sm='6' className='mt-2'>
                                <Label>Question</Label>
                                <Input type='text' invalid={!!err?.question} name='question' value={criterionDetails?.question} onChange={handleChange} />
                                <FormFeedback>{err?.question}</FormFeedback>
                            </Col>

                            <Col xs='12' sm='6' className='mt-2'>
                                <Label>Key word for search</Label>
                                <Input type='text' name='keywords' value={criterionDetails?.keywords} onChange={handleChange} />
                            </Col>

                            <Col xs='12' className='mt-2'>
                                <Label>Description</Label>
                                <Input type='textarea' rows='3' name='desc' value={criterionDetails?.desc} onChange={handleChange} />
                            </Col>

                            <Col xs='12' className='mt-2'>
                                <Input type='checkbox' name='status' checked={criterionDetails.status} onChange={handleChange} />
                                {'  '}
                                <Label className=''>Status (check to enable this criterion status)</Label>
                            </Col>

                            <div className='enable-for mt-2 mb-2'>
                                <Row>
                                    <Col xs='12'>
                                        <span className='enable-for-head'>Enable for</span>
                                    </Col>
                                    <hr />
                                    <Col xs='12' sm='3' md='2' className='mt-2'>
                                        <Input type='checkbox' name='naac_enabled' checked={criterionDetails.naac_enabled} onChange={handleChange} />
                                        {'  '}
                                        <Label className=''>NAAC</Label>
                                    </Col>
                                    <Col xs='12' sm='3' md='2' className='mt-2'>
                                        <Input type='checkbox' name='iqac_enabled' checked={criterionDetails.iqac_enabled} onChange={handleChange} />
                                        {'  '}
                                        <Label className=''>IQAC</Label>
                                    </Col>
                                    <Col xs='12' sm='3' md='2' className='mt-2'>
                                        <Input type='checkbox' name='dept_enabled' checked={criterionDetails.dept_enabled} onChange={handleChange} />
                                        {'  '}
                                        <Label className=''>DEPT</Label>
                                    </Col>
                                    <Col xs='12' sm='3' md='2' className='mt-2'>
                                        <Input type='checkbox' name='teacher_enabled' checked={criterionDetails.teacher_enabled} onChange={handleChange} />
                                        {'  '}
                                        <Label className=''>TEACHER</Label>
                                    </Col>
                                    <Col xs='12' sm='3' md='2' className='mt-2'>
                                        <Input type='checkbox' name='club_enabled' checked={criterionDetails.club_enabled} onChange={handleChange} />
                                        {'  '}
                                        <Label className=''>CLUBS</Label>
                                    </Col>
                                </Row>
                            </div>

                            <div className='enable-for mt-2 mb-2'>
                                <Row>
                                    <Col xs='12'>
                                        <span className='enable-for-head'>Optional fields</span>
                                    </Col>
                                    <hr />
                                    <Col xs='12' sm='3' className='mt-2'>
                                        <Input type='checkbox' name='department' checked={optFields.department} onChange={handleChangeOptional} />
                                        {'  '}
                                        <Label className=''>Department</Label>
                                    </Col>
                                    <Col xs='12' sm='3' className='mt-2'>
                                        <Input type='checkbox' name='program' checked={optFields.program} onChange={handleChangeOptional} />
                                        {'  '}
                                        <Label className=''>Program</Label>
                                    </Col>
                                    <Col xs='12' sm='3' className='mt-2'>
                                        <Input type='checkbox' name='paper' checked={optFields.paper} onChange={handleChangeOptional} />
                                        {'  '}
                                        <Label className=''>Paper</Label>
                                    </Col>
                                    <Col xs='12' sm='3' className='mt-2'>
                                        <Input type='checkbox' name='batch' checked={optFields.batch} onChange={handleChangeOptional} />
                                        {'  '}
                                        <Label className=''>Batch</Label>
                                    </Col>
                                </Row>
                            </div>


                            <Col xs='12' sm='4' className='mt-2'>
                                <button className='crt-btn' onClick={() => setShowClubModal(true)}>+Enabled Clubs</button>
                            </Col>
                            <Col xs='12' sm='4' className='mt-2'>
                                <button className='crt-btn' onClick={() => { openNewFieldModal('new') }}>+Add New Field</button>
                            </Col>
                            <Col xs='12' sm='4' className='mt-2'>
                                <button className='crt-btn' onClick={() => { openNewFileModal('new') }}>+Add File Field</button>
                            </Col>
                            {
                                [...extraNormalFields, ...extraFileFields].length > 0 && (
                                    <Col xs='12' className='mt-2'>
                                        <Table>
                                            <thead>
                                                <tr>
                                                    <th>Name</th>
                                                    <th>Type</th>
                                                    <th>Hint</th>
                                                    <th>Order</th>
                                                    <th>Min</th>
                                                    <th>Max</th>
                                                    <th>Reomve</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {
                                                    [...extraNormalFields, ...extraFileFields].map((val, ky) => {
                                                        return (
                                                            <tr key={ky}>
                                                                <td>{val.file2 ||  val.file3 || val.file4 || val.file5 || val.name}</td>
                                                                <td>{val?.type || '-'}</td>
                                                                <td>{val?.hint || '-'}</td>
                                                                <td>{val?.field_order || '-'}</td>
                                                                <td>{val?.minimum || '-'}</td>
                                                                <td>{val?.maximum || '-'}</td>
                                                                <td>
                                                                    <DeleteIcon style={{ cursor: 'pointer' }} onClick={() => { deleteField(val.name, val.name_id) }} />
                                                                </td>
                                                            </tr>
                                                        )
                                                    })
                                                }
                                            </tbody>
                                        </Table>
                                    </Col>
                                )
                            }

                        </Row>
                    </CardBody>
                    <CardFooter className='d-flex justify-content-end'>
                        <Button disabled={submitting} onClick={() => navigate('/criterion-settings')} outline size='sm' style={{ marginRight: '5px' }}>Cancel</Button>
                        <Button disabled={submitting} color='success' onClick={submitCriterion} size='sm'>{id ? 'Update' : 'Create'}</Button>
                    </CardFooter>
                </Card>
            </Col>

            <ClubModal
                clubs={clubs}
                selectedClubs={selectedClubs}
                showClubModal={showClubModal}
                setShowClubModal={setShowClubModal}
                handleChangeClub={handleChangeClub}
            />

            <NewFiledModal
                showFieldModal={showFieldModal}
                setShowFieldModal={setShowFieldModal}
                recieveNewField={recieveNewField}
            />

            <NewFileModal
                showFileModal={showFileModal}
                setShowFiledModal={setShowFiledModal}
                recieveFileField={recieveFileField}
                extraFileFields={extraFileFields}
            />
        </Row>
    )
}

export default UpdateCriterion