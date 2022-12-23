import React, { useEffect, useState } from 'react'
import { Row, Col, Input, Label, Button } from 'reactstrap';
import axios from '../../axios'
import EditIcon from '@material-ui/icons/Edit';
import Loader from '../../components/loader';
import { useNavigate, useOutletContext, useParams } from 'react-router-dom'
import VisibilityIcon from '@material-ui/icons/Visibility';
import '../criterion-settings/criterion.scss'

function AllCriterions() {
    const navigate = useNavigate()
    const user = useOutletContext()
    const { id = '' } = useParams()
    const [loader, setLoader] = useState(false)
    const [tableLoader, setTableLoader] = useState(false)
    const [criteriaList, setCriteriaList] = useState([])
    const [subCriteriaList, setSubCriteriaList] = useState([])
    const [subCriteriaHead, setSubCriteriaHead] = useState([])
    const [selectedCriteria, setSelectedCriteria] = useState(localStorage.getItem('selected_criterion') || '1')
    const [selectedCriteriaHead, setSelectedCriteriaHead] = useState('')
    const [question, setQuestion] = useState('')
    const [mainTitle, setMainTitle] = useState('')
    const [criterionDetailsTable, setCriterionDetailsTable] = useState([]);
    const [showButton, setShowButton] = useState(false);
    const [toggle, setToggle] = useState(false);

    let selectedCriterionFromLocal = localStorage.getItem('selected_criterion')
    let selectedSubCriterionFromLocal = localStorage.getItem('selected_sub_criterion')

    useEffect(() => {
        if (criteriaList.length > 0) {
            let crite 
            if(selectedCriterionFromLocal){
                crite = criteriaList.filter(val => val.main_id === selectedCriterionFromLocal)
            }else{
                crite = criteriaList.filter(val => val.main_id === selectedCriteria)
            }
            setSubCriteriaList(crite?.[0]?.sub_criterion || [])

            let sub_h = []
            let data = crite?.[0]?.sub_criterion || []
            data.forEach((val) => {
                if (val?.criterion ) {
                    if( user.user_scope === 'TEACHER' || user.user_scope === 'CLUB' ){
                        if( val?.active_button){
                            if (!sub_h.includes(val.criterion)) sub_h.push(val.criterion)
                        }
                    } else if (!sub_h.includes(val.criterion)) sub_h.push(val.criterion)
                }
            })
            setSubCriteriaHead([...sub_h])
            if(selectedSubCriterionFromLocal){
                setSelectedCriteriaHead(selectedSubCriterionFromLocal)
            } else setSelectedCriteriaHead(sub_h[0] ? sub_h[0] : '')
            
        }
    }, [selectedCriteria,toggle]);

    useEffect(() => {
        if (selectedCriterionFromLocal && selectedSubCriterionFromLocal) {
            setLoader(true)
            axios.get("/criterion/assigned-list")
                .then((res) => {
                    setCriteriaList(res?.data?.data || []);
                    setLoader(false)
                    setToggle((prev)=>!prev)
                    // setSelectedCriteria(selectedCriterionFromLocal)
                })
                .catch(() => setLoader(false))

        } else {
            getActiveList()
        }
    }, []);

    const getActiveList = () => {
        setLoader(true)
        axios.get("/criterion/assigned-list")
            .then((res) => {
                setCriteriaList(res?.data?.data || []);
                let sub_c = res?.data?.data?.[0]?.sub_criterion || []
                setSubCriteriaList(sub_c)
                let sub_h = []
                sub_c.forEach((val) => {
                    if (val?.criterion) {
                        if( user.user_scope === 'TEACHER' || user.user_scope === 'CLUB' ){
                            if( val?.active_button){
                                if (!sub_h.includes(val.criterion)) sub_h.push(val.criterion)
                            }
                         } else if (!sub_h.includes(val.criterion)) sub_h.push(val.criterion)
                    }
                })
                setSubCriteriaHead([...sub_h])
                if (id) {
                    let i = id.split('.')?.[0] || '1'
                    setSelectedCriteria(i)
                    setSelectedCriteriaHead(id)
                } else {
                    setSelectedCriteriaHead(sub_h[0] ? sub_h[0] : '')
                }
                setLoader(false)
            })
            .catch(() => setLoader(false))
    }

    useEffect(() => {
        if (selectedCriteriaHead) {
            let data = [...criteriaList]
            let arr = ''
            data.forEach((val) => {
                let sub = val?.sub_criterion?.filter((i) => i.criterion === selectedCriteriaHead) || []
                if (sub.length > 0) {
                    arr = sub?.[0] || {}
                }
            })
            setQuestion(arr?.question)
            setMainTitle(arr?.main_title)
            getSelectedCriterionDetails()
        }
    }, [selectedCriteriaHead])

    // useEffect(()=>{
    //     if(id){
    // let i = id.split('.')?.[0] || '1'
    // setSelectedCriteria(i)
    //     }
    // },[])
    console.log(showButton);
    const getSelectedCriterionDetails = () => {
        setTableLoader(true)
        axios.get(`/criterion/data/list-create`, {
            params: { criteria: `c${selectedCriteriaHead.replaceAll('.', '_')}` },
        })
            .then((response) => {
                setTableLoader(false);
                setCriterionDetailsTable(response?.data?.data || []);
            }).finally(() => setTableLoader(false))

        axios.get(`/criterion/add-button/c${selectedCriteriaHead.replaceAll('.', '_')}`)
            .then((response) => {
                let res = response?.data?.button || false
                setShowButton(res)
            })
    }

    const changeCriterion = (data) => {
        localStorage.setItem('selected_criterion', '')
        localStorage.setItem('selected_sub_criterion', '')
        setSelectedCriteria(data?.main_id)
    }

    if (loader) {
        return <Loader title={'All Criterions'} />
    }

    const addCriterion = () => {
        localStorage.setItem('selected_criterion', selectedCriteria)
        localStorage.setItem('selected_sub_criterion', selectedCriteriaHead)
        navigate(`/criterion/add-details/${selectedCriteriaHead}`)
    }

    const updateCriterion = (id) => {
        localStorage.setItem('selected_criterion', selectedCriteria)
        localStorage.setItem('selected_sub_criterion', selectedCriteriaHead)
        navigate(`/criterion/update-details/${selectedCriteriaHead}/${id}`)
    }

    const viewCriterion = (id) => {
        localStorage.setItem('selected_criterion', selectedCriteria)
        localStorage.setItem('selected_sub_criterion', selectedCriteriaHead)
        navigate(`/criterion/details/view/${id}/${selectedCriteriaHead}`)
    }


    return (
        <Row className='all-criterions'>
            <Col xs='12' sm='6'>
                <div class="pagetitle">
                    <h1>All Criterions</h1>
                </div>
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
                    <Input className='criterion-select' type='select' onChange={(e) => {setSelectedCriteria(e.target.value);localStorage.setItem('selected_criterion', '');localStorage.setItem('selected_sub_criterion', '')}} value={selectedCriteria}>
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
                    <Col xs='12' className='mt-2'>
                        <h5 className='head'>{mainTitle}</h5>
                        <div className='creteria-head'>
                            {
                                subCriteriaHead.map((val, ky) => {
                                    return <button onClick={() => { setSelectedCriteriaHead(val);localStorage.setItem('selected_criterion', '');localStorage.setItem('selected_sub_criterion', '') }} className={`creteria-head-box ${selectedCriteriaHead === val ? 'active' : ''}`} key={ky}>{`C ${val}`}</button>
                                })
                            }
                        </div>

                        <div className='criterion-mobile'>
                            <Label>{mainTitle}</Label>
                            <Input className='criterion-select' type='select' onChange={(e) => {setSelectedCriteriaHead(e.target.value);localStorage.setItem('selected_criterion', '');localStorage.setItem('selected_sub_criterion', '')}} value={selectedCriteriaHead}>
                                {
                                    subCriteriaHead.length > 0 ? subCriteriaHead.map((val, ky) => {
                                        return (
                                            <option key={ky} value={val}>{val}</option>
                                        )
                                    }) : ''
                                }
                            </Input>
                        </div>
                    </Col>
                    : ''
            }

            <Col xs='6' className='mt-3'>
                <h5 className='head'>Criteria {selectedCriteriaHead}</h5>
            </Col>

            <Col xs='6' className='d-flex justify-content-end mt-3'>
                {
                    (showButton && selectedCriteriaHead.length > 0) &&
                    <Button
                        onClick={addCriterion}
                        className='me-2' outline size='sm' color='primary' style={{ maxHeight: '35px' }}
                    >
                        Add Details
                    </Button>
                }

            </Col>
            <Col xs='12'>
                <p>{question}</p>
            </Col>

            {
                tableLoader && <Loader />
            }

            {
                !tableLoader && criterionDetailsTable.length > 0 ?
                    <Col xs='12'>
                        <table className='naac-table'>
                            <thead className='thead-criterion-all'>
                                <tr>
                                    <th>Date</th>
                                    <th>Department</th>
                                    <th>ID</th>
                                    <th>Status</th>
                                    <th>User</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {
                                    criterionDetailsTable.map((val, ky) => {
                                        return (
                                            <tr key={ky} style={{ cursor: 'auto' }}>
                                                <td> {val?.date} </td>
                                                <td> {val?.department?.name} </td>
                                                <td> {val?.id} </td>
                                                <td> {val?.status} </td>
                                                <td> {val?.created_by?.username} </td>
                                                <td>
                                                    <VisibilityIcon
                                                        style={{ marginRight: '10px', cursor: 'pointer' }}
                                                        onClick={() => { viewCriterion(val.id) }}
                                                    />
                                                    {
                                                        !['DEPT_COD', 'CLUB', 'TEACHER'].includes(user?.user_scope) ?
                                                            <EditIcon
                                                                style={{ cursor: 'pointer' }}
                                                                onClick={() => updateCriterion(val.id)}
                                                            />
                                                            :
                                                            ['PENDING', 'REVERTED'].includes(val?.status) ?
                                                                <EditIcon
                                                                    style={{ cursor: 'pointer' }}
                                                                    onClick={() => updateCriterion(val.id)}
                                                                />
                                                                : ''
                                                    }
                                                </td>
                                            </tr>
                                        )
                                    })
                                }
                            </tbody>
                        </table>
                    </Col>
                    :
                    <div style={{ width: '100%', textAlign: 'center', color: '#333', marginTop: '20px' }}>No Data Available!</div>
            }
        </Row>
    )
}

export default AllCriterions