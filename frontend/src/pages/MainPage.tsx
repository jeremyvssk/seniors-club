import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Pencil, RefreshCw, X } from 'lucide-react';
import ProfileCard, { ProfileDetails } from '../components/ProfileCard';
import { Logo } from '../components/ui/design';
import { useIsDesktop } from '../hooks/useIsDesktop';
import { useChat } from '../context/ChatContext';
import { matchAPI } from '../api/api';
import api from '../api/axios';
import { fetchViewableProfile, getErrorMessage, ProfileWithId } from '../api/profiles';

type Out = 'left' | 'right' | null;

const EmptyExplore: React.FC<{ onRetry: () => void }> = ({ onRetry }) => {
    const navigate = useNavigate();
    return (
        <div className="empty">
            <svg viewBox="0 0 160 120" style={{ width: 160, height: 120 }} aria-hidden="true">
                <rect x="38" y="14" width="74" height="96" rx="14" fill="#fff" transform="rotate(-8 75 62)" stroke="#DCE3F0" strokeWidth="2" />
                <rect x="50" y="10" width="74" height="96" rx="14" fill="#fff" transform="rotate(7 87 58)" stroke="#DCE3F0" strokeWidth="2" />
                <circle cx="78" cy="58" r="15" fill="#2455D3" />
                <circle cx="96" cy="58" r="15" fill="#E0564A" fillOpacity="0.9" />
            </svg>
            <h2>You’ve met everyone nearby</h2>
            <p>New people join every week. We’ll show them here as soon as they do. Adding hobbies or a bigger distance helps us find more people for you.</p>
            <div className="empty-btns">
                <button className="b-lg pri btn" onClick={onRetry}><RefreshCw className="i" /><span>Check again</span></button>
                <button className="b-lg sec btn" onClick={() => navigate('/profile')}><Pencil className="i" /><span>Edit my profile</span></button>
            </div>
        </div>
    );
};

const Skeleton: React.FC = () => (
    <div className="card skel still" aria-hidden="true">
        <div style={{ position: 'absolute', left: 20, bottom: 20, right: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ width: 190, height: 48, borderRadius: 12, background: '#D3DCEC' }} />
            <div style={{ width: 110, height: 18, borderRadius: 9, background: '#D3DCEC' }} />
            <div style={{ width: 130, height: 36, borderRadius: 18, background: '#D3DCEC' }} />
            <div style={{ display: 'flex', gap: 8 }}>
                <div style={{ width: 90, height: 36, borderRadius: 18, background: '#D3DCEC' }} />
                <div style={{ width: 110, height: 36, borderRadius: 18, background: '#D3DCEC' }} />
                <div style={{ width: 70, height: 36, borderRadius: 18, background: '#D3DCEC' }} />
            </div>
        </div>
    </div>
);

