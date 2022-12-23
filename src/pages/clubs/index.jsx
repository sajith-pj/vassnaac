import React, { useEffect, useState } from 'react'
import { Button, Row, Col, Input, ModalBody, ModalFooter, FormGroup, Label, FormFeedback, } from 'reactstrap';
import { toast } from 'react-toastify';
import ModalCom from '../../components/modal'
import Swal from "sweetalert2";
import axios from '../../axios'
import DataTable from '../../components/data-table';
import { isRequired } from "../../utils/validators";
// import Creatable from "react-select/lib/Creatable";
import Select from "react-select";
import { useNavigate } from "react-router-dom";

function Clubs() {
  const navigate = useNavigate();

  const [loader, setLoader] = useState(false);
  const [clubs, setClubs] = useState([]);
  const [open, setOpen] = useState(false);
  const [err, setErr] = useState({});
  const [inputValues, setInputValues] = useState({
    status: false,
    description: '',
    name: '',
    code: '',
    established_at: '',
  });
  const [updating, setUpdating] = useState(false);
  const [usersList, setUsersList] = useState([]);
  const [selectedUser, setSelectedUsers] = useState([]);

  const [openAssign, setOpenAssign] = useState(false);
  const [selectedClub, setSelectedClub] = useState('');
  const [usersToBeAssigned, setUsersToBeAssigned] = useState([]);
  const [assigning, setAssigning] = useState(false);
  const [clubData, setClubData] = useState({});
  const [fecthing, setFetching] = useState(false);

  const column = [
    { title: "Name", field: "name" },
    { title: "Code", field: "code" },
    { title: "Description", field: "description", },
    { title: "Established On", field: "established_at", },
    {
      title: "Status", field: "status",
      render: (rowData) => {
        return (
          <>
            {
              rowData.status ?
                <Button color='danger' size='sm' onClick={() => updateStatus('disable', rowData.id)} >Disable Club</Button> :
                <Button color='success' size='sm' onClick={() => updateStatus('enable', rowData.id)}>Enable Club</Button>
            }
          </>
        )
      },
    },
  ];

  useEffect(() => {
    getClubsList()
    getUserList()
  }, [])


  const getUserList = () => {
    axios.get("/user/list").then((response) => {
      setUsersList(response?.data?.data);
    });
  };


  const getClubsList = () => {
    setLoader(true);
    axios.get('/programs/clubs/list')
      .then((response) => {
        setClubs(response?.data?.data)
        setLoader(false);
      })
      .catch(err => console.error(err))
  }

  const updateStatus = (type, id) => {
    setLoader(true)
    axios.post(`/change-status`, {
      slug: "clubs",
      objid: id,
      status: type === 'disable' ? false : true,
    })
      .then(response => {
        toast.success('Club status updated successfully', {
          position: "top-right",
          autoClose: 2000,
        });
        getClubsList();
      })
      .catch(() => setLoader(false))
  }

  const addClub = () => {
    setErr({})
    setSelectedUsers([])
    setLoader(false);
    setOpen(true)
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

  const deleteClub = () => {
    Swal.fire({
      icon: "warning",
      text: "Do you want to delete!",
      showCancelButton: true,
      confirmButtonText: "Confirm",
    }).then((result) => {
      if (result.isConfirmed) {
        setUpdating(true)
        axios.delete(`/programs/clubs/details/${inputValues?.id}`, {})
          .then(() => {
            toast.success('Club deleted successfully', {
              position: "top-right",
              autoClose: 2000,
            });
            setUpdating(false)
            closeModal()
            getClubsList();
          }).catch(() => {
            setUpdating(false)
          })
      }
    });
  }

  const submitClub = () => {
    let errObj = {
      name: isRequired(inputValues.name),
      code: isRequired(inputValues.code),
      description: isRequired(inputValues.description),
      established_at: isRequired(inputValues.established_at),
      user: selectedUser.length === 0 ? '*Select atleast one user' : ''
    }
    if (Object.values(errObj).some((val) => val !== '')) {
      setErr(errObj)
      return
    }
    else if (inputValues?.id) {
      setUpdating(true)
      let userId = []
      selectedUser.forEach((val) => {
        userId.push(val.id)
      })
      let { user_details, tableData, ...rest } = inputValues
      axios.put(`/programs/clubs/details/${inputValues?.id}`, { ...rest, user: userId })
        .then((response) => {
          toast.success('Club updated successfully', {
            position: "top-right",
            autoClose: 2000,
          });
          closeModal()
          getClubsList();
        })
        .catch(err => {
          let msgData = err?.response?.data?.data || {}
          setErr(msgData)
        }).finally(() => setUpdating(false))
    }
    else {
      setUpdating(true)
      let userId = []
      selectedUser.forEach((val) => {
        userId.push(val.id)
      })
      axios.post('/programs/clubs/list', { ...inputValues, user: userId })
        .then((response) => {
          toast.success('Club added successfully', {
            position: "top-right",
            autoClose: 2000,
          });
          closeModal()
          getClubsList();
        })
        .catch(err => {
          let msgData = err?.response?.data?.data || {}
          setErr(msgData)
        }).finally(() => setUpdating(false))
    }
  }

  const editClub = (data) => {
    setInputValues(data)
    setErr({})
    setSelectedUsers(data?.user_details || [])
    setOpen(true)
  }

  const viewClub = (data) => {
    console.log(data)
    navigate(`/club/${data.id}`)
  }

  const handleChangeUser = (data) => {
    setSelectedUsers(data)
    if (data.length > 0) {
      setErr({ ...err, user: '' })
    } else setErr({ ...err, user: '*Select atleast one user' })
  }

  const assignUser = () => {
    setOpenAssign(true)
  }

  const closeAssignUser = () => {
    setUsersToBeAssigned([])
    setSelectedClub('')
    setClubData({})
    setOpenAssign(false)
  }

  const assignUsersToClub = () => {
    setAssigning(true)
    let arr = usersToBeAssigned.map(val => val.id)
    axios.post('programs/clubs/adduser', {
      club_id: selectedClub,
      user_list: arr
    })
      .then((response) => {
        if (response?.data?.data) {
          toast.success('Users assigned to the Club successfully', {
            position: "top-right",
            autoClose: 2000,
          });
          closeAssignUser()
          getClubsList()
        }
      }).catch(() => {
        toast.error('Oops, something went wrong', {
          position: "top-right",
          autoClose: 2000,
        });
      }).finally(() => setAssigning(false))
  }

  const handleChangeAssignSelect = (data) => {
    setUsersToBeAssigned(data)
  }

  const handleAssignChange = (e) => {
    setClubData({})
    setSelectedClub(e.target.value)
    if(e.target.value){
      setFetching(true)
      axios.get(`/programs/clubs/details/${e.target.value}`)
      .then((response) => {
        setClubData(response?.data?.data || {});
        setUsersToBeAssigned(response?.data?.data?.user_details || [])
      }).finally(()=>setFetching(false))
    }
  }
  return (
    <Row>
      <div class="pagetitle">
        <h1>All Clubs List</h1>
        <nav>
          <ol class="breadcrumb">
            <li class="breadcrumb-item">Features</li>
            <li class="breadcrumb-item active">Club</li>
          </ol>
        </nav>
      </div>


      <Col xs='12' className='d-flex justify-content-end'>
        <Button onClick={() => assignUser()} className='me-2' outline size='sm' style={{ maxHeight: '40px' }}>Assign Users</Button>
        <Button onClick={() => addClub()} className='me-2' outline color='primary' size='sm' style={{ maxHeight: '40px' }}>Add Club</Button>
      </Col>
      <Col xs='12'>
        <div className='mt-2'>
          <DataTable
            title={"Club list"}
            loading={loader}
            column={column}
            data={clubs}
            editClub={editClub}
            viewClub={viewClub}
          />
        </div>
      </Col>

      <ModalCom open={open} title={`${inputValues?.id ? 'Update Club' : 'Add Club'}`} toggle={closeModal}>
        <ModalBody>
          <Row>
            <Col xs='12'>
              <FormGroup>
                <Label>Name</Label>
                <Input type='text' name='name' onChange={handleChange} value={inputValues?.name} invalid={!!err.name} />
                <FormFeedback>{err.name}</FormFeedback>
              </FormGroup>
            </Col>
            <Col xs='12'>
              <FormGroup>
                <Label>Select users</Label>
                <Select
                  value={selectedUser}
                  onChange={handleChangeUser}
                  options={usersList}
                  getOptionLabel={option =>
                    `${option.username}`
                  }
                  getOptionValue={option =>
                    `${option.id}`
                  }
                  isMulti
                  placeholder='Select Users'
                />
                {err.user && <span className='text-danger' style={{ fontSize: '14px' }}>{err.user}</span>}
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
              <Button color='danger' size='sm' disabled={updating} onClick={deleteClub}>
                Delete
              </Button>
            )
          }
          <Button color='primary' size='sm' disabled={updating} onClick={submitClub}>
            Submit
          </Button>
          <Button size='sm' onClick={closeModal} disabled={updating} color="secondary">
            Close
          </Button>
        </ModalFooter>
      </ModalCom>

      {/* assign */}
      <ModalCom open={openAssign} title={'Assign Users to Club'} toggle={closeAssignUser}>
        <ModalBody>
          <Row>
            <Col xs='12'>
              <FormGroup>
                <Label>Select Club</Label>
                <Input type='select' onChange={handleAssignChange} name='club' value={selectedClub}>
                  <option value={''}>Select club</option>
                  {
                    clubs.map((val, ky) => {
                      return (
                        <option key={ky} value={val.id}>{val.name}</option>
                      )
                    })
                  }
                </Input>
                <FormFeedback>{err.name}</FormFeedback>
              </FormGroup>
            </Col>
            <Col xs='12'>
              {fecthing && 'Loading...!'}
              {
                Object.keys(clubData).length > 0 ?
                  <FormGroup>
                    <Label>Select Users</Label>
                    <Select
                      value={usersToBeAssigned}
                      onChange={handleChangeAssignSelect}
                      options={usersList}
                      getOptionLabel={option =>
                        `${option.username}`
                      }
                      getOptionValue={option =>
                        `${option.id}`
                      }
                      isMulti
                      placeholder='Select Users'
                    />
                    {err.user && <span className='text-danger' style={{ fontSize: '14px' }}>{err.user}</span>}
                  </FormGroup>
                  : ''
              }

            </Col>

          </Row>
        </ModalBody>
        <ModalFooter>
          <Button color='primary' size='sm' disabled={assigning || !selectedClub} onClick={assignUsersToClub}>
            {assigning ? 'assigning..' : 'Assign'}
          </Button>
          <Button size='sm' onClick={closeAssignUser} disabled={assigning} color="secondary">
            Close
          </Button>
        </ModalFooter>
      </ModalCom>
    </Row>
  )
}

export default Clubs