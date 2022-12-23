import React, { useEffect, useState } from 'react'
import { Button, Row, Col, Input, ModalBody, ModalFooter, FormGroup, Label, FormFeedback } from 'reactstrap';
import { toast } from 'react-toastify';
import ModalCom from '../../components/modal'
import Swal from "sweetalert2";
import axios from '../../axios'
import DataTable from '../../components/data-table';
import { isRequired } from "../../utils/validators";
import jsPDF from "jspdf";
import "jspdf-autotable";
import * as FileSaver from "file-saver";
import * as XLSX from "xlsx";
import { CSVLink } from "react-csv";

function Student() {

  const [loader, setLoader] = useState(false);
  const [programList, setProgramList] = useState([])
  const [open, setOpen] = useState(false);
  const [err, setErr] = useState({});
  const [inputValues, setInputValues] = useState({
    department: "",
    program: "",
    code: "",
    name: "",
    description: "",
    status: false,
    created_at: "",
  });
  const [updating, setUpdating] = useState(false);
  const [departmentList, setDepartmentList] = useState([]);
  const [studentList, setStudentList] = useState([]);
  const [batchList, setBatchList] = useState([]);

  const column = [
    { title: "Name", field: "name" },
    { title: "Student ID", field: "student_id" },
    { title: "Batch", field: "batch_name" },
    { title: "Program", field: "program_name" },
    { title: "Register No.", field: "reg_num", },
    {
      title: "Status", field: "status",
      render: (rowData) => {
        return (
          <>
            {
              rowData.status ?
                <Button color='danger' size='sm' onClick={() => updateStatus('disable', rowData.id)} >Disable</Button> :
                <Button color='success' size='sm' onClick={() => updateStatus('enable', rowData.id)}>Enable</Button>
            }
          </>
        )
      },
    },
  ];

  useEffect(() => {
    getStudentsList()
    getFeatures()
  }, [])

  const getFeatures = () => {
    axios.get("/features").then((response) => {
      const { batch = [], programs = [], departments = [] } = response?.data?.data;
      setBatchList(batch);
      setDepartmentList(departments);
      setProgramList(programs);
    });
  };
  const getStudentsList = () => {
    setLoader(true);
    axios.get('/programs/students/list')
      .then((response) => {
        setStudentList(response?.data?.data)
        setLoader(false);
      })
      .catch(err => setLoader(false))
  }


  const updateStatus = (type, id) => {
    setLoader(true)
    axios.post(`/change-status`, {
      slug: "students",
      objid: id,
      status: type === 'disable' ? false : true,
    })
      .then(response => {
        toast.success('Student status updated successfully', {
          position: "top-right",
          autoClose: 2000,
        });
        getStudentsList();
      })
      .catch(() => setLoader(false))
  }

  const addStudent = () => {
    setUpdating(false)
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

  const deleteStudent = () => {
    Swal.fire({
      icon: "warning",
      text: "Do you want to delete!",
      showCancelButton: true,
      confirmButtonText: "Confirm",
    }).then((result) => {
      if (result.isConfirmed) {
        setUpdating(true)
        axios.delete(`/programs/students/details/${inputValues?.id}`, {})
          .then(() => {
            toast.success('Student deleted successfully', {
              position: "top-right",
              autoClose: 2000,
            });
            setLoader(false);
            closeModal()
            getStudentsList();
          }).catch(() => {
            setUpdating(false)
          })
      }
    });
  }

  const submitPaper = () => {
    let errObj = {
      name: isRequired(inputValues.name),
      student_id: isRequired(inputValues.student_id),
      reg_num: isRequired(inputValues.reg_num),
      batch: isRequired(inputValues.batch),
      department: isRequired(inputValues.department),
      program: isRequired(inputValues.program),
    }
    if (Object.values(errObj).some((val) => val !== '')) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setErr(errObj)
      return
    }
    else if (inputValues?.id) {
      setUpdating(true)
      axios.put(`/programs/students/details/${inputValues?.id}`, inputValues)
        .then((response) => {
          toast.success('Student updated successfully', {
            position: "top-right",
            autoClose: 2000,
          });
          closeModal()
          getStudentsList();
        })
        .catch(err => {
          let msgData = err?.response?.data?.data || {}
          setErr(msgData)
        }).finally(() => setUpdating(false))
    }
    else {
      setUpdating(true)
      axios.post('/programs/students/list', inputValues)
        .then((response) => {
          toast.success('Student added successfully', {
            position: "top-right",
            autoClose: 2000,
          });
          setUpdating(false)
          closeModal()
          getStudentsList();
        })
        .catch(err => {
          let msgData = err?.response?.data?.data || {}
          setErr(msgData)
        }).finally(() => setUpdating(false))
    }
  }

  const editStudent = (data) => {
    setOpen(true)
    setInputValues(data)
    setErr({})
  }

  const exportPDF = () => {
    const doc = new jsPDF();
    let rows = [];
    let cols = ['Name', 'Student ID', 'Batch', 'Program', 'Reg No.','Status'];
    let arr = []
    studentList.forEach((val => {
      let obj = {
        name:val.name,
        student_id:val.student_id,
        batch:val.batch,
        program:val.program,
        reg_num:val.reg_num,
        status:val.status
      }
      arr.push(obj)
    }))

    arr.forEach((singleData) => {
      let singleRow = [];
      for (let key in singleData) {
        singleRow.push(singleData[key]);
      }
      rows.push(singleRow);
    });
    doc.autoTable(cols, rows, { startX: 10 });
    doc.save("report.pdf");
  };

  const downloadExcel = () => {
    if (studentList.length > 0) {
      const fileType =
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8";
      const fileExtension = ".xlsx";
      const ws = XLSX.utils.json_to_sheet(studentList);
      const wb = { Sheets: { data: ws }, SheetNames: ["data"] };
      const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
      const data = new Blob([excelBuffer], { type: fileType });
      FileSaver.saveAs(data, "report" + fileExtension);

    } else alert('no data available')
  }


  return (
    <Row>
      <div class="pagetitle">
        <h1>All Student List</h1>
        <nav>
          <ol class="breadcrumb">
            <li class="breadcrumb-item">Features</li>
            <li class="breadcrumb-item active">Students</li>
          </ol>
        </nav>
      </div>

      <Col xs='12' className='d-flex justify-content-end'>
        <Button onClick={() => addStudent()} className='me-2' outline color='primary' size='sm'>Add Student</Button>
        <Button onClick={() => exportPDF()} className='me-2' color='primary' size='sm'>PDF <i className="bi bi-download"></i></Button>
        <Button className='me-2' color='primary' size='sm'>
          <CSVLink
            data={studentList}
            filename={"students.csv"}
            style={{ color: 'white' }}
          >
            CSV
          </CSVLink>
          <i className="bi bi-download"></i>
        </Button>
        <Button onClick={() => downloadExcel()} className='me-2' color='primary' size='sm'>Excel <i className="bi bi-download"></i></Button>
      </Col>
      <Col xs='12'>
        <div className='mt-2'>
          <DataTable
            title={"Student list"}
            loading={loader}
            column={column}
            data={studentList}
            editStudent={editStudent}
          />
        </div>
      </Col>

      <ModalCom open={open} title={`${inputValues?.id ? 'Update Student' : 'Add Student'}`} toggle={closeModal}>
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
                <Label>Program</Label>
                <Input type='select' name='program' onChange={handleChange} value={inputValues?.program} invalid={!!err.program}>
                  <option value="">Program</option>
                  {
                    programList.map((program, ky) => {
                      return <option key={ky} value={program.id}> {program.name} </option>
                    })
                  }
                </Input>
                <FormFeedback>{err.program}</FormFeedback>
              </FormGroup>
            </Col>

            <Col xs='12' sm='6'>
              <FormGroup>
                <Label>Batch</Label>
                <Input type='select' name='batch' onChange={handleChange} value={inputValues?.batch} invalid={!!err.batch}>
                  <option value="">Batch</option>
                  {
                    batchList.map((batch) => {
                      return <option value={batch.id}> {batch.name} </option>
                    })
                  }
                </Input>
                <FormFeedback>{err.program}</FormFeedback>
              </FormGroup>
            </Col>

            <Col xs='12' sm='6'>
              <FormGroup>
                <Label>Name</Label>
                <Input type='text' name='name' value={inputValues?.name} onChange={handleChange} invalid={!!err.name} />
                <FormFeedback>{err.name}</FormFeedback>
              </FormGroup>
            </Col>

            <Col xs='12' sm='6'>
              <FormGroup>
                <Label>Student ID</Label>
                <Input type='text' name='student_id' value={inputValues?.student_id} onChange={handleChange} invalid={!!err.student_id} />
                <FormFeedback>{err.student_id}</FormFeedback>
              </FormGroup>
            </Col>

            <Col xs='12' sm='6'>
              <FormGroup>
                <Label>Reg No.</Label>
                <Input type='text' name='reg_num' value={inputValues?.reg_num} onChange={handleChange} invalid={!!err.reg_num} />
                <FormFeedback>{err.reg_num}</FormFeedback>
              </FormGroup>
            </Col>

            <Col xs='12' sm='6'>
              <FormGroup>
                <Label>Contact No.</Label>
                <Input type='number' name='contact_num' value={inputValues?.contact_num} onChange={handleChange} />
              </FormGroup>
            </Col>

            <Col xs='12' sm='6'>
              <FormGroup>
                <Label>Email</Label>
                <Input type='email' name='email' value={inputValues?.email} onChange={handleChange}  />
              </FormGroup>
            </Col>

            <Col xs='12'>
              <FormGroup>
                <Label>Address</Label>
                <Input type='textarea' rows={3} name='address' value={inputValues?.address} onChange={handleChange} />
              </FormGroup>
            </Col>

            <Col xs='6'>
              <Input type="checkbox" name='status' checked={inputValues?.status} onChange={handleChange} />
              {'  '}
              <Label>
                Enabled (System status)
              </Label>
            </Col>

            <Col xs='6'>
              <Input type="checkbox" name='placed' checked={inputValues?.placed} onChange={handleChange} />
              {'  '}
              <Label>
                Placed
              </Label>
            </Col>

            <Col xs='12' sm='6'>
              <FormGroup>
                <Label>Job Type/Current status</Label>
                <Input type='text' name='job_type' value={inputValues?.job_type} onChange={handleChange} />
              </FormGroup>
            </Col>

            <Col xs='12' sm='6'>
              <FormGroup>
                <Label>Job details/Company/Position</Label>
                <Input type='text' name='job_details' value={inputValues?.job_details} onChange={handleChange} />
              </FormGroup>
            </Col>

            <Col xs='12' sm='6'>
              <FormGroup>
                <Label>Package</Label>
                <Input type='text' name='package' value={inputValues?.package} onChange={handleChange} />
              </FormGroup>
            </Col>

            <Col xs='12' sm='6'>
              <FormGroup>
                <Label>Joined Date</Label>
                <Input type='date' name='created_at' value={inputValues?.created_at} onChange={handleChange} />
              </FormGroup>
            </Col>
          </Row>
        </ModalBody>
        <ModalFooter>
          {
            inputValues?.id && (
              <Button color='danger' size='sm' disabled={updating} onClick={deleteStudent}>
                Delete
              </Button>
            )
          }
          <Button color='primary' size='sm' disabled={updating} onClick={submitPaper}>
            Submit
          </Button>
          <Button size='sm' onClick={closeModal} disabled={updating} color="secondary">
            Close
          </Button>
        </ModalFooter>
      </ModalCom>
    </Row >
  )
}

export default Student