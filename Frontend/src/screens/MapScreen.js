import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  PermissionsAndroid,
  Platform,
  FlatList,
  Modal,
} from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import Geolocation from '@react-native-community/geolocation';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { API_BASE_URL } from '@env';

const UCLA_REGION = {
  latitude: 34.0689,
  longitude: -118.4452,
  latitudeDelta: 0.01,
  longitudeDelta: 0.01,
};

export default function MapScreen({ navigation }) {
  const [region, setRegion] = useState(UCLA_REGION);
  const [userLocation, setUserLocation] = useState(null);
  const [landmarks, setLandmarks] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [selectedLandmark, setSelectedLandmark] = useState(null);
  const mapRef = useRef(null);

  useEffect(() => {
    requestLocationPermission();
    fetchLandmarks();
  }, []);

  const requestLocationPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Location Permission',
            message: 'BruinNav needs access to your location to show you on the map.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          getCurrentLocation();
        }
      } catch (err) {
        console.warn(err);
      }
    } else {
      getCurrentLocation();
    }
  };

  const getCurrentLocation = () => {
    Geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation({ latitude, longitude });
        setRegion({
          latitude,
          longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        });
      },
      (error) => {
        console.log('Location error:', error);
        Alert.alert('Error', 'Unable to get your location');
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
    );
  };

  const fetchLandmarks = async () => {
    try {
      // Replace with your actual backend URL
      const response = await fetch(`${API_BASE_URL}/landmarks`);
      const data = await response.json();
      setLandmarks(data.landmarks || []);
    } catch (error) {
      console.error('Error fetching landmarks:', error);
      // For demo purposes, add some sample landmarks
      setLandmarks([
        {
          _id: '1',
          name: 'Royce Hall',
          type: 'building',
          location: { coordinates: [-118.4423, 34.0722] },
        },
        {
          _id: '2',
          name: 'Powell Library',
          type: 'building',
          location: { coordinates: [-118.4421, 34.0719] },
        },
        {
          _id: '3',
          name: 'Ackerman Union',
          type: 'building',
          location: { coordinates: [-118.4441, 34.0709] },
        },
      ]);
    }
  };

  const searchLandmarks = (query) => {
    setSearchQuery(query);
    if (query.length > 0) {
      const filtered = landmarks.filter((landmark) =>
        landmark.name.toLowerCase().includes(query.toLowerCase())
      );
      setSearchResults(filtered);
      setShowSearchResults(true);
    } else {
      setShowSearchResults(false);
    }
  };

  const selectLandmark = (landmark) => {
    setSelectedLandmark(landmark);
    setShowSearchResults(false);
    setSearchQuery(landmark.name);

    const newRegion = {
      latitude: landmark.location.coordinates[1],
      longitude: landmark.location.coordinates[0],
      latitudeDelta: 0.005,
      longitudeDelta: 0.005,
    };

    setRegion(newRegion);
    mapRef.current?.animateToRegion(newRegion, 1000);
  };

  const getMarkerColor = (type) => {
    switch (type) {
      case 'building':
        return '#2E86AB';
      case 'male-restroom':
      case 'female-restroom':
      case 'neutral-restroom':
        return '#A23B72';
      case 'study-spot':
        return '#F18F01';
      case 'printer':
        return '#C73E1D';
      default:
        return '#2E86AB';
    }
  };

  const renderSearchResult = ({ item }) => (
    <TouchableOpacity
      style={styles.searchResultItem}
      onPress={() => selectLandmark(item)}
    >
      <Icon name="place" size={20} color="#2E86AB" />
      <View style={styles.searchResultText}>
        <Text style={styles.searchResultName}>{item.name}</Text>
        <Text style={styles.searchResultType}>{item.type.replace('-', ' ')}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={ Platform.OS === 'android' ? PROVIDER_GOOGLE : null }
        region={region}
        onRegionChangeComplete={setRegion}
        showsUserLocation={true}
        showsMyLocationButton={true}
      >
        {landmarks.map((landmark) => (
          <Marker
            key={landmark._id}
            coordinate={{
              latitude: landmark.location.coordinates[1],
              longitude: landmark.location.coordinates[0],
            }}
            title={landmark.name}
            description={landmark.type.replace('-', ' ')}
            pinColor={getMarkerColor(landmark.type)}
            onPress={() => {
              if (landmark.type === 'building') {
                navigation.navigate('BuildingDetail', { landmark });
              }
            }}
          />
        ))}
      </MapView>

      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Icon name="search" size={20} color="#666" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search for buildings, restrooms, study spots..."
            value={searchQuery}
            onChangeText={searchLandmarks}
            onFocus={() => searchQuery.length > 0 && setShowSearchResults(true)}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              onPress={() => {
                setSearchQuery('');
                setShowSearchResults(false);
                setSelectedLandmark(null);
              }}
            >
              <Icon name="clear" size={20} color="#666" />
            </TouchableOpacity>
          )}
        </View>

        {showSearchResults && (
          <View style={styles.searchResults}>
            <FlatList
              data={searchResults}
              renderItem={renderSearchResult}
              keyExtractor={(item) => item._id}
              style={styles.searchResultsList}
              keyboardShouldPersistTaps="handled"
            />
          </View>
        )}
      </View>

      <TouchableOpacity
        style={styles.myLocationButton}
        onPress={getCurrentLocation}
      >
        <Icon name="my-location" size={24} color="#2E86AB" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  searchContainer: {
    position: 'absolute',
    top: 50,
    left: 20,
    right: 20,
    zIndex: 1,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 25,
    paddingHorizontal: 15,
    paddingVertical: 10,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  searchResults: {
    backgroundColor: 'white',
    borderRadius: 10,
    marginTop: 5,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    maxHeight: 200,
  },
  searchResultsList: {
    maxHeight: 200,
  },
  searchResultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  searchResultText: {
    marginLeft: 10,
    flex: 1,
  },
  searchResultName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  searchResultType: {
    fontSize: 14,
    color: '#666',
    textTransform: 'capitalize',
  },
  myLocationButton: {
    position: 'absolute',
    bottom: 100,
    right: 20,
    backgroundColor: 'white',
    borderRadius: 25,
    padding: 12,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
});