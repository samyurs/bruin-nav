import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  PermissionsAndroid,
  Platform,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import MapViewDirections from 'react-native-maps-directions';
import Geolocation from '@react-native-community/geolocation';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { API_BASE_URL, GOOGLE_MAPS_API_KEY } from '@env';

const UCLA_REGION = {
  latitude: 34.0689,
  longitude: -118.4452,
  latitudeDelta: 0.01,
  longitudeDelta: 0.01,
};

// Distance threshold to switch to indoor navigation (in meters)
const INDOOR_NAVIGATION_THRESHOLD = 50;

export default function OutdoorNavScreen({ navigation, route }) {
  const { landmarkId } = route.params || {};
  
  const [userLocation, setUserLocation] = useState(null);
  const [destination, setDestination] = useState(null);
  const [region, setRegion] = useState(UCLA_REGION);
  const [routeInfo, setRouteInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isNavigating, setIsNavigating] = useState(false);
  const [error, setError] = useState(null);
  const [watchId, setWatchId] = useState(null);
  const [distance, setDistance] = useState(null);
  const [duration, setDuration] = useState(null);
  const [showDirections, setShowDirections] = useState(false);
  
  const mapRef = useRef(null);

  useEffect(() => {
    if (landmarkId) {
      fetchLandmarkDetails();
      requestLocationPermission();
    } else {
      setError('Landmark ID not provided');
      setLoading(false);
    }

    return () => {
      if (watchId) {
        Geolocation.clearWatch(watchId);
      }
    };
  }, [landmarkId]);

  useEffect(() => {
    if (userLocation && destination && isNavigating) {
      checkProximityToDestination();
    }
  }, [userLocation, destination, isNavigating]);

  const requestLocationPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Location Permission',
            message: 'BruinNav needs access to your location for navigation.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          getCurrentLocation();
          startLocationTracking();
        } else {
          setError('Location permission denied');
          setLoading(false);
        }
      } catch (err) {
        console.warn(err);
        setError('Failed to request location permission');
        setLoading(false);
      }
    } else {
      getCurrentLocation();
      startLocationTracking();
    }
  };

  const getCurrentLocation = () => {
    Geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const newLocation = { latitude, longitude };
        setUserLocation(newLocation);
        
        if (destination) {
          fitMapToRoute(newLocation, destination);
        } else {
          setRegion({
            latitude,
            longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          });
        }
        setLoading(false);
      },
      (error) => {
        console.log('Location error:', error);
        setError('Unable to get your location');
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
    );
  };

  const startLocationTracking = () => {
    const id = Geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation({ latitude, longitude });
      },
      (error) => {
        console.log('Location tracking error:', error);
      },
      { 
        enableHighAccuracy: true, 
        timeout: 20000, 
        maximumAge: 1000,
        distanceFilter: 5 // Update every 5 meters
      }
    );
    setWatchId(id);
  };

  const fetchLandmarkDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`${API_BASE_URL}/landmarks/${landmarkId}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }

      const { landmark } = data;
      
      const destinationLocation = {
        latitude: landmark.location.coordinates[1],
        longitude: landmark.location.coordinates[0],
      };
      
      setDestination({
        ...destinationLocation,
        name: landmark.name,
        type: landmark.type,
        id: landmark._id
      });
      
    } catch (error) {
      console.error(`Error fetching landmark details: ${error}`);
      setError(`Failed to fetch destination: ${error.message}`);
      // Fallback to sample data for demo
      setDestination({
        latitude: 34.0722,
        longitude: -118.4423,
        name: 'Royce Hall',
        type: 'building',
        id: 'demo-1'
      });
    }
  };

  const fitMapToRoute = (origin, dest) => {
    if (mapRef.current && origin && dest) {
      const coordinates = [origin, dest];
      mapRef.current.fitToCoordinates(coordinates, {
        edgePadding: { top: 100, right: 50, bottom: 200, left: 50 },
        animated: true,
      });
    }
  };

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = lat1 * Math.PI/180;
    const φ2 = lat2 * Math.PI/180;
    const Δφ = (lat2-lat1) * Math.PI/180;
    const Δλ = (lon2-lon1) * Math.PI/180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c;
  };

  const checkProximityToDestination = () => {
    if (!userLocation || !destination) return;
    
    const distanceToDestination = calculateDistance(
      userLocation.latitude,
      userLocation.longitude,
      destination.latitude,
      destination.longitude
    );

    if (distanceToDestination <= INDOOR_NAVIGATION_THRESHOLD) {
      // Switch to indoor navigation
      Alert.alert(
        'Arrived at Building',
        `You're now at ${destination.name}. Would you like to switch to indoor navigation?`,
        [
          {
            text: 'Stay on Map',
            style: 'cancel',
          },
          {
            text: 'Indoor Navigation',
            onPress: () => {
              // Get a generic indoor destination for demo
              const indoorDestination = getIndoorDestination(destination.name);
              navigation.navigate('IndoorNav', {
                from: `${destination.name} Entrance`,
                to: indoorDestination
              });
            },
          },
        ]
      );
    }
  };

  const getIndoorDestination = (buildingName) => {
    // Simple mapping for demo purposes
    const indoorDestinations = {
      'Royce Hall': 'Room 314',
      'Powell Library': 'Study Room A',
      'Ackerman Union': 'Food Court',
      'Boelter Hall': 'Computer Lab 3400',
      'Young Research Library': 'Reading Room',
    };
    return indoorDestinations[buildingName] || 'Information Desk';
  };

  const startNavigation = () => {
    if (!userLocation || !destination) {
      Alert.alert('Error', 'Location data not available');
      return;
    }
    
    setIsNavigating(true);
    setShowDirections(true);
    fitMapToRoute(userLocation, destination);
  };

  const stopNavigation = () => {
    setIsNavigating(false);
    setShowDirections(false);
    Alert.alert(
      'Navigation Stopped',
      'Do you want to return to the map or go back?',
      [
        {
          text: 'Stay on Map',
          style: 'cancel',
        },
        {
          text: 'Go Back',
          onPress: () => navigation.goBack(),
        },
      ]
    );
  };

  const handleDirectionsReady = (result) => {
    setDistance(result.distance);
    setDuration(result.duration);
    setRouteInfo({
      distance: result.distance,
      duration: result.duration,
      coordinates: result.coordinates,
    });
  };

  const handleDirectionsError = (errorMessage) => {
    console.error('Directions error:', errorMessage);
    Alert.alert('Route Error', 'Unable to calculate route. Please try again.');
    setShowDirections(false);
  };

  const formatDistance = (distanceKm) => {
    if (distanceKm < 1) {
      return `${Math.round(distanceKm * 1000)}m`;
    }
    return `${distanceKm.toFixed(1)}km`;
  };

  const formatDuration = (durationMin) => {
    if (durationMin < 60) {
      return `${Math.round(durationMin)} min`;
    }
    const hours = Math.floor(durationMin / 60);
    const minutes = Math.round(durationMin % 60);
    return `${hours}h ${minutes}m`;
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2E86AB" />
          <Text style={styles.loadingText}>Loading navigation...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Icon name="error-outline" size={64} color="#dc3545" />
          <Text style={styles.errorTitle}>Navigation Error</Text>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => {
              setError(null);
              setLoading(true);
              fetchLandmarkDetails();
              requestLocationPermission();
            }}
          >
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backIconButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-back" size={24} color="#2E86AB" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Navigation</Text>
          {destination && (
            <Text style={styles.headerSubtitle}>To {destination.name}</Text>
          )}
        </View>
        <TouchableOpacity
          style={styles.centerButton}
          onPress={() => {
            if (userLocation && destination) {
              fitMapToRoute(userLocation, destination);
            }
          }}
        >
          <Icon name="center-focus-strong" size={24} color="#2E86AB" />
        </TouchableOpacity>
      </View>

      {/* Route Info Panel */}
      {routeInfo && (
        <View style={styles.routeInfoPanel}>
          <View style={styles.routeStats}>
            <View style={styles.routeStat}>
              <Text style={styles.routeStatValue}>{formatDistance(distance)}</Text>
              <Text style={styles.routeStatLabel}>Distance</Text>
            </View>
            <View style={styles.routeStatDivider} />
            <View style={styles.routeStat}>
              <Text style={styles.routeStatValue}>{formatDuration(duration)}</Text>
              <Text style={styles.routeStatLabel}>Duration</Text>
            </View>
            <View style={styles.routeStatDivider} />
            <View style={styles.routeStat}>
              <Text style={styles.routeStatValue}>Walking</Text>
              <Text style={styles.routeStatLabel}>Mode</Text>
            </View>
          </View>
        </View>
      )}

      {/* Map */}
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        region={region}
        onRegionChangeComplete={setRegion}
        showsUserLocation={true}
        showsMyLocationButton={false}
        followsUserLocation={isNavigating}
        mapType="standard"
      >
        {/* Destination Marker */}
        {destination && (
          <Marker
            coordinate={{
              latitude: destination.latitude,
              longitude: destination.longitude,
            }}
            title={destination.name}
            description={destination.type?.replace('-', ' ')}
            pinColor="#2E86AB"
          />
        )}

        {/* Directions */}
        {showDirections && userLocation && destination && GOOGLE_MAPS_API_KEY && (
          <MapViewDirections
            origin={{
                latitude: userLocation.latitude,
                longitude: userLocation.longitude,
            }}
            destination={{
                latitude: destination.latitude,
                longitude: destination.longitude,
            }}
            apikey={GOOGLE_MAPS_API_KEY}
            strokeWidth={4}
            strokeColor="#2E86AB"
            optimizeWaypoints={true}
            mode="WALKING"
            onReady={handleDirectionsReady}
            onError={handleDirectionsError}
            precision="high"
          />
        )}
      </MapView>

      {/* Navigation Controls */}
      <View style={styles.navigationControls}>
        {!isNavigating ? (
          <TouchableOpacity
            style={styles.startNavigationButton}
            onPress={startNavigation}
            disabled={!userLocation || !destination}
          >
            <Icon name="navigation" size={20} color="#fff" />
            <Text style={styles.startNavigationText}>Start Navigation</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.activeNavigationControls}>
            <TouchableOpacity
              style={styles.stopNavigationButton}
              onPress={stopNavigation}
            >
              <Icon name="stop" size={20} color="#fff" />
              <Text style={styles.stopNavigationText}>Stop</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.recenterButton}
              onPress={() => {
                if (userLocation && mapRef.current) {
                  mapRef.current.animateToRegion({
                    ...userLocation,
                    latitudeDelta: 0.005,
                    longitudeDelta: 0.005,
                  }, 1000);
                }
              }}
            >
              <Icon name="my-location" size={20} color="#2E86AB" />
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Location Error Warning */}
      {!userLocation && !loading && (
        <View style={styles.locationWarning}>
          <Icon name="location-off" size={20} color="#dc3545" />
          <Text style={styles.locationWarningText}>
            Unable to get your location. Navigation may not work properly.
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6c757d',
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#dc3545',
    marginTop: 16,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 16,
    color: '#6c757d',
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: '#007bff',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginBottom: 12,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  backButton: {
    backgroundColor: '#6c757d',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  backIconButton: {
    marginRight: 12,
    padding: 4,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#212529',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6c757d',
    marginTop: 2,
  },
  centerButton: {
    padding: 4,
  },
  routeInfoPanel: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  routeStats: {
    flexDirection: 'row',
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  routeStat: {
    flex: 1,
    alignItems: 'center',
  },
  routeStatDivider: {
    width: 1,
    backgroundColor: '#e9ecef',
    marginHorizontal: 16,
  },
  routeStatValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2E86AB',
  },
  routeStatLabel: {
    fontSize: 12,
    color: '#6c757d',
    marginTop: 2,
  },
  map: {
    flex: 1,
  },
  navigationControls: {
    backgroundColor: '#fff',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
  },
  startNavigationButton: {
    backgroundColor: '#28a745',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    borderRadius: 8,
  },
  startNavigationText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  activeNavigationControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  stopNavigationButton: {
    backgroundColor: '#dc3545',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    flex: 1,
    justifyContent: 'center',
    marginRight: 12,
  },
  stopNavigationText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  recenterButton: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#2E86AB',
    borderRadius: 8,
    padding: 12,
  },
  locationWarning: {
    backgroundColor: '#fff3cd',
    borderTopWidth: 1,
    borderTopColor: '#ffeaa7',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  locationWarningText: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: '#856404',
  },
});
