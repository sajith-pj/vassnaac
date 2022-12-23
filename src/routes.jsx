import React, { Suspense } from "react";
import {
  Routes,
  Route,
} from "react-router-dom";
import './App.scss'

import SuspenseLoader from "./components/suspense-loader";
import Layout from "./components/layout";
import Dashboard from './pages/dashboard'

const Login = React.lazy(() => import('./pages/login'));
const SignUp = React.lazy(() => import('./pages/sign-up'));
const Agreement = React.lazy(() => import('./pages/agreement'));
const ResetPassword = React.lazy(() => import('./pages/password-reset'));
const UserList = React.lazy(() => import('./pages/users'));
const ChangePassword = React.lazy(() => import('./pages/change-password'));
const Department = React.lazy(() => import('./pages/department'));
const Clubs = React.lazy(() => import('./pages/clubs'));
const ClubDetails = React.lazy(() => import('./pages/clubs/clubDetails'));
const Paper = React.lazy(() => import('./pages/paper'));
const Programs = React.lazy(() => import('./pages/programs'));
const Batch = React.lazy(() => import('./pages/batch'));
const Student = React.lazy(() => import('./pages/student'));
const Profile = React.lazy(() => import('./pages/profile'));
const NoticeBoard = React.lazy(() => import('./pages/noticeboard'));
const AboutUs = React.lazy(() => import('./pages/about-us'));
const Faq = React.lazy(() => import('./pages/faq'));
const Events = React.lazy(() => import('./pages/events'));
const Settings = React.lazy(() => import('./pages/settings'));
const ViewScore = React.lazy(() => import('./pages/view-score'));
const DataBackup = React.lazy(() => import('./pages/data-backup'));
const CriterionSettings = React.lazy(() => import('./pages/criterion-settings'));
const AddCriterion = React.lazy(() => import('./pages/criterion-settings/addCriterion'));
const Notifications = React.lazy(() => import('./pages/notifications'));
const Summary = React.lazy(() => import('./pages/summary'));
const StudentList = React.lazy(() => import('./pages/student-list'));
const AllCriterions = React.lazy(() => import('./pages/all-criterions'));
const AddCriterionDetails = React.lazy(() => import('./pages/all-criterions/addDetails'));
const ViewCriterion = React.lazy(() => import('./pages/all-criterions/viewCriterion'));
const UpdateCriterion = React.lazy(() => import('./pages/criterion-settings/update'));
const Reports = React.lazy(() => import('./pages/reports'));
const HtmlReports = React.lazy(() => import('./pages/html-reports'));
const PdfTextReport = React.lazy(() => import('./pages/pdg-text-reports'));

const NotFound = React.lazy(() => import('./components/not-found'));

function MainRoute() {
  return (
    <Suspense fallback={<SuspenseLoader />}>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/password-reset" element={<ResetPassword />} />
        <Route path="/sign-up" element={<SignUp />} />
        <Route path="/terms-conditions/:agreementType" element={<Agreement />} />
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="users" element={<UserList />} />
          <Route path="update-password" element={<ChangePassword />} />
          <Route index path="departments" element={<Department />} />
          <Route path="clubs" element={<Clubs />} />
          <Route path="papers" element={<Paper />} />
          <Route path="programs" element={<Programs />} />
          <Route path="batch" element={<Batch />} />
          <Route path="students" element={<Student />} />
          <Route path="my-profile" element={<Profile />} />
          <Route path="club/:id" element={<ClubDetails />} />
          <Route path="noticeboard" element={<NoticeBoard />} />
          <Route path="faq" element={<Faq />} />
          <Route path="about-us" element={<AboutUs />} />
          <Route path="events" element={<Events />} />
          <Route path="settings" element={<Settings />} />
          <Route path="view-score" element={<ViewScore />} />
          <Route path="data-backup" element={<DataBackup />} />
          <Route path="criterion-settings" element={<CriterionSettings />} />
          <Route path="criterion-settings/update/:id" element={<UpdateCriterion />} />
          <Route path="add-criterion" element={<AddCriterion />} />
          <Route path="notifications" element={<Notifications />} />
          <Route path="summary" element={<Summary />} />
          <Route path="student-list" element={<StudentList />} />
          <Route path="all-criterions" element={<AllCriterions />} />
          <Route path="all-criterions/:id" element={<AllCriterions />} />
          <Route path="criterion/add-details/:id" element={<AddCriterionDetails />} />
          <Route path="criterion/update-details/:id/:data_id" element={<AddCriterionDetails />} />
          <Route path="criterion/details/view/:id/:criterion_id" element={<ViewCriterion />} />
          <Route path="reports" element={<Reports />} />
          <Route path="html-reports" element={<HtmlReports />} />
          <Route path="pdf-image-report" element={<PdfTextReport />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}

export default MainRoute;
