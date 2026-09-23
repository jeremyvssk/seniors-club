import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, Layers, MapPin, RefreshCw, UserPlus } from 'lucide-react';
import { matchAPI } from '../../../api/api';
import { useChat } from '../../../context/ChatContext';
import { fetchViewableProfile, getErrorMessage, ProfileWithId } from '../../../api/profiles';
import ProfileCard from '../../ProfileCard';
import Modal from '../../ui/Modal';
import { Avatar, EmptyState, LookingForChip, Spinner } from '../../ui/design';
import { kmText, relativeTime } from '../../../lib/format';
import { RowChips } from './MatchesSection';

// Extend the viewable profile with requestId, same pattern as MatchesSection
interface RequestProfileWithId extends ProfileWithId {
  requestId: number;
  requestedAt?: string;
}

export const RequestsSection: React.FC = () => {
  const [requests, setRequests] = useState<RequestProfileWithId[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<number | null>(null);
  const { clearRequestsNotification, newRequestsCount, refreshRequestsCount, me } = useChat();
  const [selectedProfile, setSelectedProfile] = useState<RequestProfileWithId | null>(null);
  const navigate = useNavigate();

  const fetchRequests = useCallback(async () => {
    try {
      setError(null);
      const requestsData = await matchAPI.getPendingRequests();
      const fullProfiles = await Promise.all(
        requestsData.map(async (request) => ({
          ...(await fetchViewableProfile(request.userId)),
          requestId: request.requestId,
          requestedAt: request.requestedAt,
        }))
      );
      setRequests(fullProfiles);
    } catch (err) {
      console.error('Failed to fetch requests:', err);
      setError(getErrorMessage(err, 'Check your connection and try again.'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRequests();
    clearRequestsNotification();
  }, [fetchRequests, clearRequestsNotification]);

  // Auto-refresh when new requests arrive
  useEffect(() => {
    if (newRequestsCount > 0) {
      fetchRequests();
      clearRequestsNotification();
    }
  }, [newRequestsCount, fetchRequests, clearRequestsNotification]);

  const answer = async (request: RequestProfileWithId, accept: boolean) => {
    setProcessingId(request.requestId);
    try {
      if (accept) {
        await matchAPI.acceptRequest(request.requestId);
      } else {
        await matchAPI.declineRequest(request.requestId);
      }
      setRequests(prev => prev.filter(r => r.requestId !== request.requestId));
      setSelectedProfile(null);
      refreshRequestsCount();
    } catch (err) {
      console.error('Failed to answer request:', err);
      setError(getErrorMessage(err, accept ? 'Couldn’t accept. Try again.' : 'Couldn’t decline. Try again.'));
    } finally {
      setProcessingId(null);
    }
  };

  const header = <header className="ph-h"><h1>Requests</h1></header>;

  if (loading) {
    return <div className="page">{header}<Spinner label="Loading requests" /></div>;
  }

  if (error && requests.length === 0) {
    return (
      <div className="page">
        {header}
        <main className="page-empty">
          <EmptyState
            icon={<RefreshCw className="i" />}
            heading="Couldn’t load your requests"
            text={error}
            action={<button className="b-lg pri btn" onClick={() => { setLoading(true); fetchRequests(); }}><RefreshCw className="i" /><span>Try again</span></button>}
          />
        </main>
      </div>
    );
  }

  if (requests.length === 0) {
    return (
      <div className="page">
        {header}
        <main className="page-empty">
          <EmptyState
            icon={<UserPlus className="i" />}
            heading="No new requests"
            text="You have answered everyone. We’ll show new requests here."
            action={<button className="b-lg pri btn" onClick={() => navigate('/explore')}><Layers className="i" /><span>Find people</span></button>}
          />
        </main>
      </div>
    );
  }

  const buttons = (request: RequestProfileWithId) => {
    const busy = processingId === request.requestId;
    return (
      <div className="row-a">
        <button className="b-md pri btn" onClick={() => answer(request, true)} disabled={busy}>
          <Check className="s" />
          <span>Accept</span>
        </button>
        <button className="b-md sec btn" onClick={() => answer(request, false)} disabled={busy}>Decline</button>
      </div>
    );
  };

  return (
    <div className="page">
      {header}
      {error && <div className="page-alert"><div className="alert" role="alert">{error}</div></div>}
      <main className="page-list scroll">
        <ul className="list">
          {requests.map((request) => (
            <li key={request.requestId} className="row">
              <button className="row-ava btn" onClick={() => setSelectedProfile(request)} aria-label={`See ${request.name}'s profile`}>
                <Avatar src={request.profilePicture} name={request.name} size={64} online={request.isOnline} />
              </button>
              <div className="row-b">
                <button className="row-n btn" onClick={() => setSelectedProfile(request)}>
                  <b>{request.name}</b> <span>{request.age}</span>
                </button>
                <p className="row-sub">
                  <MapPin className="xs" />
                  {kmText(request.distanceKm)}
                  {request.requestedAt && ` · ${relativeTime(request.requestedAt)}`}
                </p>
                <span><LookingForChip kind={request.lookingFor} variant="l" small /></span>
                <RowChips hobbies={request.hobbies} mine={me?.hobbies || []} />
                {buttons(request)}
              </div>
            </li>
          ))}
        </ul>
      </main>

      {selectedProfile && (
        <Modal title={`${selectedProfile.name}'s profile`} onClose={() => setSelectedProfile(null)} bare>
          <div className="preview-card">
            <ProfileCard profile={selectedProfile} myHobbies={me?.hobbies} withBioSheet className="still" />
          </div>
          <div className="preview-acts">{buttons(selectedProfile)}</div>
        </Modal>
      )}
    </div>
  );
};

export default RequestsSection;
