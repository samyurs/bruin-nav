import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  RefreshControl,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

export default function PostsScreen({ navigation }) {
  const [posts, setPosts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [sortBy, setSortBy] = useState('recent'); // 'recent', 'popular'

  useEffect(() => {
    fetchPosts();
  }, []);

  useEffect(() => {
    filterPosts();
  }, [searchQuery, posts, sortBy]);

  const fetchPosts = async () => {
    try {
      // Replace with your actual backend URL
      const response = await fetch('http://localhost:5050/api/notes');
      const data = await response.json();
      setPosts(data);
    } catch (error) {
      console.error('Error fetching posts:', error);
      // For demo purposes, add some sample posts
      setPosts([
        {
          _id: '1',
          title: 'Elevator in Boelter Hall is broken',
          content: 'The elevator on the east side of Boelter Hall has been out of order for 3 days. Use the west elevator instead.',
          author: 'Anonymous',
          location: 'Boelter Hall',
          upvotes: 15,
          downvotes: 2,
          comments: 3,
          createdAt: new Date().toISOString(),
          tags: ['elevator', 'boelter-hall', 'accessibility'],
        },
        {
          _id: '2',
          title: 'Great study spot in Powell Library',
          content: 'Found an amazing quiet corner on the 3rd floor of Powell Library. Perfect for studying during finals week!',
          author: 'StudyBuddy',
          location: 'Powell Library',
          upvotes: 28,
          downvotes: 1,
          comments: 7,
          createdAt: new Date(Date.now() - 86400000).toISOString(),
          tags: ['study-spot', 'powell-library', 'quiet'],
        },
        {
          _id: '3',
          title: 'Shortcut to Engineering Building',
          content: 'There\'s a hidden path behind the Math Sciences building that cuts 5 minutes off your walk to Engineering.',
          author: 'PathFinder',
          location: 'Math Sciences Building',
          upvotes: 42,
          downvotes: 3,
          comments: 12,
          createdAt: new Date(Date.now() - 172800000).toISOString(),
          tags: ['shortcut', 'engineering', 'navigation'],
        },
      ]);
    }
  };

  const filterPosts = () => {
    let filtered = posts;

    if (searchQuery) {
      filtered = posts.filter(
        (post) =>
          post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
          post.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
          post.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Sort posts
    if (sortBy === 'popular') {
      filtered.sort((a, b) => (b.upvotes - b.downvotes) - (a.upvotes - a.downvotes));
    } else {
      filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    setFilteredPosts(filtered);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchPosts();
    setRefreshing(false);
  };

  const handleVote = async (postId, voteType) => {
    try {
      // Here you would make an API call to vote
      // For demo purposes, just update locally
      setPosts(prevPosts =>
        prevPosts.map(post => {
          if (post._id === postId) {
            if (voteType === 'up') {
              return { ...post, upvotes: post.upvotes + 1 };
            } else {
              return { ...post, downvotes: post.downvotes + 1 };
            }
          }
          return post;
        })
      );
    } catch (error) {
      console.error('Error voting:', error);
      Alert.alert('Error', 'Failed to vote on post');
    }
  };

  const formatTimeAgo = (dateString) => {
    const now = new Date();
    const postDate = new Date(dateString);
    const diffInHours = Math.floor((now - postDate) / (1000 * 60 * 60));

    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return `${Math.floor(diffInDays / 7)}w ago`;
  };

  const renderPost = ({ item }) => (
    <View style={styles.postCard}>
      <View style={styles.postHeader}>
        <View style={styles.postInfo}>
          <Text style={styles.postTitle}>{item.title}</Text>
          <View style={styles.postMeta}>
            <Icon name="place" size={14} color="#666" />
            <Text style={styles.postLocation}>{item.location}</Text>
            <Text style={styles.postTime}>• {formatTimeAgo(item.createdAt)}</Text>
          </View>
        </View>
      </View>

      <Text style={styles.postContent}>{item.content}</Text>

      <View style={styles.postTags}>
        {item.tags.map((tag, index) => (
          <View key={index} style={styles.tag}>
            <Text style={styles.tagText}>#{tag}</Text>
          </View>
        ))}
      </View>

      <View style={styles.postActions}>
        <View style={styles.voteContainer}>
          <TouchableOpacity
            style={styles.voteButton}
            onPress={() => handleVote(item._id, 'up')}
          >
            <Icon name="thumb-up" size={18} color="#2E86AB" />
            <Text style={styles.voteText}>{item.upvotes}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.voteButton}
            onPress={() => handleVote(item._id, 'down')}
          >
            <Icon name="thumb-down" size={18} color="#C73E1D" />
            <Text style={styles.voteText}>{item.downvotes}</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.commentButton}>
          <Icon name="comment" size={18} color="#666" />
          <Text style={styles.commentText}>{item.comments} comments</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Community Notes</Text>
        <TouchableOpacity
          style={styles.createButton}
          onPress={() => navigation.navigate('CreatePost')}
        >
          <Icon name="add" size={24} color="white" />
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Icon name="search" size={20} color="#666" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search posts, locations, tags..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        <View style={styles.sortContainer}>
          <TouchableOpacity
            style={[styles.sortButton, sortBy === 'recent' && styles.sortButtonActive]}
            onPress={() => setSortBy('recent')}
          >
            <Text style={[styles.sortText, sortBy === 'recent' && styles.sortTextActive]}>
              Recent
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.sortButton, sortBy === 'popular' && styles.sortButtonActive]}
            onPress={() => setSortBy('popular')}
          >
            <Text style={[styles.sortText, sortBy === 'popular' && styles.sortTextActive]}>
              Popular
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={filteredPosts}
        renderItem={renderPost}
        keyExtractor={(item) => item._id}
        style={styles.postsList}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
    backgroundColor: 'white',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  createButton: {
    backgroundColor: '#2E86AB',
    borderRadius: 25,
    padding: 8,
  },
  searchContainer: {
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingBottom: 15,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginBottom: 15,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
    color: '#333',
  },
  sortContainer: {
    flexDirection: 'row',
  },
  sortButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
    backgroundColor: '#f0f0f0',
  },
  sortButtonActive: {
    backgroundColor: '#2E86AB',
  },
  sortText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  sortTextActive: {
    color: 'white',
  },
  postsList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  postCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  postHeader: {
    marginBottom: 12,
  },
  postTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  postMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  postLocation: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
  },
  postTime: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  postContent: {
    fontSize: 16,
    color: '#333',
    lineHeight: 22,
    marginBottom: 12,
  },
  postTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  tag: {
    backgroundColor: '#E8F4FD',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 8,
    marginBottom: 4,
  },
  tagText: {
    fontSize: 12,
    color: '#2E86AB',
    fontWeight: '500',
  },
  postActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  voteContainer: {
    flexDirection: 'row',
  },
  voteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
  },
  voteText: {
    marginLeft: 4,
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  commentButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  commentText: {
    marginLeft: 4,
    fontSize: 14,
    color: '#666',
  },
});