const MainPage: React.FC = () => {
    const isDesktop = useIsDesktop();
    const { me } = useChat();
    const myHobbies = me?.hobbies || [];

    const [currentProfile, setCurrentProfile] = useState<ProfileWithId | null>(null);
    const [nextProfile, setNextProfile] = useState<ProfileWithId | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [noMoreProfiles, setNoMoreProfiles] = useState(false); // True when backend returns empty array (no more users to show)
    const [out, setOut] = useState<Out>(null);
    const [error, setError] = useState<string | null>(null);
    const queue = useRef<number[]>([]); // Queue of user IDs - IDs we haven't loaded yet
    const seenIds = useRef<Set<number>>(new Set()); // Track IDs we've already seen (to prevent duplicates from backend)
    const queuedIds = useRef<Set<number>>(new Set()); // IDs currently queued/reserved locally
    const isFetchingIdsRef = useRef(false); // prevent concurrent fetches
    const isActionInProgressRef = useRef(false); // Ref to prevent multiple actions (synchronous check)

    const fetchProfile = (userId: number): Promise<ProfileWithId> => {
        seenIds.current.add(userId);
        return fetchViewableProfile(userId);
    };

    /*
        Fetch more user IDs from backend and add to queue
        Returns true if we got new IDs, false if no more users
    */
    const fetchMoreIds = async (): Promise<boolean> => {
        if (isFetchingIdsRef.current) {
            return queue.current.length > 0;
        }
        isFetchingIdsRef.current = true;
        try {
            const response = await api.get<number[]>('/recommendations');
            const newIds = response.data.filter(id => !seenIds.current.has(id) && !queuedIds.current.has(id));
            newIds.forEach(id => {
                queuedIds.current.add(id);
                queue.current.push(id);
            });
            return queue.current.length > 0;
        } finally {
            isFetchingIdsRef.current = false;
        }
    };

    // Take the next ID from the queue and load it. Skips people whose profile fails to load
    const takeNext = async (): Promise<ProfileWithId | null> => {
        while (true) {
            if (queue.current.length === 0 && !(await fetchMoreIds())) return null;
            const nextId = queue.current.shift()!;
            queuedIds.current.delete(nextId);
            try {
                return await fetchProfile(nextId);
            } catch (err) {
                console.error('Skipping profile that failed to load:', nextId, err);
            }
        }
    };

    const loadInitial = async () => {
        setIsLoading(true);
        setNoMoreProfiles(false);
        setError(null);
        try {
            const first = await takeNext();
            setCurrentProfile(first);
            setNoMoreProfiles(!first);
            setIsLoading(false);
            if (first) setNextProfile(await takeNext());
        } catch (err) {
            console.error('Failed to load recommendations:', err);
            setError('We couldn’t load people right now. Check your connection and try again.');
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadInitial();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Like sends a connection request; skip just hides them. The card slides away, then the next one comes in
    const handleAction = async (actionType: 'like' | 'skip') => {
        if (!currentProfile || isActionInProgressRef.current) return;
        isActionInProgressRef.current = true;
        const person = currentProfile;

        setOut(actionType === 'like' ? 'right' : 'left');
        try {
            if (actionType === 'like') {
                await matchAPI.sendConnectionRequest(person.userId);
            }
            await api.post(`/${person.userId}/${actionType}`);
            seenIds.current.add(person.userId);
            queuedIds.current.delete(person.userId);
        } catch (err) {
            console.error(`Failed to ${actionType}:`, err);
            setError(getErrorMessage(err, actionType === 'like' ? 'Couldn’t send your request. Try again.' : 'Something went wrong. Try again.'));
            setOut(null);
            isActionInProgressRef.current = false;
            return;
        }

        window.setTimeout(async () => {
            const next = nextProfile ?? (await takeNext().catch(() => null));
            setOut(null);
            setCurrentProfile(next);
            setNextProfile(null);
            if (!next) {
                setNoMoreProfiles(true);
                isActionInProgressRef.current = false;
                return;
            }
            isActionInProgressRef.current = false;
            setNextProfile(await takeNext().catch(() => null));
        }, 240);
    };

    // Keyboard: left arrow skips, right arrow connects
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            const target = e.target as HTMLElement;
            if (target.closest('input, textarea, [role="dialog"]')) return;
            if (e.key === 'ArrowLeft') handleAction('skip');
            if (e.key === 'ArrowRight') handleAction('like');
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    });

    useEffect(() => {
        if (!error) return;
        const t = window.setTimeout(() => setError(null), 4000);
        return () => clearTimeout(t);
    }, [error]);

    const busy = Boolean(out) || isLoading;

    const actions = (
        <div className="acts" style={isLoading ? { opacity: 0.45 } : undefined} aria-hidden={isLoading}>
            <button className="act btn" onClick={() => handleAction('skip')} disabled={busy}>
                <span className="circ skip"><X className="i" /></span>Skip
            </button>
            <button className="act btn" onClick={() => handleAction('like')} disabled={busy}>
                <span className="circ like"><Heart className="i" /></span>Connect
            </button>
        </div>
    );

    let stage: React.ReactNode;
    if (isLoading) {
        stage = (
            <>
                <div className="ex-card"><Skeleton /></div>
                {actions}
                <p className="sr" role="status">Finding people near you</p>
            </>
        );
    } else if (currentProfile) {
        stage = (
            <>
                <div className="ex-card">
                    <ProfileCard
                        key={currentProfile.userId}
                        profile={currentProfile}
                        myHobbies={myHobbies}
                        withBioSheet={!isDesktop}
                        className={out ? `out-${out}` : ''}
                    />
                </div>
                {actions}
            </>
        );
    } else if (noMoreProfiles) {
        stage = <div className="ex-empty"><EmptyExplore onRetry={() => { seenIds.current.clear(); loadInitial(); }} /></div>;
    } else if (error) {
        stage = (
            <div className="ex-empty">
                <div className="empty">
                    <h2>Something went wrong</h2>
                    <p>{error}</p>
                    <button className="b-lg pri btn" onClick={loadInitial}><RefreshCw className="i" /><span>Try again</span></button>
                </div>
            </div>
        );
    }

    return (
        <div className="ex">
            <header className="ph-h ph-only"><Logo /></header>
            <main className="ex-main">
                <div className="ex-col">{stage}</div>
                {isDesktop && currentProfile && !isLoading && (
                    <section className={out ? 'det out' : 'det'} aria-label={`About ${currentProfile.name}`} key={currentProfile.userId}>
                        <p className="lbl">About {currentProfile.name}</p>
                        <ProfileDetails profile={currentProfile} myHobbies={myHobbies} />
                    </section>
                )}
            </main>
            {error && (currentProfile || isLoading) && <div className="toast err" role="alert">{error}</div>}
        </div>
    );
};

export default MainPage;
