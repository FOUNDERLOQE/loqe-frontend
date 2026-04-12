import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { client } from '../lib/sanity';

const clientDashboardQuery = `
{
  "profile": *[_type == "clientProfile" && _id == $profileId][0]{
    _id,
    _createdAt,
    _updatedAt,

    clientName,
    fullName,
    name,
    firstName,
    lastName,
    email,
    phone,
    company,
    nationality,
    location,

    tripName,
    tripType,
    travelStyle,
    luxuryStyle,
    pace,
    vibe,
    occasion,
    purposeOfTravel,
    tripLength,
    duration,
    nights,
    days,
    budget,
    budgetRange,
    budgetPerPerson,
    totalBudget,
    partySize,
    travelers,
    adults,
    children,
    kids,
    departureCity,
    originCity,
    preferredDeparture,
    preferredTravelMonth,
    preferredMonths,
    travelMonths,
    dateFlexibility,
    notes,
    summary,
    questionnaireOutput,

    recommendationSnapshots[]{
      ...,
      _key
    }
  },

  "itineraryDrafts": *[
    _type == "itineraryDraft" &&
    (
      clientProfile._ref == $profileId ||
      clientProfile->_id == $profileId
    )
  ] | order(coalesce(updatedAt, _updatedAt, _createdAt) desc){
    _id,
    _createdAt,
    _updatedAt,
    title,
    name,
    status,
    summary,
    notes,
    tripName,
    version,
    dayCount,
    nights,
    startDate,
    endDate
  }
}
`;

function formatDate(dateValue) {
  if (!dateValue) return '—';

  try {
    return new Date(dateValue).toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return '—';
  }
}

function getDisplayName(profile) {
  if (!profile) return 'Client';

  const joinedName = [profile.firstName, profile.lastName].filter(Boolean).join(' ').trim();

  return (
    profile.clientName ||
    profile.fullName ||
    profile.name ||
    joinedName ||
    profile.email ||
    'Client'
  );
}

function getProfileSummaryItems(profile) {
  if (!profile) return [];

  const travelersValue =
    profile.partySize ||
    profile.travelers ||
    [profile.adults, profile.children ?? profile.kids]
      .filter((v) => v !== undefined && v !== null && v !== '')
      .join(' + ') ||
    '—';

  const monthsValue = Array.isArray(profile.preferredMonths)
    ? profile.preferredMonths.join(', ')
    : Array.isArray(profile.travelMonths)
    ? profile.travelMonths.join(', ')
    : profile.preferredTravelMonth || '—';

  return [
    {
      label: 'Trip',
      value: profile.tripName || profile.tripType || profile.purposeOfTravel || '—',
    },
    {
      label: 'Occasion',
      value: profile.occasion || '—',
    },
    {
      label: 'Style',
      value: profile.travelStyle || profile.luxuryStyle || profile.vibe || '—',
    },
    {
      label: 'Pace',
      value: profile.pace || '—',
    },
    {
      label: 'Budget',
      value:
        profile.budgetRange ||
        profile.budget ||
        profile.budgetPerPerson ||
        profile.totalBudget ||
        '—',
    },
    {
      label: 'Travellers',
      value: travelersValue || '—',
    },
    {
      label: 'Duration',
      value: profile.tripLength || profile.duration || profile.nights || profile.days || '—',
    },
    {
      label: 'Travel Window',
      value: monthsValue,
    },
    {
      label: 'Origin',
      value: profile.departureCity || profile.originCity || profile.preferredDeparture || '—',
    },
    {
      label: 'Base',
      value: profile.location || profile.nationality || '—',
    },
  ];
}

function getSnapshotLabel(snapshot, index) {
  return (
    snapshot?.title ||
    snapshot?.boardTitle ||
    snapshot?.name ||
    snapshot?.snapshotName ||
    snapshot?.tripName ||
    `Recommendation Snapshot ${index + 1}`
  );
}

function getSnapshotDate(snapshot) {
  return (
    snapshot?.savedAt ||
    snapshot?.createdAt ||
    snapshot?._createdAt ||
    snapshot?.timestamp ||
    null
  );
}

