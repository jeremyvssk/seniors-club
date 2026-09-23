import { useState } from 'react';
import { MapPin, Navigation } from 'lucide-react';
import { StepProps } from '../StepIndex';

// Towns people can pick if the browser won't share a location
const TOWNS = [
  { name: 'Tallinn', lat: 59.437, lng: 24.7536 },
  { name: 'Tartu', lat: 58.3806, lng: 26.7225 },
  { name: 'Pärnu', lat: 58.3859, lng: 24.4971 },
  { name: 'Narva', lat: 59.3797, lng: 28.1791 },
];

const Step6Location = ({ data, updateData }: StepProps) => {
  const [gettingLocation, setGettingLocation] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [placeName, setPlaceName] = useState<string | null>(null);
  const hasLocation = Boolean(data.latitude && data.longitude);

  const requestLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('Your browser can’t share a location. Pick your town below instead.');
      return;
    }
    setGettingLocation(true);
    setLocationError(null);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        updateData({ latitude: position.coords.latitude, longitude: position.coords.longitude });
        setPlaceName('Your current location');
        setGettingLocation(false);
      },
      (error) => {
        setGettingLocation(false);
        console.error('Geolocation error:', error.code, error.message);
        if (error.code === error.PERMISSION_DENIED) {
          setLocationError('Location access was blocked. Pick your town below instead.');
        } else if (error.code === error.TIMEOUT) {
          setLocationError('That took too long. Try again, or pick your town below.');
        } else {
          setLocationError('We couldn’t find your location. Pick your town below instead.');
        }
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 }
    );
  };

  const radius = data.maxRadiusKm || 50;
  const fill = (radius / 300) * 100;

  return (
    <div className="form">
      {hasLocation ? (
        <div className="located">
          <MapPin className="i" />
          <div style={{ flexGrow: 1 }}>
            <b>{placeName || 'Location saved'}</b>
            <p>Only the distance is ever shown to others.</p>
          </div>
          <button type="button" className="edit btn" onClick={() => { updateData({ latitude: undefined, longitude: undefined }); setPlaceName(null); }}>
            Change
          </button>
        </div>
      ) : (
        <>
          <button type="button" className="b-lg sec btn" onClick={requestLocation} disabled={gettingLocation} style={{ width: '100%' }}>
            <Navigation className="i" />
            <span>{gettingLocation ? 'Finding you…' : 'Use my current location'}</span>
          </button>
          {locationError && <div className="alert" role="alert">{locationError}</div>}
          <div className="field">
            <p className="field-l">Or pick your town</p>
            <div className="pick" role="group" aria-label="Town">
              {TOWNS.map((t) => (
                <button key={t.name} type="button" className="btn" aria-pressed={false}
                  onClick={() => { updateData({ latitude: t.lat, longitude: t.lng }); setPlaceName(t.name); setLocationError(null); }}>
                  {t.name}
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      <section className="sect">
        <div className="sect-h">
          <h3><label htmlFor="radius">How far can people be?</label></h3>
          <span className="radius-v">{radius} km</span>
        </div>
        <input
          id="radius"
          className="range"
          type="range"
          min="1"
          max="300"
          value={radius}
          onChange={(e) => updateData({ maxRadiusKm: parseInt(e.target.value) })}
          style={{ background: `linear-gradient(to right, var(--accent) ${fill}%, #DCE3F0 ${fill}%)` }}
        />
        <p className="sect-note">You can change this later on your profile.</p>
      </section>
    </div>
  );
};

export default Step6Location;
