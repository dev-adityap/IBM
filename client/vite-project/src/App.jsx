import { useEffect, useMemo, useState } from "react";
import {
  ArrowUpRight,
  Bot,
  CalendarClock,
  CheckCircle2,
  Clock,
  LayoutDashboard,
  LogOut,
  Plus,
  Search,
  Sparkles,
  TrendingUp,
  UserCheck,
  Users,
  X,
} from "lucide-react";
import api from "./api";
import Login from "./Login";
import "./App.css";

function App() {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("user");

    try {
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  // ============================================
  // VISITOR STATE
  // ============================================

  const [visitors, setVisitors] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [activePage, setActivePage] = useState("dashboard");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [editingVisitor, setEditingVisitor] = useState(null);
  const [showRequest, setShowRequest] = useState(false);
  const [editingRequest, setEditingRequest] = useState(null);
  const [requestData, setRequestData] = useState({
    organization: "",
    personToMeet: "",
    purpose: "",
  });

  const [formData, setFormData] = useState({
    visitorName: "",
    mobileNumber: "",
    email: "",
    organization: "",
    personToMeet: "",
    purpose: "",
  });

  // ============================================
  // ROLE CHECKS
  // ============================================

  const canManageVisitors = user?.role === "admin";

  const isAdmin = user?.role === "admin";

  // ============================================
  // LOGIN
  // ============================================

  const handleLogin = (loggedInUser) => {
    setUser(loggedInUser);
    setActivePage(
      loggedInUser?.role === "admin" ? "dashboard" : "visitors"
    );
  };

  // ============================================
  // LOGOUT
  // ============================================

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    setUser(null);
    setVisitors([]);
  };

  // ============================================
  // FETCH VISITORS
  // ============================================

  const loadVisitors = async () => {
    try {
      const response = await api.get("/");
      setVisitors(response.data);
    } catch (error) {
      console.error("Error fetching visitors:", error);

      if (error.response?.status === 401) {
        handleLogout();
      }
    }
  };

  // ============================================
  // FETCH WHEN LOGGED IN
  // ============================================

  useEffect(() => {
    if (!user) {
      return;
    }

    let active = true;

    api
      .get("/")
      .then((response) => {
        if (active) {
          setVisitors(response.data);
        }
      })
      .catch((error) => {
        console.error("Error fetching visitors:", error);

        if (error.response?.status === 401) {
          handleLogout();
        }
      });

    return () => {
      active = false;
    };
  }, [user]);

  // ============================================
  // KEEP VISITORS OUT OF ADMIN PAGES
  // ============================================

  const currentPage =
    user && user.role !== "admin" && activePage === "dashboard"
      ? "visitors"
      : activePage;

  // ============================================
  // HANDLE INPUT
  // ============================================

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // ============================================
  // RESET FORM
  // ============================================

  const resetForm = () => {
    setFormData({
      visitorName: "",
      mobileNumber: "",
      email: "",
      organization: "",
      personToMeet: "",
      purpose: "",
    });

    setEditingVisitor(null);
  };

  // ============================================
  // EDIT OWN REQUEST (PENDING ONLY)
  // ============================================

  const handleEditRequest = (visitor) => {
    if (visitor.status !== "Pending") {
      alert("This visit can no longer be edited.");
      return;
    }

    setEditingRequest(visitor);

    setRequestData({
      organization: visitor.organization || "",
      personToMeet: visitor.personToMeet || "",
      purpose: visitor.purpose || "",
    });

    setShowRequest(true);
  };

  // ============================================
  // VISITOR REQUEST A VISIT
  // ============================================

  const handleRequestSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editingRequest) {
        await api.put(`/${editingRequest._id}`, requestData);

        alert("Visit request updated.");
      } else {
        await api.post("/", requestData);

        alert("Visit request sent. An admin will approve it.");
      }

      setRequestData({
        organization: "",
        personToMeet: "",
        purpose: "",
      });

      setEditingRequest(null);
      setShowRequest(false);

      loadVisitors();
    } catch (error) {
      console.error("Error saving request:", error);

      if (error.response?.status === 403) {
        alert(
          error.response?.data?.message ||
            "You cannot edit this visit."
        );
      } else {
        alert("Failed to save visit request");
      }
    }
  };

  // ============================================
  // ADD VISITOR
  // ============================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await api.post("/", formData);

      alert("Visitor added successfully!");

      resetForm();
      setShowForm(false);

      loadVisitors();
    } catch (error) {
      console.error("Error adding visitor:", error);

      if (error.response?.status === 403) {
        alert("You do not have permission to add visitors.");
      } else {
        alert("Failed to add visitor");
      }
    }
  };

  // ============================================
  // EDIT VISITOR
  // ============================================

  const handleEdit = (visitor) => {
    if (!canManageVisitors) {
      alert("You do not have permission to edit visitors.");
      return;
    }

    setEditingVisitor(visitor);

    setFormData({
      visitorName: visitor.visitorName,
      mobileNumber: visitor.mobileNumber,
      email: visitor.email || "",
      organization: visitor.organization,
      personToMeet: visitor.personToMeet,
      purpose: visitor.purpose,
    });

    setShowForm(true);
  };

  // ============================================
  // UPDATE VISITOR
  // ============================================

  const handleUpdate = async (e) => {
    e.preventDefault();

    try {
      await api.put(`/${editingVisitor._id}`, formData);

      alert("Visitor updated successfully!");

      resetForm();
      setShowForm(false);

      loadVisitors();
    } catch (error) {
      console.error("Error updating visitor:", error);

      if (error.response?.status === 403) {
        alert("You do not have permission to update visitors.");
      } else {
        alert("Failed to update visitor");
      }
    }
  };

  // ============================================
  // UPDATE VISITOR STATUS
  // ============================================

  const updateStatus = async (visitor, status) => {
    if (!canManageVisitors) {
      alert("You do not have permission to update visitors.");
      return;
    }

    try {
      await api.put(`/${visitor._id}`, { status });

      loadVisitors();
    } catch (error) {
      console.error("Error updating status:", error);

      if (error.response?.status === 403) {
        alert("You do not have permission to update visitors.");
      } else {
        alert("Failed to update visitor");
      }
    }
  };

  // ============================================
  // DELETE VISITOR
  // ============================================

  const deleteVisitor = async (id) => {
    if (!isAdmin) {
      alert("Only administrators can delete visitors.");
      return;
    }

    const confirmDelete = window.confirm(
      "Are you sure you want to delete this visitor?"
    );

    if (!confirmDelete) {
      return;
    }

    try {
      await api.delete(`/${id}`);

      alert("Visitor deleted successfully!");

      loadVisitors();
    } catch (error) {
      console.error("Error deleting visitor:", error);

      if (error.response?.status === 403) {
        alert("Only administrators can delete visitors.");
      } else {
        alert("Failed to delete visitor");
      }
    }
  };

  // ============================================
  // VISIBLE RECORDS
  // ============================================

  const visibleVisitors = visitors;

  // ============================================
  // SEARCH + STATUS FILTER
  // ============================================

  const filteredVisitors = visibleVisitors.filter((visitor) => {
    const term = search.toLowerCase();

    const matchesSearch =
      (visitor.visitorName || "").toLowerCase().includes(term) ||
      (visitor.mobileNumber || "").includes(search) ||
      (visitor.organization || "").toLowerCase().includes(term);

    const matchesStatus =
      statusFilter === "All" || visitor.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // ============================================
  // STATISTICS
  // ============================================

  const checkedIn = visitors.filter(
    (visitor) => visitor.status === "Checked In"
  ).length;

  const checkedOut = visitors.filter(
    (visitor) => visitor.status === "Checked Out"
  ).length;

  const pending = visitors.filter(
    (visitor) => visitor.status === "Pending"
  ).length;

  // ============================================
  // WEEKLY ACTIVITY CHART
  // ============================================

  const chart = useMemo(() => {
    const days = [];
    const today = new Date();

    for (let i = 6; i >= 0; i -= 1) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);

      const count = visitors.filter((visitor) => {
        const stamp = new Date(visitor.visitDateTime);

        return (
          stamp.getDate() === date.getDate() &&
          stamp.getMonth() === date.getMonth() &&
          stamp.getFullYear() === date.getFullYear()
        );
      }).length;

      days.push({
        label: date.toLocaleDateString("en-US", { weekday: "short" }),
        count,
      });
    }

    return days;
  }, [visitors]);

  const chartPoints = useMemo(() => {
    const width = 720;
    const height = 220;
    const max = Math.max(...chart.map((day) => day.count), 4);
    const step = width / Math.max(chart.length - 1, 1);

    const points = chart.map((day, index) => ({
      x: index * step,
      y: height - (day.count / max) * (height - 30) - 12,
    }));

    const line = points
      .map((point, index) => `${index === 0 ? "M" : "L"}${point.x},${point.y}`)
      .join(" ");

    const area = `${line} L${width},${height} L0,${height} Z`;

    return { line, area, points };
  }, [chart]);

  // ============================================
  // AI INSIGHTS
  // ============================================

  const insights = useMemo(() => {
    const peak = chart.reduce(
      (best, day) => (day.count > best.count ? day : best),
      { label: "—", count: 0 }
    );

    const list = [];

    list.push(
      pending
        ? `${pending} visit ${
            pending === 1 ? "request needs" : "requests need"
          } your approval.`
        : "All visit requests are cleared."
    );

    list.push(
      checkedIn
        ? `${checkedIn} ${
            checkedIn === 1 ? "visitor is" : "visitors are"
          } currently on site.`
        : "No visitors are on site right now."
    );

    if (peak.count > 0) {
      list.push(`Busiest day this week: ${peak.label}.`);
    }

    return list;
  }, [pending, checkedIn, chart]);

  // ============================================
  // STATUS STYLE
  // ============================================

  const statusClass = (status) => {
    if (status === "Pending") {
      return "chip pending";
    }

    return status === "Checked In"
      ? "chip checked-in"
      : "chip checked-out";
  };

  // ============================================
  // LOGIN SCREEN
  // ============================================

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  // ============================================
  // OPEN ADD VISITOR FORM
  // ============================================

  const openAddForm = () => {
    if (!canManageVisitors) {
      alert("You do not have permission to add visitors.");
      return;
    }

    resetForm();
    setShowForm(true);
  };

  const initials = (user.name || "U").charAt(0).toUpperCase();

  // ============================================
  // PAGE META
  // ============================================

  const pageTitle =
    currentPage === "dashboard"
      ? "Dashboard"
      : isAdmin
      ? "Visitors"
      : "My Visits";

  const pageSubtitle =
    currentPage === "dashboard"
      ? "Live overview of every visitor moving through your gate."
      : isAdmin
      ? "Search, approve and manage every visitor record."
      : "Track the status of the visits you have requested.";

  // ============================================
  // SHARED TABLE BLOCKS
  // ============================================

  const statCards = [
    {
      label: "Total Visitors",
      value: visitors.length,
      icon: Users,
      tone: "violet",
      hint: "All time records",
    },
    {
      label: "On Site",
      value: checkedIn,
      icon: UserCheck,
      tone: "mint",
      hint: "Checked in right now",
    },
    {
      label: "Pending",
      value: pending,
      icon: Clock,
      tone: "amber",
      hint: "Awaiting approval",
    },
    {
      label: "Completed",
      value: checkedOut,
      icon: CheckCircle2,
      tone: "rose",
      hint: "Checked out visits",
    },
  ];

  const filterTabs = ["All", "Pending", "Checked In", "Checked Out"];

  // ============================================
  // UI
  // ============================================

  return (
    <div className="app">
      <div className="ambient" aria-hidden="true" />

      {/* ==========================================
          SIDEBAR
      ========================================== */}

      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">
            <Sparkles size={18} />
          </div>
          <div className="brand-text">
            <strong>VisitEase</strong>
            <span>AI Visitor Desk</span>
          </div>
        </div>

        <nav className="nav">
          <p className="nav-label">Workspace</p>

          {isAdmin && (
            <button
              className={`nav-item ${
                currentPage === "dashboard" ? "active" : ""
              }`}
              onClick={() => setActivePage("dashboard")}
            >
              <LayoutDashboard size={18} />
              <span>Dashboard</span>
            </button>
          )}

          <button
            className={`nav-item ${
              currentPage === "visitors" ? "active" : ""
            }`}
            onClick={() => setActivePage("visitors")}
          >
            <Users size={18} />
            <span>{isAdmin ? "Visitors" : "My Visits"}</span>
          </button>

          <button
            className="nav-item"
            onClick={() => setActivePage("dashboard")}
            disabled={!isAdmin}
          >
            <CalendarClock size={18} />
            <span>Schedule</span>
          </button>
        </nav>

        <div className="ai-card">
          <div className="ai-card-icon">
            <Bot size={16} />
          </div>
          <strong>AI Assistant</strong>
          <p>
            Insights update automatically as visitors arrive and leave.
          </p>
        </div>

        <div className="sidebar-user">
          <div className="user-avatar">{initials}</div>
          <div className="user-details">
            <strong>{user.name}</strong>
            <span className="role-pill">{user.role}</span>
          </div>
          <button
            className="icon-btn"
            title="Logout"
            aria-label="Logout"
            onClick={handleLogout}
          >
            <LogOut size={17} />
          </button>
        </div>
      </aside>

      {/* ==========================================
          MAIN CONTENT
      ========================================== */}

      <main className="main-content">
        <header className="topbar">
          <div>
            <h1>{pageTitle}</h1>
            <p>{pageSubtitle}</p>
          </div>

          <div className="topbar-actions">
            <div className="search-wrap">
              <Search size={16} />
              <input
                type="text"
                placeholder="Search visitors..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            {canManageVisitors ? (
              <button className="primary-btn" onClick={openAddForm}>
                <Plus size={17} />
                Add Visitor
              </button>
            ) : (
              <button
                className="primary-btn"
                onClick={() => setShowRequest(true)}
              >
                <Plus size={17} />
                Request a Visit
              </button>
            )}
          </div>
        </header>

        {/* ========================================
            DASHBOARD PAGE
        ======================================== */}

        {currentPage === "dashboard" && (
          <>
            <section className="stats">
              {statCards.map((card) => {
                const Icon = card.icon;

                return (
                  <article className="stat-card" key={card.label}>
                    <div className="stat-head">
                      <span>{card.label}</span>
                      <div className={`stat-icon ${card.tone}`}>
                        <Icon size={17} />
                      </div>
                    </div>

                    <strong className="stat-value">{card.value}</strong>

                    <p className="stat-hint">
                      <TrendingUp size={13} />
                      {card.hint}
                    </p>
                  </article>
                );
              })}
            </section>

            <section className="grid-two">
              <article className="panel chart-panel">
                <div className="panel-head">
                  <div>
                    <h2>Visitor activity</h2>
                    <p>Visits recorded over the last 7 days</p>
                  </div>
                  <span className="tag">
                    <TrendingUp size={13} />
                    Live
                  </span>
                </div>

                <div className="chart">
                  <svg
                    viewBox="0 0 720 220"
                    preserveAspectRatio="none"
                    role="img"
                    aria-label="Visitor activity chart"
                  >
                    <defs>
                      <linearGradient
                        id="areaFill"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop offset="0%" stopColor="#7c5cff" stopOpacity="0.45" />
                        <stop offset="100%" stopColor="#7c5cff" stopOpacity="0" />
                      </linearGradient>
                      <linearGradient
                        id="lineStroke"
                        x1="0"
                        y1="0"
                        x2="1"
                        y2="0"
                      >
                        <stop offset="0%" stopColor="#7c5cff" />
                        <stop offset="100%" stopColor="#b18cff" />
                      </linearGradient>
                    </defs>

                    <path d={chartPoints.area} fill="url(#areaFill)" />

                    <path
                      d={chartPoints.line}
                      fill="none"
                      stroke="url(#lineStroke)"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />

                    {chartPoints.points.map((point, index) => (
                      <circle
                        key={index}
                        cx={point.x}
                        cy={point.y}
                        r="4"
                        fill="#0b0b12"
                        stroke="#b18cff"
                        strokeWidth="2.5"
                      />
                    ))}
                  </svg>

                  <div className="chart-labels">
                    {chart.map((day) => (
                      <span key={day.label}>{day.label}</span>
                    ))}
                  </div>
                </div>
              </article>

              <article className="panel ai-panel">
                <div className="panel-head">
                  <div>
                    <h2>AI assistant</h2>
                    <p>Generated from today&apos;s data</p>
                  </div>
                  <div className="stat-icon violet">
                    <Bot size={17} />
                  </div>
                </div>

                <ul className="insight-list">
                  {insights.map((item) => (
                    <li key={item}>
                      <Sparkles size={14} />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>

                <div className="ai-cta">
                  <p>
                    {checkedIn
                      ? `${checkedIn} guests are inside. Keep the host notified.`
                      : "The lobby is clear. Ready for the next arrival."}
                  </p>
                </div>
              </article>
            </section>

            <section className="panel">
              <div className="panel-head">
                <div>
                  <h2>Recent visitors</h2>
                  <p>Latest entries from the reception desk</p>
                </div>
                <button
                  className="ghost-btn"
                  onClick={() => setActivePage("visitors")}
                >
                  View all
                  <ArrowUpRight size={15} />
                </button>
              </div>

              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Visitor</th>
                      <th>Mobile</th>
                      <th>Organization</th>
                      <th>Person to Meet</th>
                      <th>Date &amp; Time</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visitors.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="empty">
                          No visitor records found.
                        </td>
                      </tr>
                    ) : (
                      visitors.slice(0, 5).map((visitor) => (
                        <tr key={visitor._id}>
                          <td>
                            <div className="person">
                              <div className="mini-avatar">
                                {(visitor.visitorName || "V")
                                  .charAt(0)
                                  .toUpperCase()}
                              </div>
                              <div>
                                <strong>{visitor.visitorName}</strong>
                                <small>{visitor.email || "—"}</small>
                              </div>
                            </div>
                          </td>
                          <td>{visitor.mobileNumber}</td>
                          <td>{visitor.organization}</td>
                          <td>{visitor.personToMeet}</td>
                          <td className="muted-cell">
                            {new Date(
                              visitor.visitDateTime
                            ).toLocaleString()}
                          </td>
                          <td>
                            <span className={statusClass(visitor.status)}>
                              {visitor.status}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        )}

        {/* ========================================
            VISITORS PAGE
        ======================================== */}

        {currentPage === "visitors" && (
          <>
            <section className="panel">
              <div className="panel-head">
                <div>
                  <h2>{isAdmin ? "All visitors" : "My visit history"}</h2>
                  <p>
                    {isAdmin
                      ? "Every record captured at your gate."
                      : "Your visit requests and their current status."}
                  </p>
                </div>

                <div className="tabs">
                  {filterTabs.map((tab) => (
                    <button
                      key={tab}
                      className={`tab ${statusFilter === tab ? "active" : ""}`}
                      onClick={() => setStatusFilter(tab)}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
              </div>

              {isAdmin ? (
                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>Visitor</th>
                        <th>Mobile</th>
                        <th>Organization</th>
                        <th>Person to Meet</th>
                        <th>Purpose</th>
                        <th>Date &amp; Time</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredVisitors.length === 0 ? (
                        <tr>
                          <td colSpan="8" className="empty">
                            No visitor records found.
                          </td>
                        </tr>
                      ) : (
                        filteredVisitors.map((visitor) => (
                          <tr key={visitor._id}>
                            <td>
                              <div className="person">
                                <div className="mini-avatar">
                                  {(visitor.visitorName || "V")
                                    .charAt(0)
                                    .toUpperCase()}
                                </div>
                                <div>
                                  <strong>{visitor.visitorName}</strong>
                                  <small>{visitor.email || "—"}</small>
                                </div>
                              </div>
                            </td>
                            <td>{visitor.mobileNumber}</td>
                            <td>{visitor.organization}</td>
                            <td>{visitor.personToMeet}</td>
                            <td className="muted-cell">{visitor.purpose}</td>
                            <td className="muted-cell">
                              {new Date(
                                visitor.visitDateTime
                              ).toLocaleString()}
                            </td>
                            <td>
                              <span className={statusClass(visitor.status)}>
                                {visitor.status}
                              </span>
                            </td>
                            <td>
                              <div className="actions">
                                {canManageVisitors && (
                                  <button
                                    className="table-btn violet"
                                    onClick={() => handleEdit(visitor)}
                                  >
                                    Edit
                                  </button>
                                )}

                                {canManageVisitors &&
                                  visitor.status === "Pending" && (
                                    <button
                                      className="table-btn mint"
                                      onClick={() =>
                                        updateStatus(visitor, "Checked In")
                                      }
                                    >
                                      Approve
                                    </button>
                                  )}

                                {canManageVisitors &&
                                  visitor.status === "Checked In" && (
                                    <button
                                      className="table-btn amber"
                                      onClick={() =>
                                        updateStatus(visitor, "Checked Out")
                                      }
                                    >
                                      Check Out
                                    </button>
                                  )}

                                {isAdmin && (
                                  <button
                                    className="table-btn rose"
                                    onClick={() =>
                                      deleteVisitor(visitor._id)
                                    }
                                  >
                                    Delete
                                  </button>
                                )}

                                {!isAdmin && (
                                  <span className="muted-cell">View only</span>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>Person to Meet</th>
                        <th>Organization</th>
                        <th>Purpose</th>
                        <th>Date &amp; Time</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredVisitors.length === 0 ? (
                        <tr>
                          <td colSpan="6" className="empty">
                            You have no visit requests yet.
                          </td>
                        </tr>
                      ) : (
                        filteredVisitors.map((visitor) => (
                          <tr key={visitor._id}>
                            <td>
                              <strong>{visitor.personToMeet}</strong>
                            </td>
                            <td>{visitor.organization}</td>
                            <td className="muted-cell">{visitor.purpose}</td>
                            <td className="muted-cell">
                              {new Date(
                                visitor.visitDateTime
                              ).toLocaleString()}
                            </td>
                            <td>
                              <span className={statusClass(visitor.status)}>
                                {visitor.status}
                              </span>
                            </td>
                            <td>
                              <div className="actions">
                                {visitor.status === "Pending" ? (
                                  <button
                                    className="table-btn violet"
                                    onClick={() =>
                                      handleEditRequest(visitor)
                                    }
                                  >
                                    Edit
                                  </button>
                                ) : (
                                  <span className="muted-cell">Locked</span>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </>
        )}

        {/* ========================================
            VISITOR REQUEST MODAL
        ======================================== */}

        {showRequest && !isAdmin && (
          <div className="modal-overlay">
            <div className="modal">
              <div className="modal-header">
                <div>
                  <h2>
                    {editingRequest
                      ? "Edit visit request"
                      : "Request a visit"}
                  </h2>
                  <p>
                    {editingRequest
                      ? "Update the details of your request."
                      : "Tell us who you are meeting and why."}
                  </p>
                </div>

                <button
                  className="icon-btn"
                  aria-label="Close"
                  onClick={() => {
                    setEditingRequest(null);
                    setShowRequest(false);
                  }}
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleRequestSubmit}>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Your Name</label>
                    <input type="text" value={user.name} disabled />
                  </div>

                  <div className="form-group">
                    <label>Organization / College</label>
                    <input
                      type="text"
                      name="organization"
                      placeholder="Enter organization"
                      value={requestData.organization}
                      onChange={(e) =>
                        setRequestData({
                          ...requestData,
                          organization: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div className="form-group">
                    <label>Person to Meet</label>
                    <input
                      type="text"
                      name="personToMeet"
                      placeholder="Enter employee name"
                      value={requestData.personToMeet}
                      onChange={(e) =>
                        setRequestData({
                          ...requestData,
                          personToMeet: e.target.value,
                        })
                      }
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Purpose of Visit</label>
                    <input
                      type="text"
                      name="purpose"
                      placeholder="Enter purpose"
                      value={requestData.purpose}
                      onChange={(e) =>
                        setRequestData({
                          ...requestData,
                          purpose: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                </div>

                <div className="modal-actions">
                  <button
                    type="button"
                    className="secondary-btn"
                    onClick={() => {
                      setEditingRequest(null);
                      setShowRequest(false);
                    }}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="primary-btn">
                    {editingRequest ? "Update request" : "Send request"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ========================================
            ADD / EDIT MODAL
        ======================================== */}

        {showForm && canManageVisitors && (
          <div className="modal-overlay">
            <div className="modal">
              <div className="modal-header">
                <div>
                  <h2>
                    {editingVisitor ? "Edit visitor" : "Add new visitor"}
                  </h2>
                  <p>
                    {editingVisitor
                      ? "Update the visitor's information."
                      : "Enter the visitor's information."}
                  </p>
                </div>

                <button
                  className="icon-btn"
                  aria-label="Close"
                  onClick={() => {
                    resetForm();
                    setShowForm(false);
                  }}
                >
                  <X size={18} />
                </button>
              </div>

              <form
                onSubmit={editingVisitor ? handleUpdate : handleSubmit}
              >
                <div className="form-grid">
                  <div className="form-group">
                    <label>Visitor Name</label>
                    <input
                      type="text"
                      name="visitorName"
                      placeholder="Enter visitor name"
                      value={formData.visitorName}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Mobile Number</label>
                    <input
                      type="tel"
                      name="mobileNumber"
                      placeholder="Enter mobile number"
                      value={formData.mobileNumber}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Email Address</label>
                    <input
                      type="email"
                      name="email"
                      placeholder="Enter email address"
                      value={formData.email}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="form-group">
                    <label>Organization / College</label>
                    <input
                      type="text"
                      name="organization"
                      placeholder="Enter organization"
                      value={formData.organization}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Person to Meet</label>
                    <input
                      type="text"
                      name="personToMeet"
                      placeholder="Enter employee name"
                      value={formData.personToMeet}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Purpose of Visit</label>
                    <input
                      type="text"
                      name="purpose"
                      placeholder="Enter purpose"
                      value={formData.purpose}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="modal-actions">
                  <button
                    type="button"
                    className="secondary-btn"
                    onClick={() => {
                      resetForm();
                      setShowForm(false);
                    }}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="primary-btn">
                    {editingVisitor ? "Update visitor" : "Add visitor"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
