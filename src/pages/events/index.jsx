import React, { useEffect, useState } from 'react'
import { Button, Row, Col, Input, ModalBody, ModalFooter, FormGroup, Label, FormFeedback } from 'reactstrap';
import { toast } from 'react-toastify';
import ModalCom from '../../components/modal'
import Swal from "sweetalert2";
import axios from '../../axios'
import DataTable from '../../components/data-table';
import { isRequired } from "../../utils/validators";
import DoneIcon from '../../assets/successIcon.svg'

function Events() {

    const [open, setOpen] = useState(false);
    const [err, setErr] = useState({});
    const [inputValues, setInputValues] = useState({});
    const [updating, setUpdating] = useState(false);
    const [files, setFiles] = useState({ files: '', image: '' })
    const [departmentList, setDepartmentList] = useState([]);
    const [events, setEvents] = useState([]);
    const [deleting, setDeleting] = useState(false);
    const [loader, setLoader] = useState(false);

    const column = [
        { title: "Date", field: "date" },
        { title: "Title", field: "title" },
        { title: "Tags", field: "tags" },
        { title: "Department", field: "department_name" },
        {
            title: "Image", field: "images",
            render: (rowData) => {
                return (
                    <>
                        {
                            rowData?.images ?
                                <a href={rowData.images} target="_blank" rel='noopener noreferrer'>
                                    <p className="view_p">View Image</p> </a> :
                                '-'
                        }
                    </>
                )
            },
        },
        {
            title: "File", field: "files",
            render: (rowData) => {
                return (
                    <>
                        {
                            rowData?.files ?
                                <a href={rowData.files} target="_blank" rel='noopener noreferrer'>
                                    <p className="view_p">View File</p> </a> :
                                '-'
                        }
                    </>
                )
            },
        },
        {
            title: "Publish", field: "status",
            render: (rowData) => {
              return (
                <>
                  {
                    rowData?.status ?
                      <img src={DoneIcon} width="20" alt='' /> :
                      <Button color='danger' size='sm' onClick={() =>  markAsRead(rowData.id)}>Mark as Read</Button>
                  }
                </>
              )
            },
          },
    ];

    useEffect(() => {
        getEvents()
        getDepartmentsList()
    }, [])

    const markAsRead = (val) => {
        setLoader(true)
        axios
          .post(`/change-status`, {
            slug: "events",
            objid: val,
            status: true,
          })
          .then((response) => {
            if (response?.data?.data) {
              getEvents();
            }
          })
          .catch((err) => {
            console.error(err);
            setLoader(false)
          });
      };

    const getEvents = () => {
        setLoader(true)
        axios.get('/programs/events/list')
            .then((response) => {
                setEvents(response?.data?.data)
            }).finally(()=>setLoader(false))
    }

    const getDepartmentsList = () => {
        axios
            .get("/programs/department/list ")
            .then((response) => {
                setDepartmentList(response?.data?.data);
            })
            .catch((err) => console.log(err));
    };

    const addEvent = () => {
        setErr({})
        setOpen(true)
    }

    const closeModal = () => {
        setErr({})
        setFiles({})
        setOpen(false)
    }

    const handleChange = (e) => {
        if (e.target.name === 'status') {
            setInputValues({ ...inputValues, [e.target.name]: e.target.checked })
        }
        else if (['images', 'files'].includes(e.target.name)) {
            setInputValues({ ...inputValues, [e.target.name]: e.target.files[0] })
        }
        else {
            setInputValues({ ...inputValues, [e.target.name]: e.target.value })
        }
        setErr({ ...err, [e.target.name]: '' })
    }

    const submitEvent = () => {
        let errObj = {
            title: isRequired(inputValues.title),
            date: isRequired(inputValues.date),
            department: isRequired(inputValues.department),
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
                    formData.append(key, inputValues[key]);
                }
            }
            axios.put(`/programs/events/details/${inputValues?.id}`, formData)
                .then((response) => {
                    toast.success('Event updated successfully', {
                        position: "top-right",
                        autoClose: 2000,
                    });
                    closeModal()
                    getEvents();
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
                    formData.append(key, inputValues[key]);
                }
            }
            axios.post('/programs/events/list', formData)
                .then((response) => {
                    toast.success('Event added successfully', {
                        position: "top-right",
                        autoClose: 2000,
                    });
                    closeModal()
                    getEvents();
                })
                .catch(err => {
                    let msgData = err?.response?.data?.data || {}
                    setErr(msgData)
                }).finally(() => setUpdating(false))
        }
    }

    const deleteEvent = () => {
        Swal.fire({
            icon: "warning",
            text: "Do you want to delete!",
            showCancelButton: true,
            confirmButtonText: "Confirm",
        }).then((result) => {
            if (result.isConfirmed) {
                setDeleting(true)
                axios.delete(`/programs/events/details/${inputValues.id}`, {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                })
                    .then((response) => {
                        toast.success('Event deleted successfully', {
                            position: "top-right",
                            autoClose: 2000,
                        });
                        setDeleting(false)
                        closeModal()
                    })
                    .catch(() => {
                        toast.error('Oops, Deletion Failed', {
                            position: "top-right",
                            autoClose: 2000,
                        });
                        setDeleting(false)
                    })
            }
        });
    };

    const editEvent = (data) => {
        setInputValues(data)
        setFiles({ files: data?.files, image: data?.images })
        setOpen(true)
    }
    return (
        <Row>
            <div class="pagetitle">
                <h1>All Event List</h1>
            </div>

            <Col xs='12' className='d-flex justify-content-end'>
                <Button onClick={() => addEvent()} className='me-2' outline color='primary' size='sm' style={{ maxHeight: '40px' }}>Add Event</Button>
            </Col>

            <Col xs='12'>
                <div className='mt-2'>
                    <DataTable
                        title={"Event list"}
                        loading={loader}
                        column={column}
                        data={events}
                        editEvent={editEvent}
                    />
                </div>
            </Col>

            <ModalCom open={open} title={`${inputValues?.id ? 'Update Event' : 'Add Event'}`} toggle={closeModal}>
                <ModalBody>
                    <Row>
                        <Col xs='12'>
                            <FormGroup>
                                <Label>Date</Label>
                                <Input type='date' name='date' onChange={handleChange} value={inputValues?.date} invalid={!!err.date} />
                                <FormFeedback>{err.date}</FormFeedback>
                            </FormGroup>
                        </Col>
                        <Col xs='12'>
                            <FormGroup>
                                <Label>Title</Label>
                                <Input type='text' name='title' value={inputValues?.title} onChange={handleChange} invalid={!!err.title} />
                                <FormFeedback>{err.title}</FormFeedback>
                            </FormGroup>
                        </Col>
                        <Col xs='12'>
                            <FormGroup>
                                <Label>Tags</Label>
                                <Input type='textarea' rows={2} name='tags' value={inputValues?.tags} onChange={handleChange} />
                            </FormGroup>
                        </Col>

                        <Col xs='12'>
                            <FormGroup>
                                <Label>Department</Label>
                                <Input type='select' name='department' value={inputValues?.department} onChange={handleChange} invalid={!!err.department}>
                                    <option value=""> Department</option>
                                    {
                                        departmentList.map((department, index) => (
                                            <option value={department.id} key={index}> {department.name} </option>
                                        ))
                                    }
                                </Input>
                                <FormFeedback>{err.department}</FormFeedback>
                            </FormGroup>
                        </Col>

                        <Col xs='12'>
                            <FormGroup>
                                <Label>Image</Label>
                                <Input type='file' name='images' onChange={handleChange} />
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
                            <Input type="checkbox" name='status' checked={inputValues?.status} onChange={handleChange} />
                            {'  '}
                            <Label>
                                Mark as Read
                            </Label>
                        </Col>
                    </Row>
                </ModalBody>
                <ModalFooter>
                    {
                        inputValues?.id && (
                            <Button color='danger' size='sm' disabled={updating || deleting} onClick={deleteEvent}>
                                {deleting ? 'deleting...' : 'Delete'}
                            </Button>
                        )
                    }
                    <Button color='primary' size='sm' disabled={updating || deleting} onClick={submitEvent}>
                        Submit
                    </Button>
                    <Button size='sm' onClick={closeModal} disabled={updating || deleting} color="secondary">
                        Close
                    </Button>
                </ModalFooter>
            </ModalCom>
        </Row>
    )
}

export default Events