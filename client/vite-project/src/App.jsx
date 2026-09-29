import { useEffect, useState } from "react";
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
  const [editingVisitor, setEditingVisitor] = useState(null);

  const [formData, setFormData] = useState({
    visitorName: "",
    mobileNumber: "",
    email: "",
    organization: "",
    personToMeet: "",
    purpose: ""
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

  const fetchVisitors = async () => {
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
    if (user) {
      fetchVisitors();
    }
  }, [user]);

  // ============================================
  // KEEP VISITORS OUT OF ADMIN PAGES
  // ============================================

  useEffect(() => {
    if (user && user.role !== "admin" && activePage === "dashboard") {
      setActivePage("visitors");
    }
  }, [user, activePage]);

  // ============================================
  // HANDLE INPUT
  // ============================================

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
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
      purpose: ""
    });

    setEditingVisitor(null);
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

      fetchVisitors();
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
      purpose: visitor.purpose
    });

    setShowForm(true);
  };

  // ============================================
  // UPDATE VISITOR
  // ============================================

  const handleUpdate = async (e) => {
    e.preventDefault();

    try {
      await api.put(
        `/${editingVisitor._id}`,
        formData
      );

      alert("Visitor updated successfully!");

      resetForm();
      setShowForm(false);

      fetchVisitors();
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
  // CHECK OUT VISITOR
  // ============================================

  const handleCheckOut = async (visitor) => {
    if (!canManageVisitors) {
      alert("You do not have permission to check out visitors.");
      return;
    }

    try {
      await api.put(`/${visitor._id}`, {
        status: "Checked Out"
      });

      fetchVisitors();
    } catch (error) {
      console.error("Error checking out visitor:", error);

      if (error.response?.status === 403) {
        alert("You do not have permission to check out visitors.");
      } else {
        alert("Failed to check out visitor");
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

      fetchVisitors();
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
  // ROLE-BASED VISIBLE RECORDS
  // ============================================

  // Admins see every record, visitors only their own
  const visibleVisitors = isAdmin
    ? visitors
    : visitors.filter(
        (visitor) =>
          visitor.visitorName?.toLowerCase() ===
            user?.name?.toLowerCase() ||
          (visitor.email &&
            user?.email &&
            visitor.email.toLowerCase() ===
              user.email.toLowerCase())
      );

  // ============================================
  // SEARCH
  // ============================================

  const filteredVisitors = visibleVisitors.filter(
    (visitor) =>
      visitor.visitorName
        .toLowerCase()
        .includes(search.toLowerCase()) ||
      visitor.mobileNumber.includes(search)
  );

  // ============================================
  // STATISTICS
  // ============================================

  const checkedIn = visitors.filter(
    (visitor) => visitor.status === "Checked In"
  ).length;

  const checkedOut = visitors.filter(
    (visitor) => visitor.status === "Checked Out"
  ).length;

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

  // ============================================
  // UI
  // ============================================

  return (
    <div className="app">

      {/* ==========================================
          SIDEBAR
      ========================================== */}

      <aside className="sidebar">

        {/* LOGO */}

        <div className="logo">

          <img className="logo-icon" src="/favicon.ico" alt="VisitEase" />

          <div>
            <h2>VisitEase</h2>
            <span>Visitor Management</span>
          </div>

        </div>

        {/* NAVIGATION */}

        <nav>

          {isAdmin && (
            <a
              className={
                activePage === "dashboard"
                  ? "active"
                  : ""
              }
              onClick={() =>
                setActivePage("dashboard")
              }
            >
              Dashboard
            </a>
          )}

          <a
            className={
              activePage === "visitors"
                ? "active"
                : ""
            }
            onClick={() =>
              setActivePage("visitors")
            }
          >
            Visitors
          </a>

        </nav>

        {/* USER INFO */}

        <div className="sidebar-user">

          <div className="user-avatar">
            {user.name?.charAt(0).toUpperCase()}
          </div>

          <div className="user-details">

            <strong>
              {user.name}
            </strong>

            <span>
              {user.role}
            </span>

          </div>

          <button
            className="logout-btn"
            onClick={handleLogout}
          >
            Logout
          </button>

        </div>

        {/* SIDEBAR BOTTOM */}

        <div className="sidebar-bottom">

          <p>
            Employee Visitor System
          </p>

          <span>
            MERN Stack Application
          </span>

        </div>

      </aside>


      {/* ==========================================
          MAIN CONTENT
      ========================================== */}

      <main className="main-content">


        {/* ========================================
            DASHBOARD PAGE
        ======================================== */}

        {activePage === "dashboard" && (

          <>

            {/* HEADER */}

            <header className="topbar">

              <div>

                <h1>
                  Dashboard
                </h1>

                <p>
                  Welcome to your visitor management dashboard.
                </p>

              </div>

              {/* ADMIN + RECEPTIONIST ONLY */}

              {canManageVisitors && (

                <button
                  className="add-btn"
                  onClick={openAddForm}
                >
                  + Add Visitor
                </button>

              )}

            </header>


            {/* STATISTICS */}

            <section className="stats">

              {/* TOTAL */}

              <div className="stat-card">

                <div>

                  <span>
                    Total Visitors
                  </span>

                  <h2>
                    {visitors.length}
                  </h2>

                </div>

                <div className="stat-icon blue">
                  👥
                </div>

              </div>


              {/* CHECKED IN */}

              <div className="stat-card">

                <div>

                  <span>
                    Checked In
                  </span>

                  <h2>
                    {checkedIn}
                  </h2>

                </div>

                <div className="stat-icon green">
                  ✓
                </div>

              </div>


              {/* CHECKED OUT */}

              <div className="stat-card">

                <div>

                  <span>
                    Checked Out
                  </span>

                  <h2>
                    {checkedOut}
                  </h2>

                </div>

                <div className="stat-icon orange">
                  ↗
                </div>

              </div>

            </section>


            {/* RECENT VISITORS */}

            <section className="visitor-section">

              <div className="section-header">

                <div>

                  <h2>
                    Recent Visitors
                  </h2>

                  <p>
                    Latest visitor entries.
                  </p>

                </div>

                <button
                  className="view-all-btn"
                  onClick={() =>
                    setActivePage("visitors")
                  }
                >
                  View All Visitors →
                </button>

              </div>


              <div className="table-wrapper">

                <table>

                  <thead>

                    <tr>

                      <th>
                        Visitor
                      </th>

                      <th>
                        Mobile
                      </th>

                      <th>
                        Organization
                      </th>

                      <th>
                        Person to Meet
                      </th>

                      <th>
                        Date & Time
                      </th>

                      <th>
                        Status
                      </th>

                    </tr>

                  </thead>


                  <tbody>

                    {visitors.length === 0 ? (

                      <tr>

                        <td
                          colSpan="6"
                          className="empty"
                        >
                          No visitor records found.

                          <br />

                          <span>
                            Add your first visitor to get started.
                          </span>

                        </td>

                      </tr>

                    ) : (

                      visitors
                        .slice(0, 5)
                        .map((visitor) => (

                          <tr
                            key={visitor._id}
                          >

                            <td>

                              <strong>
                                {visitor.visitorName}
                              </strong>

                              <br />

                              <small>
                                {visitor.email}
                              </small>

                            </td>

                            <td>
                              {visitor.mobileNumber}
                            </td>

                            <td>
                              {visitor.organization}
                            </td>

                            <td>
                              {visitor.personToMeet}
                            </td>

                            <td>
                              {new Date(
                                visitor.visitDateTime
                              ).toLocaleString()}
                            </td>

                            <td>

                              <span
                                className={
                                  visitor.status ===
                                  "Checked In"
                                    ? "status checked-in"
                                    : "status checked-out"
                                }
                              >
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

        {activePage === "visitors" && (

          <>

            {/* HEADER */}

            <header className="topbar">

              <div>

                <h1>
                  {isAdmin ? "Visitors" : "My Visits"}
                </h1>

                <p>
                  {isAdmin
                    ? "Manage all visitor records."
                    : "View the visits recorded for your account."}
                </p>

              </div>

              {/* ADMIN + RECEPTIONIST */}

              {canManageVisitors && (

                <button
                  className="add-btn"
                  onClick={openAddForm}
                >
                  + Add Visitor
                </button>

              )}

            </header>


            {/* VISITOR SECTION */}

            <section className="visitor-section">

              <div className="section-header">

                <div>

                    <h2>
                      {isAdmin ? "All Visitors" : "My Visit History"}
                    </h2>

                    <p>
                      {isAdmin
                        ? "View and manage all visitor entries."
                        : "Only your own visits are shown."}
                    </p>

                </div>


                {/* SEARCH */}

                <input
                  type="text"
                  placeholder="Search by name or mobile..."
                  className="search-box"
                  value={search}
                  onChange={(e) =>
                    setSearch(e.target.value)
                  }
                />

              </div>


              {/* TABLE */}

              <div className="table-wrapper">

                <table>

                  <thead>

                    <tr>

                      <th>
                        Visitor
                      </th>

                      <th>
                        Mobile
                      </th>

                      <th>
                        Organization
                      </th>

                      <th>
                        Person to Meet
                      </th>

                      <th>
                        Purpose
                      </th>

                      <th>
                        Date & Time
                      </th>

                      <th>
                        Status
                      </th>

                      <th>
                        Actions
                      </th>

                    </tr>

                  </thead>


                  <tbody>

                    {filteredVisitors.length === 0 ? (

                      <tr>

                        <td
                          colSpan="8"
                          className="empty"
                        >

                          No visitor records found.

                          <br />

                          <span>
                            Add your first visitor to get started.
                          </span>

                        </td>

                      </tr>

                    ) : (

                      filteredVisitors.map(
                        (visitor) => (

                          <tr
                            key={visitor._id}
                          >

                            {/* VISITOR */}

                            <td>

                              <strong>
                                {visitor.visitorName}
                              </strong>

                              <br />

                              <small>
                                {visitor.email}
                              </small>

                            </td>


                            {/* MOBILE */}

                            <td>
                              {visitor.mobileNumber}
                            </td>


                            {/* ORGANIZATION */}

                            <td>
                              {visitor.organization}
                            </td>


                            {/* PERSON */}

                            <td>
                              {visitor.personToMeet}
                            </td>


                            {/* PURPOSE */}

                            <td>
                              {visitor.purpose}
                            </td>


                            {/* DATE */}

                            <td>
                              {new Date(
                                visitor.visitDateTime
                              ).toLocaleString()}
                            </td>


                            {/* STATUS */}

                            <td>

                              <span
                                className={
                                  visitor.status ===
                                  "Checked In"
                                    ? "status checked-in"
                                    : "status checked-out"
                                }
                              >
                                {visitor.status}
                              </span>

                            </td>


                            {/* ACTIONS */}

                            <td>

                              <div className="actions">

                                {/* EDIT */}

                                {canManageVisitors && (

                                  <button
                                    className="edit-btn"
                                    onClick={() =>
                                      handleEdit(
                                        visitor
                                      )
                                    }
                                  >
                                    Edit
                                  </button>

                                )}


                                {/* CHECK OUT */}

                                {canManageVisitors &&
                                  visitor.status ===
                                    "Checked In" && (

                                    <button
                                      className="checkout-btn"
                                      onClick={() =>
                                        handleCheckOut(
                                          visitor
                                        )
                                      }
                                    >
                                      Check Out
                                    </button>

                                  )}


                                {/* DELETE - ADMIN ONLY */}

                                {isAdmin && (

                                  <button
                                    className="delete-btn"
                                    onClick={() =>
                                      deleteVisitor(
                                        visitor._id
                                      )
                                    }
                                  >
                                    Delete
                                  </button>

                                )}

                                {/* VIEWER MESSAGE */}

                                {!canManageVisitors &&
                                  !isAdmin && (

                                  <span
                                    style={{
                                      color: "#64748b",
                                      fontSize: "13px"
                                    }}
                                  >
                                    View Only
                                  </span>

                                )}

                              </div>

                            </td>

                          </tr>

                        )
                      )

                    )}

                  </tbody>

                </table>

              </div>

            </section>

          </>

        )}


        {/* ========================================
            ADD / EDIT MODAL
        ======================================== */}

        {showForm && canManageVisitors && (

          <div className="modal-overlay">

            <div className="modal">

              {/* MODAL HEADER */}

              <div className="modal-header">

                <div>

                  <h2>

                    {editingVisitor
                      ? "Edit Visitor"
                      : "Add New Visitor"}

                  </h2>

                  <p>

                    {editingVisitor
                      ? "Update the visitor's information."
                      : "Enter the visitor's information."}

                  </p>

                </div>


                <button
                  className="close-btn"
                  onClick={() => {
                    resetForm();
                    setShowForm(false);
                  }}
                >
                  ×
                </button>

              </div>


              {/* FORM */}

              <form
                onSubmit={
                  editingVisitor
                    ? handleUpdate
                    : handleSubmit
                }
              >

                <div className="form-grid">


                  {/* VISITOR NAME */}

                  <div className="form-group">

                    <label>
                      Visitor Name
                    </label>

                    <input
                      type="text"
                      name="visitorName"
                      placeholder="Enter visitor name"
                      value={
                        formData.visitorName
                      }
                      onChange={handleChange}
                      required
                    />

                  </div>


                  {/* MOBILE */}

                  <div className="form-group">

                    <label>
                      Mobile Number
                    </label>

                    <input
                      type="tel"
                      name="mobileNumber"
                      placeholder="Enter mobile number"
                      value={
                        formData.mobileNumber
                      }
                      onChange={handleChange}
                      required
                    />

                  </div>


                  {/* EMAIL */}

                  <div className="form-group">

                    <label>
                      Email Address
                    </label>

                    <input
                      type="email"
                      name="email"
                      placeholder="Enter email address"
                      value={
                        formData.email
                      }
                      onChange={handleChange}
                    />

                  </div>


                  {/* ORGANIZATION */}

                  <div className="form-group">

                    <label>
                      Organization / College
                    </label>

                    <input
                      type="text"
                      name="organization"
                      placeholder="Enter organization"
                      value={
                        formData.organization
                      }
                      onChange={handleChange}
                      required
                    />

                  </div>


                  {/* PERSON */}

                  <div className="form-group">

                    <label>
                      Person to Meet
                    </label>

                    <input
                      type="text"
                      name="personToMeet"
                      placeholder="Enter employee name"
                      value={
                        formData.personToMeet
                      }
                      onChange={handleChange}
                      required
                    />

                  </div>


                  {/* PURPOSE */}

                  <div className="form-group">

                    <label>
                      Purpose of Visit
                    </label>

                    <input
                      type="text"
                      name="purpose"
                      placeholder="Enter purpose"
                      value={
                        formData.purpose
                      }
                      onChange={handleChange}
                      required
                    />

                  </div>

                </div>


                {/* MODAL ACTIONS */}

                <div className="modal-actions">

                  <button
                    type="button"
                    className="cancel-btn"
                    onClick={() => {
                      resetForm();
                      setShowForm(false);
                    }}
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="save-btn"
                  >

                    {editingVisitor
                      ? "Update Visitor"
                      : "Add Visitor"}

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