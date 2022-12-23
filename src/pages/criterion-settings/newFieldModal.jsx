import React, { useState, useEffect } from 'react'
import ModalCom from '../../components/modal'
import { ModalBody, ModalFooter, Button, Input, Label, FormGroup, Row, Col, FormFeedback } from 'reactstrap'
import { isRequired } from "../../utils/validators";
import { v4 as uuidv4 } from "uuid";
import Chip from '@material-ui/core/Chip';
import { toast } from 'react-toastify';

function NewFiledModal({ showFieldModal, setShowFieldModal, recieveNewField,isFromEdit=false }) {
    let initialNewFieldValue = {
        name: "",
        type: "date",
        selectBoxType:"static",
        hint: "",
        minimum: "",
        maximum: "",
        status: true,
        is_required: false,
        selectBoxOptions: [],
        isFromEdit: isFromEdit ? true : undefined,
        field_order:"",
        slug:""
    };

    const [err, setErr] = useState({ name: '', type: '', minimum: '', maximum: '', selectBoxType:"", slug:"" })
    const [newFieldDetail, setNewFieldDetail] = useState(initialNewFieldValue);
    const [selectBoxOptions, setSelectBoxOptions] = useState([]);
    const [selectBoxOptionValue, setSelectBoxOptionValue] = useState('');

    useEffect(() => {
        resetData()
    }, [showFieldModal])

    const resetData=()=>{
        setNewFieldDetail(initialNewFieldValue)
        setErr({ name: '', type: '' })
        setSelectBoxOptions([])
        setSelectBoxOptionValue('')
    }

    const closeModal = () => {
        setShowFieldModal(false)
    }

    const addField = () => {
        let err = {
            name: isRequired(newFieldDetail.name),
            type: isRequired(newFieldDetail.type),
            minimum: ['text', 'textarea'].includes(newFieldDetail.type) ? isRequired(newFieldDetail.minimum) : '',
            maximum: ['text', 'textarea'].includes(newFieldDetail.type) ? isRequired(newFieldDetail.maximum) : '',
            selectBoxOptions: newFieldDetail.type === 'select_box' ? newFieldDetail.selectBoxType === 'static' &&  selectBoxOptions.length === 0 ? '*Required atleast one value' : '' : ''
        }
        if (Object.values(err).some((val) => val !== '')) {
            setErr(err)
            return
        }
        let data = {
            ...newFieldDetail,
            name_id: uuidv4(),
            selectBoxOptions: newFieldDetail.type === 'select_box' ? selectBoxOptions : []
        }
        resetData()
        toast.success('New field addedd successfully', {
            position: "top-right",
            autoClose: 2000,
        });
        recieveNewField(data)
    }

    const handleChange = (event) => {
        if (event.target.name === "status" || event.target.name === "is_required") {
            setNewFieldDetail({
                ...newFieldDetail,
                [event.target.name]: event.target.checked,
            });
        }
        else {
            setNewFieldDetail({
                ...newFieldDetail,
                [event.target.name]: event.target.value,
            });
            setErr({ ...err, [event.target.name]: '' })
        }
    }

    const addOptions = () => {
        let arr = [...selectBoxOptions]
        if (selectBoxOptionValue) {
            arr.push(selectBoxOptionValue)
            setSelectBoxOptions([...arr])
            setSelectBoxOptionValue('')
        }
        setErr({ ...err, selectBoxOptions: '' })
    }

    const handleDelete = (data) => {
        let arr = selectBoxOptions.filter((val) => val !== data)
        setSelectBoxOptions(arr)
    }

    return (
        <ModalCom open={showFieldModal} title={'Add New Field'} toggle={closeModal}>
            <ModalBody>
                <Row>
                    <Col xs='12'>
                        <FormGroup>
                            <Label>Field Heading Name</Label>
                            <Input type='text' name='name' value={newFieldDetail.name} onChange={handleChange} invalid={!!err.name} />
                            <FormFeedback>{err.name}</FormFeedback>
                        </FormGroup>
                    </Col>
                    <Col xs='12'>
                        <FormGroup>
                            <Label>Field Type</Label>
                            <Input type='select' name='type' value={newFieldDetail.type} onChange={handleChange} invalid={!!err.type}>
                                <option value="date">Date</option>
                                <option value="text">Text</option>
                                <option value="number">Number</option>
                                <option value="textarea">Textarea </option>
                                <option value="checkbox">Checkbox </option>
                                <option value="select_box">Select Box</option>
                            </Input>
                            <FormFeedback>{err.type}</FormFeedback>
                        </FormGroup>
                    </Col>
                    {
                        newFieldDetail.type === 'select_box' &&
                        <>
                            <Col xs='12'>
                                <FormGroup>
                                    <Label>Select Type</Label>
                                    <Input type='select' invalid={!!err.selectBoxType} name='hint' value={newFieldDetail.selectBoxType} onChange={(e) => setNewFieldDetail({...newFieldDetail, selectBoxType: e.target.value})} >
                                        <option value="static">Static </option>
                                        <option value="api">Api </option>
                                    </Input>
                                    <FormFeedback>{err?.selectBoxType}</FormFeedback>
                                </FormGroup>
                            </Col>
                            {
                                newFieldDetail.selectBoxType == 'static' ?
                                <>
                            <Col xs='9'>
                                <FormGroup>
                                    <Label>Enter Options</Label>
                                    <Input type='text' invalid={!!err.selectBoxOptions} name='hint' value={selectBoxOptionValue} onChange={(e) => setSelectBoxOptionValue(e.target.value)} />
                                    <FormFeedback>{err?.selectBoxOptions}</FormFeedback>
                                </FormGroup>
                            </Col>
                            <Col xs='3'>
                                <FormGroup>
                                    <Button style={{ marginTop: '35px' }} onClick={addOptions} disabled={!selectBoxOptionValue} size='sm'><i className="bi bi-plus"></i></Button>
                                </FormGroup>
                            </Col>
                            <Col xs='12'>
                                {
                                    selectBoxOptions.map((val, k) => {
                                        return <Chip style={{ marginLeft: '3px' }} key={k} label={val} onDelete={() => handleDelete(val)} />
                                    })
                                }
                            </Col>
                            </>
                            :
                            <Col xs='12'>
                            <FormGroup>
                                <Label>Enter Slug</Label>
                                <Input type='text' invalid={!!err.slug} name='hint' value={newFieldDetail.slug} onChange={(e) => setNewFieldDetail({ ...newFieldDetail, slug: e.target.value})} />
                                <FormFeedback>{err?.slug}</FormFeedback>
                            </FormGroup>
                        </Col>
                            }
                        </>
                    }
                    <Col xs='12'>
                        <FormGroup>
                            <Label>Field Order</Label>
                            <Input type='number' name='field_order' value={newFieldDetail.field_order} onChange={handleChange} />
                        </FormGroup>
                    </Col>
                    <Col xs='12'>
                        <FormGroup>
                            <Label>Hints</Label>
                            <Input type='text' name='hint' value={newFieldDetail.hint} onChange={handleChange} />
                        </FormGroup>
                    </Col>

                    {
                        ( newFieldDetail.type === 'number' || newFieldDetail.type === 'text' || newFieldDetail.type === 'textarea') ?
                            <>
                                <Col xs='6'>
                                    <FormGroup>
                                        <Label>Min Character</Label>
                                        <Input type='number' min={1} name='minimum' value={newFieldDetail.minimum} onChange={handleChange} invalid={!!err.minimum} />
                                        <FormFeedback>{err.minimum}</FormFeedback>
                                    </FormGroup>
                                </Col>
                                <Col xs='6'>
                                    <FormGroup>
                                        <Label>Max Character</Label>
                                        <Input type='number' min={1} name='maximum' value={newFieldDetail.maximum} onChange={handleChange} invalid={!!err.maximum} />
                                        <FormFeedback>{err.maximum}</FormFeedback>
                                    </FormGroup>
                                </Col>

                            </>
                            :
                            ''
                    }
                    <Col xs='6'>
                        <Input type='checkbox' name='status' checked={newFieldDetail.status} onChange={handleChange} />
                        {' '}
                        <Label>Status</Label>
                    </Col>
                    <Col xs='6'>
                        <Input type='checkbox' name='is_required' checked={newFieldDetail.is_required} onChange={handleChange} />
                        {' '}
                        <Label>Required field</Label>
                    </Col>
                </Row>
            </ModalBody>
            <ModalFooter>
                <Button size='sm' outline onClick={closeModal}>Close</Button>
                <Button size='sm' onClick={addField}>Create</Button>
            </ModalFooter>
        </ModalCom>
    )
}

export default NewFiledModal