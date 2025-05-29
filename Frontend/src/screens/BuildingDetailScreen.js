import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

export default function BuildingDetailScreen({ route, navigation }) {
  const { landmark } = route.params;
  const [selectedFloor, setSelectedFloor] = useState(1);
  const [buildingDetails, setBuildingDetails] = useState(null);
  const [amenities, setAmenities] = useState([]);

  useEffect(() => {
    fetchBuildingDetails();
  }, []);

  const fetchBuildingDetails = async () => {
    try {
      // Replace with your actual backend URL
      const response = await fetch(`http://localhost:5050/api/landmarks/${landmark._id}/details`);
      const data = await response.json();
      setBuildingDetails(data);
    } catch (error) {
      console.error('Error fetching building details:', error);
      // For demo purposes, set sample data
      setBuildingDetails({
        name: landmark.name,
        description: 'A historic building on UCLA campus with modern facilities and academic departments.',
        floors: [1, 2, 3, 4],
        hours: [
          { day: 'Monday', open: '7:00 AM', close: '10:00 PM', isOpen: true },
          { day: 'Tuesday', open: '7:00 AM', close: '10:00 PM', isOpen: true },
          { day: 'Wednesday', open: '7:00 AM', close: '10:00 PM', isOpen: true },
          { day: 'Thursday', open: '7:00 AM', close: '10:00 PM', isOpen: true },
          { day: 'Friday', open: '7:00 AM', close: '8:00 PM', isOpen: true },
          { day: 'Saturday', open: '9:00 AM', close: '6:00 PM', isOpen: true },
          { day: 'Sunday', open: 'Closed', close: '', isOpen: false },
        ],
        departments: ['Computer Science', 'Mathematics', 'Physics'],
        contact: {
          phone: '(310) 825-4321',
          email: 'info@ucla.edu',
        },
      });

      setAmenities([
        { type: 'male-restroom', floor: 1, description: 'Men\'s restroom near main entrance' },
        { type: 'female-restroom', floor: 1, description: 'Women\'s restroom near main entrance' },
        { type: 'neutral-restroom', floor: 2, description: 'Gender-neutral restroom' },
        { type: 'printer', floor: 1, description: 'Public printer in lobby' },
        { type: 'printer', floor: 3, description: 'Department printer' },
        { type: 'study-spot', floor: 2, description: 'Quiet study area with tables' },
        { type: 'study-spot', floor: 3, description: 'Group study rooms' },
      ]);
    }
  };

  const getAmenityIcon = (type) => {
    switch (type) {
      case 'male-restroom':
        return 'wc';
      case 'female-restroom':
        return 'wc';
      case 'neutral-restroom':
        return 'wc';
      case 'printer':
        return 'print';
      case 'study-spot':
        return 'menu-book';
      default:
        return 'place';
    }
  };

  const getAmenityColor = (type) => {
    switch (type) {
      case 'male-restroom':
      case 'female-restroom':
      case 'neutral-restroom':
        return '#A23B72';
      case 'printer':
        return '#C73E1D';
      case 'study-spot':
        return '#F18F01';
      default:
        return '#2E86AB';
    }
  };

  const getCurrentDayHours = () => {
    if (!buildingDetails?.hours) return null;
    const today = new Date().getDay();
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return buildingDetails.hours.find(h => h.day === days[today]);
  };

  const isCurrentlyOpen = () => {
    const todayHours = getCurrentDayHours();
    if (!todayHours || !todayHours.isOpen) return false;

    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();

    // Simple time parsing (assumes format like "7:00 AM")
    const parseTime = (timeStr) => {
      const [time, period] = timeStr.split(' ');
      const [hours, minutes] = time.split(':').map(Number);
      let totalMinutes = hours * 60 + minutes;
      if (period === 'PM' && hours !== 12) totalMinutes += 12 * 60;
      if (period === 'AM' && hours === 12) totalMinutes = minutes;
      return totalMinutes;
    };

    const openTime = parseTime(todayHours.open);
    const closeTime = parseTime(todayHours.close);

    return currentTime >= openTime && currentTime <= closeTime;
  };

  const getFloorAmenities = (floor) => {
    return amenities.filter(amenity => amenity.floor === floor);
  };

  if (!buildingDetails) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{buildingDetails.name}</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.statusContainer}>
          <View style={[styles.statusBadge, { backgroundColor: isCurrentlyOpen() ? '#4CAF50' : '#F44336' }]}>
            <Text style={styles.statusText}>
              {isCurrentlyOpen() ? 'Open Now' : 'Closed'}
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.description}>{buildingDetails.description}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Hours</Text>
          {buildingDetails.hours.map((hour, index) => (
            <View key={index} style={styles.hourRow}>
              <Text style={styles.dayText}>{hour.day}</Text>
              <Text style={styles.timeText}>
                {hour.isOpen ? `${hour.open} - ${hour.close}` : 'Closed'}
              </Text>
            </View>
          ))}
        </View>

        {buildingDetails.departments && buildingDetails.departments.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Departments</Text>
            {buildingDetails.departments.map((dept, index) => (
              <Text key={index} style={styles.departmentText}>• {dept}</Text>
            ))}
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Floor Plans</Text>
          <View style={styles.floorSelector}>
            {buildingDetails.floors.map((floor) => (
              <TouchableOpacity
                key={floor}
                style={[
                  styles.floorButton,
                  selectedFloor === floor && styles.floorButtonActive
                ]}
                onPress={() => setSelectedFloor(floor)}
              >
                <Text style={[
                  styles.floorButtonText,
                  selectedFloor === floor && styles.floorButtonTextActive
                ]}>
                  Floor {floor}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.floorPlanContainer}>
            <View style={styles.floorPlanPlaceholder}>
              <Icon name="map" size={48} color="#ccc" />
              <Text style={styles.floorPlanText}>Floor {selectedFloor} Plan</Text>
              <Text style={styles.floorPlanSubtext}>Interactive floor plan coming soon</Text>
            </View>
          </View>

          <View style={styles.amenitiesContainer}>
            <Text style={styles.amenitiesTitle}>Amenities on Floor {selectedFloor}</Text>
            {getFloorAmenities(selectedFloor).map((amenity, index) => (
              <View key={index} style={styles.amenityItem}>
                <Icon
                  name={getAmenityIcon(amenity.type)}
                  size={20}
                  color={getAmenityColor(amenity.type)}
                />
                <View style={styles.amenityText}>
                  <Text style={styles.amenityType}>
                    {amenity.type.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </Text>
                  <Text style={styles.amenityDescription}>{amenity.description}</Text>
                </View>
              </View>
            ))}
            {getFloorAmenities(selectedFloor).length === 0 && (
              <Text style={styles.noAmenities}>No amenities listed for this floor</Text>
            )}
          </View>
        </View>

        {buildingDetails.contact && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Contact Information</Text>
            {buildingDetails.contact.phone && (
              <TouchableOpacity style={styles.contactItem}>
                <Icon name="phone" size={20} color="#2E86AB" />
                <Text style={styles.contactText}>{buildingDetails.contact.phone}</Text>
              </TouchableOpacity>
            )}
            {buildingDetails.contact.email && (
              <TouchableOpacity style={styles.contactItem}>
                <Icon name="email" size={20} color="#2E86AB" />
                <Text style={styles.contactText}>{buildingDetails.contact.email}</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
    backgroundColor: 'white',
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
    textAlign: 'center',
  },
  placeholder: {
    width: 34,
  },
  content: {
    flex: 1,
  },
  statusContainer: {
    alignItems: 'center',
    paddingVertical: 15,
  },
  statusBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  statusText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  section: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginVertical: 10,
    padding: 20,
    borderRadius: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  description: {
    fontSize: 16,
    color: '#666',
    lineHeight: 22,
  },
  hourRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  dayText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  timeText: {
    fontSize: 16,
    color: '#666',
  },
  departmentText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 5,
  },
  floorSelector: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  floorButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    marginRight: 10,
  },
  floorButtonActive: {
    backgroundColor: '#2E86AB',
  },
  floorButtonText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  floorButtonTextActive: {
    color: 'white',
  },
  floorPlanContainer: {
    marginBottom: 20,
  },
  floorPlanPlaceholder: {
    height: 200,
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e0e0e0',
    borderStyle: 'dashed',
  },
  floorPlanText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#999',
    marginTop: 10,
  },
  floorPlanSubtext: {
    fontSize: 14,
    color: '#ccc',
    marginTop: 5,
  },
  amenitiesContainer: {
    marginTop: 10,
  },
  amenitiesTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  amenityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  amenityText: {
    marginLeft: 15,
    flex: 1,
  },
  amenityType: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  amenityDescription: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  noAmenities: {
    fontSize: 14,
    color: '#999',
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: 20,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  contactText: {
    fontSize: 16,
    color: '#2E86AB',
    marginLeft: 10,
  },
});