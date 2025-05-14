import React, { useState } from 'react';
import { View, TextInput, FlatList, Text, StyleSheet } from 'react-native';
import styles from './SearchStyles';

function Search() {
  const [inputValue, setInputValue] = useState('');
  const [filterOptions, setFilterOptions] = useState([]);
  const [submittedText, setSubmittedText] = useState(''); // Track the submitted value

  const uclaBuildings = [
    "Royce Hall",
    "Powell Library",
    "Young Research Library",
    "Perloff Hall",
    "Boelter Hall",
    "Math Sciences Building",
    "Theater Arts Building",
    "Bruin Plaza",
    "Cohen Hall",
    "Gonda Center",
    "Stewart Hall",
    "Dodd Hall",
    "Engineering VI",
    "Schoenberg Hall",
    "Kaufman Hall",
    "Haines Hall",
    "Chavez Auditorium",
    "Faculty Center",
    "Math 2000",
    "Strathmore Building"
  ];

  const options = (text) => {
  
    setInputValue(text);
    let pattern = ".*" + text + ".*"; // Use text for real-time updates
    let regex = new RegExp(pattern, "gi");

    if (text.trim() === '') {
   setFilterOptions([]);
  } else {
    setFilterOptions(uclaBuildings.filter(name => regex.test(name)).slice(0, 7));
  }
  };

  const userSubmitted = () => {
    setSubmittedText(inputValue); // Set the submitted text
    setInputValue(''); // Optionally clear the input after submission
  };

  return (
    <View style={styles.container}>
      {submittedText && (
        <View style={styles.submittedText}>
          <Text>{submittedText}</Text>
        </View>
      )}

      <TextInput
        style={[styles.searchInput, inputValue ? styles.typing : null]} 
        value={inputValue} 
        onChangeText={options} // Use onChangeText instead of onChange
        onSubmitEditing={userSubmitted} // Use onSubmitEditing for submit action
        placeholder="Search"
      />

      <FlatList
        data={filterOptions}
        renderItem={({ item }) => (
          <View style={styles.listItem}>
            <Text>{item}</Text>
          </View>
        )}
        keyExtractor={(item, index) => index.toString()}
      />
    </View>
  );
}


export default Search;
