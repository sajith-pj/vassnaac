import React, { useState, useEffect } from 'react'
import { Button, Row, Col, Input, ModalBody, ModalFooter, FormGroup, Label, FormFeedback } from 'reactstrap';
import { toast } from 'react-toastify';
import ModalCom from '../../components/modal'
import axios from '../../axios'
import { isRequired, validateURL } from "../../utils/validators";
import DataTable from '../../components/data-table';
import Swal from "sweetalert2";
import DoneIcon from '../../assets/successIcon.svg'

function NoticeBoard() {

  const [open, setOpen] = useState(false);
  const [err, setErr] = useState({});
  const [inputValues, setInputValues] = useState({});
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [noticeData, setNoticeData] = useState([]);
  const [loader, setLoader] = useState(false);
  const [file, setFile] = useState(false);

  const column = [
    {
      title: "Date", field: "created_at",
      render: (rowData) => {
        return (
          <>
            {
              rowData?.created_at ?
                rowData?.created_at.slice(0, 10) :
                ''
            }
          </>
        )
      },
    },
    { title: "Title", field: "title" },
    { title: "Message", field: "message" },
    {
      title: "Linked", field: "link_to",
      render: (rowData) => {
        return (
          <>
            {
              rowData?.link_to ?
                <img src={DoneIcon} width="20" alt='' /> :
                <span className='text-warning'>Not Linked</span>
            }
          </>
        )
      },
    },
    {
      title: "URL", field: "urls",
      render: (rowData) => {
        return (
          <>
            {
              rowData?.urls ?
                <a href={rowData.urls} target="_blank" rel='noopener noreferrer'>
                  <p className="view_p">Visit URL</p> </a> :
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

  const getNoticeBoard = () => {
    setLoader(true)
    axios.get('/programs/noticeboard/list')
      .then((response) => {
        setNoticeData(response?.data?.data)
      }).finally(() => setLoader(false))
  }
  useEffect(() => {
    getNoticeBoard()
  }, [])

  const addNotice = () => {
    setOpen(true)
  }

  const closeModal = () => {
    setOpen(false)
    setErr({})
    setInputValues({})
    setFile('')
  }

  const handleChange = (e) => {
    if (e.target.name === 'status' || e.target.name === 'link_to') {
      setInputValues({ ...inputValues, [e.target.name]: e.target.checked })
    }
    else {
      setInputValues({ ...inputValues, [e.target.name]: e.target.value })
    }
    setErr({ ...err, [e.target.name]: '' })
  }

  const submiNotice = () => {
    let errObj = {
      title: isRequired(inputValues.title),
      message: isRequired(inputValues.message),
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
          formData.append(key, inputValues[key]);
        }
      }
      axios.put(`/programs/noticeboard/details/${inputValues?.id}`, formData)
        .then((response) => {
          toast.success('Notice updated successfully', {
            position: "top-right",
            autoClose: 2000,
          });
          closeModal()
          getNoticeBoard();
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
      axios.post('/programs/noticeboard/list', formData)
        .then((response) => {
          toast.success('Notice added successfully', {
            position: "top-right",
            autoClose: 2000,
          });
          closeModal()
          getNoticeBoard();
        })
        .catch(err => {
          let msgData = err?.response?.data?.data || {}
          setErr(msgData)
        }).finally(() => setUpdating(false))
    }
  }

  const noticeBoardDelete = () => {
    Swal.fire({
      icon: "warning",
      text: "Do you want to delete!",
      showCancelButton: true,
      confirmButtonText: "Confirm",
    }).then((result) => {
      if (result.isConfirmed) {
        setDeleting(true)
        axios.delete(`/programs/noticeboard/details/${inputValues.id}`, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        })
          .then((response) => {
            toast.success('Notice deleted successfully', {
              position: "top-right",
              autoClose: 2000,
            });
            setDeleting(false)
            closeModal()
            getNoticeBoard()
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

  const editNotice = (data) => {
    let { created_at, created_by, jdoc, is_enabled, ...rest } = data
    setFile(data.files)
    setInputValues(rest)
    setOpen(true)
  }

  const markAsRead = (val) => {
    setLoader(true)
    axios
      .post(`/change-status`, {
        slug: "noticeboard",
        objid: val,
        status: true,
      })
      .then((response) => {
        if (response?.data?.data) {
          getNoticeBoard();
        }
      })
      .catch((err) => {
        console.error(err);
        setLoader(false)
      });
  };

  return (
    <Row className='faq'>
      <div class="pagetitle">
        <h1>Noticeboard</h1>
        <nav>
          <ol class="breadcrumb">
            <li class="breadcrumb-item">Others</li>
            <li class="breadcrumb-item active">Noticeboard</li>
          </ol>
        </nav>
      </div>

      <Col xs='12' className='d-flex justify-content-end'>
        <Button onClick={() => addNotice()} className='me-2' outline color='primary' size='sm'>Add Notice</Button>
      </Col>

      <Col xs='12'>
        <div className='mt-2'>
          <DataTable
            title={"Notice list"}
            loading={loader}
            column={column}
            data={noticeData}
            editNotice={editNotice}
          />
        </div>
      </Col>

      <ModalCom open={open} title={`${inputValues?.id ? 'Update Notice' : 'Add Notice'}`} toggle={closeModal}>
        <ModalBody>
          <Row>
            <Col xs='12'>
              <FormGroup>
                <Label>Notice ID</Label>
                <Input type='text' name='id_no' onChange={handleChange} value={inputValues?.id_no} invalid={!!err.id_no} />
                <FormFeedback>{err.id_no}</FormFeedback>
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
                <Label>Message</Label>
                <Input type='textarea' rows={3} name='message' value={inputValues?.message} onChange={handleChange} invalid={!!err.message} />
                <FormFeedback>{err.message}</FormFeedback>
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
              <FormGroup>
                <Label>File</Label>
                <Input type='file' name='files' onChange={handleChange} />
                {file && inputValues?.id && <a href={file} target="_blank" rel='noopener noreferrer'><p className='view_p'>View Current File</p></a>}
              </FormGroup>
            </Col>

            <Col xs='12' sm='6'>
              <Input type="checkbox" name='status' checked={inputValues?.status} onChange={handleChange} />
              {'  '}
              <Label>
                Mark as Read
              </Label>
            </Col>
            <Col xs='12' sm='6'>
              <Input type="checkbox" name='link_to' checked={inputValues?.link_to} onChange={handleChange} />
              {'  '}
              <Label>
                Link to URL
              </Label>
            </Col>
          </Row>
        </ModalBody>
        <ModalFooter>
          {
            inputValues?.id && (
              <Button color='danger' size='sm' disabled={updating || deleting} onClick={noticeBoardDelete}>
                {deleting ? 'deleteing..' : 'Delete'}
              </Button>
            )
          }

          <Button color='primary' size='sm' disabled={updating || deleting} onClick={submiNotice}>
            {updating ? 'loading..' : 'Submit'}
          </Button>
          <Button size='sm' onClick={closeModal} disabled={updating || deleting} color="secondary">
            Close
          </Button>
        </ModalFooter>
      </ModalCom>
    </Row>
  )
}

export default NoticeBoard