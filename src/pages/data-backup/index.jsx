import React from 'react'
import { Row, Col } from 'reactstrap';
import comingsoon from '../../assets/comingsoon.svg'

function DataBackup() {
  return (
    <Row>
      <div class="pagetitle">
        <h1>Data Backup</h1>
        <nav>
          <ol class="breadcrumb">
            <li class="breadcrumb-item">Admin Tools</li>
            <li class="breadcrumb-item active">Data Backup</li>
          </ol>
        </nav>
      </div>

      <Col xs='12' className='d-flex align-items-center flex-column'>
        <img src={comingsoon} width="300" alt='coming soon' />
        <h3 style={{ color: '#174a84' }}>Coming Soon</h3>
        <h6>We will notify you once this feature is ready</h6>
      </Col>
    </Row>
  )
}

export default DataBackup