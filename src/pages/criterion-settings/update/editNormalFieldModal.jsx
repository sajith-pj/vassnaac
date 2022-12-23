import React, { useState, useEffect } from 'react'
import ModalCom from '../../../components/modal'
import { ModalBody, ModalFooter, Button, Input, Label, Row, Col, FormFeedback, FormGroup } from 'reactstrap'
import Chip from '@material-ui/core/Chip';
import { isRequired } from "../../../utils/validators";

function EditNormalFieldModal({ showUpdateNormalFieldModal, closeUpdateNormalFieldModal, selectedField = {}, updateNormalField }) {
  const [value, setValue] = useState({})
  const [err, setErr] = useState({})
  const [selectBoxOptionValue, setSelectBoxOptionValue] = useState('');

  useEffect(() => {
    if (Object.keys(selectedField).length > 0) {
      setValue(selectedField)
      setSelectBoxOptionValue('')
      setErr({})
    }
  }, [selectedField])

  const handleChange = (e) => {
    if (e.target.name === "status" || e.target.name === "is_required") {
      setValue({
        ...value,
        [e.target.name]: e.target.checked,
      })
    }
    else {
      setValue({
        ...value,
        [e.target.name]: e.target.value,
      });
    }
  }
  const updateField = () => {
    let err = {
      minimum: ['text', 'textarea'].includes(value.type) ? isRequired(value.minimum) : '',
      maximum: ['text', 'textarea'].includes(value.type) ? isRequired(value.maximum) : '',
      selectBoxOptions: ['select_box', 'select box'].includes(value?.type) ? value?.selectBoxOptions.length === 0 ? '*Required atleast one value' : '' : ''
    }
    if (Object.values(err).some((val) => val !== '')) {
      setErr(err)
      return
    }
    updateNormalField(value)
  }

  const handleDelete = (data) => {
    let arr = value?.selectBoxOptions ? [...value.selectBoxOptions] : []
    arr = arr.filter((val) => val !== data)
    setValue({ ...value, selectBoxOptions: [...arr] })
  }

  const addOptions = () => {
    let arr = value?.selectBoxOptions ? [...value.selectBoxOptions] : []
    if (selectBoxOptionValue) {
      arr.push(selectBoxOptionValue)
      setValue({ ...value, selectBoxOptions: [...arr] })
      setSelectBoxOptionValue('')
    }
  }

  return (
    <ModalCom open={showUpdateNormalFieldModal} title={'Update Field'} toggle={closeUpdateNormalFieldModal}>
      <ModalBody>
        <Row>
          <Col xs='12'>
            <FormGroup>
              <Label>Field Heading Name</Label>
              <Input value={value?.name} disabled />
            </FormGroup>
          </Col>
          <Col xs='12'>
            <FormGroup>
              <Label>Field Type</Label>
              <Input type='text' name='type' value={value?.type} disabled />
            </FormGroup>
          </Col>
          {
            (value?.type === 'select_box' || value?.type === 'select box') &&
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
                  value?.selectBoxOptions.map((val, k) => {
                    return <Chip style={{ marginLeft: '3px' }} key={k} label={val} onDelete={() => handleDelete(val)} />
                  })
                }
              </Col>
            </>
          }
          <Col xs='12'>
            <FormGroup>
              <Label>Hints</Label>
              <Input type='text' name='hint' value={value?.hint} onChange={handleChange} />
            </FormGroup>
          </Col>

          {
            (value.type === 'text' || value.type === 'textarea') ?
              <>
                <Col xs='6'>
                  <FormGroup>
                    <Label>Min Character</Label>
                    <Input type='number' min={1} name='minimum' value={value?.minimum} onChange={handleChange} invalid={!!err.minimum} />
                    <FormFeedback>{err.minimum}</FormFeedback>
                  </FormGroup>
                </Col>
                <Col xs='6'>
                  <FormGroup>
                    <Label>Max Character</Label>
                    <Input type='number' min={1} name='maximum' value={value?.maximum} onChange={handleChange} invalid={!!err.maximum} />
                    <FormFeedback>{err.maximum}</FormFeedback>
                  </FormGroup>
                </Col>

              </>
              :
              ''
          }
          <Col xs='6'>
            <Input type='checkbox' name='status' checked={value.status} onChange={handleChange} />
            {' '}
            <Label>Status</Label>
          </Col>
          <Col xs='6'>
            <Input type='checkbox' name='is_required' checked={value.is_required} onChange={handleChange} />
            {' '}
            <Label>Required field</Label>
          </Col>
        </Row>
      </ModalBody>

      <ModalFooter>
        <Button size='sm' outline onClick={closeUpdateNormalFieldModal}>Close</Button>
        <Button size='sm' color='primary' onClick={updateField}>Update</Button>
      </ModalFooter>
    </ModalCom>
  )
}

export default EditNormalFieldModal
