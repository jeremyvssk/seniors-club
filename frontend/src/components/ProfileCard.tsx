import React, { useEffect, useRef, useState } from 'react';
import { Check, Info, MapPin, Sparkles, X } from 'lucide-react';
import { ViewableProfile } from '../types/User';
import { LookingForChip, LookingForValue } from './ui/design';
import { joinAnd, kmText, sortShared } from '../lib/format';

interface ProfileCardProps {
  profile: ViewableProfile;
  myHobbies?: string[];
  // 'out-left' / 'out-right' play the swipe-away, 'still' skips the entry animation
  className?: string;
  // Phone only: the Bio pill and the bottom sheet. Desktop shows the bio next to the card instead
  withBioSheet?: boolean;
  // Replaces the Bio pill (the profile page puts "Change photo" there)
  topRight?: React.ReactNode;
  // Replaces the distance line
  meta?: string;
  hideHobbies?: boolean;
}

// Average brightness of the lower half of the photo. Bright photos get a stronger scrim so white text stays readable
const isBrightPhoto = (img: HTMLImageElement) => {
  try {
    const canvas = document.createElement('canvas');
    canvas.width = 24;
    canvas.height = 24;
    const ctx = canvas.getContext('2d');
    if (!ctx) return false;
    ctx.drawImage(img, 0, 0, 24, 24);
    const { data } = ctx.getImageData(0, 12, 24, 12);
    let sum = 0;
    for (let i = 0; i < data.length; i += 4) {
      sum += 0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2];
    }
    return sum / (data.length / 4) > 170;
  } catch {
    return false;
  }
};

const ProfileCard: React.FC<ProfileCardProps> = ({
  profile,
  myHobbies = [],
  className = '',
  withBioSheet = false,
  topRight,
  meta,
  hideHobbies = false,
}) => {
  const [showBio, setShowBio] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [bright, setBright] = useState(false);
  const [rowWidth, setRowWidth] = useState(318);
  const overlayRef = useRef<HTMLDivElement>(null);

  const { name, age, profilePicture, hobbies = [], lookingFor, distanceKm, isOnline } = profile;

  useEffect(() => {
    const el = overlayRef.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => setRowWidth(entry.contentRect.width));
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const all = sortShared(hobbies, myHobbies);
  const shared = all.filter((h) => h.sh).map((h) => h.t);

  // Fit as many chips as the row holds (max 3), always leaving room for the "+N" chip
  const visible: typeof all = [];
  let used = 0;
  for (let k = 0; k < all.length; k++) {
    const h = all[k];
    const w = Math.min(150, h.t.length * 8.1 + 28 + (h.sh ? 20 : 0));
    const rest = all.length - k - 1;
    const gap = visible.length ? 8 : 0;
    if (visible.length >= 3 || used + gap + w + (rest > 0 ? 56 : 0) > rowWidth) break;
    used += gap + w;
    visible.push(h);
  }
  const more = all.length - visible.length;
  const hasPhoto = Boolean(profilePicture) && !imageError;
  const kind = lookingFor || 'open';

  return (
    <article className={`card${bright ? ' bright' : ''} ${className}`}>
      {hasPhoto ? (
        <img
          className="bgimg"
          src={profilePicture!.toString()}
          alt={`Photo of ${name}`}
          onError={() => setImageError(true)}
          onLoad={(e) => setBright(isBrightPhoto(e.currentTarget))}
        />
      ) : (
        <div className={`noimg ${kind}`}>
          <span>{name?.charAt(0)}</span>
          <p>No photo yet</p>
        </div>
      )}
      <div className="frost" />
      <div className="scrim" />

      {isOnline && (
        <span className="gpill online">
          <span className="dot" />
          Online
        </span>
      )}

      {topRight ??
        (withBioSheet && (
          <button className="gpill biob btn" onClick={() => setShowBio(true)} aria-label={`Read ${name}'s bio`}>
            <Info className="s" />
            <span>Bio</span>
          </button>
        ))}

      <div className="ov" ref={overlayRef}>
        <div className={name && name.length > 9 ? 'nm long' : 'nm'}>
          <h2>{name}</h2>
          <span className="age">{age}</span>
        </div>
        <div className="meta">
          <MapPin className="s" />
          <span>{meta ?? kmText(distanceKm)}</span>
        </div>
        <LookingForChip kind={lookingFor} />
        {!hideHobbies && all.length > 0 && (
          <ul className="gchips" aria-label="Hobbies">
            {visible.map((h) => (
              <li key={h.t}>
                <span className={h.sh ? 'gc sh' : 'gc'}>
                  {h.sh && <Check className="xs" />}
                  <span className="t">{h.t}</span>
                </span>
              </li>
            ))}
            {more > 0 && (
              <li>
                {withBioSheet ? (
                  <button className="gc more btn" onClick={() => setShowBio(true)} aria-label={`Show all ${all.length} hobbies`}>
                    +{more}
                  </button>
                ) : (
                  <span className="gc more">+{more}</span>
                )}
              </li>
            )}
          </ul>
        )}
      </div>

      {withBioSheet && showBio && (
        <div className="sheet" role="dialog" aria-label={`About ${name}`}>
          <div className="grab" />
          <div className="sheet-h">
            <p className="lbl">About {name}</p>
            <button className="sheet-x btn" onClick={() => setShowBio(false)} aria-label="Close">
              <X className="s" />
            </button>
          </div>
          <div className="sheet-b">
            <ProfileDetails profile={profile} myHobbies={myHobbies} compact shared={shared} />
          </div>
        </div>
      )}
    </article>
  );
};

// Bio, looking for, distance, shared hobbies and every hobby. Used in the phone sheet and beside the desktop card
export const ProfileDetails: React.FC<{
  profile: ViewableProfile;
  myHobbies?: string[];
  compact?: boolean;
  shared?: string[];
}> = ({ profile, myHobbies = [], compact = false, shared }) => {
  const all = sortShared(profile.hobbies, myHobbies);
  const common = shared ?? all.filter((h) => h.sh).map((h) => h.t);
  const bio = (profile.bio || '').trim();
  const quoteCls = compact ? 'quote' : bio.length > 180 ? 'quote q3' : bio.length > 100 ? 'quote q2' : 'quote';

  const kv = (
    <div className="kv2">
      <div className="kvb">
        <small>Looking for</small>
        <LookingForValue kind={profile.lookingFor} />
      </div>
      <div className="kvb">
        <small>Distance</small>
        <b>{kmText(profile.distanceKm)}</b>
      </div>
    </div>
  );
  const commonBox = common.length > 0 && (
    <p className="common">
      <Sparkles className="s" />
      <span>You both enjoy {joinAnd(common)}</span>
    </p>
  );

  return (
    <>
      {bio ? (
        <p className={quoteCls}>“{bio}”</p>
      ) : (
        <p className="nobio">{profile.name} hasn’t written a bio yet. Say hello and ask what they enjoy.</p>
      )}
      {compact ? kv : commonBox}
      {compact ? commonBox : kv}
      {all.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <p className="lbl">Hobbies · {all.length}</p>
          <ul className="chips">
            {all.map((h) => (
              <li key={h.t} className={h.sh ? 'sh' : ''}>
                {h.sh && <Check className="xs" />}
                {h.t}
              </li>
            ))}
          </ul>
        </div>
      )}
    </>
  );
};

export default ProfileCard;
