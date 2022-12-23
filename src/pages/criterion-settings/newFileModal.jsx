import React, { useState, useEffect } from 'react'
import ModalCom from '../../components/modal'
import { ModalBody, ModalFooter, Button, Input, Label, Row, Col, FormFeedback } from 'reactstrap'
import { toast } from 'react-toastify';
import { v4 as uuidv4 } from "uuid";

function NewFileModal({ showFileModal, setShowFiledModal, recieveFileField, extraFileFields,isFromEdit=false }) {
    
    const [err, setErr] = useState({
        file2: '',
        file3: '',
        file4: '',
        file5: '',
    });

    const [file2, setFile2] = useState({ file2: '', is_required: false, name: 'file2' })
    const [file3, setFile3] = useState({ file3: '', is_required: false, name: 'file3' })
    const [file4, setFile4] = useState({ file4: '', is_required: false, name: 'file4' })
    const [file5, setFile5] = useState({ file5: '', is_required: false, name: 'file5' })

    const [checkBoxes, setCheckBoxes] = useState({
        file2: false,
        file3: false,
        file4: false,
        file5: false,
    });

    useEffect(() => {
        resetData()
    }, [showFileModal])

    const resetData = () => {
        setFile2({ file2: '', is_required: false, name: 'file2' })
        setFile3({ file3: '', is_required: false, name: 'file3' })
        setFile4({ file4: '', is_required: false, name: 'file4' })
        setFile5({ file5: '', is_required: false, name: 'file5' })
        setCheckBoxes({
            file2: false,
            file3: false,
            file4: false,
            file5: false,
        })
        setErr({})
    }

    const handleQuestionChange = (event) => {
        const { name, value } = event.target
        switch (name) {
            case 'file2':
                setFile2({ ...file2, [name]: value })
                break;
            case 'file3':
                setFile3({ ...file3, [name]: value })
                break;
            case 'file4':
                setFile4({ ...file4, [name]: value })
                break;
            case 'file5':
                setFile5({ ...file5, [name]: value })
                break;
            default:
            // code block
        }
        setErr({ ...err, [name]: '' })
    };

    const handleCheckBox = (event) => {
        setCheckBoxes({ ...checkBoxes, [event.target.name]: event.target.checked });
    }

    const handleRequiredCheckBox = (event) => {
        const { name, checked } = event.target
        switch (name) {
            case 'file2':
                setFile2({ ...file2, is_required: checked })
                break;
            case 'file3':
                setFile3({ ...file3, is_required: checked })
                break;
            case 'file4':
                setFile4({ ...file4, is_required: checked })
                break;
            case 'file5':
                setFile5({ ...file5, is_required: checked })
                break;
            default:
            // code block
        }
    }
    const closeModal = () => {
        setShowFiledModal(false)
    }

    const submitData = () => {
        let val = Object.values(checkBoxes)
        if (val.every((val) => val === false)) {
            toast.error('Enter at least one data to submit', {
                position: "top-right",
                autoClose: 2000,
            });
            return
        }

        let err = {
            file2: checkBoxes.file2 && !file2.file2 ? 'Required' : '',
            file3: checkBoxes.file3 && !file3.file3 ? 'Required' : '',
            file4: checkBoxes.file4 && !file4.file4 ? 'Required' : '',
            file5: checkBoxes.file5 && !file5.file5 ? 'Required' : '',
        }
        if (Object.values(err).some((val) => val !== '')) {
            setErr(err)
            return
        } else {
            let allDataObj = [{ ...file2 }, { ...file3 }, { ...file4 }, { ...file5 }]
            let filter = allDataObj.filter((val) => val[val.name])
            filter.forEach((value) => {
                value.status = true
                value.name_id = uuidv4()
                value.type = 'file'
                value.name_for_filter = value.name
                value.isFromEdit = isFromEdit ? true : undefined
            })
            recieveFileField(filter)
            toast.success('New file fields addedd successfully', {
                position: "top-right",
                autoClose: 2000,
            });
            closeModal()
        }
    }

    const showInput = (value) => {
        return !extraFileFields.some((val) => val.name_for_filter === value)
    }

    return (
        <ModalCom open={showFileModal} title={'Add File Fields'} toggle={closeModal}>
            <ModalBody>
                <Row>
                    <Col xs='12'>
                        <h6 style={{ color: '#0a41ab' }}>Only images and pdf are allowed</h6>
                    </Col>
                    {
                        showInput('file2') && (
                            <>
                                <Col xs='1'>
                                    <Input type='checkbox' name='file2' onChange={handleCheckBox} />
                                </Col>
                                <Col xs='8'>
                                    <Input type='text' name='file2' invalid={!!err.file2} value={file2.file2} onChange={handleQuestionChange} disabled={!checkBoxes.file2} />
                                    <FormFeedback>{err.file2}</FormFeedback>
                                </Col>
                                <Col xs='3'>
                                    <Input type='checkbox' name='file2' disabled={!checkBoxes.file2} onChange={handleRequiredCheckBox} checked={file2.is_required} />
                                    {' '}
                                    <Label>Required</Label>
                                </Col>
                            </>
                        )
                    }

                    {
                        showInput('file3') && (
                            <>
                                <Col xs='1' className='mt-2'>
                                    <Input type='checkbox' name='file3' onChange={handleCheckBox} />
                                </Col>
                                <Col xs='8' className='mt-2'>
                                    <Input type='text' name='file3' invalid={!!err.file3} value={file3.file3} onChange={handleQuestionChange} disabled={!checkBoxes.file3} />
                                    <FormFeedback>{err.file3}</FormFeedback>
                                </Col>
                                <Col xs='3' className='mt-2'>
                                    <Input type='checkbox' name='file3' disabled={!checkBoxes.file3} onChange={handleRequiredCheckBox} checked={file3.is_required} />
                                    {' '}
                                    <Label>Required</Label>
                                </Col>
                            </>
                        )
                    }

                    {
                        showInput('file4') && (
                            <>
                                <Col xs='1' className='mt-2'>
                                    <Input type='checkbox' name='file4' onChange={handleCheckBox} />
                                </Col>
                                <Col xs='8' className='mt-2'>
                                    <Input type='text' invalid={!!err.file4} name='file4' value={file4.file4} onChange={handleQuestionChange} disabled={!checkBoxes.file4} />
                                    <FormFeedback>{err.file4}</FormFeedback>
                                </Col>
                                <Col xs='3' className='mt-2'>
                                    <Input type='checkbox' name='file4' disabled={!checkBoxes.file4} onChange={handleRequiredCheckBox} checked={file4.is_required} />
                                    {' '}
                                    <Label>Required</Label>
                                </Col>
                            </>
                        )
                    }

                    {
                        showInput('file5') && (
                            <>
                                <Col xs='1' className='mt-2'>
                                    <Input type='checkbox' name='file5' onChange={handleCheckBox} />
                                </Col>
                                <Col xs='8' className='mt-2'>
                                    <Input type='text' invalid={!!err.file5} name='file5' value={file5.file5} onChange={handleQuestionChange} disabled={!checkBoxes.file5} />
                                    <FormFeedback>{err.file5}</FormFeedback>
                                </Col>
                                <Col xs='3' className='mt-2'>
                                    <Input type='checkbox' name='file5' disabled={!checkBoxes.file5} onChange={handleRequiredCheckBox} checked={file5.is_required} />
                                    {' '}
                                    <Label>Required</Label>
                                </Col>
                            </>
                        )
                    }

                </Row>
            </ModalBody>
            <ModalFooter>
                <Button size='sm' outline onClick={closeModal}>Close</Button>
                <Button size='sm' onClick={submitData}>Create</Button>
            </ModalFooter>
        </ModalCom>
    )
}

export default NewFileModal