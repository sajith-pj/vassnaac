import React, { useEffect, useState } from 'react'
import { Row, Col, Button, Label, Input, FormFeedback, FormGroup } from 'reactstrap';
import axios from '../../axios'
import SettingTable from './settingTable';
import { toast } from 'react-toastify';
import { isRequired, validateURL, validateMobile, validateEmail } from "../../utils/validators";
import Loader from '../../components/loader';

function Settings() {
    const [showTable, setShowTable] = useState(false);
    const [loading, setLoading] = useState(true);
    const [settingsData, setSettingsData] = useState({});
    const [changeSettings, setChangeSettings] = useState(false);
    const [err, setErr] = useState({});
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        checkForSettings();
    }, []);

    const checkForSettings = () => {
        setLoading(true)
        axios.get("/adminapp/settings/list")
            .then((response) => {
                if (response?.data?.data?.length > 0) {
                    let data = response?.data?.data?.[0]
                    setSettingsData(response?.data?.data?.[0])
                    setShowTable(true);
                    setChangeSettings(false)
                    if (!data?.is_app_active) {
                        localStorage.clear()
                        let url = new URL('/login', window.location.origin)
                        window.location = url
                    }
                }
            })
            .catch((err) => console.log(err))
            .finally(() => setLoading(false))
    }

    const validateForm = () => {
        let obj = {
            id_no: isRequired(settingsData?.id_no),
            admin_email: validateEmail(settingsData?.admin_email),
            title: isRequired(settingsData?.title),
            admin_phone: validateMobile(settingsData?.admin_phone),
            admin_url: settingsData?.admin_url ? validateURL(settingsData?.admin_url) : '',
        }
        if (Object.values(obj).some((val) => val !== '')) {
            setErr(obj)
            return true
        }
        setErr({})
        return false
    }

    const submitSeting = () => {
        if (validateForm()) return
        if (changeSettings && settingsData?.id) {
            setSubmitting(true)
            axios.put(`/adminapp/settings/details/${settingsData?.id}`, settingsData, {
                headers: {
                    'Content-Type': 'application/json'
                }
            })
                .then((response) => {
                    toast.success('Settings updated successfully', {
                        position: "top-right",
                        autoClose: 2000,
                    });
                    checkForSettings()
                })
                .catch(error => {
                    let msgData = error?.response?.data?.data || {}
                    setErr(msgData)
                })
                .finally(() => setSubmitting(false))
        }
        else {
            setSubmitting(true)
            axios.post('/adminapp/settings/list', settingsData, {
                headers: {
                    'Content-Type': 'application/json'
                }
            })
                .then((response) => {
                    toast.success('Settings added successfully', {
                        position: "top-right",
                        autoClose: 2000,
                    });
                    setSettingsData({})
                    checkForSettings()
                })
                .catch(error => {
                    let msgData = err?.response?.data?.data || {}
                    setErr(msgData)
                })
                .finally(() => setSubmitting(false))
        }
    }

    const handleChange = (event) => {
        setSettingsData({ ...settingsData, [event.target.name]: event.target.value })
        setErr({ ...err, [event.target.name]: '' })
    }

    const handleCheck = (event) => {
        setSettingsData({ ...settingsData, [event.target.name]: event.target.checked })
    }

    const changeSettingsFn = () => {
        setErr({})
        setChangeSettings(true)
        setShowTable(false)

    }
    if (loading) {
        return <Loader title={'General Settings'} />
    }

    return (
        <Row>
            <div class="pagetitle">
                <h1>General Settings</h1>
                {showTable && <h6>The settings are already exist and can be changed by user</h6>}
                {!showTable && <h6>Setup the site settings according to you</h6>}
            </div>
            {
                showTable &&
                <Col xs='12' className='d-flex justify-content-end mb-1'>
                    <Button onClick={() => { changeSettingsFn() }} className='me-2' outline color='primary' size='sm'>Change Settings</Button>
                </Col>
            }
            {
                showTable ?
                    <SettingTable settingsData={settingsData} />
                    :
                    <>
                        <Col xs='12' sm='9'>
                            <Row>
                                <Col xs='12' sm='6' className='mt-2'>
                                    <Label>
                                        Settings ID
                                    </Label>
                                    <Input
                                        type="number"
                                        min={0}
                                        name="id_no"
                                        id="id_no"
                                        onChange={handleChange}
                                        value={settingsData?.id_no}
                                        invalid={!!err.id_no}
                                    />
                                    <FormFeedback>{err?.id_no}</FormFeedback>
                                </Col>
                                <Col xs='12' sm='6' className='mt-2'>
                                    <Label>
                                        Admin email
                                    </Label>
                                    <Input
                                        type="email"
                                        name="admin_email"
                                        id="admin_email"
                                        onChange={handleChange}
                                        value={settingsData?.admin_email}
                                        invalid={!!err.admin_email}
                                    />
                                    <FormFeedback>{err?.admin_email}</FormFeedback>
                                </Col>
                                <Col xs='12' sm='6' className='mt-2'>
                                    <Label>
                                        Portal name (App title)
                                    </Label>
                                    <Input
                                        type="text"
                                        name="title"
                                        id="title"
                                        onChange={handleChange}
                                        value={settingsData?.title}
                                        invalid={!!err.title}
                                    />
                                    <FormFeedback>{err?.title}</FormFeedback>
                                </Col>
                                <Col xs='12' sm='6' className='mt-2'>
                                    <Label>
                                        Admin phone no.
                                    </Label>
                                    <Input
                                        type="number"
                                        name="admin_phone"
                                        id="admin_phone"
                                        min={0}
                                        onChange={handleChange}
                                        value={settingsData?.admin_phone}
                                        invalid={!!err.admin_phone}
                                    />
                                    <FormFeedback>{err?.admin_phone}</FormFeedback>
                                </Col>
                                <Col xs='12' sm='6' className='mt-2'>
                                    <Label>
                                        Tags
                                    </Label>
                                    <Input
                                        type="text"
                                        name="tags"
                                        id="tags"
                                        onChange={handleChange}
                                        value={settingsData?.tags}
                                    />
                                </Col>
                                <Col xs='12' sm='6' className='mt-2'>
                                    <Label>
                                        Admin URL
                                    </Label>
                                    <Input
                                        type="text"
                                        name="admin_url"
                                        id="admin_url"
                                        onChange={handleChange}
                                        value={settingsData?.admin_url}
                                        invalid={!!err.admin_url}
                                    />
                                    <FormFeedback>{err?.admin_url}</FormFeedback>
                                </Col>
                                <Col xs='12' sm='6' className='mt-2'>
                                    <Label>
                                        Portal Description
                                    </Label>
                                    <Input
                                        type="textarea"
                                        rows={4}
                                        name="description"
                                        id="description"
                                        onChange={handleChange}
                                        value={settingsData?.description}
                                    />
                                </Col>
                                <Col xs='12' sm='6' className='mt-2'>
                                    <Label>
                                        Administrator Address
                                    </Label>
                                    <Input
                                        type="textarea"
                                        rows={4}
                                        name="admin_address"
                                        id="admin_address"
                                        onChange={handleChange}
                                        value={settingsData?.admin_address}
                                    />
                                </Col>
                            </Row>
                        </Col>
                        <Col xs='12' sm='3' className='d-flex flex-column mt-2'>
                            <FormGroup>
                                <Input type="checkbox" name='allow_signup' onChange={handleCheck} checked={settingsData?.allow_signup} />
                                {'  '}
                                <Label>
                                    Allow Signup
                                </Label>
                            </FormGroup>
                            <FormGroup>
                                <Input type="checkbox" name='allow_data_entry' onChange={handleCheck} checked={settingsData?.allow_data_entry} />
                                {'  '}
                                <Label>
                                    Enable data entry
                                </Label>
                            </FormGroup>
                            <FormGroup>
                                <Input type="checkbox" name='allow_change_roles' onChange={handleCheck} checked={settingsData?.allow_change_roles} />
                                {'  '}
                                <Label>
                                    Allow change roles
                                </Label>
                            </FormGroup>
                            <FormGroup>
                                <Input type="checkbox" name='enable_otp' onChange={handleCheck} checked={settingsData?.enable_otp} />
                                {'  '}
                                <Label>
                                    Enable OTP Verification
                                </Label>
                            </FormGroup>
                            <FormGroup>
                                <Input type="checkbox" name='enable_captha' onChange={handleCheck} checked={settingsData?.enable_captha} />
                                {'  '}
                                <Label>
                                    Enable Re-Captha verification
                                </Label>
                            </FormGroup>
                            <FormGroup>
                                <Input type="checkbox" name='enable_https' onChange={handleCheck} checked={settingsData?.enable_https} />
                                {'  '}
                                <Label>
                                    Enable HTTPS (Force)
                                </Label>
                            </FormGroup>
                            <FormGroup>
                                <Input type="checkbox" name='other' onChange={handleCheck} checked={settingsData?.other} />
                                {'  '}
                                <Label>
                                    Other
                                </Label>
                            </FormGroup>
                            <FormGroup>
                                <Input type="checkbox" name='classic_ui' onChange={handleCheck} checked={settingsData?.classic_ui} />
                                {'  '}
                                <Label>
                                    Classic UI
                                </Label>
                            </FormGroup>
                            <FormGroup>
                                <Input type="checkbox" name='is_app_active' onChange={handleCheck} checked={settingsData?.is_app_active} />
                                {'  '}
                                <Label>
                                    App Status
                                </Label>
                            </FormGroup>
                        </Col>

                        <Col xs='12' className='d-flex justify-content-end mb-1'>
                            {
                                changeSettings &&
                                <Button disabled={submitting} onClick={() => checkForSettings()} className='me-2' size='sm'>Cancel</Button>
                            }
                            <Button disabled={submitting} onClick={submitSeting} className='me-2' color='success' size='sm'>Submit</Button>
                        </Col>
                    </>

            }
        </Row>
    )
}

export default Settings