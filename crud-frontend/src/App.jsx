
import { useCallback, useEffect, useState } from 'react';

const API = import.meta.env.VITE_API_URL || 'http://localhost:2025';
const emptyForm = {
  hallName: '',
  building: '',
  seatingCapacity: '',
  rentalFee: '',
};

async function request(path, options = {}) {
  let response;

  try {
    response = await fetch(`${API}${path}`, {
      ...options,
      headers: {
        ...(options.body ? { 'Content-Type': 'application/json' } : {}),
        ...options.headers,
      },
    });
  } catch {
    throw new Error(
      `Cannot connect to backend at ${API}. Check that the Spring Boot application is running.`
    );
  }

  const text = await response.text();

  if (!response.ok) {
    throw new Error(text || `Request failed: ${response.status}`);
  }

  if (!text) return null;

  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

export default function App() {
  const [records, setRecords] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [searchId, setSearchId] = useState('');
  const [foundRecord, setFoundRecord] = useState(null);
  const [page, setPage] = useState('records');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  const loadRecords = useCallback(async () => {
    setLoading(true);
    try {
      const data = await request('/DisplayAll');
      setRecords(Array.isArray(data) ? data : []);
    } catch (error) {
      setMessage({ type: 'danger', text: error.message });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRecords();
  }, [loadRecords]);

  function changeForm(event) {
    setForm({ ...form, [event.target.name]: event.target.value });
  }

  function resetForm() {
    setForm(emptyForm);
    setEditingId(null);
  }

  function validate() {
    if (!form.hallName.trim()) return 'Hall name is required.';
    if (form.hallName.trim().length > 100)
      return 'Hall name must be at most 100 characters.';
    if (!form.building.trim()) return 'Building is required.';
    if (form.building.trim().length > 100)
      return 'Building must be at most 100 characters.';

    if (
      form.seatingCapacity === '' ||
      !Number.isInteger(Number(form.seatingCapacity)) ||
      Number(form.seatingCapacity) <= 0
    ) {
      return 'Seating capacity must be a positive whole number.';
    }

    if (
      form.rentalFee === '' ||
      !Number.isFinite(Number(form.rentalFee)) ||
      Number(form.rentalFee) < 0
    ) {
      return 'Rental fee must be zero or greater.';
    }

    return '';
  }

  async function submitForm(event) {
    event.preventDefault();
    setMessage(null);

    const error = validate();
    if (error) {
      setMessage({ type: 'danger', text: error });
      return;
    }

    const body = {
      hallName: form.hallName.trim(),
      building: form.building.trim(),
      seatingCapacity: Number(form.seatingCapacity),
      rentalFee: Number(form.rentalFee),
    };

    setSaving(true);

    try {
      if (editingId !== null) {
        await request(`/Update/${editingId}`, {
          method: 'PUT',
          body: JSON.stringify(body),
        });
        setMessage({ type: 'success', text: 'Hall updated successfully.' });
      } else {
        // Do not send an ID. The backend generates it automatically.
        await request('/Add', {
          method: 'POST',
          body: JSON.stringify(body),
        });
        setMessage({ type: 'success', text: 'Hall added successfully.' });
      }

      resetForm();
      setPage('records');
      await loadRecords();
    } catch (error) {
      setMessage({ type: 'danger', text: error.message });
    } finally {
      setSaving(false);
    }
  }

  function editRecord(record) {
    setEditingId(record.id);
    setForm({
      hallName: record.hallName ?? '',
      building: record.building ?? '',
      seatingCapacity: String(record.seatingCapacity ?? ''),
      rentalFee: String(record.rentalFee ?? ''),
    });
    setPage('form');
    setMessage(null);
  }

  async function searchRecord(event) {
    event.preventDefault();
    setMessage(null);
    setFoundRecord(null);

    if (!/^[1-9]\d*$/.test(searchId.trim())) {
      setMessage({ type: 'danger', text: 'Enter a valid positive ID.' });
      return;
    }

    try {
      const data = await request(`/DisplayById/${searchId.trim()}`);
      setFoundRecord(data);
      setMessage({ type: 'success', text: 'Record found.' });
    } catch (error) {
      setMessage({ type: 'danger', text: error.message });
    }
  }

  async function deleteRecord(id) {
    if (!window.confirm(`Delete conference hall ${id}?`)) return;

    setMessage(null);
    try {
      await request(`/Delete/${id}`, { method: 'DELETE' });

      if (String(foundRecord?.id) === String(id)) setFoundRecord(null);

      setMessage({ type: 'success', text: 'Hall deleted successfully.' });
      await loadRecords();
    } catch (error) {
      setMessage({ type: 'danger', text: error.message });
    }
  }

  function fee(value) {
    const number = Number(value);
    return Number.isFinite(number)
      ? number.toLocaleString('en-IN', {
          style: 'currency',
          currency: 'INR',
          maximumFractionDigits: 2,
        })
      : '—';
  }

  return (
    <>
      <nav className="navbar navbar-expand navbar-dark main-nav">
        <div className="container">
          <a className="navbar-brand fw-bold" href="#home">
            Hall<span>Manager</span>
          </a>
          <div className="navbar-nav flex-row gap-1">
            <button className="nav-link" onClick={() => setPage('records')}>
              Records
            </button>
            <button
              className="nav-link"
              onClick={() => {
                resetForm();
                setMessage(null);
                setPage('form');
              }}
            >
              Add Hall
            </button>
            <button
              className="nav-link"
              onClick={() => {
                setMessage(null);
                setPage('search');
              }}
            >
              Find by ID
            </button>
          </div>
        </div>
      </nav>

      <header className="hero">
        <div className="container py-5">
          <div className="small-label">CONFERENCE HALL MANAGEMENT</div>
          <h1>Manage your halls, effortlessly.</h1>
          <p>Add, view, update and manage conference hall records in one place.</p>
          <div className="hero-count">
            <strong>{records.length}</strong>
            <span> Total records</span>
          </div>
        </div>
      </header>

      <main className="container py-4 py-lg-5">
        {message && (
          <div className={`alert alert-${message.type}`} role="alert">
            {message.text}
            <button
              className="message-close"
              onClick={() => setMessage(null)}
              aria-label="Close message"
            >
              ×
            </button>
          </div>
        )}

        {page === 'records' && (
          <section className="panel">
            <div className="panel-heading">
              <div>
                <div className="small-label">YOUR DATABASE</div>
                <h2>Conference halls</h2>
                <p>View, edit or delete existing records.</p>
              </div>
              <button
                className="btn btn-primary"
                onClick={() => {
                  resetForm();
                  setMessage(null);
                  setPage('form');
                }}
              >
                + Add Hall
              </button>
            </div>

            {loading ? (
              <div className="empty">
                <div className="spinner-border text-primary" />
                <p>Loading records...</p>
              </div>
            ) : records.length === 0 ? (
              <div className="empty">
                <h3>No records found</h3>
                <p>Add your first conference hall to get started.</p>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table align-middle hall-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Hall name</th>
                      <th>Building</th>
                      <th>Capacity</th>
                      <th>Rental fee</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {records.map((record) => (
                      <tr key={record.id}>
                        <td><span className="id-badge">#{record.id}</span></td>
                        <td className="fw-semibold">{record.hallName}</td>
                        <td>{record.building}</td>
                        <td>{record.seatingCapacity}</td>
                        <td>{fee(record.rentalFee)}</td>
                        <td>
                          <div className="d-flex gap-2">
                            <button
                              className="btn btn-sm btn-outline-primary"
                              onClick={() => editRecord(record)}
                            >
                              Edit
                            </button>
                            <button
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => deleteRecord(record.id)}
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        )}

        {page === 'form' && (
          <section className="panel form-panel">
            <div className="small-label">HALL DETAILS</div>
            <h2>{editingId === null ? 'Add a new hall' : 'Update hall'}</h2>
            <p className="text-secondary">
              {editingId === null
                ? 'Enter hall details. The ID is generated automatically.'
                : `Updating record #${editingId}`}
            </p>

            <form onSubmit={submitForm} noValidate>
              <div className="row g-4 mt-1">
                <div className="col-12">
                  <label className="form-label" htmlFor="hallName">Hall name *</label>
                  <input
                    id="hallName"
                    name="hallName"
                    className="form-control"
                    value={form.hallName}
                    onChange={changeForm}
                    maxLength={100}
                    placeholder="e.g. Main Conference Hall"
                    required
                  />
                </div>

                <div className="col-12">
                  <label className="form-label" htmlFor="building">Building *</label>
                  <input
                    id="building"
                    name="building"
                    className="form-control"
                    value={form.building}
                    onChange={changeForm}
                    maxLength={100}
                    placeholder="e.g. Block A"
                    required
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label" htmlFor="seatingCapacity">
                    Seating capacity *
                  </label>
                  <input
                    id="seatingCapacity"
                    name="seatingCapacity"
                    type="number"
                    min="1"
                    step="1"
                    className="form-control"
                    value={form.seatingCapacity}
                    onChange={changeForm}
                    required
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label" htmlFor="rentalFee">
                    Rental fee (₹) *
                  </label>
                  <input
                    id="rentalFee"
                    name="rentalFee"
                    type="number"
                    min="0"
                    step="0.01"
                    className="form-control"
                    value={form.rentalFee}
                    onChange={changeForm}
                    required
                  />
                </div>
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={() => {
                    resetForm();
                    setPage('records');
                  }}
                >
                  Cancel
                </button>
                <button className="btn btn-primary" disabled={saving}>
                  {saving ? 'Saving...' : editingId === null ? 'Add Hall' : 'Save Changes'}
                </button>
              </div>
            </form>
          </section>
        )}

        {page === 'search' && (
          <section className="panel form-panel">
            <div className="small-label">RECORD LOOKUP</div>
            <h2>Find a hall by ID</h2>
            <form className="row g-3 mt-2" onSubmit={searchRecord}>
              <div className="col-md-8">
                <label className="form-label" htmlFor="searchId">Record ID</label>
                <input
                  id="searchId"
                  type="number"
                  min="1"
                  step="1"
                  className="form-control"
                  value={searchId}
                  onChange={(event) => setSearchId(event.target.value)}
                  placeholder="Enter record ID"
                  required
                />
              </div>
              <div className="col-md-4 d-flex align-items-end">
                <button className="btn btn-primary w-100">Find Record</button>
              </div>
            </form>

            {foundRecord && (
              <div className="found-record mt-4">
                <span className="id-badge">#{foundRecord.id}</span>
                <h3 className="mt-3">{foundRecord.hallName}</h3>
                <p>{foundRecord.building}</p>
                <p>Capacity: {foundRecord.seatingCapacity}</p>
                <p>Rental fee: {fee(foundRecord.rentalFee)}</p>
                <div className="d-flex gap-2">
                  <button
                    className="btn btn-outline-primary"
                    onClick={() => editRecord(foundRecord)}
                  >
                    Edit
                  </button>
                  <button
                    className="btn btn-outline-danger"
                    onClick={() => deleteRecord(foundRecord.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            )}
          </section>
        )}

        <footer className="footer">
          HallManager <span>• Conference Hall CRUD Management</span>
        </footer>
      </main>
    </>
  );
}