function getSnapshotDestinations(snapshot) {
  const buckets = [
    snapshot?.destinations,
    snapshot?.recommendedDestinations,
    snapshot?.topDestinations,
    snapshot?.boardDestinations,
    snapshot?.results,
  ].filter(Array.isArray);

  const firstList = buckets[0] || [];

  return firstList
    .map((item) => {
      if (!item) return null;
      if (typeof item === 'string') return item;
      return (
        item.title ||
        item.destinationTitle ||
        item.name ||
        item.destination?.title ||
        item.destinationName ||
        null
      );
    })
    .filter(Boolean);
}

function getDraftLabel(draft, index) {
  return draft?.title || draft?.name || draft?.tripName || `Itinerary Draft ${index + 1}`;
}

function getStatusBadgeStyles(status) {
  const normalized = (status || 'draft').toLowerCase();

  const map = {
    draft: { background: '#1f2937', color: '#e5e7eb' },
    working: { background: '#1e3a8a', color: '#dbeafe' },
    review: { background: '#78350f', color: '#fef3c7' },
    approved: { background: '#14532d', color: '#dcfce7' },
    final: { background: '#3f0071', color: '#f3e8ff' },
  };

  return map[normalized] || { background: '#27272a', color: '#f4f4f5' };
}

export default function ClientDashboardPage() {
  const { id: routeId, profileId: altProfileId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const profileId = routeId || altProfileId || searchParams.get('profileId');

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({ profile: null, itineraryDrafts: [] });
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function loadDashboard() {
      if (!profileId) {
        setError('Missing client profile ID.');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError('');

        const result = await client.fetch(clientDashboardQuery, { profileId });

        if (!cancelled) {
          setData({
            profile: result?.profile || null,
            itineraryDrafts: Array.isArray(result?.itineraryDrafts) ? result.itineraryDrafts : [],
          });
        }
      } catch (err) {
        console.error('Failed to load client dashboard:', err);
        if (!cancelled) {
          setError('Failed to load the client dashboard.');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadDashboard();

    return () => {
      cancelled = true;
    };
  }, [profileId]);

  const profile = data.profile;

  const displayName = useMemo(() => getDisplayName(profile), [profile]);

  const summaryItems = useMemo(() => getProfileSummaryItems(profile), [profile]);

  const snapshots = useMemo(() => {
    const raw = Array.isArray(profile?.recommendationSnapshots)
      ? [...profile.recommendationSnapshots]
      : [];

    return raw.sort((a, b) => {
      const aTime = new Date(getSnapshotDate(a) || 0).getTime();
      const bTime = new Date(getSnapshotDate(b) || 0).getTime();
      return bTime - aTime;
    });
  }, [profile]);

  const itineraryDrafts = useMemo(() => data.itineraryDrafts || [], [data.itineraryDrafts]);

  const stats = {
    snapshots: snapshots.length,
    drafts: itineraryDrafts.length,
    latestSnapshot: snapshots[0] ? formatDate(getSnapshotDate(snapshots[0])) : '—',
    latestDraft: itineraryDrafts[0]
      ? formatDate(
          itineraryDrafts[0]?.updatedAt ||
            itineraryDrafts[0]?._updatedAt ||
            itineraryDrafts[0]?._createdAt
        )
      : '—',
  };

  if (loading) {
    return (
      <div style={pageStyle}>
        <div style={containerStyle}>
          <div style={heroCardStyle}>
            <div style={mutedLabelStyle}>LOQE Operating Console</div>
            <h1 style={pageTitleStyle}>Loading client dashboard...</h1>
            <p style={pageSubtitleStyle}>Pulling profile summary, recommendation history, and itinerary drafts.</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div style={pageStyle}>
        <div style={containerStyle}>
          <div style={heroCardStyle}>
            <div style={mutedLabelStyle}>LOQE Operating Console</div>
            <h1 style={pageTitleStyle}>Client dashboard unavailable</h1>
            <p style={pageSubtitleStyle}>{error || 'The client profile could not be found.'}</p>

            <div style={actionsRowStyle}>
              <Link to="/client-profiles" style={primaryButtonStyle}>
                Back to Client Profiles
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={pageStyle}>
      <div style={containerStyle}>
        <div style={heroCardStyle}>
          <div style={heroTopRowStyle}>
            <div>
              <div style={mutedLabelStyle}>LOQE Operating Console</div>
              <h1 style={pageTitleStyle}>{displayName}</h1>
              <p style={pageSubtitleStyle}>
                Single control surface for profile context, recommendation memory, itinerary work, and next actions.
              </p>
            </div>

            <div style={actionsWrapStyle}>
              <button
                type="button"
                style={secondaryButtonStyle}
                onClick={() => navigate(`/client-profiles/${profile._id}`)}
              >
                View Profile
              </button>

              <Link to={`/client-profiles/${profile._id}/recommendations`} style={primaryButtonStyle}>
                Open Recommendations
              </Link>

              <Link to={`/client-profiles/${profile._id}/itinerary-builder`} style={ghostButtonStyle}>
                Build Itinerary
              </Link>
            </div>
          </div>

          <div style={statsGridStyle}>
            <div style={statCardStyle}>
              <div style={statLabelStyle}>Recommendation Snapshots</div>
              <div style={statValueStyle}>{stats.snapshots}</div>
              <div style={statMetaStyle}>Latest: {stats.latestSnapshot}</div>
            </div>

            <div style={statCardStyle}>
              <div style={statLabelStyle}>Itinerary Drafts</div>
              <div style={statValueStyle}>{stats.drafts}</div>
              <div style={statMetaStyle}>Latest: {stats.latestDraft}</div>
            </div>

            <div style={statCardStyle}>
              <div style={statLabelStyle}>Profile Created</div>
              <div style={statValueStyleSmall}>{formatDate(profile._createdAt)}</div>
              <div style={statMetaStyle}>Updated: {formatDate(profile._updatedAt)}</div>
            </div>

            <div style={statCardStyle}>
              <div style={statLabelStyle}>Contact</div>
              <div style={statValueStyleSmall}>{profile.email || profile.phone || '—'}</div>
              <div style={statMetaStyle}>{profile.company || profile.location || '—'}</div>
            </div>
          </div>
        </div>

        <div style={mainGridStyle}>
          <section style={panelStyle}>
            <div style={panelHeaderStyle}>
              <div>
                <div style={sectionLabelStyle}>Profile Summary</div>
                <h2 style={sectionTitleStyle}>Client signal snapshot</h2>
              </div>
            </div>

            <div style={summaryGridStyle}>
              {summaryItems.map((item) => (
                <div key={item.label} style={summaryItemStyle}>
                  <div style={summaryLabelStyle}>{item.label}</div>
                  <div style={summaryValueStyle}>{item.value || '—'}</div>
                </div>
              ))}
            </div>

            {(profile.summary || profile.notes || profile.questionnaireOutput) && (
              <div style={notesBoxStyle}>
                <div style={summaryLabelStyle}>Notes / Summary</div>
                <div style={notesTextStyle}>
                  {profile.summary || profile.notes || profile.questionnaireOutput}
                </div>
              </div>
            )}
          </section>

          <section style={panelStyle}>
            <div style={panelHeaderStyle}>
              <div>
                <div style={sectionLabelStyle}>Quick Actions</div>
                <h2 style={sectionTitleStyle}>Operational shortcuts</h2>
              </div>
            </div>

            <div style={quickActionsGridStyle}>
              <Link to={`/client-profiles/${profile._id}/recommendations`} style={quickActionCardStyle}>
                <div style={quickActionTitleStyle}>Run Recommendations</div>
                <div style={quickActionTextStyle}>
                  Re-score destinations and open the luxury recommendation board.
                </div>
              </Link>

              <Link to={`/client-profiles/${profile._id}/itinerary-builder`} style={quickActionCardStyle}>
                <div style={quickActionTitleStyle}>Open Itinerary Builder</div>
                <div style={quickActionTextStyle}>
                  Start building from the client context without re-entering profile details.
                </div>
              </Link>

              <Link to={`/itinerary-drafts?profileId=${profile._id}`} style={quickActionCardStyle}>
                <div style={quickActionTitleStyle}>View All Drafts</div>
                <div style={quickActionTextStyle}>
                  Jump into all draft itineraries tied to this client.
                </div>
              </Link>

              <Link to={`/client-profiles/${profile._id}`} style={quickActionCardStyle}>
                <div style={quickActionTitleStyle}>Return to Client Profile</div>
                <div style={quickActionTextStyle}>
                  Review intake answers and the original client profile record.
                </div>
              </Link>
            </div>
          </section>
        </div>

        <div style={twoColumnGridStyle}>
          <section style={panelStyle}>
            <div style={panelHeaderStyle}>
              <div>
                <div style={sectionLabelStyle}>Recommendation History</div>
                <h2 style={sectionTitleStyle}>Saved board memory</h2>
              </div>
            </div>

            {snapshots.length === 0 ? (
              <div style={emptyStateStyle}>
                No recommendation snapshots saved yet.
              </div>
            ) : (
              <div style={listStyle}>
                {snapshots.map((snapshot, index) => {
                  const snapshotId = snapshot?._key || snapshot?._id || `snapshot-${index}`;
                  const destinations = getSnapshotDestinations(snapshot);

                  return (
                    <div key={snapshotId} style={listCardStyle}>
                      <div style={listCardTopRowStyle}>
                        <div>
                          <div style={listCardTitleStyle}>{getSnapshotLabel(snapshot, index)}</div>
                          <div style={listCardMetaStyle}>
                            Saved: {formatDate(getSnapshotDate(snapshot))}
                          </div>
                        </div>

                        <Link
                          to={`/client-profiles/${profile._id}/recommendations?snapshotId=${encodeURIComponent(
                            snapshotId
                          )}`}
                          style={inlineActionStyle}
                        >
                          Reopen
                        </Link>
                      </div>

                      {snapshot?.summary && (
                        <div style={listCardBodyStyle}>{snapshot.summary}</div>
                      )}

                      {destinations.length > 0 && (
                        <div style={pillWrapStyle}>
                          {destinations.slice(0, 6).map((destination) => (
                            <span key={destination} style={pillStyle}>
                              {destination}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          <section style={panelStyle}>
            <div style={panelHeaderStyle}>
              <div>
                <div style={sectionLabelStyle}>Itinerary Drafts</div>
                <h2 style={sectionTitleStyle}>Active trip work</h2>
              </div>
            </div>

            {itineraryDrafts.length === 0 ? (
              <div style={emptyStateStyle}>
                No itinerary drafts exist for this client yet.
              </div>
            ) : (
              <div style={listStyle}>
                {itineraryDrafts.map((draft, index) => {
                  const badgeStyles = getStatusBadgeStyles(draft.status);

                  return (
                    <div key={draft._id} style={listCardStyle}>
                      <div style={listCardTopRowStyle}>
                        <div>
                          <div style={listCardTitleStyle}>{getDraftLabel(draft, index)}</div>
                          <div style={listCardMetaStyle}>
                            Updated:{' '}
                            {formatDate(
                              draft.updatedAt || draft._updatedAt || draft._createdAt
                            )}
                          </div>
                        </div>

                        <div
                          style={{
                            ...statusBadgeStyle,
                            background: badgeStyles.background,
                            color: badgeStyles.color,
                          }}
                        >
                          {draft.status || 'draft'}
                        </div>
                      </div>

                      {(draft.summary || draft.notes) && (
                        <div style={listCardBodyStyle}>{draft.summary || draft.notes}</div>
                      )}

                      <div style={draftMetaGridStyle}>
                        <div style={draftMetaItemStyle}>
                          <span style={draftMetaLabelStyle}>Version</span>
                          <span>{draft.version || '—'}</span>
                        </div>

                        <div style={draftMetaItemStyle}>
                          <span style={draftMetaLabelStyle}>Days</span>
                          <span>{draft.dayCount || draft.nights || '—'}</span>
                        </div>

                        <div style={draftMetaItemStyle}>
                          <span style={draftMetaLabelStyle}>Start</span>
                          <span>{draft.startDate || '—'}</span>
                        </div>

                        <div style={draftMetaItemStyle}>
                          <span style={draftMetaLabelStyle}>End</span>
                          <span>{draft.endDate || '—'}</span>
                        </div>
                      </div>

                      <div style={actionsRowStyle}>
                        <Link to={`/itinerary-drafts/${draft._id}`} style={inlineActionStyle}>
                          Open Draft
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

const pageStyle = {
  minHeight: '100vh',
  background:
    'radial-gradient(circle at top, rgba(42,51,88,0.35), rgba(10,10,16,1) 45%), #08080c',
  color: '#f5f7fb',
  padding: '32px 20px 60px',
};

const containerStyle = {
  maxWidth: '1320px',
  margin: '0 auto',
  display: 'grid',
  gap: '24px',
};

const heroCardStyle = {
  background: 'linear-gradient(135deg, rgba(19,24,42,0.96), rgba(8,10,18,0.96))',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: '24px',
  padding: '28px',
  boxShadow: '0 20px 60px rgba(0,0,0,0.28)',
};

const heroTopRowStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  gap: '20px',
  alignItems: 'flex-start',
  flexWrap: 'wrap',
};

const mutedLabelStyle = {
  fontSize: '12px',
  letterSpacing: '0.16em',
  textTransform: 'uppercase',
  color: 'rgba(255,255,255,0.55)',
  marginBottom: '10px',
};

const pageTitleStyle = {
  fontSize: '36px',
  lineHeight: 1.05,
  margin: 0,
};

const pageSubtitleStyle = {
  margin: '12px 0 0',
  maxWidth: '780px',
  color: 'rgba(255,255,255,0.72)',
  fontSize: '15px',
  lineHeight: 1.6,
};

const actionsWrapStyle = {
  display: 'flex',
  gap: '12px',
  flexWrap: 'wrap',
};

const buttonBaseStyle = {
  textDecoration: 'none',
  borderRadius: '14px',
  padding: '12px 16px',
  fontWeight: 700,
  fontSize: '14px',
  border: '1px solid rgba(255,255,255,0.1)',
  cursor: 'pointer',
};

const primaryButtonStyle = {
  ...buttonBaseStyle,
  background: '#ffffff',
  color: '#0b0e16',
};

const secondaryButtonStyle = {
  ...buttonBaseStyle,
  background: 'rgba(255,255,255,0.08)',
  color: '#ffffff',
};

const ghostButtonStyle = {
  ...buttonBaseStyle,
  background: 'transparent',
  color: '#ffffff',
};

const statsGridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
  gap: '14px',
  marginTop: '22px',
};

const statCardStyle = {
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: '18px',
  padding: '18px',
};

const statLabelStyle = {
  color: 'rgba(255,255,255,0.62)',
  fontSize: '12px',
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
};

const statValueStyle = {
  fontSize: '34px',
  fontWeight: 800,
  marginTop: '10px',
};

const statValueStyleSmall = {
  fontSize: '18px',
  fontWeight: 700,
  marginTop: '10px',
  lineHeight: 1.4,
};

const statMetaStyle = {
  color: 'rgba(255,255,255,0.6)',
  fontSize: '13px',
  marginTop: '8px',
};

const mainGridStyle = {
  display: 'grid',
  gridTemplateColumns: '1.2fr 1fr',
  gap: '24px',
};

const twoColumnGridStyle = {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: '24px',
};

const panelStyle = {
  background: 'rgba(10,12,18,0.94)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: '24px',
  padding: '24px',
  boxShadow: '0 18px 48px rgba(0,0,0,0.22)',
};

const panelHeaderStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  gap: '12px',
  marginBottom: '18px',
};

const sectionLabelStyle = {
  color: 'rgba(255,255,255,0.55)',
  fontSize: '12px',
  textTransform: 'uppercase',
  letterSpacing: '0.12em',
};

const sectionTitleStyle = {
  margin: '8px 0 0',
  fontSize: '22px',
};

const summaryGridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
  gap: '12px',
};

const summaryItemStyle = {
  padding: '14px',
  borderRadius: '16px',
  border: '1px solid rgba(255,255,255,0.08)',
  background: 'rgba(255,255,255,0.03)',
};

const summaryLabelStyle = {
  fontSize: '12px',
  color: 'rgba(255,255,255,0.56)',
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
};

const summaryValueStyle = {
  marginTop: '8px',
  fontSize: '16px',
  fontWeight: 700,
  lineHeight: 1.45,
};

const notesBoxStyle = {
  marginTop: '16px',
  padding: '16px',
  borderRadius: '18px',
  background: 'rgba(255,255,255,0.03)',
  border: '1px solid rgba(255,255,255,0.08)',
};

const notesTextStyle = {
  marginTop: '8px',
  lineHeight: 1.7,
  color: 'rgba(255,255,255,0.82)',
  whiteSpace: 'pre-wrap',
};

const quickActionsGridStyle = {
  display: 'grid',
  gap: '12px',
};

const quickActionCardStyle = {
  display: 'block',
  textDecoration: 'none',
  padding: '18px',
  borderRadius: '18px',
  border: '1px solid rgba(255,255,255,0.08)',
  background: 'linear-gradient(135deg, rgba(255,255,255,0.04), rgba(255,255,255,0.02))',
  color: '#ffffff',
};

const quickActionTitleStyle = {
  fontSize: '16px',
  fontWeight: 700,
};

const quickActionTextStyle = {
  marginTop: '8px',
  color: 'rgba(255,255,255,0.68)',
  lineHeight: 1.55,
  fontSize: '14px',
};

const listStyle = {
  display: 'grid',
  gap: '14px',
};

const listCardStyle = {
  borderRadius: '18px',
  padding: '18px',
  background: 'rgba(255,255,255,0.03)',
  border: '1px solid rgba(255,255,255,0.08)',
};

const listCardTopRowStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  gap: '12px',
};

const listCardTitleStyle = {
  fontWeight: 800,
  fontSize: '16px',
};

const listCardMetaStyle = {
  marginTop: '6px',
  fontSize: '13px',
  color: 'rgba(255,255,255,0.62)',
};

const listCardBodyStyle = {
  marginTop: '12px',
  fontSize: '14px',
  lineHeight: 1.65,
  color: 'rgba(255,255,255,0.8)',
  whiteSpace: 'pre-wrap',
};

const pillWrapStyle = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: '8px',
  marginTop: '14px',
};

const pillStyle = {
  padding: '8px 10px',
  borderRadius: '999px',
  background: 'rgba(255,255,255,0.07)',
  border: '1px solid rgba(255,255,255,0.08)',
  fontSize: '12px',
};

const draftMetaGridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
  gap: '10px',
  marginTop: '14px',
};

const draftMetaItemStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  gap: '8px',
  padding: '10px 12px',
  borderRadius: '12px',
  background: 'rgba(255,255,255,0.03)',
  fontSize: '13px',
};

const draftMetaLabelStyle = {
  color: 'rgba(255,255,255,0.56)',
};

const statusBadgeStyle = {
  fontSize: '12px',
  padding: '8px 10px',
  borderRadius: '999px',
  textTransform: 'capitalize',
  fontWeight: 700,
  whiteSpace: 'nowrap',
};

const inlineActionStyle = {
  color: '#ffffff',
  textDecoration: 'none',
  fontWeight: 700,
  fontSize: '14px',
};

const emptyStateStyle = {
  padding: '18px',
  borderRadius: '18px',
  border: '1px dashed rgba(255,255,255,0.12)',
  color: 'rgba(255,255,255,0.65)',
  background: 'rgba(255,255,255,0.02)',
};

const actionsRowStyle = {
  display: 'flex',
  gap: '12px',
  flexWrap: 'wrap',
  marginTop: '18px',
};