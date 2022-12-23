import React, { useEffect, useState } from 'react'
import { Row, Col, Input, Label, Button } from 'reactstrap';
import axios from '../../axios'
import './criterion.scss'
import EditIcon from '@material-ui/icons/Edit';
import Loader from '../../components/loader';
import { useNavigate } from 'react-router-dom'

function CriterionSettings() {
    const navigate = useNavigate()
    const [loader, setLoader] = useState(false)
    const [criteriaList, setCriteriaList] = useState([])
    const [subCriteriaList, setSubCriteriaList] = useState([])
    const [subCriteriaHead, setSubCriteriaHead] = useState([])
    const [selectedCriteria, setSelectedCriteria] = useState('1')
    const [selectedCriteriaHead, setSelectedCriteriaHead] = useState('All')

    useEffect(() => {
        if (criteriaList.length > 0) {
            setSelectedCriteriaHead('All')
            let crite = criteriaList.filter(val => val.main_id === selectedCriteria)
            setSubCriteriaList(crite?.[0]?.sub_criterion || [])

            let sub_h = []
            let data = crite?.[0]?.sub_criterion || []
            data.forEach((val) => {
                if (val?.criterion) {
                    let a = val.criterion.split('.')
                    let entry = (a[0] && a[1]) ? a[0] + '.' + a[1] : ''
                    if (!sub_h.includes(entry)) sub_h.push(entry)
                }
            })
            setSubCriteriaHead(['All', ...sub_h])
        }
    }, [selectedCriteria]);

    useEffect(() => {
        getActiveList()
    }, []);

    const getActiveList = () => {
        setLoader(true)
        axios.get("/criterion/active-list")
            .then((res) => {
                setCriteriaList(res?.data?.data || []);
                let sub_c = res?.data?.data?.[0]?.sub_criterion || []
                setSubCriteriaList(sub_c)
                let sub_h = []
                sub_c.forEach((val) => {
                    if (val?.criterion) {
                        let a = val.criterion.split('.')
                        let entry = (a[0] && a[1]) ? a[0] + '.' + a[1] : ''
                        if (!sub_h.includes(entry)) sub_h.push(entry)
                    }
                })
                setSubCriteriaHead(['All', ...sub_h])
                setLoader(false)
            })
            .catch(() => setLoader(false))
    }

    const changeCriterion = (data) => {
        setSelectedCriteria(data?.main_id)
    }

    const editCriterion = (id) => {
        navigate(`/criterion-settings/update/${id}`)
    }

    if (loader) {
        return <Loader title={'Criterion Settings'} />
    }
    return (
        <Row>
            <Col xs='12' sm='6'>
                <div class="pagetitle">
                    <h1>Criterion Settings</h1>
                    <nav>
                        <ol class="breadcrumb">
                            <li class="breadcrumb-item">Admin Tools</li>
                            <li class="breadcrumb-item active">Criterions</li>
                        </ol>
                    </nav>
                </div>
            </Col>
            <Col xs='12' sm='6' className='d-flex justify-content-end'>
                <Button
                    onClick={() => navigate('/add-criterion')}
                    className='me-2' outline size='sm' color='primary' style={{ maxHeight: '35px' }}
                >
                    Add Criterion
                </Button>
            </Col>


            <Col xs='12'>
                <div className='criterion'>
                    {
                        criteriaList.length > 0 ? criteriaList.map((val, k) => {
                            return (
                                <button
                                    className={`criterion-btn ${selectedCriteria === val.main_id ? 'active' : ''}`}
                                    key={k}
                                    onClick={() => changeCriterion(val)}
                                >
                                    Criteria {val.main_id}
                                </button>
                            )
                        })
                            :
                            ''
                    }
                </div>

                <div className='criterion-mobile'>
                    <Label>Selected Criterion</Label>
                    <Input className='criterion-select' type='select' onChange={(e) => setSelectedCriteria(e.target.value)} name='club' value={selectedCriteria}>
                        {
                            criteriaList.length > 0 ? criteriaList.map((val, ky) => {
                                return (
                                    <option key={ky} value={val.main_id}>Criteria {val.main_id}</option>
                                )
                            }) : ''
                        }
                    </Input>
                </div>
            </Col>

            {
                subCriteriaList.length > 0 ?
                    <>
                        <Col xs='12' className='mt-2'>
                            <div className='creteria-head'>
                                {
                                    subCriteriaHead.map((val, ky) => {
                                        return <button onClick={() => { setSelectedCriteriaHead(val) }} className={`creteria-head-box ${selectedCriteriaHead === val ? 'active' : ''}`} key={ky}>{val}</button>
                                    })
                                }
                            </div>
                        </Col>
                        <Col xs='12' className='mt-1'>
                            <table className='naac-table'>
                                <tbody className='blue-rows'>
                                    {
                                        subCriteriaList.map((val, ky) => {
                                            if (selectedCriteriaHead === 'All' || val.criterion.includes(selectedCriteriaHead)) {
                                                return (
                                                    <tr key={ky} onClick={() => editCriterion(val.id)}>
                                                        <td> {val.criterion} </td>
                                                        <td style={{ whiteSpace: "unset" }}> {val.question} </td>
                                                        <td style={{ whiteSpace: "unset" }}> {val.description} </td>
                                                        <td><EditIcon /></td>
                                                    </tr>
                                                )
                                            } else return null
                                        })
                                    }
                                </tbody>
                            </table>
                        </Col>
                    </>
                    :
                    ''
            }
        </Row>
    )
}

export default CriterionSettings