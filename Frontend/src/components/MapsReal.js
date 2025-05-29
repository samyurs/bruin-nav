import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Dimensions, ActivityIndicator, Alert } from 'react-native';
import MapView, { Marker } from 'react-native-maps';


//DONT USE YET !!! USE AFTER TESTING ALSO RENAME THIS FILE TO MAPS AS THE FUNCTION THIS USES IS NAMED MAPS

const UCLA_BOUNDS = {
  northEast: { latitude: 34.0745, longitude: -118.4380 },
  southWest: { latitude: 34.0650, longitude: -118.4525 },
};

const initialRegion = {
  latitude: 34.0697,
  longitude: -118.4445,
  latitudeDelta: 0.01,
  longitudeDelta: 0.015,
};

function isWithinBounds(lat, lon) {
  return (
    lat >= UCLA_BOUNDS.southWest.latitude &&
    lat <= UCLA_BOUNDS.northEast.latitude &&
    lon >= UCLA_BOUNDS.southWest.longitude &&
    lon <= UCLA_BOUNDS.northEast.longitude
  );
}

export default function Maps() {
  const [landmarks, setLandmarks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://YOUR_BACKEND_URL/api/landmarks')
      .then(res => res.json())
      .then(data => {
        // Filter landmarks within UCLA bounds
        const filteredLandmarks = data.landmarks.filter(lm => {
          const [lon, lat] = lm.location.coordinates;
          return isWithinBounds(lat, lon);
        });
        setLandmarks(filteredLandmarks);
        setLoading(false);
      })
      .catch(err => {
        Alert.alert('Error', 'Failed to load landmarks');
        setLoading(false);
      });
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
        initialRegion={initialRegion}
        provider="google"
        minZoomLevel={15} // prevent zooming out too much
        maxZoomLevel={18} // prevent zooming in too much
      >
        {landmarks.map((lm, i) => {
          const [longitude, latitude] = lm.location.coordinates;
          return (
            <Marker
              key={i}
              coordinate={{ latitude, longitude }}
              title={lm.name}
              description={lm.type || ''}
            />
          );
        })}
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
  center: { justifyContent: 'center', alignItems: 'center' },
});
