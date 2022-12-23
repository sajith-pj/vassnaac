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

function Paper() {

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
    established_at: "",
  });
  const [updating, setUpdating] = useState(false);
  const [departmentList, setDepartmentList] = useState([]);
  const [paperList, setPaperList] = useState([]);

  const column = [
    { title: "Name", field: "name" },
    { title: "Code", field: "code" },
    { title: "Program", field: "program_name" },
    { title: "Department", field: "department_name", },
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
    getPapersList()
  }, [])

  const getDepartments = () => {
    axios.get("/programs/department/list").then((response) => {
      setDepartmentList(response?.data?.data || []);
    });
  };

  const getPapersList = () => {
    setLoader(true);
    axios.get('/programs/subjects/list')
      .then((response) => {
        setPaperList(response?.data?.data)
        setLoader(false);
      })
      .catch(err => setLoader(false))
  }

  const getProgramsList = () => {
    axios
      .get("/programs/programs/list")
      .then((response) => {
        setProgramList(response?.data?.data || []);
      })
      .catch((err) => {
        console.error(err);
      });
  };

  const updateStatus = (type, id) => {
    setLoader(true)
    axios.post(`/change-status`, {
      slug: "subjects",
      objid: id,
      status: type === 'disable' ? false : true,
    })
      .then(response => {
        toast.success('Paper status updated successfully', {
          position: "top-right",
          autoClose: 2000,
        });
        getPapersList();
      })
      .catch(() => setLoader(false))
  }

  const addPaper = () => {
    if (programList.length === 0) getProgramsList()
    if (departmentList.length === 0) getDepartments()
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

  const deletePaper = () => {
    Swal.fire({
      icon: "warning",
      text: "Do you want to delete!",
      showCancelButton: true,
      confirmButtonText: "Confirm",
    }).then((result) => {
      if (result.isConfirmed) {
        setUpdating(true)
        axios.delete(`/programs/subjects/details/${inputValues?.id}`, {})
          .then(() => {
            toast.success('Paper deleted successfully', {
              position: "top-right",
              autoClose: 2000,
            });
            setLoader(false);
            closeModal()
            getPapersList();
          }).catch(() => {
            setUpdating(false)
          })
      }
    });
  }

  const submitPaper = () => {
    let errObj = {
      name: isRequired(inputValues.name),
      code: isRequired(inputValues.code),
      description: isRequired(inputValues.description),
      established_at: isRequired(inputValues.established_at),
      department: isRequired(inputValues.department),
      program: isRequired(inputValues.program),
    }
    if (Object.values(errObj).some((val) => val !== '')) {
      setErr(errObj)
      return
    }
    else if (inputValues?.id) {
      setUpdating(true)
      axios.put(`/programs/subjects/details/${inputValues?.id}`, inputValues)
        .then((response) => {
          toast.success('Paper updated successfully', {
            position: "top-right",
            autoClose: 2000,
          });
          closeModal()
          getPapersList();
        })
        .catch(err => {
          let msgData = err?.response?.data?.data || {}
          setErr(msgData)
        }).finally(() => setUpdating(false))
    }
    else {
      setUpdating(true)
      axios.post('/programs/subjects/list', inputValues)
        .then((response) => {
          toast.success('Paper added successfully', {
            position: "top-right",
            autoClose: 2000,
          });
          setUpdating(false)
          closeModal()
          getPapersList();
        })
        .catch(err => {
          let msgData = err?.response?.data?.data || {}
          setErr(msgData)
        }).finally(() => setUpdating(false))
    }
  }

  const editPaper = (data) => {
    if (programList.length === 0) getProgramsList()
    if (departmentList.length === 0) getDepartments()
    setOpen(true)
    setInputValues(data)
    setErr({})
  }

  const exportPDF = () => {
    const doc = new jsPDF();
    let rows = [];
    let cols = ['Department', 'Program', 'Name', 'Code', 'Status'];
    let arr = []
    paperList.forEach((val => {
      let { department, description, established_at, id, is_enabled, program, ...rest } = val
      arr.push(rest)
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
    if (paperList.length > 0) {
      const fileType =
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8";
      const fileExtension = ".xlsx";
      const ws = XLSX.utils.json_to_sheet(paperList);
      const wb = { Sheets: { data: ws }, SheetNames: ["data"] };
      const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
      const data = new Blob([excelBuffer], { type: fileType });
      FileSaver.saveAs(data, "report" + fileExtension);

    } else alert('no data available')
  }


  return (
    <Row>
      <div class="pagetitle">
        <h1>All Paper List</h1>
        <nav>
          <ol class="breadcrumb">
            <li class="breadcrumb-item">Features</li>
            <li class="breadcrumb-item active">Papers</li>
          </ol>
        </nav>
      </div>

      <Col xs='12' className='d-flex justify-content-end'>
        <Button onClick={() => addPaper()} className='me-2' outline color='primary' size='sm'>Add Paper</Button>
        <Button onClick={() => exportPDF()} className='me-2' color='primary' size='sm'>PDF <i className="bi bi-download"></i></Button>
        <Button className='me-2' color='primary' size='sm'>
          <CSVLink
            data={paperList}
            filename={"papers.csv"}
            style={{color:'white'}}
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
            title={"Paper list"}
            loading={loader}
            column={column}
            data={paperList}
            editPaper={editPaper}
          />
        </div>
      </Col>

      <ModalCom open={open} title={`${inputValues?.id ? 'Update Paper' : 'Add Paper'}`} toggle={closeModal}>
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
                      // if (program.department === subjectDetails.department) {
                      return <option key={ky} value={program.id}> {program.name} </option>
                      // }
                    })
                  }
                </Input>
                <FormFeedback>{err.program}</FormFeedback>
              </FormGroup>
            </Col>

            <Col xs='12'>
              <FormGroup>
                <Label>Name</Label>
                <Input type='text' name='name' value={inputValues?.name} onChange={handleChange} invalid={!!err.name} />
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
              <Button color='danger' size='sm' disabled={updating} onClick={deletePaper}>
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

export default Paper