import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { API_BASE_URL } from '@env';

const POST_CATEGORIES = [
  { id: 'tip', label: 'Navigation Tip', icon: 'directions' },
  { id: 'issue', label: 'Report Issue', icon: 'report-problem' },
  { id: 'study', label: 'Study Spot', icon: 'menu-book' },
  { id: 'amenity', label: 'Amenity Info', icon: 'info' },
  { id: 'event', label: 'Event/News', icon: 'event' },
  { id: 'other', label: 'Other', icon: 'more-horiz' },
];

const COMMON_LOCATIONS = [
  'Royce Hall',
  'Powell Library',
  'Ackerman Union',
  'Boelter Hall',
  'Young Research Library',
  'Pauley Pavilion',
  'Westwood Plaza',
  'Engineering Building',
  'Math Sciences Building',
  'Life Sciences Building',
];

export default function CreatePostScreen({ navigation }) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [location, setLocation] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [tags, setTags] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false);

  const handleSubmit = async () => {
    if (!title.trim() || !content.trim() || !selectedCategory) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);

    try {
      const postData = {
        title: title.trim(),
        content: content.trim(),
        location: location.trim() || 'General',
        category: selectedCategory,
        tags: tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0),
      };

      // Replace with your actual backend URL
      const response = await fetch(`${API_BASE_URL}/notes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Add authorization header if needed
          // 'Authorization': `Bearer ${userToken}`,
        },
        body: JSON.stringify(postData),
      });

      if (response.ok) {
        Alert.alert('Success', 'Your post has been created!', [
          { text: 'OK', onPress: () => navigation.goBack() }
        ]);
      } else {
        throw new Error('Failed to create post');
      }
    } catch (error) {
      console.error('Error creating post:', error);
      Alert.alert('Error', 'Failed to create post. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectLocation = (selectedLocation) => {
    setLocation(selectedLocation);
    setShowLocationSuggestions(false);
  };

  const filteredLocations = COMMON_LOCATIONS.filter(loc =>
    loc.toLowerCase().includes(location.toLowerCase())
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="close" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create Post</Text>
        <TouchableOpacity
          style={[styles.submitButton, (!title.trim() || !content.trim() || !selectedCategory) && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={isSubmitting || !title.trim() || !content.trim() || !selectedCategory}
        >
          <Text style={[styles.submitButtonText, (!title.trim() || !content.trim() || !selectedCategory) && styles.submitButtonTextDisabled]}>
            {isSubmitting ? 'Posting...' : 'Post'}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Category *</Text>
          <View style={styles.categoryContainer}>
            {POST_CATEGORIES.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.categoryButton,
                  selectedCategory === category.id && styles.categoryButtonActive
                ]}
                onPress={() => setSelectedCategory(category.id)}
              >
                <Icon
                  name={category.icon}
                  size={20}
                  color={selectedCategory === category.id ? 'white' : '#666'}
                />
                <Text style={[
                  styles.categoryText,
                  selectedCategory === category.id && styles.categoryTextActive
                ]}>
                  {category.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Title *</Text>
          <TextInput
            style={styles.titleInput}
            placeholder="Enter a descriptive title..."
            value={title}
            onChangeText={setTitle}
            maxLength={100}
          />
          <Text style={styles.characterCount}>{title.length}/100</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Location</Text>
          <View style={styles.locationContainer}>
            <TextInput
              style={styles.locationInput}
              placeholder="Enter location (optional)"
              value={location}
              onChangeText={(text) => {
                setLocation(text);
                setShowLocationSuggestions(text.length > 0);
              }}
              onFocus={() => setShowLocationSuggestions(location.length > 0)}
            />
            <TouchableOpacity
              style={styles.locationButton}
              onPress={() => {
                // Here you could implement GPS location detection
                Alert.alert('Feature Coming Soon', 'GPS location detection will be available soon!');
              }}
            >
              <Icon name="my-location" size={20} color="#2E86AB" />
            </TouchableOpacity>
          </View>

          {showLocationSuggestions && filteredLocations.length > 0 && (
            <View style={styles.locationSuggestions}>
              {filteredLocations.slice(0, 5).map((loc, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.locationSuggestion}
                  onPress={() => selectLocation(loc)}
                >
                  <Icon name="place" size={16} color="#666" />
                  <Text style={styles.locationSuggestionText}>{loc}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Content *</Text>
          <TextInput
            style={styles.contentInput}
            placeholder="Share your tip, report an issue, or provide helpful information..."
            value={content}
            onChangeText={setContent}
            multiline
            textAlignVertical="top"
            maxLength={500}
          />
          <Text style={styles.characterCount}>{content.length}/500</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tags</Text>
          <TextInput
            style={styles.tagsInput}
            placeholder="Enter tags separated by commas (e.g., elevator, accessibility, shortcut)"
            value={tags}
            onChangeText={setTags}
          />
          <Text style={styles.helperText}>
            Tags help other students find your post more easily
          </Text>
        </View>

        <View style={styles.section}>
          <View style={styles.guidelinesContainer}>
            <Text style={styles.guidelinesTitle}>Community Guidelines</Text>
            <Text style={styles.guidelinesText}>
              • Be respectful and helpful to fellow Bruins{'\n'}
              • Provide accurate and useful information{'\n'}
              • Report genuine issues and safety concerns{'\n'}
              • Avoid spam or inappropriate content
            </Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
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
  submitButton: {
    backgroundColor: '#2E86AB',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  submitButtonDisabled: {
    backgroundColor: '#ccc',
  },
  submitButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  submitButtonTextDisabled: {
    color: '#999',
  },
  content: {
    flex: 1,
  },
  section: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginVertical: 10,
    padding: 20,
    borderRadius: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    marginBottom: 10,
  },
  categoryButtonActive: {
    backgroundColor: '#2E86AB',
  },
  categoryText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  categoryTextActive: {
    color: 'white',
  },
  titleInput: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#333',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#333',
    marginRight: 10,
  },
  locationButton: {
    padding: 12,
    borderWidth: 1,
    borderColor: '#2E86AB',
    borderRadius: 8,
  },
  locationSuggestions: {
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    backgroundColor: 'white',
  },
  locationSuggestion: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  locationSuggestionText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#333',
  },
  contentInput: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#333',
    height: 120,
  },
  tagsInput: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#333',
  },
  characterCount: {
    textAlign: 'right',
    fontSize: 12,
    color: '#999',
    marginTop: 5,
  },
  helperText: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
    fontStyle: 'italic',
  },
  guidelinesContainer: {
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#2E86AB',
  },
  guidelinesTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  guidelinesText: {
    fontSize: 12,
    color: '#666',
    lineHeight: 18,
  },
});