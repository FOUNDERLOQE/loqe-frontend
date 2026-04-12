import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { client } from '../lib/sanity';

const clientProfileDetailPageQuery = `
{
  "profile": *[_type in ["clientProfile", "clientTravelPersonality"] && _id == $id][0]{
    _id,
    _type,
    _createdAt,
    _updatedAt,

    title,
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
    cityOfResidence,

    tripName,
    tripType,
    travelStyle,
    luxuryStyle,
    pace,
    vibe,
    occasion,
    purposeOfTravel,
    tripLength,
    tripLengthDays,
    duration,
    nights,
    days,
    budget,
    budgetBand,
    budgetRange,
    budgetPerPerson,
    totalBudget,
    partySize,
    travellerCount,
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
    relationshipManagerNotes,
    summary,
    autoSummary,
    questionnaireOutput,
    profilePayload,
    recommendationSnapshots[]{
      ...,
      _key
    }
  },

  "itineraryDrafts": *[
    _type == "itineraryDraft" &&
    (
      clientProfile._ref == $id ||
      clientProfile->_id == $id
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

function formatDate(value) {
  if (!value) return '—';

  try {
    return new Date(value).toLocaleString('en-IN', {
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

  const joined = [profile.firstName, profile.lastName].filter(Boolean).join(' ').trim();

  return (
    profile.clientName ||
    profile.fullName ||
    profile.name ||
    profile.title ||
    joined ||
    profile.email ||
    'Client'
  );
}

function getTravelers(profile) {
  if (!profile) return '—';

  if (profile.travellerCount) return profile.travellerCount;
  if (profile.partySize) return profile.partySize;
  if (profile.travelers) return profile.travelers;

  const parts = [];
  if (profile.adults) parts.push(`${profile.adults} adult${Number(profile.adults) > 1 ? 's' : ''}`);
  if (profile.children || profile.kids) {
    const kids = profile.children || profile.kids;
    parts.push(`${kids} child${Number(kids) > 1 ? 'ren' : ''}`);
  }

  return parts.length ? parts.join(', ') : '—';
}

function getTravelWindow(profile) {
  if (!profile) return '—';

  if (Array.isArray(profile.preferredMonths) && profile.preferredMonths.length) {
    return profile.preferredMonths.join(', ');
  }

  if (Array.isArray(profile.travelMonths) && profile.travelMonths.length) {
    return profile.travelMonths.join(', ');
  }

  return profile.preferredTravelMonth || '—';
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
  const sources = [
    snapshot?.destinations,
    snapshot?.recommendedDestinations,
    snapshot?.topDestinations,
    snapshot?.boardDestinations,
    snapshot?.results,
  ].filter(Array.isArray);

  const items = sources[0] || [];

  return items
    .map((item) => {
      if (!item) return null;
      if (typeof item === 'string') return item;

      return (
        item.title ||
        item.name ||
        item.destinationTitle ||
        item.destinationName ||
        item.destination?.title ||
        null
      );
    })
    .filter(Boolean);
}

function getDraftLabel(draft, index) {
  return draft?.title || draft?.name || draft?.tripName || `Itinerary Draft ${index + 1}`;
}

function getStatusStyles(status) {
  const normalized = (status || 'draft').toLowerCase();

  const styles = {
    draft: { background: '#1f2937', color: '#e5e7eb' },
    working: { background: '#1e3a8a', color: '#dbeafe' },
    review: { background: '#78350f', color: '#fef3c7' },
    approved: { background: '#14532d', color: '#dcfce7' },
    final: { background: '#4c1d95', color: '#f3e8ff' },
  };

  return styles[normalized] || { background: '#27272a', color: '#f4f4f5' };
}

export default function ClientProfileDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [profile, setProfile] = useState(null);
  const [itineraryDrafts, setItineraryDrafts] = useState([]);

  useEffect(() => {
    let cancelled = false;

    async function loadData() {
      try {
        setLoading(true);
        setError('');

        const result = await client.fetch(clientProfileDetailPageQuery, { id });

        if (!cancelled) {
          setProfile(result?.profile || null);
          setItineraryDrafts(Array.isArray(result?.itineraryDrafts) ? result.itineraryDrafts : []);
        }
      } catch (err) {
        console.error('Failed to load client profile detail:', err);
        if (!cancelled) {
          setError('Failed to load client profile.');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadData();

    return () => {
      cancelled = true;
    };
  }, [id]);

  const displayName = useMemo(() => getDisplayName(profile), [profile]);

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

  const overviewCards = useMemo(() => {
    if (!profile) return [];

    return [
      { label: 'Trip', value: profile.tripName || profile.tripType || profile.purposeOfTravel || '—' },
      { label: 'Occasion', value: profile.occasion || '—' },
      { label: 'Travel Style', value: profile.travelStyle || '—' },
      { label: 'Luxury Style', value: profile.luxuryStyle || '—' },
      { label: 'Pace', value: profile.pace || '—' },
      { label: 'Vibe', value: profile.vibe || '—' },
      {
        label: 'Budget',
        value:
          profile.budgetBand ||
          profile.budgetRange ||
          profile.budget ||
          profile.budgetPerPerson ||
          profile.totalBudget ||
          '—',
      },
      { label: 'Travellers', value: getTravelers(profile) },
      {
        label: 'Duration',
        value:
          profile.tripLengthDays ||
          profile.tripLength ||
          profile.duration ||
          profile.nights ||
          profile.days ||
          '—',
      },
      { label: 'Travel Window', value: getTravelWindow(profile) },
      { label: 'Departure', value: profile.departureCity || profile.originCity || profile.preferredDeparture || '—' },
      { label: 'Location', value: profile.location || profile.cityOfResidence || profile.nationality || '—' },
    ];
  }, [profile]);

  if (loading) {
    return (
      <div style={pageStyle}>
        <div style={containerStyle}>
          <div style={heroStyle}>
            <div style={eyebrowStyle}>Client Profile</div>
            <h1 style={titleStyle}>Loading client record...</h1>
            <p style={subtitleStyle}>
              Pulling questionnaire output, recommendation history, and itinerary drafts.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div style={pageStyle}>
        <div style={containerStyle}>
          <div style={heroStyle}>
            <div style={eyebrowStyle}>Client Profile</div>
            <h1 style={titleStyle}>Client record unavailable</h1>
            <p style={subtitleStyle}>{error || 'The client profile could not be found.'}</p>

            <div style={actionRowStyle}>
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
        <section style={heroStyle}>
          <div style={heroTopStyle}>
            <div>
              <div style={eyebrowStyle}>LOQE Client Record</div>
              <h1 style={titleStyle}>{displayName}</h1>
              <p style={subtitleStyle}>
                This is the unified operating console for the client: questionnaire
                profile, travel personality, recommendation memory, and itinerary work.
              </p>
            </div>

            <div style={actionWrapStyle}>
              <button
                type="button"
                style={secondaryButtonStyle}
                onClick={() => navigate('/client-profiles')}
              >
                Back to Profiles
              </button>

              <Link
                to={`/client-profiles/${profile._id}/recommendations`}
                style={primaryButtonStyle}
              >
                Run Recommendations
              </Link>

              <Link
                to={`/client-profiles/${profile._id}/itinerary-builder`}
                style={ghostButtonStyle}
              >
                Open Itinerary Builder
              </Link>
            </div>
          </div>

          <div style={statsGridStyle}>
            <div style={statCardStyle}>
              <div style={statLabelStyle}>Profile Created</div>
              <div style={statValueSmallStyle}>{formatDate(profile._createdAt)}</div>
              <div style={statMetaStyle}>Updated: {formatDate(profile._updatedAt)}</div>
            </div>

            <div style={statCardStyle}>
              <div style={statLabelStyle}>Recommendation Snapshots</div>
              <div style={statValueStyle}>{snapshots.length}</div>
              <div style={statMetaStyle}>
                Latest: {snapshots[0] ? formatDate(getSnapshotDate(snapshots[0])) : '—'}
              </div>
            </div>

            <div style={statCardStyle}>
              <div style={statLabelStyle}>Itinerary Drafts</div>
              <div style={statValueStyle}>{itineraryDrafts.length}</div>
              <div style={statMetaStyle}>
                Latest:{' '}
                {itineraryDrafts[0]
                  ? formatDate(
                      itineraryDrafts[0].updatedAt ||
                        itineraryDrafts[0]._updatedAt ||
                        itineraryDrafts[0]._createdAt
                    )
                  : '—'}
              </div>
            </div>

            <div style={statCardStyle}>
              <div style={statLabelStyle}>Contact</div>
              <div style={statValueSmallStyle}>{profile.email || profile.phone || '—'}</div>
              <div style={statMetaStyle}>{profile.company || '—'}</div>
            </div>
          </div>
        </section>

        <div style={topGridStyle}>
          <section style={panelStyle}>
            <div style={panelHeaderStyle}>
              <div>
                <div style={sectionEyebrowStyle}>Questionnaire Output</div>
                <h2 style={sectionTitleStyle}>Travel Personality & Client Context</h2>
              </div>
            </div>

            <div style={infoGridStyle}>
              {overviewCards.map((item) => (
                <div key={item.label} style={infoCardStyle}>
                  <div style={infoLabelStyle}>{item.label}</div>
                  <div style={infoValueStyle}>{item.value || '—'}</div>
                </div>
              ))}
            </div>

            {(profile.summary || profile.autoSummary || profile.relationshipManagerNotes || profile.notes || profile.questionnaireOutput) && (
              <div style={textBlockStyle}>
                <div style={textBlockTitleStyle}>Notes / Summary</div>
                <div style={textBlockBodyStyle}>
                  {profile.summary ||
                    profile.autoSummary ||
                    profile.relationshipManagerNotes ||
                    profile.notes ||
                    profile.questionnaireOutput}
                </div>
              </div>
            )}
          </section>

          <section style={panelStyle}>
            <div style={panelHeaderStyle}>
              <div>
                <div style={sectionEyebrowStyle}>Quick Actions</div>
                <h2 style={sectionTitleStyle}>Next Best Moves</h2>
              </div>
            </div>

            <div style={quickGridStyle}>
              <Link
                to={`/client-profiles/${profile._id}/recommendations`}
                style={quickActionStyle}
              >
                <div style={quickTitleStyle}>Run Recommendations</div>
                <div style={quickTextStyle}>
                  Re-score and open the luxury recommendation board for this client.
                </div>
              </Link>

              <Link
                to={`/client-profiles/${profile._id}/itinerary-builder`}
                style={quickActionStyle}
              >
                <div style={quickTitleStyle}>Open Itinerary Builder</div>
                <div style={quickTextStyle}>
                  Create or refine the itinerary using this client’s saved profile.
                </div>
              </Link>

              <Link
                to={`/itinerary-drafts?profileId=${profile._id}`}
                style={quickActionStyle}
              >
                <div style={quickTitleStyle}>View All Drafts</div>
                <div style={quickTextStyle}>
                  Jump straight into every itinerary draft linked to this client.
                </div>
              </Link>

              <Link to="/client-intake" style={quickActionStyle}>
                <div style={quickTitleStyle}>Create New Client</div>
                <div style={quickTextStyle}>
                  Start a fresh questionnaire only when creating a brand new client.
                </div>
              </Link>
            </div>
          </section>
        </div>

        <div style={bottomGridStyle}>
          <section style={panelStyle}>
            <div style={panelHeaderStyle}>
              <div>
                <div style={sectionEyebrowStyle}>Recommendation History</div>
                <h2 style={sectionTitleStyle}>Saved Recommendation Boards</h2>
              </div>
            </div>

            {snapshots.length === 0 ? (
              <div style={emptyStateStyle}>No recommendation snapshots saved yet.</div>
            ) : (
              <div style={listStyle}>
                {snapshots.map((snapshot, index) => {
                  const snapshotId = snapshot?._key || snapshot?._id || `snapshot-${index}`;
                  const destinations = getSnapshotDestinations(snapshot);

                  return (
                    <div key={snapshotId} style={listCardStyle}>
                      <div style={listTopStyle}>
                        <div>
                          <div style={listTitleStyle}>{getSnapshotLabel(snapshot, index)}</div>
                          <div style={listMetaStyle}>
                            Saved: {formatDate(getSnapshotDate(snapshot))}
                          </div>
                        </div>

                        <Link
                          to={`/client-profiles/${profile._id}/recommendations?snapshotId=${encodeURIComponent(
                            snapshotId
                          )}`}
                          style={inlineLinkStyle}
                        >
                          Reopen
                        </Link>
                      </div>

                      {snapshot?.summary && (
                        <div style={listBodyStyle}>{snapshot.summary}</div>
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
                <div style={sectionEyebrowStyle}>Itinerary Work</div>
                <h2 style={sectionTitleStyle}>Past & Active Drafts</h2>
              </div>
            </div>

            {itineraryDrafts.length === 0 ? (
              <div style={emptyStateStyle}>No itinerary drafts exist for this client yet.</div>
            ) : (
              <div style={listStyle}>
                {itineraryDrafts.map((draft, index) => {
                  const badge = getStatusStyles(draft.status);

                  return (
                    <div key={draft._id} style={listCardStyle}>
                      <div style={listTopStyle}>
                        <div>
                          <div style={listTitleStyle}>{getDraftLabel(draft, index)}</div>
                          <div style={listMetaStyle}>
                            Updated:{' '}
                            {formatDate(
                              draft.updatedAt || draft._updatedAt || draft._createdAt
                            )}
                          </div>
                        </div>

                        <div
                          style={{
                            ...statusBadgeStyle,
                            background: badge.background,
                            color: badge.color,
                          }}
                        >
                          {draft.status || 'draft'}
                        </div>
                      </div>

                      {(draft.summary || draft.notes) && (
                        <div style={listBodyStyle}>{draft.summary || draft.notes}</div>
                      )}

                      <div style={draftGridStyle}>
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

                      <div style={actionRowStyle}>
                        <Link to={`/itinerary-drafts/${draft._id}`} style={inlineLinkStyle}>
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
  minHeight: 'calc(100vh - 80px)',
  background:
    'radial-gradient(circle at top, rgba(38,48,86,0.28), rgba(6,7,11,1) 45%), #06070b',
  color: '#ffffff',
};

const containerStyle = {
  maxWidth: '1320px',
  margin: '0 auto',
  padding: '32px 20px 64px',
  display: 'grid',
  gap: '24px',
};

const heroStyle = {
  background: 'linear-gradient(135deg, rgba(16,21,38,0.96), rgba(7,9,16,0.96))',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: '28px',
  padding: '28px',
  boxShadow: '0 20px 60px rgba(0,0,0,0.24)',
};

const heroTopStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  gap: '20px',
  alignItems: 'flex-start',
  flexWrap: 'wrap',
};

const eyebrowStyle = {
  fontSize: '12px',
  letterSpacing: '0.16em',
  textTransform: 'uppercase',
  color: 'rgba(255,255,255,0.55)',
  marginBottom: '10px',
};

const titleStyle = {
  margin: 0,
  fontSize: '40px',
  lineHeight: 1.05,
};

const subtitleStyle = {
  margin: '12px 0 0',
  maxWidth: '840px',
  color: 'rgba(255,255,255,0.72)',
  fontSize: '15px',
  lineHeight: 1.6,
};

const actionWrapStyle = {
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

const statValueSmallStyle = {
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

const topGridStyle = {
  display: 'grid',
  gridTemplateColumns: '1.2fr 1fr',
  gap: '24px',
};

const bottomGridStyle = {
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

const sectionEyebrowStyle = {
  color: 'rgba(255,255,255,0.55)',
  fontSize: '12px',
  textTransform: 'uppercase',
  letterSpacing: '0.12em',
};

const sectionTitleStyle = {
  margin: '8px 0 0',
  fontSize: '22px',
};

const infoGridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
  gap: '12px',
};

const infoCardStyle = {
  padding: '14px',
  borderRadius: '16px',
  border: '1px solid rgba(255,255,255,0.08)',
  background: 'rgba(255,255,255,0.03)',
};

const infoLabelStyle = {
  fontSize: '12px',
  color: 'rgba(255,255,255,0.56)',
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
};

const infoValueStyle = {
  marginTop: '8px',
  fontSize: '16px',
  fontWeight: 700,
  lineHeight: 1.45,
};

const textBlockStyle = {
  marginTop: '16px',
  padding: '16px',
  borderRadius: '18px',
  background: 'rgba(255,255,255,0.03)',
  border: '1px solid rgba(255,255,255,0.08)',
};

const textBlockTitleStyle = {
  fontSize: '12px',
  color: 'rgba(255,255,255,0.56)',
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
};

const textBlockBodyStyle = {
  marginTop: '8px',
  lineHeight: 1.7,
  color: 'rgba(255,255,255,0.82)',
  whiteSpace: 'pre-wrap',
};

const quickGridStyle = {
  display: 'grid',
  gap: '12px',
};

const quickActionStyle = {
  display: 'block',
  textDecoration: 'none',
  padding: '18px',
  borderRadius: '18px',
  border: '1px solid rgba(255,255,255,0.08)',
  background: 'linear-gradient(135deg, rgba(255,255,255,0.04), rgba(255,255,255,0.02))',
  color: '#ffffff',
};

const quickTitleStyle = {
  fontSize: '16px',
  fontWeight: 700,
};

const quickTextStyle = {
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

const listTopStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  gap: '12px',
};

const listTitleStyle = {
  fontWeight: 800,
  fontSize: '16px',
};

const listMetaStyle = {
  marginTop: '6px',
  fontSize: '13px',
  color: 'rgba(255,255,255,0.62)',
};

const listBodyStyle = {
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

const draftGridStyle = {
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

const inlineLinkStyle = {
  color: '#ffffff',
  textDecoration: 'none',
  fontWeight: 700,
  fontSize: '14px',
};

const emptyStateStyle = {
  padding: '18px',
  borderRadius: '16px',
  background: 'rgba(255,255,255,0.03)',
  border: '1px solid rgba(255,255,255,0.08)',
  color: 'rgba(255,255,255,0.7)',
};

const actionRowStyle = {
  display: 'flex',
  gap: '12px',
  flexWrap: 'wrap',
  marginTop: '18px',
};