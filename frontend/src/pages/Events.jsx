import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import api, { errorMessage } from "../api/client";
import EventCard from "../components/EventCard";
import Icon from "../components/Icon";
import { Alert, EmptyState, Loader, PageHeader, RetryState } from "../components/ui";
import { toDate } from "../utils/format";

const TABS = [
  { key: "upcoming", label: "Upcoming" },
  { key: "registered", label: "My registrations" },
  { key: "past", label: "Past" },
];

// Groups events under "October 2026", "November 2026", ...
function groupByMonth(events) {
  const groups = [];
  for (const ev of events) {
    const label = toDate(ev.event_date)?.toLocaleDateString("en-GB", { month: "long", year: "numeric" }) || "";
    const last = groups[groups.length - 1];
    if (last && last.label === label) last.events.push(ev);
    else groups.push({ label, events: [ev] });
  }
  return groups;
}

function Events() {
  const [params, setParams] = useSearchParams();
  const tab = TABS.some((t) => t.key === params.get("tab")) ? params.get("tab") : "upcoming";
  // Remember which tab the loaded events belong to, so switching tabs shows the loader
  const [loaded, setLoaded] = useState({ tab: null, events: [] });
  const events = loaded.tab === tab ? loaded.events : null;
  const [search, setSearch] = useState("");
  const [error, setError] = useState(null);

  const load = useCallback(() => {
    api
      .get("/events", { params: { scope: tab } })
      .then((res) => {
        setLoaded({ tab, events: res.data.events });
        setError(null);
      })
      .catch((err) => setError({ tab, message: errorMessage(err) }));
  }, [tab]);

  useEffect(() => {
    load();
  }, [load]);

  const term = search.trim().toLowerCase();
  const visible = (events || []).filter(
    (e) =>
      !term ||
      e.title.toLowerCase().includes(term) ||
      (e.club_name || "").toLowerCase().includes(term) ||
      (e.venue || "").toLowerCase().includes(term)
  );

  return (
    <div className="page">
      <PageHeader eyebrow="What's on" title="Events" subtitle="Workshops, competitions, meetups and more from every club." />

      <Alert onClose={() => setError(null)}>{error?.tab === tab && events ? error.message : null}</Alert>

      <div className="toolbar">
        <div className="tabs inline" role="tablist">
          {TABS.map((t) => (
            <button
              key={t.key}
              role="tab"
              aria-selected={tab === t.key}
              className={`tab ${tab === t.key ? "active" : ""}`}
              onClick={() => setParams(t.key === "upcoming" ? {} : { tab: t.key })}
            >
              {t.label}
            </button>
          ))}
        </div>
        <div className="search-box">
          <Icon name="search" size={18} />
          <input placeholder="Search events, clubs, venues..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </div>

      {!events ? (
        error?.tab === tab ? <RetryState message={error.message} onRetry={() => { setError(null); load(); }} /> : <Loader />
      ) : visible.length === 0 ? (
        <EmptyState icon="calendar" title={term ? "No matching events" : "Nothing here yet"}>
          {tab === "registered"
            ? "Events you register for will appear here."
            : tab === "past"
              ? "Past events will appear here."
              : "No upcoming events right now - check back soon."}
        </EmptyState>
      ) : (
        groupByMonth(visible).map((group) => (
          <section key={group.label} className="month-group">
            <h3 className="section-title">{group.label}</h3>
            <div className="event-list">
              {group.events.map((ev) => (
                <EventCard key={ev.id} event={ev} onChange={load} onError={setError} />
              ))}
            </div>
          </section>
        ))
      )}
    </div>
  );
}

export default Events;
