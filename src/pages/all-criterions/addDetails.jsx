import React, { useEffect, useState, useContext } from 'react'
import { Row, Col, Input, Label, Button, Card, CardBody, CardFooter, FormGroup, CardHeader, FormFeedback, } from 'reactstrap';
import axios from '../../axios'
import Loader from '../../components/loader';
import { useNavigate, Link, useParams, useOutletContext } from 'react-router-dom'
import '../criterion-settings/criterion.scss'
import { toast } from 'react-toastify';
import { isRequired } from "../../utils/validators";
import PermissionContext from "../../store/permissionContext"

function AddCriterionDetails() {
    const navigate = useNavigate()
    const params = useParams()
    const { data_id = '' } = useParams()
    const user = useOutletContext()
    const ctx = useContext(PermissionContext);
    const allow_data_entry = ctx?.permissions?.allow_data_entry || false

    const [loader, setLoader] = useState(true)
    const [departmentList, setDepartmentList] = useState([]);
    const [paperList, setPaperList] = useState([]);
    const [batchList, setBatchList] = useState([]);
    const [programList, setProgramsList] = useState([]);
    const [dataField, setDataField] = useState({});
    const [answerData, setAnswerData] = useState({
        user: 1,
    }) // TO HANDLE THE STATIC AND OPTIONAL DATA SEPERATE
    const [files, setFiles] = useState({});
    const [answerDataJoc, setAnswerDataJdoc] = useState({}); // TO HANDLE THE JDOC DATA SEPERATE
    const [submitLoader, setSubmitLoader] = useState(false)
    const [err, setErr] = useState({})

    useEffect(() => {
        if (allow_data_entry) {
            getCriterionData()
            getFeatures()
            if (data_id) getCriterionDataById()
            setUserDepartment()
        } else {
            navigate('/all-criterions')
        }

    }, [])

    const setUserDepartment = ()=>{
        if (
            user.user_scope === "CLUB" ||
            user.user_scope === "TEACHER" ||
            user.user_scope === "DEPT_COD"
        ) {
            setAnswerData({...answerData, department: user?.department?.id})
        }
    }
    const getCriterionData = () => {
        axios.get(`/criterion/add-button/c${params.id.replaceAll('.', '_')}`)
            .then((response) => {
                let res = response?.data?.button || false
                if (!res) navigate('/all-criterions')
            })

        axios.get(`/criterion/show-question-fields/c${params.id.replaceAll('.', '_')}`).then((response) => {
            if (response?.data?.data) {
                setDataField(response?.data?.data || {});
            } else setDataField({});

        })
            .finally(() => setLoader(false))
    };

    const getCriterionDataById = () => {
        axios.get(`/criterion/data/foreign-key/${data_id}`).then((response) => {
            let res_data = response?.data?.data || {}
            // if (['PENDING', 'REVERTED'].includes(res_data?.status) && ['DEPT_COD', 'CLUB', 'TEACHER'].includes(user?.user_scope)) {
            //     navigate(-1)
            // }
            setAnswerDataJdoc(res_data?.jdoc || {});
            setAnswerData({ ...res_data, user: 1 });

        })
            .catch((err) => console.log(err))
            .finally(() => setLoader(false))
    };

    const getFeatures = () => {
        axios.get("/features").then((response) => {
            const { batch, subjects, programs, departments } = response.data.data;
            setBatchList(batch);
            setDepartmentList(departments);
            setPaperList(subjects);
            setProgramsList(programs);
        });
    };

    const postAnswer = (e) => {
        e.preventDefault()
        let validate = validateData()
        if (!validate) {
            return
        }
        setSubmitLoader(true)
        if (data_id) {
            updateAnswer()
        } else {
            axios
                .post("/criterion/data/list-create", {
                    ...answerData,
                    status: "PENDING",
                    created_by: user.id,
                    criterion: dataField?.criterion,
                    criteria: dataField?.criterion_id,
                    jdoc: answerDataJoc,
                    is_active: true,
                    is_enabled: true,
                    data: [],
                    logs: "",
                })
                .then((response) => {
                    if (response?.data?.data) {
                        if (Object.values(files).length > 0) {
                            postFiles(response?.data?.data?.id);
                        } else {
                            toast.success('Added successfully', {
                                position: "top-right",
                                autoClose: 2000,
                            })
                            setTimeout(() => {
                                setSubmitLoader(false);
                                navigate('/all-criterions')
                            }, 1500)
                        }
                    }
                }).catch(() => {
                    setSubmitLoader(false)
                    toast.error('Ops, Something went wrong', {
                        position: "top-right",
                        autoClose: 2000,
                    })
                })
        }
    }

    const postFiles = (id) => {
        let formData = new FormData();
        for (let file in files) {
            formData.append(file, files[file]);
        }
        axios
            .put(`/criterion/file/update/${id}`, formData, {
                headers: { "Content-Type": "multipart/form-data" },
            })
            .then((response) => {
                toast.success('Added Successfully', {
                    position: "top-right",
                    autoClose: 2000,
                })
                setTimeout(() => {
                    setSubmitLoader(false);
                    navigate('/all-criterions')
                }, 1500)
            }).catch(() => {
                toast.warn('Details Added, However File updation failed!', {
                    position: "top-right",
                    autoClose: 2000,
                })
                setTimeout(() => {
                    setSubmitLoader(false);
                    navigate('/all-criterions')
                }, 1500)
            })
    };

    const updateAnswer = () => {
        axios
            .put(`/criterion/data/show/${data_id}`, {
                ...answerData,
                created_by: user.id,
                criterion: dataField?.criterion,
                criteria: dataField?.criterion_id,
                jdoc: answerDataJoc,
                is_active: true,
                is_enabled: true,
                data: dataField,
                logs: "",
                status: "PENDING"
            })
            .then((response) => {
                if (response.data.data) {
                    if (
                        files.file1 ||
                        files.file2 ||
                        files.file3 ||
                        files.file4 ||
                        files.file5
                    ) {
                        updatFiles();
                    } else {
                        toast.success('Updated successfully', {
                            position: "top-right",
                            autoClose: 2000,
                        })
                        setTimeout(() => {
                            setSubmitLoader(false);
                            navigate('/all-criterions')
                        }, 1500)
                    }
                }
            }).catch(() => {
                setSubmitLoader(false)
                toast.error('Ops, Something went wrong', {
                    position: "top-right",
                    autoClose: 2000,
                })
            })
    }

    const updatFiles = () => {
        let formData = new FormData();
        for (let file in files) {
            if (files[file] !== null) {
                formData.append(file, files[file]);
            }
        }
        axios
            .put(`/criterion/file/update/${data_id}`, formData, {
                headers: { "Content-Type": "multipart/form-data" },
            })
            .then((response) => {
                toast.success('Updated Successfully', {
                    position: "top-right",
                    autoClose: 2000,
                })
                setTimeout(() => {
                    setSubmitLoader(false);
                    navigate('/all-criterions')
                }, 1500)
            }).catch(() => {
                toast.warn('Details Updated, However File updation failed!', {
                    position: "top-right",
                    autoClose: 2000,
                })
                setTimeout(() => {
                    setSubmitLoader(false);
                    navigate('/all-criterions')
                }, 1500)
            })
    };

    const handleOptionalFieldChange = (e) => {
        const { name, value } = e.target
        if (name === 'department') {
            setAnswerData({ ...answerData, 'department': Number(value), });
        }
        else if (name === 'program') {
            setAnswerData({
                ...answerData,
                [name]: Number(value),
                'paper': ''
            });
        }
        else {
            setAnswerData({
                ...answerData,
                [name]: Number(value),
            });
        }
        setErr({ ...err, [name]: '' })
    };

    const handleFiles = (event, field) => {
        const { name_id, name } = field;
        const { type = '' } = event?.target?.files[0];
        const acceptMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/bmp', 'application/pdf']
        if (!acceptMimeTypes.includes(type)) {
            toast.error('The file format is not supported', {
                position: "top-right",
                autoClose: 1500,
            })
            return
        }
        setFiles({ ...files, [event.target.name]: event.target.files[0] });
        console.log(field);
        setAnswerDataJdoc({
                ...answerDataJoc,
                [name_id]: [field[name], name],
            })
    }

    const handleJdocAnswerChange = (event, field) => {
        console.log(field);

        console.log("checking for name ID working")
        const {name, value, checked,id } = event.target
        if (field.type === 'checkbox') {
            setAnswerDataJdoc({
                ...answerDataJoc,
                [id]: [name,checked],
            })
        } else {
            setAnswerDataJdoc({
                ...answerDataJoc,
                [id]: [name,value],
            })
        }

    };

    const handleAnswerChange = (event) => {
        setAnswerData({ ...answerData, [event.target.name]: event.target.value });
        if (event.target.name === 'date') setErr({ ...err, date: '' })
    };

    const validateData = () => {
        console.log('answerDataanswerData', answerData)
        let opt_fields = dataField?.optional_fields.filter((val) => val.status)
        let err = {
            date: isRequired(answerData.date)
        }
        opt_fields.forEach((val) => {
            if (!answerData[val.name]) {
                err[val.name] = '*Required'
            }
        })

        if (Object.values(err).some((val) => val !== '')) {
            setErr(err)
            toast.warn('Fill the all required fields', {
                position: "top-right",
                autoClose: 1000,
            })
            return false
        }
        setErr({})
        return true
    }

    if (loader) return <Loader title={data_id ? 'Update Details' : 'Add Details'} />

    const getSelectOptionsFromSlug = (slug) =>{
      axios.get('/features/dropdown',{ params: { slug: slug}})
      .then((response) =>{
        return response.data.data
      })
    }
    return (
        <Row className='criterion-add-details'>
            <div class="pagetitle">
                <h1>{data_id ? 'Update Details' : 'Add Details'}</h1>
                <nav>
                    <ol class="breadcrumb">
                        <li class="breadcrumb-item"><Link to='/all-criterions'>Criterions</Link></li>
                        <li class="breadcrumb-item active">{data_id ? 'Update Details' : 'Add Details'}</li>
                    </ol>
                </nav>
            </div>

            <Col xs='12'>
                <h5>Criteria - C {params?.id}</h5>
                <p>{dataField?.question}</p>
                <p>{dataField?.description}</p>
            </Col>

            <Col xs='1' sm='1'></Col>
            <Col xs='12' sm='10'>
                <form onSubmit={postAnswer}>
                    <Card>
                        <CardHeader>Add Details</CardHeader>
                        <CardBody>
                            {dataField?.optional_fields?.length > 0 ? dataField?.optional_fields.map((val, ky) => {
                                if (val.status) {
                                    return (
                                        <FormGroup key={ky}>
                                            <Label className='optional_fields-label'>{val.name}</Label>
                                            <Input
                                                type='select'
                                                name={val.name}
                                                onChange={handleOptionalFieldChange}
                                                value={answerData[val.name]}
                                                invalid={!!err[val.name]}
                                            >
                                                <option value=''>Select</option>
                                                {val?.name === "department"
                                                    ? departmentList.map((field, k) => {
                                                        if (
                                                            user.user_scope === "CLUB" ||
                                                            user.user_scope === "TEACHER" ||
                                                            user.user_scope === "DEPT_COD"
                                                        ) {
                                                            if (field.id === user?.department?.id) {
                                                                return (
                                                                    <option key={k} value={field.id}>
                                                                        {field.name}
                                                                    </option>
                                                                );
                                                            }
                                                        } else
                                                            return (
                                                                <option key={k} value={field.id}>
                                                                    {field.name}
                                                                </option>
                                                            );
                                                    })
                                                    : val?.name === "program"
                                                        ? programList.map((field, k) => {
                                                            if (
                                                                user.user_scope === "CLUB" ||
                                                                user.user_scope === "TEACHER" ||
                                                                user.user_scope === "DEPT_COD"
                                                            ) {
                                                            if (field.department === answerData?.department) {
                                                                return (
                                                                    <option key={k} value={field.id}>
                                                                        {field.name}
                                                                    </option>
                                                                );
                                                             }
                                                            } else {
                                                                return (
                                                                    <option key={k} value={field.id}>
                                                                        {field.name}
                                                                    </option>
                                                                );
                                                            }

                                                        })
                                                        : val?.name === "paper"
                                                            ? paperList.map((field, k) => {
                                                                if (field.program === answerData.program) {
                                                                    return (
                                                                        <option key={k} value={field.id}>
                                                                            {field.name}
                                                                        </option>
                                                                    );
                                                                }
                                                            })
                                                            : val?.name === "batch"
                                                                ? batchList.map((field, k) => {
                                                                    return (
                                                                        <option key={k} value={field.id}>
                                                                            {field.name}
                                                                        </option>
                                                                    )
                                                                }) : ''
                                                }
                                            </Input>
                                            <FormFeedback>{err[val.name]}</FormFeedback>
                                        </FormGroup>

                                    )
                                }
                            }) : ''}

                            <hr />

                            {dataField?.extra_fields?.length > 0 &&
                                dataField.extra_fields.map((field) => {
                                    if (field.status) {
                                        return (
                                            <>
                                                {field.type === "textarea" ? (
                                                    <FormGroup>
                                                        <Label className='optional_fields-label'>
                                                            {field.name}
                                                        </Label>
                                                        <Input
                                                            type='textarea'
                                                            rows="3"
                                                            name={field.name}
                                                            id={field.name_id}
                                                            min={field?.minimum}
                                                            max={field?.maximum}
                                                            onChange={(e) => handleJdocAnswerChange(e, field)}
                                                            value={answerDataJoc[field?.name]}
                                                            required={field?.is_required || false}
                                                        ></Input>
                                                    </FormGroup>
                                                ) : field.type === "checkbox" ? (
                                                    <FormGroup>
                                                        <Input
                                                            type="checkbox"
                                                            name={field.name}
                                                            id={field.name_id}
                                                            onChange={(e) => handleJdocAnswerChange(e, field)}
                                                            checked={answerDataJoc[field?.name]}
                                                        />
                                                        {"  "}
                                                        <Label className='optional_fields-label'>
                                                            {field.name}
                                                        </Label>

                                                    </FormGroup>
                                                ) : field.type === "select_box" || field.type === "select box" ? (
                                                    <FormGroup>
                                                        <Label className='optional_fields-label'>
                                                            {field.name}
                                                        </Label>
                                                        <Input
                                                            name={field.name}
                                                            type='select'
                                                            id={field.name_id}
                                                            onChange={(e) => handleJdocAnswerChange(e, field)}
                                                            value={answerDataJoc[field?.name]}
                                                            required={field?.is_required || false}
                                                        >
                                                          { 
                                                          field.selectBoxType === 'static' ?
                                                          <>
                                                            <option value="">{field.name}</option>
                                                            {field?.selectBoxOptions.length > 0 && field.selectBoxOptions.map((option, index) => (
                                                                <option key={index} value={option}>
                                                                    {option}
                                                                </option>
                                                            )
                                                            )}
                                                            </>
                                                            :
                                                            getSelectOptionsFromSlug(field.slug)
                                                }
                                                        </Input>
                                                    </FormGroup>
                                                ) : field.type === "date" ? (
                                                    <FormGroup>
                                                        <Label className='optional_fields-label'>
                                                            {field.name}
                                                        </Label>
                                                        <Input
                                                            type='Date'
                                                            onChange={(e) => handleJdocAnswerChange(e, field)}
                                                            name={field.name}
                                                            id={field.name_id}
                                                            value={answerDataJoc[field?.name]}
                                                            required={field?.is_required || false}
                                                        />
                                                    </FormGroup>
                                                ) : field.type === "text" ? (
                                                    <FormGroup>
                                                        <Label className='optional_fields-label'>{field.name}</Label>
                                                        <Input
                                                            type='text'
                                                            name={field.name}
                                                            id={field.name_id}
                                                            min={field?.minimum}
                                                            max={field?.maximum}
                                                            onChange={(e) => handleJdocAnswerChange(e, field)}
                                                            value={answerDataJoc[field?.name]}
                                                            required={field?.is_required || false}
                                                        />
                                                    </FormGroup>
                                                ) : field.type === "number" ? (
                                                    <FormGroup>
                                                        <Label className='optional_fields-label'>{field.name}</Label>
                                                        <Input
                                                            type='number'
                                                            name={field.name}
                                                            id={field.name_id}
                                                            min={field?.minimum}
                                                            max={field?.maximum}
                                                            onChange={(e) => handleJdocAnswerChange(e, field)}
                                                            value={answerDataJoc[field?.name]}
                                                            required={field?.is_required || false}
                                                        />
                                                    </FormGroup>
                                                ) :
                                                    <FormGroup>
                                                        <Label className='optional_fields-label'>{field[field.name_for_filter]}</Label>
                                                        <Input
                                                            type='file'
                                                            name={field.name_for_filter}
                                                            id={field.name_id}
                                                            onChange={(event) => handleFiles(event, field)}
                                                            accept="image/*,.pdf"
                                                            required={field?.is_required || false}
                                                        />
                                                    </FormGroup>
                                                }
                                            </>
                                        );
                                    }
                                })}

                            <hr />

                            {dataField?.static_fields?.length > 0 ? dataField?.static_fields?.map((field, k) => {
                                return (
                                    <FormGroup key={k}>
                                        <Label className='optional_fields-label'>{field?.name} {field.type ==="date" ? " of activity (if no date available choose any date of the year of activity)": field.type ==="file" ? "(If any files available)" : field.name === "Additional Links"? "(If any resource URL available)":""} </Label>
                                        {
                                            field.type === "file" ?
                                                <Input
                                                    type={field.type}
                                                    name='file1'
                                                    onChange={(event) => {
                                                        setFiles({
                                                            ...files,
                                                            [event.target.name]: event.target.files[0],
                                                        });
                                                    }
                                                    }
                                                />
                                                :
                                                <>
                                                    <Input
                                                        type={field.type}
                                                        name={`${field.type === "file" ? "file1" : field?.name === "Additional Links" ? "url1" : field?.name}`}
                                                        onChange={handleAnswerChange}
                                                        value={field?.name === 'Additional Links' ? answerData['url1'] : answerData['date']}
                                                        invalid={field.type === 'date' ? !!err?.date : false}
                                                    />
                                                    {
                                                        field.type === 'date' ?
                                                            <FormFeedback>{err?.date}</FormFeedback> : ''
                                                    }
                                                </>
                                        }

                                    </FormGroup>
                                )
                            }) : ''}



                        </CardBody>
                        <CardFooter className='d-flex justify-content-end'>
                            <Button size='sm' disabled={submitLoader} outline onClick={() => navigate('/all-criterions')}>Cancel</Button>
                            <Button type='submit' size='sm' disabled={submitLoader} className='ms-2' color='success'>{submitLoader ? 'Submitting..' : 'Submit'}</Button>
                        </CardFooter>
                    </Card>
                </form>
            </Col>
            <Col xs='1' sm='1'></Col>
        </Row >
    )
}

export default AddCriterionDetails