import React, { useState, useEffect } from 'react'
import axios from '../../axios'
import { Button, Row, Col, Input, ModalBody, ModalFooter, FormGroup, Label, FormFeedback } from 'reactstrap';
import { toast } from 'react-toastify';
import ModalCom from '../../components/modal'
import {
    Accordion,
    AccordionBody,
    AccordionHeader,
    AccordionItem,
} from 'reactstrap';
import './faq.scss'
import { isRequired, validateURL } from "../../utils/validators";
import Loader from '../../components/loader';
import { useOutletContext } from 'react-router-dom'

function Faq() {
    const user = useOutletContext()
    const [open, setOpen] = useState(false);
    const [err, setErr] = useState({});
    const [inputValues, setInputValues] = useState({});
    const [faqs, setFaqs] = useState([])
    const [openAcc, setOpenAcc] = useState(false);
    const [updating, setUpdating] = useState(false);
    const [files, setFiles] = useState({ files: '', image: '' })
    const [loader, setLoader] = useState(false);
    useEffect(() => {
        getFAQs()
    }, [])

    const getFAQs = () => {
        setLoader(true)
        axios.get('/programs/faq/list')
            .then(response => {
                setFaqs(response?.data?.data);
            }).finally(() => setLoader(false))
    }

    const addFaq = () => {
        setOpen(true)
        setErr({})
    }

    const closeModal = () => {
        setOpen(false)
        setInputValues({})
        setErr({})
        setFiles({})
    }

    const toggle = (id) => {
        if (openAcc === id) {
            setOpenAcc();
        } else {
            setOpenAcc(id);
        }
    };
    const handleChange = (e) => {
        if (e.target.name === 'is_enabled') {
            setInputValues({ ...inputValues, [e.target.name]: e.target.checked })
        }
        else if (['image', 'files'].includes(e.target.name)) {
            setInputValues({ ...inputValues, [e.target.name]: e.target.files[0] })
        }
        else {
            setInputValues({ ...inputValues, [e.target.name]: e.target.value })
        }
        setErr({ ...err, [e.target.name]: '' })
    }

    const editFaq = (data) => {
        setInputValues(data)
        setFiles({ files: data?.files, image: data?.image })
        setOpen(true)
        setOpenAcc('')
    }

    const submitFaq = () => {
        let errObj = {
            faq_no: isRequired(inputValues.faq_no),
            question: isRequired(inputValues.question),
            answer: isRequired(inputValues.answer),
            urls: inputValues.urls ? validateURL(inputValues.urls) : '',
        }
        if (Object.values(errObj).some((val) => val !== '')) {
            setErr(errObj)
            return
        }
        else if (inputValues?.id) {
            setUpdating(true)
            let formData = new FormData();
            for (let key in inputValues) {
                if (inputValues[key]) {
                    formData.append(key, inputValues[key])
                }
            }
            axios.put(`/programs/faq/details/${inputValues?.id}`, formData)
                .then((response) => {
                    toast.success('FAQ updated successfully', {
                        position: "top-right",
                        autoClose: 2000,
                    });
                    closeModal()
                    getFAQs();
                })
                .catch(err => {
                    let msgData = err?.response?.data?.data || {}
                    setErr(msgData)
                }).finally(() => setUpdating(false))
        }
        else {
            setUpdating(true)
            let formData = new FormData();
            for (let key in inputValues) {
                if (inputValues[key]) {
                    formData.append(key, inputValues[key])
                }
            }
            axios.post('/programs/faq/list', formData)
                .then((response) => {
                    toast.success('FAQ added successfully', {
                        position: "top-right",
                        autoClose: 2000,
                    });
                    closeModal()
                    getFAQs();
                })
                .catch(err => {
                    let msgData = err?.response?.data?.data || {}
                    setErr(msgData)
                }).finally(() => setUpdating(false))
        }
    }
    if (loader) {
        return <Loader title={'FAQ'} />
    }

    return (
        <Row className='faq'>
            <div class="pagetitle">
                <h1>FAQ</h1>
                <nav>
                    <ol class="breadcrumb">
                        <li class="breadcrumb-item">Others</li>
                        <li class="breadcrumb-item active">FAQ</li>
                    </ol>
                </nav>
            </div>

            <Col xs='12' className='d-flex justify-content-end'>
                {
                    !['DEPT_COD', 'CLUB', 'TEACHER'].includes(user?.user_scope) &&
                    <Button onClick={() => addFaq()} className='me-2' outline color='primary' size='sm'>Add Faq</Button>
                }
            </Col>

            <Col xs='12' className='mt-3'>
                <Accordion open={openAcc} toggle={toggle}>
                    {
                        faqs.map((val, k) => {
                            return (
                                <AccordionItem key={k}>
                                    <AccordionHeader targetId={k}>
                                        {val?.faq_no} {val?.question}
                                    </AccordionHeader>
                                    <AccordionBody accordionId={k}>
                                        {
                                            !['DEPT_COD', 'CLUB', 'TEACHER'].includes(user?.user_scope) &&
                                            <div className='edit-faq'><span onClick={() => editFaq(val)}>Edit Faq</span></div>
                                        }
                                        <p>{val?.answer}</p>
                                        <div className='faq-attaches'>
                                            {val?.image ? <a href={val.image} target="_blank" rel='noopener noreferrer'>
                                                <p className="naac-faq-links">  View attached Images </p>  </a> : ""}
                                            {val?.files ? <a href={val.files} target="_blank" rel='noopener noreferrer'>
                                                <p className="naac-faq-links">  View attached Files </p>  </a> : ""}
                                            {val?.urls ? <a href={val.urls} target="_blank" rel='noopener noreferrer'>
                                                <p className="naac-faq-links">  View External Link </p>  </a> : ""}
                                        </div>
                                    </AccordionBody>
                                </AccordionItem>
                            )
                        })
                    }

                </Accordion>
            </Col>


            <ModalCom open={open} title={`${inputValues?.id ? 'Update FAQ' : 'Add FAQ'}`} toggle={closeModal}>
                <ModalBody>
                    <Row>

                        <Col xs='12'>
                            <FormGroup>
                                <Label>FAQ No.</Label>
                                <Input type='number' min={0} name='faq_no' onChange={handleChange} value={inputValues?.faq_no} invalid={!!err.faq_no} />
                                <FormFeedback>{err.faq_no}</FormFeedback>
                            </FormGroup>
                        </Col>
                        <Col xs='12'>
                            <FormGroup>
                                <Label>Tags</Label>
                                <Input type='text' name='tags' value={inputValues?.tags} onChange={handleChange} />
                            </FormGroup>
                        </Col>
                        <Col xs='12'>
                            <FormGroup>
                                <Label>Question</Label>
                                <Input type='text' name='question' value={inputValues?.question} onChange={handleChange} invalid={!!err.question} />
                                <FormFeedback>{err.question}</FormFeedback>
                            </FormGroup>
                        </Col>

                        <Col xs='12'>
                            <FormGroup>
                                <Label>Answer</Label>
                                <Input type='textarea' rows={3} name='answer' value={inputValues?.answer} onChange={handleChange} invalid={!!err.answer} />
                                <FormFeedback>{err.answer}</FormFeedback>
                            </FormGroup>
                        </Col>

                        <Col xs='12'>
                            <FormGroup>
                                <Label>Image</Label>
                                <Input type='file' name='image' onChange={handleChange} />
                                {files?.image && inputValues?.id && <a href={files.image} target="_blank" rel='noopener noreferrer'><p className='view_p'>View Current Image</p></a>}
                            </FormGroup>
                        </Col>

                        <Col xs='12'>
                            <FormGroup>
                                <Label>File</Label>
                                <Input type='file' name='files' onChange={handleChange} />
                                {files?.files && inputValues?.id && <a href={files.files} target="_blank" rel='noopener noreferrer'><p className='view_p'>View Current File</p></a>}
                            </FormGroup>
                        </Col>

                        <Col xs='12'>
                            <FormGroup>
                                <Label>URL</Label>
                                <Input type='text' name='urls' value={inputValues?.urls} onChange={handleChange} invalid={!!err.urls} />
                                <FormFeedback>{err.urls}</FormFeedback>
                            </FormGroup>
                        </Col>

                        <Col xs='12'>
                            <Input type="checkbox" name='is_enabled' checked={inputValues?.is_enabled} onChange={handleChange} />
                            {'  '}
                            <Label>
                                Enable For User
                            </Label>
                        </Col>
                    </Row>
                </ModalBody>
                <ModalFooter>
                    <Button color='primary' size='sm' disabled={updating} onClick={submitFaq}>
                        {updating ? 'loading..' : 'Submit'}
                    </Button>
                    <Button size='sm' onClick={closeModal} disabled={updating} color="secondary">
                        Close
                    </Button>
                </ModalFooter>
            </ModalCom>
        </Row>
    )
}

export default Faq