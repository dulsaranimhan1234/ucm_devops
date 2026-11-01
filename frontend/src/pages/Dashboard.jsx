import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api, { errorMessage } from "../api/client";
import { useAuth } from "../context/authContext";
import EventCard from "../components/EventCard";
import Icon from "../components/Icon";
import { Alert, ClubAvatar, EmptyState, Loader, PageHeader, RetryState, StatusBadge } from "../components/ui";
import { timeAgo } from "../utils/format";

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

function Dashboard() {
  const { user, isAdmin, accountType } = useAuth();
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [clubStats, setClubStats] = useState({ members: 0, pending: 0 });

  const load = useCallback(() => {
    api
      .get("/dashboard")
      .then(async (res) => {
        setError("");
        setData(res.data);
        if (accountType !== "club" || !res.data.my_clubs.length) {
          setClubStats({ members: 0, pending: 0 });
          return;
        }

        const memberLists = await Promise.allSettled(
          res.data.my_clubs.map((club) => api.get(`/clubs/${club.id}/members`))
        );
        const counts = memberLists.reduce(
          (total, result) => {
            if (result.status !== "fulfilled") return total;
            total.members += result.value.data.members.filter((member) => member.status === "approved").length;
            total.pending += result.value.data.members.filter((member) => member.status === "pending").length;
            return total;
          },
          { members: 0, pending: 0 }
        );
        setClubStats(counts);
      })
      .catch((err) => setError(errorMessage(err)));
  }, [accountType]);

  useEffect(load, [load]);

  if (!data) {
    return error ? <div className="page"><RetryState message={error} onRetry={() => { setError(""); load(); }} /></div> : <Loader />;
  }

  const { stats } = data;
  const firstName = user?.name?.split(" ")[0] || "";
  const isClubAccount = accountType === "club";

  const cards = isClubAccount
    ? [
        { label: "Managed clubs", value: data.my_clubs.length, icon: "clubs", to: "/clubs" },
        { label: "Club members", value: clubStats.members, icon: "users", to: "/clubs" },
        { label: "Join requests", value: clubStats.pending, icon: "inbox", to: "/clubs" },
        { label: "Upcoming events", value: stats.upcoming_events, icon: "calendar", to: "/events" },
      ]
    : [
        { label: "My clubs", value: stats.my_clubs, icon: "clubs", to: "/clubs" },
        { label: "Events I'm going to", value: stats.my_upcoming_events, icon: "ticket", to: "/events?tab=registered" },
        { label: "Upcoming events", value: stats.upcoming_events, icon: "calendar", to: "/events" },
        isAdmin
          ? { label: "Registered users", value: stats.total_users, icon: "users", to: "/admin" }
          : { label: "Clubs on campus", value: stats.total_clubs, icon: "shield", to: "/clubs" },
      ];

  return (
    <div className="page">
      <PageHeader
        eyebrow={new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" })}
        title={`${greeting()}, ${firstName}!`}
        subtitle={isClubAccount ? "Your club workspace, members and upcoming events." : "Here's what's happening in your clubs."}
        actions={
          <Link to="/clubs" className="btn btn-primary">
            <Icon name={isClubAccount ? "clubs" : "search"} size={18} /> {isClubAccount ? "Manage my clubs" : "Explore clubs"}
          </Link>
        }
      />

      <Alert onClose={() => setError("")}>{error}</Alert>

      {!isClubAccount && stats.pending_requests > 0 && (
        <div className="notice-banner">
          <Icon name="inbox" />
          <span>
            <strong>{stats.pending_requests}</strong> membership request{stats.pending_requests > 1 ? "s are" : " is"}{" "}
            waiting for approval in {isAdmin ? "clubs across campus" : "clubs you manage"}.
          </span>
        </div>
      )}

      <div className="stats-grid">
        {cards.map((c) => (
          <Link to={c.to} className="stat-card" key={c.label}>
            <div className="stat-icon">
              <Icon name={c.icon} size={22} />
            </div>
            <div>
              <div className="stat-value">{c.value ?? 0}</div>
              <div className="stat-label">{c.label}</div>
            </div>
          </Link>
        ))}
      </div>

      <div className="dashboard-grid">
        <section className="card">
          <div className="card-header">
            <h2>{isClubAccount ? "Your upcoming events" : "Upcoming events"}</h2>
            <Link to="/events" className="link">
              View all
            </Link>
          </div>
          {data.upcoming_events.length ? (
            <div className="event-list">
              {data.upcoming_events.map((ev) => (
                <EventCard key={ev.id} event={ev} onChange={load} onError={setError} />
              ))}
            </div>
          ) : (
            <EmptyState icon="calendar" title="No upcoming events">
              {isClubAccount ? "Create an event from one of your club workspaces." : "Check back soon - clubs post new events regularly."}
            </EmptyState>
          )}
        </section>

        <div className="dashboard-side">
          <section className="card">
            <div className="card-header">
              <h2>{isClubAccount ? "Club workspace" : "My clubs"}</h2>
              <Link to="/clubs" className="link">
                {isClubAccount ? "Manage" : "Browse"}
              </Link>
            </div>
            {data.my_clubs.length ? (
              <ul className="club-mini-list">
                {data.my_clubs.map((club) => (
                  <li key={club.id}>
                    <Link to={`/clubs/${club.id}`}>
                      <ClubAvatar name={club.name} logoUrl={club.logo_url} size={40} />
                      <div className="club-mini-info">
                        <strong>{club.name}</strong>
                        <span>{isClubAccount ? "Open club workspace" : `${club.member_count} member${Number(club.member_count) === 1 ? "" : "s"}`}</span>
                      </div>
                      <StatusBadge status={club.status} role={club.role} />
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyState
                icon="clubs"
                title={isClubAccount ? "No clubs to manage yet" : "You haven't joined any clubs yet"}
                action={
                  <Link to="/clubs" className="btn btn-primary btn-sm">
                    {isClubAccount ? "Create a club" : "Find a club"}
                  </Link>
                }
              />
            )}
          </section>

          <section className="card">
            <div className="card-header">
              <h2>{isClubAccount ? "Club announcements" : "Latest announcements"}</h2>
            </div>
            {data.announcements.length ? (
              <ul className="announcement-feed">
                {data.announcements.map((a) => (
                  <li key={a.id}>
                    <div className="announcement-meta">
                      <Link to={`/clubs/${a.club_id}`}>{a.club_name}</Link>
                      <span>{timeAgo(a.created_at)}</span>
                    </div>
                    <strong>{a.title}</strong>
                    <p>{a.content}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyState icon="megaphone" title="No announcements">
                Announcements from your clubs will show up here.
              </EmptyState>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
