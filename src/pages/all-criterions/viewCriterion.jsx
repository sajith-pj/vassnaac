import React, { useEffect, useState } from 'react'
import { Row, Col, Button, CardHeader, CardBody, Card, Table, CardFooter, ModalBody, ModalFooter, Input } from 'reactstrap';
import axios from '../../axios'
import Loader from '../../components/loader';
import { useNavigate, Link, useParams, useOutletContext } from 'react-router-dom'
import Swal from 'sweetalert2';
import { toast } from 'react-toastify';
import ModalCom from '../../components/modal'

function ViewCriterion() {
  const navigate = useNavigate()
  const params = useParams()
  const user = useOutletContext()

  const [loader, setLoader] = useState(true)
  const [criterionData, setCriterionData] = useState({})
  const [revertModal, setRevertModal] = useState(false);
  const [revertMessage, setRevertMessage] = useState('');
  const [Btnloader, setBtnLoader] = useState(false)

  const getCriterionDetails = () => {
    axios.get(`/criterion/data/show/${params.id}`).then((response) => {
      setCriterionData(response?.data?.data || {});
    }).finally(() => setLoader(false))
  };

  useEffect(() => {
    getCriterionDetails();
  }, []);

  const changeStatusApiCall = (status, message) => {
    setBtnLoader(true)
    axios
      .post(`/criterion/change-status/${params.id}`, { status_to: status, message })
      .then((response) => {
        if (response?.data?.success) {
          toast.success(`Successfully ${status.toLowerCase()}`, {
            position: "top-right",
            autoClose: 2000,
          });
          closeModal()
          getCriterionDetails()
        }
      }).finally(() => setBtnLoader(false))
  };

  const getDeleteButton = () => {
    if (['NAAC_COD', 'IQAC_COD'].includes(user?.user_scope) || user?.id === criterionData?.created_by?.id) {
      if (criterionData?.is_deleted === false) {
        return (
          <Button
            disabled={Btnloader}
            size='sm'
            color='danger'
            onClick={() => changeStatus("DELETED")}
            className='ms-2'
          >
            Delete
          </Button>
        );
      }
    } else {
      if (criterionData?.status === 'PENDING' || criterionData?.status === 'REVERTED') {
        if (criterionData?.is_deleted === false && user?.id === criterionData?.created_by?.id) {
          return (
            <Button
              disabled={Btnloader} size='sm'
              color='danger'
              className='ms-2'
              onClick={() => changeStatus("DELETED")}
            >
              Delete
            </Button>
          );
        }
      }
    }
  };
  const changeStatus = (status, message) => {
    if (status === "DELETED") {
      Swal.fire({
        icon: "warning",
        type: "warning",
        text: "Do you want to delete ?",
        showCancelButton: true,
        showConfirmButton: true,
      }).then((result) => {
        if (result?.isConfirmed) {
          changeStatusApiCall(status, message);
        }
      });
    } else {
      changeStatusApiCall(status, message);
    }
  };

  const getRevertButton = () => {
    if (user?.user_scope === "DEPT_COD") {
      if (
        criterionData?.is_deleted === false &&
        criterionData?.status === "PENDING"
      ) {
        return (
          <Button
            size='sm'
            color='warning'
            onClick={() => setRevertModal(true)}
            className='ms-2'
            disabled={Btnloader}
          >
            Revert
          </Button>
        );
      }
    } else if (user?.user_scope === "NAAC_COD" || user?.user_scope === "IQAC_COD") {
      if (criterionData?.is_deleted === false && (criterionData?.status === "PENDING" || criterionData.status === "VERIFIED")) {
        return (
          <Button
            size='sm'
            color='warning'
            onClick={() => setRevertModal(true)}
            className='ms-2'
            disabled={Btnloader}
          >
            Revert
          </Button>
        );
      }

    }
  };

  const closeModal = () => {
    setRevertMessage('')
    setRevertModal(false)
  }

  const getVerifyButton = () => {
    if (
      criterionData?.status === "PENDING" &&
      criterionData?.status !== "VERIFIED"
    ) {
      if (
        criterionData?.is_deleted === false &&
        user?.user_scope === "DEPT_COD"
      ) {
        return (
          <Button
            type="button"
            size='sm'
            color='info'
            onClick={() => changeStatus("VERIFIED")}
            disabled={Btnloader}
            className='ms-2'
          >
            VERIFY
          </Button>
        );
      }
    }
  };

  const getApproveButton = () => {
    if (user?.user_scope === "NAAC_COD" || user?.user_scope === "IQAC_COD") {
      if (criterionData?.is_deleted === false && (criterionData?.status === "PENDING" || criterionData?.status === "VERIFIED")) {
        return (
          <Button
            type="button"
            size='sm'
            color='success'
            onClick={() => changeStatus("APPROVED")}
            disabled={Btnloader}
            className='ms-2'
          >
            Approve
          </Button>
        );
      }
    }
  };

  const getFileName = (fileName) =>{
      if( fileName === "file2"){
        return <a href={criterionData.file2} rel='noopener noreferrer' target="_blank"><u> View File </u></a>
      } else if( fileName === "file3"){
        return <a href={criterionData.file3} rel='noopener noreferrer' target="_blank"><u> View File </u></a>
      } else if( fileName === "file4"){
        return <a href={criterionData.file4} rel='noopener noreferrer' target="_blank"><u> View File </u></a>
      } else if( fileName === "file5"){
        return <a href={criterionData.file5} rel='noopener noreferrer' target="_blank"><u> View File </u></a>
      } else return fileName;
  }
  if (loader) return <Loader title={'View Criteria'} />
  return (
    <Row>
      <div class="pagetitle">
        <h1>View Criteria</h1>
        <nav>
          <ol class="breadcrumb">
            <li class="breadcrumb-item"><Link to='/all-criterions'>Criterions</Link></li>
            <li class="breadcrumb-item active">View Criteria</li>
          </ol>
        </nav>
      </div>

      <Col xs='12'>
        <Card>
          <CardHeader>Details of C-{params.criterion_id}</CardHeader>
          <CardBody>
            <Table>
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Value</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Date</td>
                  <td> {criterionData?.date} </td>
                </tr>
                <tr>
                  <td>Batch</td>
                  <td>
                    {criterionData?.batch?.name || '-'}
                  </td>
                </tr>

                <tr>
                  <td>Paper</td>
                  <td>
                    {criterionData?.paper?.name || '-'}
                  </td>
                </tr>

                <tr>
                  <td> Program </td>
                  <td>
                    {criterionData?.program?.name || '-'}
                  </td>
                </tr>

                <tr>
                  <td> Department </td>
                  <td>
                    {criterionData?.department?.name || '-'}
                  </td>
                </tr>

                {Object.entries(criterionData?.jdoc)?.length > 0 ?
                  Object.entries(criterionData?.jdoc).map((field) => {
                    
                    return (
                      <tr>
                        <td>{field[1][0]}</td>
                        <td>
                          {
                            typeof field[1][1] === "boolean"
                              ? field[1][1] ? "Yes" : "No"
                              : getFileName(field[1][1])
                          }
                        </td>
                      </tr>
                    );
                  }) : ''}

                <tr>
                  <td> Additional Info Files </td>
                  <td className='whitespace-normal-wrap'>
                    {criterionData?.file1 && (
                      <a target="blank" rel='noopener noreferrer' href={criterionData.file1}>
                        <u>View file </u>
                      </a>
                    )}
                  </td>
                </tr>

                <tr>
                  <td> Additional Info Links </td>
                  <td>
                    {criterionData?.url1 && (
                      <a target="blank" rel='noopener noreferrer' href={criterionData.url1}>
                        <u>View Link</u>
                      </a>
                    )}
                  </td>
                </tr>

                {
                  criterionData?.file2 && (
                    <tr>
                      <td>File 1</td>
                      <td>
                        <a target="blank" rel='noopener noreferrer' href={criterionData.file2}>
                          <u>View Link</u>
                        </a>
                      </td>
                    </tr>
                  )
                }
                {
                  criterionData?.file3 && (
                    <tr>
                      <td>File 2</td>
                      <td>
                        <a target="blank" rel='noopener noreferrer' href={criterionData.file3}>
                          <u>View Link</u>
                        </a>
                      </td>
                    </tr>
                  )
                }
                {
                  criterionData?.file4 && (
                    <tr>
                      <td>File 3</td>
                      <td>
                        <a target="blank" rel='noopener noreferrer' href={criterionData.file4}>
                          <u>View Link</u>
                        </a>
                      </td>
                    </tr>
                  )
                }
                {
                  criterionData?.file5 && (
                    <tr>
                      <td>File 4</td>
                      <td>
                        <a target="blank" rel='noopener noreferrer' href={criterionData.file5}>
                          <u>View Link</u>
                        </a>
                      </td>
                    </tr>
                  )
                }
                <tr>
                  <td> User </td>
                  <td>
                    {criterionData?.created_by?.username}
                  </td>
                </tr>

                <tr>
                  <td> Status </td>
                  <td>{criterionData?.status}</td>
                </tr>
              </tbody>
            </Table>
          </CardBody>
          <CardFooter className='d-flex justify-content-end'>
            {Object.keys(criterionData).length > 1 && (
              <>
                <Button size='sm' outline onClick={() => navigate('/all-criterions')} v className='ms-2'>Go Back</Button>
                {getDeleteButton()}
                {getRevertButton()}
                {getVerifyButton()}
                {getApproveButton()}
              </>
            )}
          </CardFooter>
        </Card>
      </Col>

      <ModalCom open={revertModal} title={'Alert !'} toggle={closeModal}>
        <ModalBody>
          <Row>
            <Col xs='12'>
              <p>Are you sure you want to Revert? Please add your note</p>
            </Col>
            <Col xs='12'>
              <Input type='textarea' rows='4' value={revertMessage} onChange={(e) => setRevertMessage(e.target.value)} />
            </Col>
          </Row>
        </ModalBody>
        <ModalFooter>
          <Button size='sm' onClick={closeModal} disabled={Btnloader}>Cancel</Button>
          <Button size='sm' onClick={() => { changeStatus('REVERTED', revertMessage) }} disabled={!revertMessage || Btnloader} color='warning'>Revert</Button>
        </ModalFooter>
      </ModalCom>
    </Row>
  )
}

export default ViewCriterion