import React,{useState,useEffect} from 'react'
import ModalCom from '../../../components/modal'
import { ModalBody, ModalFooter, Button, Input, Label, Row, Col,  } from 'reactstrap'

function EditFileModal({ showUpdateFileModal, closeUpdateFileModal, selectedFile={}, updateFileField }) {
    const [value,setValue] = useState({})
    useEffect(()=>{
        if(Object.keys(selectedFile).length > 0){
            setValue(selectedFile)
        }
    },[selectedFile])
    
    const handleQuestionChange = (e) => {
        setValue({...value,[e.target.name]:e.target.value,name:e.target.value})
    }

    return (
        <ModalCom open={showUpdateFileModal} title={'Update File Field'} toggle={closeUpdateFileModal}>
            <ModalBody>
                <Row>
                    <Col xs='12'>
                        <h6 style={{ color: '#0a41ab' }}>Only images and pdf are allowed</h6>
                    </Col>

                    <Col xs='1' className='mt-2'>
                        <Input type='checkbox' checked={true} disabled />
                    </Col>
                    <Col xs='8' className='mt-2'>
                        <Input type='text' name={value.name_for_filter} value={value[value.name_for_filter]} onChange={handleQuestionChange} />
                    </Col>
                    <Col xs='3' className='mt-2'>
                        <Input type='checkbox' onChange={(e)=>setValue({...value,is_required:e.target.checked})} checked={value.is_required} />
                        {' '}
                        <Label>Required</Label>
                    </Col>
                </Row>
            </ModalBody>
            <ModalFooter>
                <Button size='sm' outline onClick={closeUpdateFileModal}>Cancel</Button>
                <Button size='sm' color='primary' onClick={()=>updateFileField(value)} disabled={!value[value.name_for_filter]}>Update</Button>
            </ModalFooter>
        </ModalCom>
    )
}

export default EditFileModal