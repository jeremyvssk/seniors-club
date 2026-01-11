import { useState, useEffect } from 'react';
import { UserFormData } from '../../../types/User';
import CompleteProfileButton from '../../buttons/CompleteProfile';
import PrevStepButton from '../../buttons/PrevStepButton';
import { MapPin, Navigation, Globe } from 'lucide-react';

interface Step6Props {
  data: UserFormData;
  updateData: (data: Partial<UserFormData>) => void;
  onNext: () => void;
  onBack: () => void;
}

const Step6Location = ({ data, updateData, onNext, onBack }: Step6Props) => {
  // State to track if we're currently requesting location from browser
  const [gettingLocation, setGettingLocation] = useState(false);
  
  // Error message if location request fails
  const [locationError, setLocationError] = useState<string | null>(null);
  
  // Track if user has granted location access
  const [hasLocation, setHasLocation] = useState(false);
  
  // Current radius value (1-300km)
  const [radius, setRadius] = useState(50);

  const [showManualInput, setShowManualInput] = useState(false);

  // Check if location already exists in form data (e.g., user went back)
  useEffect(() => {
    if (data.latitude && data.longitude) {
      setHasLocation(true);
      if (data.maxRadiusKm) {
        setRadius(data.maxRadiusKm);
      }
    }
  }, [data.latitude, data.longitude, data.maxRadiusKm]);

  // Request GPS location from browser
  const requestLocation = () => {
    // Check if browser supports geolocation
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser');
      return;
    }

    setGettingLocation(true);
    setLocationError(null);

    // Better geolocation options for reliability
    const options = {
      enableHighAccuracy: false, // Faster, less battery drain
      timeout: 10000, // 10 second timeout
      maximumAge: 300000 // Accept cached location up to 5 minutes old
    };

    // Request current position from browser
    navigator.geolocation.getCurrentPosition(
      // Success callback
      (position) => {
        // Store coordinates in form data
        updateData({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          maxRadiusKm: 50,
        });
        
        setHasLocation(true);
        setGettingLocation(false);
        setLocationError(null);
      },
      // Error callback
      (error) => {
        setGettingLocation(false);
        
        // ADD DETAILED CONSOLE LOGGING
        console.error('=== GEOLOCATION ERROR ===');
        console.error('Error Code:', error.code);
        console.error('Error Message:', error.message);
        console.error('Full Error Object:', error);
        
        // Error code meanings:
        // 1 = PERMISSION_DENIED
        // 2 = POSITION_UNAVAILABLE
        // 3 = TIMEOUT
        
        // Handle different error types
        if (error.code === error.PERMISSION_DENIED) {
          console.error('User denied location permission');
          setLocationError('Location access denied. You must allow location to use this app.');
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          console.error('Location information unavailable');
          setLocationError('Location information unavailable. Please ensure location services are enabled on your device.');
        } else if (error.code === error.TIMEOUT) {
          console.error('Location request timed out');
          setLocationError('Location request timed out. Please try again.');
        } else {
          console.error('Unknown geolocation error');
          setLocationError('Unable to get your location. Please try again.');
        }
      },
      options // pass options to geolocation
    );
  };

  // Handle radius slider change
  const handleRadiusChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    setRadius(value);
    
    // If slider is at max (300km), set to null for unlimited matching
    if (value >= 300) {
      updateData({ maxRadiusKm: null });
    } else {
      updateData({ maxRadiusKm: value });
    }
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate that location was granted
    if (!data.latitude || !data.longitude) {
      alert('Please allow location access to continue');
      return;
    }
    
    // Proceed to submit profile
    onNext();
  };

  return (
    // Main container
    <div className="w-full max-w-md mx-auto">
      {/* Card container */}
      <div className="bg-white/55 backdrop-blur-sm rounded-2xl p-4 md:p-8 shadow-md">
        {/* Header */}
        <h2 className="text-2xl md:text-3xl font-bold text-slate-900 text-center mb-1 md:mb-2">
          Location Access
        </h2>
        {/* Privacy text */}
        <p className="text-center text-slate-600 text-sm mb-4 md:mb-6">
          We need your location to find matches near you. Your exact location is never shared with others.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
          {/* STEP 1: Request Location (shown when location not granted) */}
          {!hasLocation ? (
            <>
              {/* Allow Location Button */}
              <button
                type="button"
                onClick={requestLocation}
                disabled={gettingLocation}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white py-3 md:py-4 px-4 md:px-6 rounded-lg font-medium transition-all shadow-md hover:shadow-lg flex items-center justify-center text-sm md:text-base"
              >
                {gettingLocation ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 md:h-5 md:w-5 border-b-2 border-white mr-2 md:mr-3"></div>
                    Getting location...
                  </>
                ) : (
                  <>
                    <Navigation className="w-4 h-4 md:w-5 md:h-5 mr-2 md:mr-3" />
                    Allow Location Access
                  </>
                )}
              </button>

              {/* Error Message Box (shown if location request fails) */}
              {locationError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 md:p-4 space-y-2">
                  <p className="text-red-800 font-medium text-sm mb-1">Location Required</p>
                  <p className="text-red-700 text-xs md:text-sm">{locationError}</p>
                  
                  {!showManualInput && (
                    <button
                      type="button"
                      onClick={() => setShowManualInput(true)}
                      className="w-full bg-yellow-500 hover:bg-yellow-600 text-white py-2 px-4 rounded text-xs font-medium transition-colors"
                    >
                      Enter Coordinates Manually
                    </button>
                  )}
                </div>
              )}

              {/* Manual Input Section - for linux enjoyers */}
              {showManualInput && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 md:p-4">
                <p className="text-yellow-800 font-medium text-sm mb-2">Manual Coordinates</p>
                <div className="space-y-2">
                  <input
                    type="number"
                    step="0.0001"
                    placeholder="Latitude (e.g., 59.4370)"
                    onChange={(e) => updateData({ latitude: parseFloat(e.target.value) || undefined })}
                    className="w-full px-3 py-2 border border-yellow-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  />
                  <input
                    type="number"
                    step="0.0001"
                    placeholder="Longitude (e.g., 24.7536)"
                    onChange={(e) => updateData({ longitude: parseFloat(e.target.value) || undefined })}
                    className="w-full px-3 py-2 border border-yellow-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (data.latitude && data.longitude) {
                        updateData({ maxRadiusKm: 50 });
                        setHasLocation(true);
                        setShowManualInput(false);
                        setLocationError(null);
                      } else {
                        alert('Please enter both latitude and longitude');
                      }
                    }}
                    className="w-full bg-yellow-600 hover:bg-yellow-700 text-white py-2 rounded text-sm font-medium transition-colors"
                  >
                    Use These Coordinates
                  </button>
                </div>
                <div className="mt-2 text-xs text-yellow-700 space-y-1">
                  <p><strong>Example Locations:</strong></p>
                  <p>• Tallinn: 59.4370, 24.7536</p>
                  <p>• Tartu: 58.3806, 26.7225</p>
                  <p>• Pärnu: 58.3859, 24.4971</p>
                </div>
              </div>
            )}

              {/* Back Button */}
              <PrevStepButton type="button" onClick={onBack} />
            </>
          ) : (
            // STEP 2: Show Radius Slider (shown after location granted)
            <>
              {/* Location Confirmation Box */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 md:p-4">
                <div className="flex items-center text-green-800 mb-1">
                  <MapPin className="w-4 h-4 md:w-5 md:h-5 mr-2" />
                  <span className="font-medium text-sm md:text-base">Location received!</span>
                </div>
                <p className="text-xs md:text-sm text-green-700">
                  {data.latitude?.toFixed(4)}, {data.longitude?.toFixed(4)}
                </p>
              </div>

              {/* Radius Slider Section */}
              <div>
                {/* Slider Label and Current Value */}
                <div className="flex items-center justify-between mb-2 md:mb-3">
                  <label className="block text-base md:text-lg font-medium text-slate-700">
                    Match Radius
                  </label>
                  {/* Show "Unlimited" if slider at max, otherwise show km value */}
                  {radius >= 300 ? (
                    <div className="flex items-center text-blue-600 font-bold text-lg md:text-xl">
                      <Globe className="w-4 h-4 md:w-5 md:h-5 mr-1" />
                      Unlimited
                    </div>
                  ) : (
                    <span className="text-blue-600 font-bold text-xl md:text-2xl">
                      {radius} km
                    </span>
                  )}
                </div>

                {/* Range Slider Input */}
                <input
                  type="range"
                  min="1"
                  max="300"
                  value={radius}
                  onChange={handleRadiusChange}
                  className="w-full h-2 md:h-3 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                  style={{
                    // Dynamic gradient to show filled portion of slider
                    background: `linear-gradient(to right, #2563eb 0%, #2563eb ${(radius / 300) * 100}%, #e2e8f0 ${(radius / 300) * 100}%, #e2e8f0 100%)`
                  }}
                />

                {/* Slider Range Labels */}
                <div className="flex justify-between text-xs text-slate-500 mt-1 md:mt-2">
                  <span>1 km</span>
                  <span>150 km</span>
                  <span>300 km</span>
                </div>

                {/* Helper Text */}
                <p className="text-xs md:text-sm text-slate-600 text-center mt-2 md:mt-3">
                  {radius >= 300 
                    ? 'Match with everyone!' 
                    : `Show matches within ${radius} km`
                  }
                </p>
              </div>

              {/* Change Location Link */}
              <button
                type="button"
                onClick={() => {
                  // Reset location state to allow user to request location again
                  setHasLocation(false);
                  setLocationError(null);
                  updateData({ latitude: undefined, longitude: undefined });
                }}
                className="w-full text-blue-600 hover:text-blue-700 font-medium text-xs md:text-sm underline"
              >
                Change Location
              </button>

              {/* Submit and Back Buttons */}
              <div className="space-y-2 md:space-y-3">
                <CompleteProfileButton type="submit" />
                <PrevStepButton type="button" onClick={onBack} />
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  );
};

export default Step6Location;