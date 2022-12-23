import React, { Fragment } from 'react'
import { Col, CardBody, CardHeader, Table, Card } from 'reactstrap';

function SettingTable({ settingsData }) {
  return (
    <Fragment>
      <Col xs='12' sm='1'></Col>
      <Col xs='12' sm='10'>
        <Card>
          <CardHeader>Settings Details</CardHeader>
          <CardBody>
            <div style={{ height: '70vh', width: '100%', overflowY: 'auto' }}>
              {
                settingsData && Object.keys(settingsData).length > 0  && (
                  <Table>
                    <thead>
                      <tr>
                        <th>Type</th>
                        <th>Value</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td> Settings ID </td>
                        <td> {settingsData?.id_no} </td>
                      </tr>
                      <tr>
                        <td>Portal Name </td>
                        <td>{settingsData?.title}  </td>
                      </tr>
                      <tr>
                        <td>Tags  </td>
                        <td>{settingsData?.tags}  </td>
                      </tr>
                      <tr>
                        <td>Description  </td>
                        <td>{settingsData?.description}  </td>
                      </tr>
                      <tr>
                        <td>Admin Email  </td>
                        <td>{settingsData?.admin_email}  </td>
                      </tr>
                      <tr>
                        <td>Admin Phone  </td>
                        <td>{settingsData?.admin_phone}  </td>
                      </tr>
                      <tr>
                        <td>Admin URL  </td>
                        <td>{settingsData?.admin_url}   </td>
                      </tr>
                      <tr>
                        <td>Admin Address  </td>
                        <td>{settingsData?.admin_address}   </td>
                      </tr>
                      <tr>
                        <td> Allow Signup </td>
                        <td> {settingsData?.allow_signup ? "Yes" : "No"} </td>
                      </tr>
                      <tr>
                        <td> Allow Data Entry </td>
                        <td>{settingsData?.allow_data_entry ? "Yes" : "No"}  </td>
                      </tr>
                      <tr>
                        <td>Allo Change Roles  </td>
                        <td>{settingsData?.allow_change_roles ? "Yes" : "No"}  </td>
                      </tr>
                      <tr>
                        <td>Enable OTP  </td>
                        <td>{settingsData?.enable_otp ? "Yes" : "No"}  </td>
                      </tr>
                      <tr>
                        <td>Enable Captha  </td>
                        <td>{settingsData?.enable_captha ? "Yes" : "No"}  </td>
                      </tr>
                      <tr>
                        <td>Force HTTPS  </td>
                        <td>{settingsData?.enable_https ? "Yes" : "No"}  </td>
                      </tr>
                      <tr>
                        <td>App Status </td>
                        <td>{settingsData?.is_app_active ? "Yes" : "No"}   </td>
                      </tr>
                    </tbody>
                  </Table>
                )
              }
            </div>
          </CardBody>
        </Card>
      </Col>
      <Col xs='12' sm='1'></Col>
    </Fragment>
  )
}

export default SettingTable