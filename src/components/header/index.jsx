import React, { useState, useEffect, Fragment, useContext } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import logo from "../../assets/new_logo.png"
import axios from "../../axios";
import { toast } from 'react-toastify';
import GrayLoader from "../page-gray-loader";
import PermissionContext from "../../store/permissionContext"

function Header({ user, hide = false }) {
  const navigate = useNavigate();
  const location = useLocation()
  const [notification, setNotifications] = useState([]);
  const [userScopeClubs, setUserScopeClubs] = useState([]);
  const [roleChangeLoader, setRoleChangeLoader] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchrResults, setSearchResult] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const ctx = useContext(PermissionContext);
  
  useEffect(() => {
    if (user?.status) {
      getNotifications();
      getUserAssingedClubs();
    }
  }, []);

  const getUserAssingedClubs = () => {
    axios.get("/user/change-user-clubs").then((response) => {
      setUserScopeClubs(response?.data?.data || []);
    });
  };

  const getNotifications = () => {
    axios.get("user/notifications/list").then((response) => {
      setNotifications(response?.data?.data || []);
    });
  };

  const toggleMenu = () => {
    let bdy = document.querySelector('body')
    if (bdy?.classList?.contains('toggle-sidebar')) {
      bdy.classList.remove('toggle-sidebar')
    } else {
      bdy.classList.add("toggle-sidebar");
    }
  }

  const logout = () => {
    localStorage.clear()
    navigate("/login");
  }

  const changeScope = (scope, clubs) => {
    setRoleChangeLoader(true)
    axios
      .post(`/user/change-user-role`, { user_scope: `${scope}` })
      .then((response) => {
        if (scope === "CLUB") {
          changeClub(clubs?.id);
        } else if (response?.data?.data) {
          toast.success(`Role Changed to ${scope}`, {
            position: "top-right",
            autoClose: 2000,
          });
          setTimeout(() => {
            window.location.href = "/";
          }, 1500)
        } else {
          setRoleChangeLoader(false)
          toast.error(`Something went wrong`, {
            position: "top-right",
            autoClose: 2000,
          });
        }
      })
      .catch((err) => {
        setRoleChangeLoader(false)
        toast.error(`Something went wrong`, {
          position: "top-right",
          autoClose: 2000,
        });
      });
  };

  const changeClub = (id) => {
    axios
      .post(`/user/change-user-clubs`, { user_club: id })
      .then((response) => {
        if (response?.data?.data) {
          toast.success('Role Changed to CLUB', {
            position: "top-right",
            autoClose: 2000,
          });
          setTimeout(() => {
            window.location.href = "/";
          }, 1500)
        } else {
          setRoleChangeLoader(false)
          toast.error(`Something went wrong`, {
            position: "top-right",
            autoClose: 2000,
          });
        }
      }).catch(() => {
        setRoleChangeLoader(false)
        toast.error(`Something went wrong`, {
          position: "top-right",
          autoClose: 2000,
        });
      })
  };

  const searchTerm = (e) => {
    e.preventDefault()
    if (searchQuery) {
      axios
        .get("/criterion/search", { params: { query: searchQuery } })
        .then((response) => {
          setSearchResult(response?.data?.data);
          setIsSearching(true);
        }).catch(() => setIsSearching(false))
    }
  }

  const handleClick = (data) => {
    setSearchQuery('')
    setIsSearching(false)
    setSearchResult([])
    navigate(`/all-criterions/${data.criterion}`);
  };

  const searchChange = (e) => {
    const { value } = e.target
    if (value) {
      setSearchQuery(value)
    } else {
      setSearchQuery('')
      setIsSearching(false)
      setSearchResult([])
    }
  }
  return (
    <Fragment>
      {roleChangeLoader && <GrayLoader />}
      <header id="header" className="header fixed-top d-flex align-items-center">
        {
          !roleChangeLoader ?
            <>
              <div className="d-flex align-items-center justify-content-between">
                <Link to="/" className="logo d-flex align-items-center">
                  <img src={logo} alt="logo" />
                  <span className="d-none d-lg-block">NAAC</span>
                </Link>
                {
                  !hide && <i id='toggle' onClick={toggleMenu} className="bi bi-list toggle-sidebar-btn"></i>
                }
              </div>

              {
                !hide && !location.pathname.includes('all-criterions') &&
                <div className="search-bar">
                  <form className="search-form d-flex align-items-center" onSubmit={searchTerm} >
                    <input onChange={searchChange} type="text" value={searchQuery} name="query" placeholder="Search" title="Enter search keyword" />
                    <button type="submit" title="Search"><i className="bi bi-search"></i></button>
                  </form>
                  {isSearching &&
                    <div className="search-results">
                      {
                        searchrResults.length > 0 ?
                          searchrResults.map((res, k) => {
                            return (
                              <div key={k} onClick={() => handleClick(res)} className="search-item">
                                <p><span>{res?.criterion} - </span> {res?.question}</p>
                              </div>
                            )
                          }) : 'No Results found'
                      }
                    </div>}
                </div>
              }

              <nav className="header-nav ms-auto">
                <ul className="d-flex align-items-center">

                  {
                    ctx?.permissions?.allow_signup ?
                      <>
                        {
                          user?.user_scope !== 'NAAC_COD' &&
                          user?.user_scope !== 'DEPT_COD' &&
                          user?.user_scope !== 'IQAC_COD' &&
                          !hide && (
                            <li className="nav-item dropdown pe-3">
                              <a className="nav-link nav-profile d-flex align-items-center pe-0" href="#" data-bs-toggle="dropdown">
                                <span style={{ fontSize: '16px', marginBottom: '7px' }}><i className="bi bi-gear"></i></span>
                                <span className="d-none d-md-block dropdown-toggle ps-2">
                                  {user?.user_scope === "CLUB" ? user?.clubs?.name : user?.user_scope}
                                </span>
                              </a>
                              <ul className="dropdown-menu dropdown-menu-end dropdown-menu-arrow profile">
                                <li onClick={() => changeScope("TEACHER", "")}>
                                  <a href="javascript:void(0)" className="dropdown-item d-flex align-items-center">
                                    <span>TEACHER</span>
                                  </a>
                                </li>
                                {
                                  userScopeClubs.length > 0 ? userScopeClubs.map((val, ky) => {
                                    return (
                                      <li key={ky} onClick={() => changeScope("CLUB", val)}>
                                        <a href="javascript:void(0)" className="dropdown-item d-flex align-items-center">
                                          <span>{val?.name}</span>
                                        </a>
                                      </li>
                                    )
                                  }) : ''
                                }
                              </ul>
                            </li>
                          )
                        }
                      </>
                      :
                      ''
                  }


                  {
                    !hide &&
                    <li className="nav-item dropdown">
                      <Link className="nav-link nav-icon" to="/notifications">
                        <i className="bi bi-bell"></i>
                        <span className="badge bg-primary badge-number">
                          {
                            notification.filter((message) => message.is_viewed === false).length
                          }
                        </span>
                      </Link>
                    </li>
                  }


                  <li className="nav-item dropdown pe-3">

                    <a className="nav-link nav-profile d-flex align-items-center pe-0" href="#" data-bs-toggle="dropdown">
                      {/* <img src={"assets/img/profile-img.jpg"} alt="img" className="rounded-circle" /> */}
                      <span style={{ fontSize: '22px', marginBottom: '7px' }}><i className="bi bi-person"></i></span>
                      <span className="d-none d-md-block dropdown-toggle ps-2">{user?.username}</span>
                    </a>

                    <ul className="dropdown-menu dropdown-menu-end dropdown-menu-arrow profile">
                      <li className="dropdown-header">
                        <h6>{user?.first_name}</h6>
                        <span>{user?.email}</span>
                      </li>
                      <li>
                        <hr className="dropdown-divider" />
                      </li>

                      {
                        !hide && (
                          <>
                            <li>
                              <Link to='/my-profile' className="dropdown-item d-flex align-items-center">
                                <i className="bi bi-person"></i>
                                <span>My Profile</span>
                              </Link>
                            </li>
                            <li>
                              <Link to='/update-password' className="dropdown-item d-flex align-items-center">
                                <i className="bi bi-pen"></i>
                                <span>Update Password</span>
                              </Link>
                            </li>
                          </>
                        )
                      }

                      <li>
                        <hr className="dropdown-divider" />
                      </li>

                      <li onClick={logout}>
                        <a className="dropdown-item d-flex align-items-center" href="javascript:void(0)">
                          <i className="bi bi-box-arrow-right"></i>
                          <span>Sign Out</span>
                        </a>
                      </li>

                    </ul>
                  </li>

                </ul>
              </nav>
            </>
            :
            ''
        }
      </header>
    </Fragment>

  )
}

export default Header