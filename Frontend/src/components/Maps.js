import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Dimensions, ActivityIndicator, Alert } from 'react-native';
import MapView, { Marker } from 'react-native-maps';

const UCLA_CENTER = {
  latitude: 34.0697,
  longitude: -118.4445,
};

const GOOGLE_API_KEY = 'AIzaSyAdiQ-cIb21O0XYeFx7RJU3XjDuEepkwXQ';

const samplePlaces = [
  {
    title: 'Bruin Cafe',
    coordinate: { latitude: 34.0711, longitude: -118.4461 },
  },
  {
    title: 'Rendezvous',
    coordinate: { latitude: 34.0702, longitude: -118.4457 },
  },
  {
    title: 'Cafe 1919',
    coordinate: { latitude: 34.0721, longitude: -118.4493 },
  },
  {
    title: 'The Study at Hedrick',
    coordinate: { latitude: 34.0728, longitude: -118.4507 },
  },
  {
    title: 'Epicuria at Covel',
    coordinate: { latitude: 34.0740, longitude: -118.4502 },
  },
];

export default function App() {
  const [landmarks, setLandmarks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${UCLA_CENTER.latitude},${UCLA_CENTER.longitude}&radius=500&type=point_of_interest&key=${GOOGLE_API_KEY}`;

    fetch(url)
      .then(res => res.json())
      .then(data => {
        if (data.results) {
          const apiPlaces = data.results.map(place => ({
            title: place.name,
            coordinate: {
              latitude: place.geometry.location.lat,
              longitude: place.geometry.location.lng,
            },
          }));

          // Combine sample places and Google API places
          setLandmarks([...samplePlaces, ...apiPlaces]);
        } else {
          Alert.alert('No places found');
          setLandmarks(samplePlaces); // fallback to sample only
        }
      })
      .catch(err => {
        Alert.alert('Error fetching places', err.message);
        setLandmarks(samplePlaces); // fallback to sample only
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        provider="google"
        initialRegion={{
          ...UCLA_CENTER,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
      >
        {landmarks.map((landmark, index) => (
          <Marker
            key={index}
            coordinate={landmark.coordinate}
            title={landmark.title}
          />
        ))}
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
