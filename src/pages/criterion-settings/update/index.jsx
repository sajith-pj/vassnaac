import React, { useEffect, useState } from 'react'
import { Link, useParams, useNavigate, useOutletContext } from 'react-router-dom'
import { Row, Col, Card, CardHeader, CardBody, Input, Label, CardFooter, Button, FormFeedback, Table } from 'reactstrap';
import axios from '../../../axios'
import Loader from '../../../components/loader';
import '../criterion.scss'
import { isRequired } from "../../../utils/validators";
import ClubModal from '../clubModal'
import NewFiledModal from '../newFieldModal';
import NewFileModal from '../newFileModal';
import { toast } from 'react-toastify';
import EditIcon from '@material-ui/icons/Edit';
import DeleteIcon from '@material-ui/icons/Delete';
import EditFileModal from './editFileModal'
import EditNormalFieldModal from './editNormalFieldModal';

function UpdateCriterion() {
    const { id } = useParams()
    const navigate = useNavigate()
    let userDetails = useOutletContext()

    const [loader, setLoader] = useState(true)
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
    const [showUpdateFileModal, setShowUpdateFileModal] = useState(false)
    const [selectedFile, setSelectedFile] = useState({})
    const [showUpdateNormalFieldModal, setShhowUpdateNormalFieldModal] = useState(false)
    const [selectedNormalField, setSelectedNormalField] = useState({})

    useEffect(() => {
        getEnalbledClubs();
        getSingleCriterion()
    }, []);

    const getSingleCriterion = () => {
        axios.get(`/criterion/details/list/${id}`).then((response) => {
            let data = response?.data?.data
            console.log('data', data)
            setSelectedClubs([...data?.clubs])
            let optFields = data?.optional_fields || []
            let extraFields = data?.extra_fields || []
            let extraFileFields = extraFields.filter((val) => val.type === 'file')
            extraFields = extraFields.filter((val => val.type !== 'file'))
            setExtraFileFields(extraFileFields)
            setExtraNormalFields(extraFields)
            let optObj = {}
            optFields.forEach((val) => {
                let name = val?.name
                optObj[name] = val.status
            })
            setOptFields({ ...optObj })
            setCriterionDetails({
                criterion: data?.criterion,
                criterion_id: data?.criterion_id,
                main_id: data?.criterion.split('.')[0],
                sub_id: `${data?.criterion.split('.')[0]}.${data?.criterion.split('.')[1]}`,
                final_id: data?.criterion,
                main_title: data?.main_title,
                sub_title: data?.sub_title,
                question: data?.question,
                desc: data?.desc,
                keywords: data?.keywords,
                status: data?.status,
                is_active: true,
                is_enabled: data?.is_enabled,
                naac_enabled: data?.naac_enabled,
                iqac_enabled: data?.iqac_enabled,
                dept_enabled: data?.dept_enabled,
                teacher_enabled: data?.teacher_enabled,
                club_enabled: data?.club_enabled,
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
            })
        }).finally(() => setLoader(false))
    };


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
        let data = { ...criterionDetails, optional_fields: optionalFields, clubs: selectedClubs, }
        let arrExtra = [...extraNormalFields]
        arrExtra.forEach((val) => {
            val.isFromEdit = undefined
        })
        let arrFileExtra = [...extraFileFields]
        arrFileExtra.forEach((val) => {
            val.isFromEdit = undefined
        })
        data.extra_fields = [...arrExtra, ...arrFileExtra]
        if (id) {
            axios
                .put("/criterion/details/list/" + id, data)
                .then((res) => {
                    toast.success('Criterion updated successfully', {
                        position: "top-right",
                        autoClose: 2000,
                    });
                    setTimeout(() => {
                        navigate('/criterion-settings')
                    }, 1500)
                })
                .catch((err) => {
                    let msg = err?.response?.data?.message?.criterion?.[0] || 'Oops, Something went wrong!!'
                    toast.error(msg, {
                        position: "top-right",
                        autoClose: 2000,
                    });
                    setSubmitting(false)
                })
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

    const editNormalField = (val) => {
        setSelectedNormalField(val)
        setShhowUpdateNormalFieldModal(true)
    }

    const editFileField = (val) => {
        setSelectedFile(val)
        setShowUpdateFileModal(true)
    }
    const closeUpdateFileModal = () => {
        setShowUpdateFileModal(false)
        setSelectedFile({})
    }
    const updateFileField = (data) => {
        let arr = [...extraFileFields]
        let i = arr.findIndex((val) => val.name_id === data.name_id)
        if (i !== -1) {
            arr[i] = data
            setExtraFileFields(arr)
            toast.success('File details changed', {
                position: "top-right",
                autoClose: 1000,
            });
            closeUpdateFileModal()
        }
    }

    const closeUpdateNormalFieldModal = () => {
        setShhowUpdateNormalFieldModal(false)
        setSelectedNormalField({})
    }

    const updateNormalField = (data) => {
        let arr = [...extraNormalFields]
        let i = arr.findIndex((val) => val.name_id === data.name_id)
        if (i !== -1) {
            arr[i] = data
            setExtraNormalFields(arr)
            toast.success('Field details changed', {
                position: "top-right",
                autoClose: 1000,
            });
            closeUpdateNormalFieldModal()
        }
    }

    if (loader) return <Loader title={'Criterion Settings'} />
    return (
        <Row>
            <div class="pagetitle">
                <h1>Update Criterion</h1>
                <nav>
                    <ol class="breadcrumb">
                        <li class="breadcrumb-item">Admin Tools</li>
                        <li class="breadcrumb-item"><Link to='/criterion-settings'>Criterions</Link></li>
                        <li class="breadcrumb-item active">Update Criterion</li>
                    </ol>
                </nav>
            </div>

            <Col xs='12'>
                <Card>
                    <CardHeader>Update Criterion</CardHeader>
                    <CardBody>
                        <Row>
                            <Col xs='12' sm='3' className='mt-2'>
                                <Label>Major</Label>
                                <Input type='text' name='main_id' value={criterionDetails?.main_id} disabled />
                            </Col>

                            <Col xs='12' sm='3' className='mt-2'>
                                <Label>Sub</Label>
                                <Input type='text' name='sub_id' value={criterionDetails?.sub_id} disabled />
                            </Col>

                            <Col xs='12' sm='3' className='mt-2'>
                                <Label>Final</Label>
                                <Input type='text' name='final_id' value={criterionDetails?.final_id} disabled />
                            </Col>

                            <Col xs='12' sm='3' className='mt-2'>
                                <Label style={{ visibility: 'hidden' }}>Final</Label>
                                <Input type='text' disabled name='major' value={`C ${criterionDetails?.final_id}`} />
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
                                                    <th>Min</th>
                                                    <th>Max</th>
                                                    <th>Edit</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {
                                                    [...extraNormalFields, ...extraFileFields].map((val, ky) => {
                                                        return (
                                                            <tr key={ky}>
                                                                <td>{val.file2 || val.file3 || val.file4 || val.file5 || val.name}</td>
                                                                <td>{val?.type || '-'}</td>
                                                                <td>{val?.hint || '-'}</td>
                                                                <td>{val?.minimum || '-'}</td>
                                                                <td>{val?.maximum || '-'}</td>
                                                                <td>
                                                                    {
                                                                        val?.isFromEdit ?
                                                                            ''
                                                                            :
                                                                            <>
                                                                                {
                                                                                    val.type !== 'file' ?
                                                                                        <EditIcon style={{ cursor: 'pointer' }} onClick={() => { editNormalField(val) }} />
                                                                                        :
                                                                                        <EditIcon style={{ cursor: 'pointer' }} onClick={() => { editFileField(val) }} />
                                                                                }
                                                                            </>
                                                                    }

                                                                    {
                                                                        val?.isFromEdit && (
                                                                            <DeleteIcon style={{ cursor: 'pointer', }} onClick={() => { deleteField(val.name, val.name_id) }} />
                                                                        )
                                                                    }
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
                        <Button disabled={submitting} color='success' onClick={submitCriterion} size='sm'>{submitting ? 'updating..' : 'Update'}</Button>
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

            <NewFileModal
                showFileModal={showFileModal}
                setShowFiledModal={setShowFiledModal}
                recieveFileField={recieveFileField}
                extraFileFields={extraFileFields}
                isFromEdit={true}
            />

            <NewFiledModal
                showFieldModal={showFieldModal}
                setShowFieldModal={setShowFieldModal}
                recieveNewField={recieveNewField}
                isFromEdit={true}
            />

            <EditFileModal
                showUpdateFileModal={showUpdateFileModal}
                closeUpdateFileModal={closeUpdateFileModal}
                selectedFile={selectedFile}
                updateFileField={updateFileField}
            />

            <EditNormalFieldModal
                showUpdateNormalFieldModal={showUpdateNormalFieldModal}
                closeUpdateNormalFieldModal={closeUpdateNormalFieldModal}
                selectedField={selectedNormalField}
                updateNormalField={updateNormalField}
            />
        </Row>
    )
}

export default UpdateCriterion