import React, { useEffect, useState } from 'react'
import { Button, Row, Col, Input, ModalBody, ModalFooter, FormGroup, Label, FormFeedback } from 'reactstrap';
import { toast } from 'react-toastify';
import ModalCom from '../../components/modal'
import Swal from "sweetalert2";
import axios from '../../axios'
import DataTable from '../../components/data-table';
import { isRequired } from "../../utils/validators";

function Batch() {

  const [loader, setLoader] = useState(false);
  const [programs, setPrograms] = useState([]);
  const [open, setOpen] = useState(false);
  const [err, setErr] = useState({});
  const [inputValues, setInputValues] = useState({
    status: false,
    batch_no: '',
    name: '',
  });
  const [updating, setUpdating] = useState(false);

  const column = [
    { title: "Name", field: "name" },
    { title: "Batch No.", field: "batch_no" },
    {
      title: "Status", field: "status",
      render: (rowData) => {
        return (
          <>
            {
              rowData.status ?
                <Button color='danger' size='sm' onClick={() => updateStatus('disable', rowData.id)} >Disable Batch</Button> :
                <Button color='success' size='sm' onClick={() => updateStatus('enable', rowData.id)}>Enable Batch</Button>
            }
          </>
        )
      },
    },
  ];

  useEffect(() => {
    getBatchList()
  }, [])

 

  const getBatchList = () => {
    setLoader(true);
    axios.get('/programs/batch/list')
      .then((response) => {
        setPrograms(response?.data?.data)
        setLoader(false);
      })
      .catch(err => console.error(err))
  }

  const updateStatus = (type, id) => {
    setLoader(true)
    axios.post(`/change-status`, {
      slug: "batch",
      objid: id,
      status: type === 'disable' ? false : true,
    })
      .then(response => {
        toast.success('Batch status updated successfully', {
          position: "top-right",
          autoClose: 2000,
        });
        getBatchList();
      })
      .catch(() => setLoader(false))
  }

  const addBatch = () => {
    setOpen(true)
    setErr({})
  }

  const closeModal = () => {
    setOpen(false)
    setInputValues({})
    setErr({})
  }

  const handleChange = (e) => {
    if (e.target.name === 'status') {
      setInputValues({ ...inputValues, [e.target.name]: e.target.checked })
    } else {
      setInputValues({ ...inputValues, [e.target.name]: e.target.value })
    }
    setErr({ ...err, [e.target.name]: '' })
  }

  const deleteBatch = () => {
    Swal.fire({
      icon: "warning",
      text: "Do you want to delete!",
      showCancelButton: true,
      confirmButtonText: "Confirm",
    }).then((result) => {
      if (result.isConfirmed) {
        setUpdating(true)
        axios.delete(`/programs/batch/details/${inputValues?.id}`, {})
          .then(() => {
            toast.success('Batch deleted successfully', {
              position: "top-right",
              autoClose: 2000,
            });
            closeModal()
            getBatchList();
          }).catch(() => {
            setUpdating(false)
          })
      }
    });
  }

  const submitBatch = () => {
    let errObj = {
      name: isRequired(inputValues.name),
      batch_no: isRequired(inputValues.batch_no),
    }
    if (Object.values(errObj).some((val) => val !== '')) {
      setErr(errObj)
      return
    }
    else if (inputValues?.id) {
      setUpdating(true)
      axios.put(`/programs/batch/details/${inputValues?.id}`, inputValues)
        .then((response) => {
          toast.success('Batch updated successfully', {
            position: "top-right",
            autoClose: 2000,
          });
          closeModal()
          getBatchList();
        })
        .catch(err => {
          let msgData = err?.response?.data?.data || {}
          setErr(msgData)
        }).finally(() => setUpdating(false))
    }
    else {
      setUpdating(true)
      axios.post('/programs/batch/list', inputValues)
        .then((response) => {
          toast.success('Batch added successfully', {
            position: "top-right",
            autoClose: 2000,
          });
          closeModal()
          getBatchList();
        })
        .catch(err => {
          let msgData = err?.response?.data?.data || {}
          setErr(msgData)
        }).finally(() => setUpdating(false))
    }
  }

  const editBatch = (data) => {
    setOpen(true)
    setInputValues(data)
    setErr({})
  }

  return (
    <Row>
      <div class="pagetitle">
        <h1>All Batch List</h1>
        <nav>
          <ol class="breadcrumb">
            <li class="breadcrumb-item">Features</li>
            <li class="breadcrumb-item active">Batch</li>
          </ol>
        </nav>
      </div>

      <Col xs='12' className='d-flex justify-content-end'>
        <Button onClick={() => addBatch()} className='me-2' outline color='primary' size='sm'>Add Batch</Button>
      </Col>
      <Col xs='12'>
        <div className='mt-2'>
          <DataTable
            title={"Batch list"}
            loading={loader}
            column={column}
            data={programs}
            editBatch={editBatch}
          />
        </div>
      </Col>

      <ModalCom open={open} title={`${inputValues?.id ? 'Update Batch' : 'Add Batch'}`} toggle={closeModal}>
        <ModalBody>
          <Row>
            
            <Col xs='12' sm='6'>
              <FormGroup>
                <Label>Batch Name</Label>
                <Input type='text' name='name' onChange={handleChange} value={inputValues?.name} invalid={!!err.name} />
                <FormFeedback>{err.name}</FormFeedback>
              </FormGroup>
            </Col>
            <Col xs='12' sm='6'>
              <FormGroup>
                <Label>Batch No.</Label>
                <Input type='number' min={0} name='batch_no' value={inputValues?.batch_no} onChange={handleChange} invalid={!!err.batch_no} />
                <FormFeedback>{err.batch_no}</FormFeedback>
              </FormGroup>
            </Col>

            <Col xs='12'>
              <Input type="checkbox" name='status' checked={inputValues?.status} onChange={handleChange} />
              {'  '}
              <Label>
                Status
              </Label>
            </Col>
          </Row>
        </ModalBody>
        <ModalFooter>
          {
            inputValues?.id && (
              <Button color='danger' size='sm' disabled={updating} onClick={deleteBatch}>
                Delete
              </Button>
            )
          }
          <Button color='primary' size='sm' disabled={updating} onClick={submitBatch}>
            Submit
          </Button>
          <Button size='sm' onClick={closeModal} disabled={updating} color="secondary">
            Close
          </Button>
        </ModalFooter>
      </ModalCom>
    </Row>
  )
}

export default Batch