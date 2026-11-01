import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api, { errorMessage } from "../api/client";
import { useAuth } from "../context/authContext";
import ClubForm from "../components/ClubForm";
import Icon from "../components/Icon";
import { Alert, ClubAvatar, EmptyState, Loader, Modal, PageHeader, RetryState, StatusBadge } from "../components/ui";

function Clubs() {
  const { isAdmin, accountType } = useAuth();
  const navigate = useNavigate();
  const [clubs, setClubs] = useState(null);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [busyId, setBusyId] = useState(null);
  const [showCreate, setShowCreate] = useState(false);

  const load = useCallback(() => {
    api
      .get("/clubs")
      .then((res) => setClubs(res.data.clubs))
      .catch((err) => setError(errorMessage(err)));
  }, []);

  useEffect(load, [load]);

  const join = async (club) => {
    setError("");
    setSuccess("");
    try {
      setBusyId(club.id);
      const res = await api.post(`/clubs/${club.id}/join`);
      setSuccess(res.data.message);
      load();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusyId(null);
    }
  };

  if (!clubs) return error ? <div className="page"><RetryState message={error} onRetry={() => { setError(""); load(); }} /></div> : <Loader />;

  const categories = ["All", ...new Set(clubs.map((c) => c.category))];
  const term = search.trim().toLowerCase();
  const visible = clubs.filter(
    (c) =>
      (category === "All" || c.category === category) &&
      (!term || c.name.toLowerCase().includes(term) || (c.description || "").toLowerCase().includes(term))
  );

  return (
    <div className="page">
      <PageHeader
        eyebrow="Discover"
        title={accountType === "club" ? "My clubs" : "Clubs & societies"}
        subtitle={accountType === "club"
          ? `${clubs.length} club${clubs.length === 1 ? "" : "s"} in your workspace. Manage members, events and announcements.`
          : `${clubs.length} clubs to explore. Find your people.`}
        actions={
          (isAdmin || accountType === "club") && (
            <button className="btn btn-primary" onClick={() => setShowCreate(true)}>
              <Icon name="plus" size={18} /> {accountType === "club" ? "Create a club" : "New club"}
            </button>
          )
        }
      />

      <Alert onClose={() => setError("")}>{error}</Alert>
      <Alert type="success" onClose={() => setSuccess("")}>
        {success}
      </Alert>

      <div className="toolbar">
        <div className="search-box">
          <Icon name="search" size={18} />
          <input placeholder={accountType === "club" ? "Search my clubs..." : "Search clubs..."} value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <div className="chips">
          {categories.map((c) => (
            <button key={c} className={`chip ${category === c ? "active" : ""}`} onClick={() => setCategory(c)}>
              {c}
            </button>
          ))}
        </div>
      </div>

      {visible.length === 0 && accountType === "club" && clubs.length === 0 ? (
        <EmptyState
          icon="clubs"
          title="Start your club workspace"
          action={<button className="btn btn-primary" onClick={() => setShowCreate(true)}>Create a club</button>}
        >
          Add your club to manage its events, membership requests and announcements.
        </EmptyState>
      ) : visible.length === 0 ? (
        <EmptyState icon="search" title="No clubs found">
          Try a different search or category.
        </EmptyState>
      ) : (
        <div className="club-grid">
          {visible.map((club) => (
            <article className="club-card" key={club.id}>
              <Link to={`/clubs/${club.id}`} className="club-card-link">
                <div className="club-card-top">
                  <ClubAvatar name={club.name} logoUrl={club.logo_url} />
                  <StatusBadge status={club.my_status} role={club.my_role} />
                </div>
                <span className="category-tag">{club.category}</span>
                <h3>{club.name}</h3>
                <p>{club.description}</p>
              </Link>

              <div className="club-card-footer">
                <div className="club-stats">
                  <span>
                    <Icon name="users" size={15} /> {club.member_count}
                  </span>
                  <span>
                    <Icon name="calendar" size={15} /> {club.upcoming_event_count} upcoming
                  </span>
                </div>
                {!club.my_status || club.my_status === "rejected" ? (
                  <button className="btn btn-primary btn-sm" onClick={() => join(club)} disabled={busyId === club.id}>
                    Join
                  </button>
                ) : (
                  <Link to={`/clubs/${club.id}`} className="btn btn-ghost btn-sm">
                    Open
                  </Link>
                )}
              </div>
            </article>
          ))}
        </div>
      )}

      {showCreate && (
        <Modal title="Create a new club" onClose={() => setShowCreate(false)}>
          <ClubForm
            onCancel={() => setShowCreate(false)}
            onSaved={(id) => {
              setShowCreate(false);
              navigate(`/clubs/${id}`);
            }}
          />
        </Modal>
      )}
    </div>
  );
}

export default Clubs;
