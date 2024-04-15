import { useEffect, useState } from 'react'
import { useGlobalContextUpdate } from '../context/globalContext';

const useGeolocation = () => {
    const { activeCityCoords, setActiveCityCoords } = useGlobalContextUpdate();

    const [location, setLocation] = useState({
        loaded: false,
        coordinates: { lat: "", lng: "" }
    });


    useEffect(() => {
        if (!("geolocation" in navigator)) {
            setLocation((prevState) => ({
                ...prevState,
                loaded: true,
                error: {
                    code: 0,
                    message: "Geolocation is not available"
                }
            }));
            console.log("Geolocation is not available");
        }
        navigator.geolocation.getCurrentPosition(
            (l) => {
                setLocation({
                    loaded: true,
                    coordinates: {
                        lat: l.coords.latitude,
                        lng: l.coords.longitude,
                    }
                });

                location && setActiveCityCoords([l.coords.latitude, l.coords.longitude]);

            },
            (error) => {
                setLocation((prevState) => ({
                    ...prevState,
                    loaded: true,
                    error: {
                        code: error.code,
                        message: error.message
                    }
                }));
            }
        );

    }, []);

    return location;
}

export default useGeolocation