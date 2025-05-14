import { StyleSheet } from 'react-native';
export default StyleSheet.create({
  container: {
    flex: 1, // Take up all available space
    justifyContent: 'center', // Center vertically
    alignItems: 'center', // Center horizontally
    padding: 20, // Optional: add padding around the container
  },
  listItem: {
    borderWidth: 2,
    borderColor: '#ccc',
    borderRadius: 4,
    width: 150,
    paddingVertical: 10,
    paddingHorizontal: 8,
    fontSize: 20,
    marginVertical: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchInput: {
    borderWidth: 0,
    borderRadius: 25,
    width: 150,
    height: 50,
    fontSize: 20,
    paddingHorizontal: 20,
    paddingVertical: 10,
    fontFamily: 'Trebuchet MS', // may require a custom font or fallback
    backgroundColor: '#e6e6e6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5, // Android shadow
  },
  searchInputTyping: {
    width: 500,
    height: 'auto',
  },
  list: {
    paddingLeft: 0,
  },
});