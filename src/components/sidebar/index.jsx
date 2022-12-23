import { Link } from "react-router-dom";
function SideBar({ user }) {

  const { user_scope = 'admin' } = user
  return (
    <aside id="sidebar" class="sidebar">
      <ul class="sidebar-nav" id="sidebar-nav">
        <li class="nav-item">
          <Link class="nav-link collapsed" to="/">
            <i class="bi bi-grid"></i>
            <span>Dashboard</span>
          </Link>
        </li>

        {
          !['DEPT_COD', 'CLUB', 'TEACHER'].includes(user_scope) && (
            <>
              <li class="nav-item">
                <Link class="nav-link collapsed" to="/users">
                  <i class="bi bi-person"></i>
                  <span>Users</span>
                </Link>
              </li>

              <li class="nav-item">
                <a class="nav-link collapsed" data-bs-target="#components-nav" data-bs-toggle="collapse" href="javascript:void(0)">
                  <i class="bi bi-menu-button-wide"></i><span>Features</span><i class="bi bi-chevron-down ms-auto"></i>
                </a>
                <ul id="components-nav" class="nav-content collapse " data-bs-parent="#sidebar-nav">
                  <li>
                    <Link to="/departments">
                      <span>Departments</span>
                    </Link>
                  </li>
                  <li>
                    <Link to="/programs">
                      <span>Programs</span>
                    </Link>
                  </li>
                  <li>
                    <Link to="/papers">
                      <span>Papers</span>
                    </Link>
                  </li>
                  <li>
                    <Link to="/batch">
                      <span>Batch</span>
                    </Link>
                  </li>
                  <li>
                    <Link to="/clubs">
                      <span>Clubs</span>
                    </Link>
                  </li>
                  <li>
                    <Link to="/students">
                      <span>Students</span>
                    </Link>
                  </li>
                </ul>
              </li>


              <li class="nav-item">
                <a class="nav-link collapsed" data-bs-target="#forms-nav" data-bs-toggle="collapse" href="javascript:void(0)">
                  <i class="bi bi-journal-text"></i><span>Admin Tools</span><i class="bi bi-chevron-down ms-auto"></i>
                </a>
                <ul id="forms-nav" class="nav-content collapse " data-bs-parent="#sidebar-nav">
                  <li>
                    <Link to="/settings">
                      <span>Settings</span>
                    </Link>
                  </li>
                  <li>
                    <Link to="/criterion-settings">
                      <span>Criterion Settings</span>
                    </Link>
                  </li>
                  <li>
                    <Link to="/view-score">
                      <span>View Score</span>
                    </Link>
                  </li>
                  <li>
                    <Link to="/data-backup">
                      <span>Data Backup</span>
                    </Link>
                  </li>
                </ul>
              </li>

              <li class="nav-item">
                <Link class="nav-link collapsed" to="/reports">
                  <i class="bi bi-card-list"></i>
                  <span>Reports</span>
                </Link>
              </li>

            </>

          )
        }

        <li class="nav-item">
          <Link class="nav-link collapsed" to="/all-criterions">
            <i class="bi bi-box-arrow-in-right"></i>
            <span>All Criterions</span>
          </Link>
        </li>

        {
          !['DEPT_COD', 'CLUB', 'TEACHER'].includes(user_scope) && (
            <li class="nav-item">
              <Link class="nav-link collapsed" to="/events">
                <i class="bi bi-file-earmark"></i>
                <span>Events</span>
              </Link>
            </li>
          )
        }


        <li class="nav-item">
          <Link class="nav-link collapsed" to="/summary">
            <i class="bi bi-dash-circle"></i>
            <span>Summary</span>
          </Link>
        </li>

        <li class="nav-item">
          <Link class="nav-link collapsed" to="/student-list">
            <i class="bi bi-file-earmark"></i>
            <span>Student List</span>
          </Link>
        </li>

        <li class="nav-item">
          <a class="nav-link collapsed" data-bs-target="#icons-nav" data-bs-toggle="collapse" href="javascript:void(0)">
            <i class="bi bi-gem"></i><span>Others</span><i class="bi bi-chevron-down ms-auto"></i>
          </a>
          <ul id="icons-nav" class="nav-content collapse " data-bs-parent="#sidebar-nav">
            {
              !['DEPT_COD', 'CLUB', 'TEACHER'].includes(user_scope) &&
              <li>
                <Link to="/noticeboard">
                  <span>Notice Board</span>
                </Link>
              </li>
            }
            <li>
              <Link to="/faq">
                <span>FAQ</span>
              </Link>
            </li>
            <li>
              <Link to="/about-us">
                <span>About Us</span>
              </Link>
            </li>
          </ul>
        </li>

      </ul>

    </aside>
  )
}

export default SideBar