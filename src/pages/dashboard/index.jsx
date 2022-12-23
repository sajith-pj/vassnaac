import React, { useEffect, useState } from 'react'
import { Row, Col, Card, CardBody, CardHeader } from 'reactstrap'
import './dashboard.scss'
import { useNavigate, useOutletContext } from 'react-router-dom'
import axios from '../../axios'
import girl_image from '../../assets/girl.png'

function Dashboard() {
  let userDetails = useOutletContext()
  const navigate = useNavigate()
  const [dashboardData, setDashboardData] = useState({})
  const [noticeBoardList, setNoticeBoardList] = useState([]);

  useEffect(() => {
    getDashboardDetails();
    getNoticeBoard();
  }, []);

  const getDashboardDetails = () => {
    axios.get("/user/dashboard").then((response) => {
      setDashboardData(response?.data?.data);
    });
  };
  const getNoticeBoard = () => {
    axios.get("/programs/noticeboard/list").then((response) => {
      setNoticeBoardList(response?.data?.data || []);
    });
  };
 const navigateToCriterion = ({ criterion}) => {
  navigate(`/all-criterions/${criterion}`)
 }
  return (
    <Row>
      <div class="pagetitle">
        <h1>Dashboard</h1>
        {/* <h6>Welcome to NAAC.</h6> */}
      </div>
      <Col xs='12' sm='8'>
        <Card>
          <CardHeader>Welcome to NAAC</CardHeader>
          <CardBody>
            <div className='main-div'>
              <div>
                <h2 className='h2-dash'>Welcome back {userDetails?.username}</h2>
                <p>EasyNAAC College Assist System</p>
                <p>User role: {userDetails?.user_scope}</p>
                {userDetails?.user_scope === "CLUB" ?
                  <p>
                    Club Name:{userDetails?.clubs?.name}
                  </p>
                  : ''}
              </div>
              <img
                src={girl_image}
                width={300}
                height={150}
                className="girl_icon"
                alt=""
                srcSet=""
              />
            </div>
          </CardBody>
        </Card>
      </Col>
      <Col xs='12' sm='4'>
        <Card>
          <CardHeader>Notice Board</CardHeader>
          <CardBody style={{ padding: '5px' }}>
            <div className='notice-div'>
              {noticeBoardList.length > 0 ? noticeBoardList.map((val, ky) => {
                return (
                  <div className='notice-item' key={ky} onClick={() => val?.urls ? window.open(val.urls) : ''}>
                    <span className='notice-title'>{val?.title}</span>
                    <span className='notice-message'>{val?.message}</span>
                  </div>
                )
              }) : ''
              }
            </div>
          </CardBody>
        </Card>
      </Col>
      
        
      <Col xs='12' sm='12'>
        <Card>
          <CardHeader>Quick Summary</CardHeader>
          <CardBody>
          <Row>
  
          { userDetails.user_scope !== 'NAAC_COD' && userDetails.user_scope !== 'IQAC_COD' ?
          dashboardData?.dashboard_summury?.map(( summary, index )=>{
            if( summary[Object.keys(summary)[0]].assigned ){
            return (
            <Col xs='12' sm='3'>
              <Card className='dashboard-criterion-cards'  onClick={()=> navigateToCriterion({criterion:Object.keys(summary)[0]})}>
                <CardHeader> Criterion - {Object.keys(summary)[0]}</CardHeader>
                <CardBody>
                    <div className='dashboard-summary-body'> 
                        <p> Criterion Attended: {summary[Object.keys(summary)[0]].attended} </p> 
                        <p> Criterion Pending: {summary[Object.keys(summary)[0]].pending} </p>  
                        <p> Criterion assigned: {summary[Object.keys(summary)[0]].question} </p> 
                  </div>
                </CardBody>
              </Card>
            </Col>
          )}
        })
        :
        <> 
        <Col xs='12' sm='6' md='4'>
          <div className='dash-box first'>
            <div className='count'>{dashboardData?.total_active_criterions}</div>
            <p>Total Active Criterions</p>
          </div>
        </Col>
        <Col xs='12' sm='6' md='4'>
          <div className='dash-box second'>
            <div className='count'>{dashboardData?.assigned_criterions}</div>
            <p>Total Assigned Criterions </p>
          </div>
        </Col>
        <Col xs='12' sm='6' md='4'>
          <div className='dash-box third'>
            <div className='count'>{dashboardData?.total_clubs}</div>
            <p>Total Clubs (Active)</p>
          </div>
        </Col>
        <Col xs='12' sm='6' md='4'>
          <div className='dash-box fourth'>
            <div className='count'>{dashboardData?.total_departments}</div>
            <p>Total Departments (Actives)</p>
          </div>
        </Col>
        <Col xs='12' sm='6' md='4'>
          <div className='dash-box fifth'>
            <div className='count'>{dashboardData?.total_programs}</div>
            <p>Total Programs (Active)</p>
          </div>
        </Col>
        <Col xs='12' sm='6' md='4'>
          <div className='dash-box sixth'>
            <div className='count'>{dashboardData?.total_subjects}</div>
            <p>Total Subjects (Papers)</p>
          </div>
        </Col>
        </>
    }
    </Row>
           
          </CardBody>
        </Card>
      </Col>
    </Row>

  )
}

export default Dashboard