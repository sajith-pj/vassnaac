import React, { useState, useEffect } from "react";
import RoutesList from "./routes";
import PermissionContext from "./store/permissionContext"
import axios from "./axios";
import Maintenance from "./components/maintainance"
import {
  Routes,
  Route,
} from "react-router-dom";
import AdminRoutes from "./pages/admin-login";

const App = () => {

  const [permissions, setPermissions] = useState([])
  const [show, setShow] = useState(false)
  useEffect(() => {
    axios.get('/adminapp/settings/list').then((res) => {
      let arr = res?.data?.data?.[0] ? res?.data?.data?.[0] : []
      setPermissions(arr)
      setShow(true)
    }).catch((err) => {
      console.log(err)
      setShow(true)
    })
  }, [])

  if (!show) return ''
  if (!permissions?.is_app_active) return (
    <Routes>
      <Route index element={<Maintenance />} />
      <Route path="/admin-login" element={<AdminRoutes />} />
      <Route path="*" element={<Maintenance />} />
    </Routes>
  )
  return (
    <PermissionContext.Provider value={{
      permissions: permissions
    }}>
      <RoutesList />
    </PermissionContext.Provider>
  )
}

export default App
