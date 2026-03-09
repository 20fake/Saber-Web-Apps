import React, { useEffect, useState } from 'react';
import { ref, onValue, set } from "firebase/database";
import { db } from '../firebase';
import { MapPin } from 'lucide-react';

// A mock component to demonstrate Firebase integration
// In a real app, this would use a map library like Leaflet or Google Maps
export default function LiveMap({ orderId, role, simulatedPartnerLocation }) {
    const [location, setLocation] = useState(null);

    useEffect(() => {
        if (!orderId) return;

        if (role === 'client') {
            // Listen for partner's location updates
            const locationRef = ref(db, 'locations/' + orderId);
            const unsubscribe = onValue(locationRef, (snapshot) => {
                const data = snapshot.val();
                if (data) {
                    setLocation(data);
                }
            });
            return () => unsubscribe();
        }

        if (role === 'partner' && simulatedPartnerLocation) {
            // Push partner's location to Firebase
            // In reality, this would use the Geolocation API
            const locationRef = ref(db, 'locations/' + orderId);
            set(locationRef, simulatedPartnerLocation);
            setLocation(simulatedPartnerLocation);
        }
    }, [orderId, role, simulatedPartnerLocation]);

    return (
        <div className="map-container h-full w-full">
            <div className="text-center">
                {location ? (
                    <>
                        <MapPin size={48} color="var(--color-primary)" className="mx-auto mb-2 animate-pulse" />
                        <p style={{ color: 'var(--color-text)' }}>Driver is at: {location.lat}, {location.lng}</p>
                        <p className="text-sm">Real-time update via Firebase</p>
                    </>
                ) : (
                    <>
                        <MapPin size={48} color="var(--color-text-muted)" className="mx-auto mb-2" />
                        <p style={{ color: 'var(--color-text)' }}>Waiting for location data...</p>
                    </>
                )}
            </div>
        </div>
    );
}
