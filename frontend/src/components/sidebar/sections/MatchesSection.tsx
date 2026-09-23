import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layers, MapPin, MessageCircle, RefreshCw, Users } from 'lucide-react';
import { matchAPI } from '../../../api/api';
import { useChat } from '../../../context/ChatContext';
import { fetchViewableProfile, getErrorMessage, ProfileWithId as BaseProfile } from '../../../api/profiles';
import ProfileCard from '../../ProfileCard';
import Modal from '../../ui/Modal';
import { Avatar, EmptyState, LookingForChip, Spinner } from '../../ui/design';
import { kmText, sortShared } from '../../../lib/format';

interface ProfileWithId extends BaseProfile {
  matchedAt?: string; // Optional: when they matched
}

// Two hobbies (shared ones first) and "+N more", so every row is the same height
export const RowChips: React.FC<{ hobbies: string[]; mine: string[] }> = ({ hobbies, mine }) => {
  const all = sortShared(hobbies, mine);
  if (all.length === 0) return null;
  return (
    <ul className="chips sm">
      {all.slice(0, 2).map((h) => (
        <li key={h.t} className={h.sh ? 'sh' : ''}>{h.t}</li>
      ))}
      {all.length > 2 && <li className="more">+{all.length - 2} more</li>}
    </ul>
  );
};

export const MatchesSection: React.FC = () => {
  const [matches, setMatches] = useState<ProfileWithId[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [opening, setOpening] = useState<number | null>(null);
  const { openChatWithUser, clearMatchesNotification, newMatchesCount, me } = useChat();
  const navigate = useNavigate();
  const [unfriend, setUnfriend] = useState<ProfileWithId | null>(null);
  const [removing, setRemoving] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<ProfileWithId | null>(null);

  const fetchMatches = useCallback(async () => {
    try {
      setError(null);
      const matchesData = await matchAPI.getUserMatches();
      const fullProfiles = await Promise.all(
        matchesData.map(async (match) => ({
          ...(await fetchViewableProfile(match.userId)),
          matchedAt: match.matchedAt,
        }))
      );
      setMatches(fullProfiles);
    } catch (err) {
      console.error('Failed to fetch matches:', err);
      setError(getErrorMessage(err, 'Check your connection and try again.'));
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load + clear notification
  useEffect(() => {
    fetchMatches();
    clearMatchesNotification();
  }, [fetchMatches, clearMatchesNotification]);

  // Auto-refresh when new matches arrive
  useEffect(() => {
    if (newMatchesCount > 0) {
      fetchMatches();
      clearMatchesNotification();
    }
  }, [newMatchesCount, fetchMatches, clearMatchesNotification]);

  const handleSendMessage = async (userId: number) => {
    setOpening(userId);
    try {
      await openChatWithUser(userId);
      navigate('/messages');
    } catch (err) {
      setError(getErrorMessage(err, 'Couldn’t open the chat. Try again.'));
    } finally {
      setOpening(null);
    }
  };

  const confirmUnfriend = async () => {
    if (!unfriend) return;
    setRemoving(true);
    try {
      await matchAPI.disconnect(unfriend.userId);
      setMatches(prev => prev.filter(m => m.userId !== unfriend.userId));
      setUnfriend(null);
    } catch (err) {
      setError(getErrorMessage(err, 'Couldn’t remove this match. Try again.'));
      setUnfriend(null);
    } finally {
      setRemoving(false);
    }
  };

  const header = (
    <header className="ph-h">
      <h1>Matches</h1>
      {matches.length > 0 && (
        <span className="ph-note">{matches.length} {matches.length === 1 ? 'person' : 'people'}</span>
      )}
    </header>
  );

  if (loading) {
    return <div className="page">{header}<Spinner label="Loading matches" /></div>;
  }

  if (error && matches.length === 0) {
    return (
      <div className="page">
        {header}
        <main className="page-empty">
          <EmptyState
            icon={<RefreshCw className="i" />}
            heading="Couldn’t load your matches"
            text={error}
            action={<button className="b-lg pri btn" onClick={() => { setLoading(true); fetchMatches(); }}><RefreshCw className="i" /><span>Try again</span></button>}
          />
        </main>
      </div>
    );
  }

  if (matches.length === 0) {
    return (
      <div className="page">
        {header}
        <main className="page-empty">
          <EmptyState
            icon={<Users className="i" />}
            heading="No matches yet"
            text="Press Connect on someone you like. When they accept, they show up here."
            action={<button className="b-lg pri btn" onClick={() => navigate('/explore')}><Layers className="i" /><span>Find people</span></button>}
          />
        </main>
      </div>
    );
  }

  return (
    <div className="page">
      {header}
      {error && <div className="page-alert"><div className="alert" role="alert">{error}</div></div>}
      <main className="page-list scroll">
        <ul className="list">
          {matches.map((match) => (
            <li key={match.userId} className="row">
              <button className="row-ava btn" onClick={() => setSelectedProfile(match)} aria-label={`See ${match.name}'s profile`}>
                <Avatar src={match.profilePicture} name={match.name} size={64} online={match.isOnline} />
              </button>
              <div className="row-b">
                <button className="row-n btn" onClick={() => setSelectedProfile(match)}>
                  <b>{match.name}</b> <span>{match.age}</span>
                </button>
                <p className="row-sub"><MapPin className="xs" />{kmText(match.distanceKm)}</p>
                <span><LookingForChip kind={match.lookingFor} variant="l" small /></span>
                <RowChips hobbies={match.hobbies} mine={me?.hobbies || []} />
                <div className="row-a">
                  <button className="b-md pri btn" onClick={() => handleSendMessage(match.userId)} disabled={opening === match.userId}>
                    <MessageCircle className="s" />
                    <span>{opening === match.userId ? 'Opening…' : 'Message'}</span>
                  </button>
                  <button className="b-md ghost btn" onClick={() => setUnfriend(match)}>Unfriend</button>
                </div>
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
        </Modal>
      )}

      {unfriend && (
        <Modal title={`Unfriend ${unfriend.name}?`} onClose={() => setUnfriend(null)} small>
          <p style={{ color: 'var(--muted)', fontSize: 17 }}>
            {unfriend.name} will be removed from your matches and you won’t be able to message each other.
          </p>
          <div className="modal-a">
            <button className="b-lg sec btn" onClick={() => setUnfriend(null)}>Keep</button>
            <button className="b-lg danger btn" onClick={confirmUnfriend} disabled={removing}>
              {removing ? 'Removing…' : 'Unfriend'}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default MatchesSection;
