import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { API_BASE_URL } from '@env';

export default function IndoorNavScreen({ navigation, route }) {
  const { from, to } = route.params || {};
  const [instructions, setInstructions] = useState([]);
  const [routeInfo, setRouteInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [checkedSteps, setCheckedSteps] = useState(new Set());
  const [error, setError] = useState(null);

  useEffect(() => {
    if (from && to) {
      fetchRouteInstructions();
    } else {
      setError('Missing route parameters');
      setLoading(false);
    }
  }, [from, to]);

  const fetchRouteInstructions = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(
        `${API_BASE_URL}/path?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}&mode=bfs`
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }
      
      setRouteInfo({
        algorithm: data.algorithm,
        from: data.from,
        to: data.to,
      });
      
      // Parse instructions into individual steps
      const instructionSteps = data.instructions
        .filter(step => step.trim().length > 0)
        .map((step, index) => ({
          id: index,
          text: step.trim(),
          completed: false,
        }));
      
      setInstructions(instructionSteps);
    } catch (error) {
      console.error('Error fetching route instructions:', error);
      setError(error.message);
      Alert.alert('Error', `Failed to fetch route instructions: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const toggleStepCompletion = (stepId) => {
    const newCheckedSteps = new Set(checkedSteps);
    if (checkedSteps.has(stepId)) {
      newCheckedSteps.delete(stepId);
    } else {
      newCheckedSteps.add(stepId);
    }
    setCheckedSteps(newCheckedSteps);
  };

  const getCompletionProgress = () => {
    if (instructions.length === 0) return 0;
    return Math.round((checkedSteps.size / instructions.length) * 100);
  };

  const handleFinishNavigation = () => {
    Alert.alert(
      'Navigation Complete!',
      'Congratulations! You have reached your destination.',
      [
        {
          text: 'Navigate Again',
          onPress: () => navigation.goBack(),
        },
        {
          text: 'Go to Map',
          onPress: () => navigation.navigate('MainTabs', { screen: 'Map' }),
        },
      ]
    );
  };

  const renderInstruction = ({ item }) => {
    const isCompleted = checkedSteps.has(item.id);
    
    return (
      <TouchableOpacity
        style={[styles.instructionItem, isCompleted && styles.completedInstruction]}
        onPress={() => toggleStepCompletion(item.id)}
      >
        <View style={styles.instructionContent}>
          <Icon
            name={isCompleted ? 'check-circle' : 'radio-button-unchecked'}
            size={24}
            color={isCompleted ? '#28a745' : '#6c757d'}
            style={styles.checkIcon}
          />
          <Text style={[styles.instructionText, isCompleted && styles.completedText]}>
            {item.text}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2E86AB" />
          <Text style={styles.loadingText}>Calculating route...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Icon name="error-outline" size={64} color="#dc3545" />
          <Text style={styles.errorTitle}>Route Not Found</Text>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={fetchRouteInstructions}
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
          <Text style={styles.headerTitle}>Indoor Navigation</Text>
          {routeInfo && (
            <Text style={styles.headerSubtitle}>
              {routeInfo.from} → {routeInfo.to}
            </Text>
          )}
        </View>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressHeader}>
          <Text style={styles.progressText}>
            Progress: {getCompletionProgress()}% ({checkedSteps.size}/{instructions.length})
          </Text>
          {routeInfo && (
            <Text style={styles.algorithmText}>
              Route: {routeInfo.algorithm}
            </Text>
          )}
        </View>
        <View style={styles.progressBarContainer}>
          <View
            style={[
              styles.progressBar,
              { width: `${getCompletionProgress()}%` },
            ]}
          />
        </View>
      </View>

      {/* Instructions List */}
      <FlatList
        data={instructions}
        renderItem={renderInstruction}
        keyExtractor={(item) => item.id.toString()}
        style={styles.instructionsList}
        contentContainerStyle={styles.instructionsContainer}
        showsVerticalScrollIndicator={false}
      />

      {/* Complete Navigation Button */}
      {getCompletionProgress() === 100 && (
        <View style={styles.completeContainer}>
          <TouchableOpacity
            style={styles.completeButton}
            onPress={handleFinishNavigation}
          >
            <Icon name="celebration" size={20} color="#fff" />
            <Text style={styles.completeButtonText}>Destination Reached!</Text>
          </TouchableOpacity>
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
  progressContainer: {
    backgroundColor: '#fff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2E86AB',
  },
  algorithmText: {
    fontSize: 12,
    color: '#6c757d',
    fontStyle: 'italic',
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: '#e9ecef',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#28a745',
    borderRadius: 4,
  },
  instructionsList: {
    flex: 1,
  },
  instructionsContainer: {
    paddingVertical: 8,
  },
  instructionItem: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginVertical: 4,
    borderRadius: 8,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  completedInstruction: {
    backgroundColor: '#f8f9fa',
    opacity: 0.7,
  },
  instructionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  checkIcon: {
    marginRight: 12,
  },
  instructionText: {
    flex: 1,
    fontSize: 16,
    color: '#212529',
    lineHeight: 22,
  },
  completedText: {
    textDecorationLine: 'line-through',
    color: '#6c757d',
  },
  completeContainer: {
    backgroundColor: '#fff',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
  },
  completeButton: {
    backgroundColor: '#28a745',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    borderRadius: 8,
  },
  completeButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});
