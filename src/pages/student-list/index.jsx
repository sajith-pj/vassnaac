import React, { useEffect, useRef, useState } from "react";
import { Row, Col, Input, Button } from "reactstrap";
import axios from "../../axios";
import Loader from "../../components/loader";
import MaterialTable from "@material-table/core";
import { toast } from "react-toastify";
import * as FileSaver from "file-saver";
import * as XLSX from "xlsx";
import { CSVLink } from "react-csv";
import { useOutletContext } from "react-router-dom";
import StudentStyle from "./student.module.scss";
import uploadIcon from "../../assets/upload-icon.svg";

function StudentList() {
  const user = useOutletContext();
  const [loader, setLoader] = useState(true);
  const [loader1, setLoader1] = useState(false);
  const [departmentList, setDepartmentList] = useState([]);
  const [programsList, setProgramsList] = useState([]);
  const [batchList, setBatchList] = useState([]);
  const [studentList, setStudentList] = useState([]);
  const [filterValues, setFilterValues] = useState({
    department: "",
    program: "",
    batch: "",
  });
  const [disable, setDisable] = useState(true);

  useEffect(() => {
    getFeatures();
    setUserDepartment();
  }, []);

  const setUserDepartment = () => {
    if (
      user.user_scope === "CLUB" ||
      user.user_scope === "TEACHER" ||
      user.user_scope === "DEPT_COD"
    ) {
      setFilterValues({ ...filterValues, department: user?.department?.id });
    }
  };

  useEffect(() => {
    if (
      filterValues?.department &&
      filterValues?.batch &&
      filterValues?.program
    ) {
      setDisable(false);
    } else {
      setDisable(true);
    }
  }, [filterValues]);

  const getFeatures = () => {
    axios
      .get("/features")
      .then((response) => {
        const {
          batch = [],
          programs = [],
          departments = [],
        } = response?.data?.data;
        setBatchList(batch);
        setDepartmentList(departments);
        setProgramsList(programs);
      })
      .finally(() => setLoader(false));
  };

  const handleChange = (e) => {
    setFilterValues({ ...filterValues, [e.target.name]: e.target.value });
  };
  const getStudentsData = () => {
    setLoader1(true);
    axios
      .get("/programs/students/list", {
        params: filterValues,
      })
      .then((response) => {
        setStudentList(response?.data?.data || []);
      })
      .finally(() => {
        setLoader1(false);
      });
  };

  const columns = [
    { title: "Student ID", field: "student_id" },
    { title: "Name", field: "name" },
    { title: "Reg.No", field: "reg_num" },
    { title: "Email", field: "email" },
    { title: "Phone", field: "contact_num" },
    { title: "Address", field: "address" },
    { title: "Job Type", field: "job_type" },
    { title: "Job Details", field: "job_details" },
  ];

  const updateTableData = (data) => {
    setLoader1(true);
    let arr = [...studentList];
    arr = arr.filter((val) => val.id !== data.id);
    let user_data = [...arr, data];
    axios
      .put("programs/students/table/bulk", { user_data })
      .then((response) => {
        toast.success("updated successfully", {
          position: "top-right",
          autoClose: 2000,
          hideProgressBar: true,
        });
        getStudentsData();
        setLoader1(false);
      })
      .catch((err) => {
        setLoader1(false);
        toast.success("Oops, updation failed", {
          position: "top-right",
          autoClose: 2000,
          hideProgressBar: true,
        });
      });
  };

  const downloadExcel = () => {
    const fileType =
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8";
    const fileExtension = ".xlsx";
    const ws = XLSX.utils.json_to_sheet(studentList);
    const wb = { Sheets: { data: ws }, SheetNames: ["data"] };
    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const data = new Blob([excelBuffer], { type: fileType });
    FileSaver.saveAs(data, "report" + fileExtension);
  };

  if (loader) return <Loader title={"Student List"} />;
  return (
    <Row>
      <div class="pagetitle">
        <h1>Student List</h1>
      </div>

      <Col xs="12" sm="6" md="3" className="mt-2">
        <Input
          type="select"
          size={"sm"}
          placeholder="Department"
          value={filterValues?.department}
          name="department"
          onChange={handleChange}
          disabled={
            user.user_scope === "CLUB" ||
            user.user_scope === "TEACHER" ||
            user.user_scope === "DEPT_COD"
              ? true
              : false
          }
        >
          <option value="">Department</option>
          {departmentList.map((val, k) => {
            return (
              <option key={k} value={val.id}>
                {val.name}
              </option>
            );
          })}
        </Input>
      </Col>
      <Col xs="12" sm="6" md="3" className="mt-2">
        <Input
          type="select"
          size={"sm"}
          placeholder="Programs"
          value={filterValues?.program}
          name="program"
          onChange={handleChange}
        >
          <option value="">Programs</option>
          {programsList.map((val, k) => {
            if (filterValues.department == val.department) {
              return (
                <option key={k} value={val.id}>
                  {val.name}
                </option>
              );
            }
          })}
        </Input>
      </Col>
      <Col xs="12" sm="6" md="3" className="mt-2">
        <Input
          type="select"
          size={"sm"}
          placeholder="Batch"
          value={filterValues?.batch}
          name="batch"
          onChange={handleChange}
        >
          <option value="">Batch</option>
          {batchList.map((val, k) => {
            return (
              <option key={k} value={val.id}>
                {val.name}
              </option>
            );
          })}
        </Input>
      </Col>
      <Col xs="12" sm="6" md="3" className="mt-2">
        <Button
          onClick={getStudentsData}
          outline
          color="primary"
          size="sm"
          disabled={disable || loader1}
        >
          {loader1 ? "loading..." : "Load data"}
        </Button>
      </Col>
      {studentList.length > 0 ? (
        <>
          <Col xs="12" className="mt-2 d-flex justify-content-end">
            <Button className="me-2" color="primary" size="sm">
              <CSVLink
                data={studentList}
                filename={"papers.csv"}
                style={{ color: "white" }}
              >
                CSV
              </CSVLink>
              <i className="bi bi-download"></i>
            </Button>
            <Button
              onClick={() => downloadExcel()}
              className="me-2"
              color="primary"
              size="sm"
            >
              Excel
              <i className="bi bi-download"></i>
            </Button>
          </Col>
        </>
      ) : (
        ""
      )}

      <Col xs="12" className="mt-2">
        <MaterialTable
          title="Student List"
          columns={columns}
          data={studentList}
          isLoading={loader1}
          options={{
            search: true,
            sorting: true,
            actionsColumnIndex: -1,
            rowStyle: {
              backgroundColor: "#fff",
            },
            headerStyle: {
              backgroundColor: "#01579b",
              color: "#FFF",
            },
          }}
          editable={{
            onRowUpdate: (newData, oldData) =>
              new Promise((resolve, reject) => {
                updateTableData(newData);
                resolve();
              }),
          }}
        />
      </Col>
    </Row>
  );
}

export default StudentList;
