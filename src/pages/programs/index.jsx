import React, { useEffect, useState } from 'react'
import { Button, Row, Col, Input, ModalBody, ModalFooter, FormGroup, Label, FormFeedback } from 'reactstrap';
import { toast } from 'react-toastify';
import ModalCom from '../../components/modal'
import Swal from "sweetalert2";
import axios from '../../axios'
import DataTable from '../../components/data-table';
import { isRequired } from "../../utils/validators";

function Programs() {

  const [loader, setLoader] = useState(false);
  const [programs, setPrograms] = useState([]);
  const [open, setOpen] = useState(false);
  const [err, setErr] = useState({});
  const [inputValues, setInputValues] = useState({
    status: false,
    description: '',
    name: '',
    code: '',
    established_at: '',
    department: ''
  });
  const [updating, setUpdating] = useState(false);
  const [departmentList, setDepartmentList] = useState([]);

  const column = [
    { title: "Name", field: "name" },
    { title: "Department", field: "department_name" },
    { title: "Code", field: "code" },
    { title: "Description", field: "description", },
    // { title: "Established On", field: "established_at", },
    {
      title: "Status", field: "status",
      render: (rowData) => {
        return (
          <>
            {
              rowData.status ?
                <Button color='danger' size='sm' onClick={() => updateStatus('disable', rowData.id)} >Disable Prgm</Button> :
                <Button color='success' size='sm' onClick={() => updateStatus('enable', rowData.id)}>Enable Prgm</Button>
            }
          </>
        )
      },
    },
  ];

  useEffect(() => {
    getProgramsList()
    getDepartments()
  }, [])

  const getDepartments = () => {
    axios.get("/programs/department/list").then((response) => {
      setDepartmentList(response?.data?.data || []);
    });
  };

  const getProgramsList = () => {
    setLoader(true);
    axios.get('/programs/programs/list')
      .then((response) => {
        setPrograms(response?.data?.data)
        setLoader(false);
      })
      .catch(err => console.error(err))
  }

  const updateStatus = (type, id) => {
    setLoader(true)
    axios.post(`/change-status`, {
      slug: "programs",
      objid: id,
      status: type === 'disable' ? false : true,
    })
      .then(response => {
        toast.success('Program status updated successfully', {
          position: "top-right",
          autoClose: 2000,
        });
        getProgramsList();
      })
      .catch(() => setLoader(false))
  }

  const addProgram = () => {
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

  const deleteProgram = () => {
    Swal.fire({
      icon: "warning",
      text: "Do you want to delete!",
      showCancelButton: true,
      confirmButtonText: "Confirm",
    }).then((result) => {
      if (result.isConfirmed) {
        setUpdating(true)
        axios.delete(`/programs/programs/details/${inputValues?.id}`, {})
          .then(() => {
            toast.success('program deleted successfully', {
              position: "top-right",
              autoClose: 2000,
            });
            closeModal()
            getProgramsList();
          }).catch(() => {
            setUpdating(false)
          })
      }
    });
  }

  const submitProgram = () => {
    let errObj = {
      name: isRequired(inputValues.name),
      code: isRequired(inputValues.code),
      description: isRequired(inputValues.description),
      established_at: isRequired(inputValues.established_at),
      department: isRequired(inputValues.department),
    }
    if (Object.values(errObj).some((val) => val !== '')) {
      setErr(errObj)
      return
    }
    else if (inputValues?.id) {
      setUpdating(true)
      axios.put(`/programs/programs/details/${inputValues?.id}`, inputValues)
        .then((response) => {
          toast.success('Program updated successfully', {
            position: "top-right",
            autoClose: 2000,
          });
          closeModal()
          getProgramsList();
        })
        .catch(err => {
          let msgData = err?.response?.data?.data || {}
          setErr(msgData)
        }).finally(() => setUpdating(false))
    }
    else {
      setUpdating(true)
      axios.post('/programs/programs/list', inputValues)
        .then((response) => {
          toast.success('Program added successfully', {
            position: "top-right",
            autoClose: 2000,
          });
          closeModal()
          getProgramsList();
        })
        .catch(err => {
          let msgData = err?.response?.data?.data || {}
          setErr(msgData)
        }).finally(() => setUpdating(false))
    }
  }

  const editProgram = (data) => {
    setOpen(true)
    setInputValues(data)
    setErr({})
  }

  return (
    <Row>
      <div class="pagetitle">
        <h1>All Program List</h1>
        <nav>
          <ol class="breadcrumb">
            <li class="breadcrumb-item">Features</li>
            <li class="breadcrumb-item active">Programs</li>
          </ol>
        </nav>
      </div>

      <Col xs='12' className='d-flex justify-content-end'>
        <Button onClick={() => addProgram()} className='me-2' outline color='primary' size='sm'>Add Program</Button>
      </Col>
      <Col xs='12'>
        <div className='mt-2'>
          <DataTable
            title={"Program list"}
            loading={loader}
            column={column}
            data={programs}
            editProgram={editProgram}
          />
        </div>
      </Col>

      <ModalCom open={open} title={`${inputValues?.id ? 'Update Program' : 'Add Program'}`} toggle={closeModal}>
        <ModalBody>
          <Row>
            <Col xs='12' sm='6'>
              <FormGroup>
                <Label>Department</Label>
                <Input type='select' name='department' onChange={handleChange} value={inputValues?.department} invalid={!!err.department}>
                  <option value="" selected> Department </option>
                  {departmentList.map((department, ky) => (
                    <option key={ky} value={department.id}> {department.name} </option>
                  ))}
                </Input>
                <FormFeedback>{err.department}</FormFeedback>
              </FormGroup>
            </Col>
            <Col xs='12' sm='6'>
              <FormGroup>
                <Label>Name</Label>
                <Input type='text' name='name' onChange={handleChange} value={inputValues?.name} invalid={!!err.name} />
                <FormFeedback>{err.name}</FormFeedback>
              </FormGroup>
            </Col>
            <Col xs='12' sm='6'>
              <FormGroup>
                <Label>Code</Label>
                <Input type='text' name='code' value={inputValues?.code} onChange={handleChange} invalid={!!err.code} />
                <FormFeedback>{err.code}</FormFeedback>
              </FormGroup>
            </Col>

            <Col xs='12' sm='6'>
              <FormGroup>
                <Label>Established At</Label>
                <Input type='date' name='established_at' value={inputValues?.established_at} onChange={handleChange} invalid={!!err.established_at} />
                <FormFeedback>{err.established_at}</FormFeedback>
              </FormGroup>
            </Col>

            <Col xs='12'>
              <FormGroup>
                <Label>Description</Label>
                <Input type='textarea' rows={3} name='description' value={inputValues?.description} onChange={handleChange} invalid={!!err.description} />
                <FormFeedback>{err.description}</FormFeedback>
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
              <Button color='danger' size='sm' disabled={updating} onClick={deleteProgram}>
                Delete
              </Button>
            )
          }
          <Button color='primary' size='sm' disabled={updating} onClick={submitProgram}>
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

export default Programs