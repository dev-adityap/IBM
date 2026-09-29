import { useEffect, useState } from "react";
import axios from "axios";
import "./App.css";

const API_URL = "http://localhost:5000/api/visitors";

function App() {
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

  // =========================
  // FETCH VISITORS
  // =========================

  const fetchVisitors = async () => {
    try {
      const response = await axios.get(API_URL);
      setVisitors(response.data);
    } catch (error) {
      console.error("Error fetching visitors:", error);
    }
  };

  useEffect(() => {
    fetchVisitors();
  }, []);

  // =========================
  // HANDLE INPUT
  // =========================

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // =========================
  // RESET FORM
  // =========================

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

  // =========================
  // ADD VISITOR
  // =========================

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await axios.post(API_URL, formData);

      alert("Visitor added successfully!");

      resetForm();
      setShowForm(false);

      fetchVisitors();
    } catch (error) {
      console.error("Error adding visitor:", error);
      alert("Failed to add visitor");
    }
  };

  // =========================
  // EDIT VISITOR
  // =========================

  const handleEdit = (visitor) => {
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

  // =========================
  // UPDATE VISITOR
  // =========================

  const handleUpdate = async (e) => {
    e.preventDefault();

    try {
      await axios.put(
        `${API_URL}/${editingVisitor._id}`,
        formData
      );

      alert("Visitor updated successfully!");

      resetForm();
      setShowForm(false);

      fetchVisitors();
    } catch (error) {
      console.error("Error updating visitor:", error);
      alert("Failed to update visitor");
    }
  };

  // =========================
  // CHECK OUT VISITOR
  // =========================

  const handleCheckOut = async (visitor) => {
    try {
      await axios.put(`${API_URL}/${visitor._id}`, {
        status: "Checked Out"
      });

      fetchVisitors();
    } catch (error) {
      console.error("Error checking out visitor:", error);
      alert("Failed to check out visitor");
    }
  };

  // =========================
  // DELETE VISITOR
  // =========================

  const deleteVisitor = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this visitor?"
    );

    if (!confirmDelete) {
      return;
    }

    try {
      await axios.delete(`${API_URL}/${id}`);

      fetchVisitors();
    } catch (error) {
      console.error("Error deleting visitor:", error);
      alert("Failed to delete visitor");
    }
  };

  // =========================
  // SEARCH
  // =========================

  const filteredVisitors = visitors.filter(
    (visitor) =>
      visitor.visitorName
        .toLowerCase()
        .includes(search.toLowerCase()) ||
      visitor.mobileNumber.includes(search)
  );

  // =========================
  // STATISTICS
  // =========================

  const checkedIn = visitors.filter(
    (visitor) => visitor.status === "Checked In"
  ).length;

  const checkedOut = visitors.filter(
    (visitor) => visitor.status === "Checked Out"
  ).length;

  // =========================
  // UI
  // =========================

  return (
    <div className="app">

      {/* =====================================
          SIDEBAR
      ===================================== */}

      <aside className="sidebar">

        <div className="logo">

          <div className="logo-icon">
            V
          </div>

          <div>
            <h2>VisitEase</h2>
            <span>Visitor Management</span>
          </div>

        </div>


        <nav>

          <a
            className={
              activePage === "dashboard"
                ? "active"
                : ""
            }
            onClick={() => setActivePage("dashboard")}
          >
            Dashboard
          </a>


          <a
            className={
              activePage === "visitors"
                ? "active"
                : ""
            }
            onClick={() => setActivePage("visitors")}
          >
            Visitors
          </a>

        </nav>


        <div className="sidebar-bottom">

          <p>
            Employee Visitor System
          </p>

          <span>
            MERN Stack Application
          </span>

        </div>

      </aside>


      {/* =====================================
          MAIN CONTENT
      ===================================== */}

      <main className="main-content">


        {/* =====================================
            DASHBOARD PAGE
        ===================================== */}

        {activePage === "dashboard" && (

          <>

            {/* Header */}

            <header className="topbar">

              <div>

                <h1>
                  Dashboard
                </h1>

                <p>
                  Welcome to your visitor management dashboard.
                </p>

              </div>


              <button
                className="add-btn"
                onClick={() => {
                  resetForm();
                  setShowForm(true);
                }}
              >
                + Add Visitor
              </button>

            </header>


            {/* Statistics */}

            <section className="stats">


              {/* Total Visitors */}

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


              {/* Checked In */}

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


              {/* Checked Out */}

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


            {/* Recent Visitors */}

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

                          <tr key={visitor._id}>

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
                                  visitor.status === "Checked In"
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


        {/* =====================================
            VISITORS PAGE
        ===================================== */}

        {activePage === "visitors" && (

          <>

            {/* Header */}

            <header className="topbar">

              <div>

                <h1>
                  Visitors
                </h1>

                <p>
                  Manage all visitor records.
                </p>

              </div>


              <button
                className="add-btn"
                onClick={() => {
                  resetForm();
                  setShowForm(true);
                }}
              >
                + Add Visitor
              </button>

            </header>


            {/* Visitors Section */}

            <section className="visitor-section">


              <div className="section-header">

                <div>

                  <h2>
                    All Visitors
                  </h2>

                  <p>
                    View and manage all visitor entries.
                  </p>

                </div>


                {/* Search */}

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


              {/* Table */}

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

                            {/* Visitor */}

                            <td>

                              <strong>
                                {visitor.visitorName}
                              </strong>

                              <br />

                              <small>
                                {visitor.email}
                              </small>

                            </td>


                            {/* Mobile */}

                            <td>
                              {visitor.mobileNumber}
                            </td>


                            {/* Organization */}

                            <td>
                              {visitor.organization}
                            </td>


                            {/* Person */}

                            <td>
                              {visitor.personToMeet}
                            </td>


                            {/* Purpose */}

                            <td>
                              {visitor.purpose}
                            </td>


                            {/* Date */}

                            <td>

                              {new Date(
                                visitor.visitDateTime
                              ).toLocaleString()}

                            </td>


                            {/* Status */}

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


                            {/* Actions */}

                            <td>

                              <div className="actions">


                                {/* Edit */}

                                <button
                                  className="edit-btn"
                                  onClick={() =>
                                    handleEdit(visitor)
                                  }
                                >
                                  Edit
                                </button>


                                {/* Check Out */}

                                {visitor.status ===
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


                                {/* Delete */}

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


        {/* =====================================
            ADD / EDIT MODAL
        ===================================== */}

        {showForm && (

          <div className="modal-overlay">

            <div className="modal">


              {/* Modal Header */}

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


              {/* Form */}

              <form
                onSubmit={
                  editingVisitor
                    ? handleUpdate
                    : handleSubmit
                }
              >

                <div className="form-grid">


                  {/* Visitor Name */}

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


                  {/* Mobile Number */}

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


                  {/* Email */}

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


                  {/* Organization */}

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


                  {/* Person To Meet */}

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


                  {/* Purpose */}

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


                {/* Modal Actions */}

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