import React, { useState, useEffect } from "react";

export default function ExperimentEvaluatorApp() {
  const [role, setRole] = useState("student");
  const [submissions, setSubmissions] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [gradeInput, setGradeInput] = useState("");
  const [feedbackInput, setFeedbackInput] = useState("");
  const [filter, setFilter] = useState("");

  const initialForm = {
    studentName: "",
    studentId: "",
    experimentTitle: "",
    date: new Date().toISOString().slice(0, 10),
    observations: "",
    data: "",
  };
  const [form, setForm] = useState(initialForm);

  useEffect(() => {
    const raw = localStorage.getItem("ee_submissions_v1");
    if (raw) {
      try {
        setSubmissions(JSON.parse(raw));
      } catch (e) {
        console.error("Failed to parse submissions", e);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("ee_submissions_v1", JSON.stringify(submissions));
  }, [submissions]);

  function deleteSubmission(id) {
    if (!window.confirm("Delete this submission? This cannot be undone.")) return;
    setSubmissions((prev) => prev.filter((s) => s.id !== id));
    if (selectedId === id) setSelectedId(null);
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!form.studentName || !form.studentId || !form.experimentTitle) {
      window.alert("Please fill in all required fields.");
      return;
    }

    const newSubmission = {
      ...form,
      id: Date.now(),
      marks: null,
      feedback: "",
    };

    setSubmissions([...submissions, newSubmission]);
    setForm(initialForm);
    window.alert("Submission successful!");
  }

  function saveGrade() {
    if (selectedId == null) return;
    setSubmissions((prev) =>
      prev.map((s) =>
        s.id === selectedId
          ? { ...s, marks: gradeInput === "" ? null : Number(gradeInput), feedback: feedbackInput }
          : s
      )
    );
    window.alert("Saved marks & feedback.");
    setSelectedId(null);
    setGradeInput("");
    setFeedbackInput("");
  }

  function averageScore() {
    const graded = submissions.filter((s) => s.marks != null);
    if (graded.length === 0) return 0;
    return (
      graded.reduce((sum, s) => sum + s.marks, 0) / graded.length
    ).toFixed(2);
  }

  const filtered = submissions.filter((s) =>
    s.studentName.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="container my-4">
      <h1 className="text-center mb-4">🧪 Experiment Evaluator</h1>

      <div className="d-flex justify-content-center mb-4">
        <button
          onClick={() => setRole("student")}
          className={`btn mx-2 ${role === "student" ? "btn-success" : "btn-outline-success"}`}
        >
          Student
        </button>
        <button
          onClick={() => setRole("faculty")}
          className={`btn mx-2 ${role === "faculty" ? "btn-success" : "btn-outline-success"}`}
        >
          Faculty
        </button>
      </div>

      {/* Student View */}
      {role === "student" && (
        <div className="card shadow-sm p-4 mb-4">
          <h4>Submit Experiment</h4>
          <form onSubmit={handleSubmit}>
            <div className="row mb-3">
              <div className="col-md-6">
                <label className="form-label">Student Name</label>
                <input
                  type="text"
                  className="form-control"
                  value={form.studentName}
                  onChange={(e) => setForm({ ...form, studentName: e.target.value })}
                />
              </div>
              <div className="col-md-6">
                <label className="form-label">Student ID</label>
                <input
                  type="text"
                  className="form-control"
                  value={form.studentId}
                  onChange={(e) => setForm({ ...form, studentId: e.target.value })}
                />
              </div>
            </div>

            <div className="mb-3">
              <label className="form-label">Experiment Title</label>
              <input
                type="text"
                className="form-control"
                value={form.experimentTitle}
                onChange={(e) => setForm({ ...form, experimentTitle: e.target.value })}
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Date</label>
              <input
                type="date"
                className="form-control"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Observations</label>
              <textarea
                className="form-control"
                rows="3"
                value={form.observations}
                onChange={(e) => setForm({ ...form, observations: e.target.value })}
              ></textarea>
            </div>

            <div className="mb-3">
              <label className="form-label">Data / Results</label>
              <textarea
                className="form-control"
                rows="3"
                value={form.data}
                onChange={(e) => setForm({ ...form, data: e.target.value })}
              ></textarea>
            </div>

            <button type="submit" className="btn btn-primary">
              Submit
            </button>
          </form>
        </div>
      )}

      {/* Faculty View */}
      {role === "faculty" && (
        <div className="card shadow-sm p-4">
          <h4>Faculty Dashboard</h4>

          <div className="mb-3">
            <input
              type="text"
              className="form-control"
              placeholder="Search by student name..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            />
          </div>

          <table className="table table-bordered">
            <thead className="table-secondary">
              <tr>
                <th>Student</th>
                <th>ID</th>
                <th>Experiment</th>
                <th>Date</th>
                <th>Marks</th>
                <th>Feedback</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s) => (
                <tr key={s.id}>
                  <td>{s.studentName}</td>
                  <td>{s.studentId}</td>
                  <td>{s.experimentTitle}</td>
                  <td>{s.date}</td>
                  <td>{s.marks ?? "-"}</td>
                  <td>{s.feedback || "-"}</td>
                  <td>
                    <button
                      className="btn btn-sm btn-info me-2"
                      onClick={() => {
                        setSelectedId(s.id);
                        setGradeInput(s.marks ?? "");
                        setFeedbackInput(s.feedback ?? "");
                      }}
                    >
                      Grade
                    </button>
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => deleteSubmission(s.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan="7" className="text-center">
                    No submissions yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          <div className="mt-3">
            <h6>📊 Average Score: {averageScore()}</h6>
          </div>

          {selectedId && (
            <div className="card mt-4 p-3 bg-light">
              <h5>Enter Marks and Feedback</h5>
              <div className="mb-3">
                <label className="form-label">Marks</label>
                <input
                  type="number"
                  className="form-control"
                  value={gradeInput}
                  onChange={(e) => setGradeInput(e.target.value)}
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Feedback</label>
                <textarea
                  className="form-control"
                  rows="3"
                  value={feedbackInput}
                  onChange={(e) => setFeedbackInput(e.target.value)}
                ></textarea>
              </div>
              <button className="btn btn-success me-2" onClick={saveGrade}>
                Save
              </button>
              <button
                className="btn btn-secondary"
                onClick={() => setSelectedId(null)}
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
