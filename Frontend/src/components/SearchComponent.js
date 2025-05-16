import React, { useState } from 'react';
import { View, TextInput, FlatList, Text, StyleSheet } from 'react-native';
import styles from './SearchStyles';
import React, { useEffect } from 'react';
const LANDMARK_API_URL = 'http://localhost:5050/api/landmarks';

function Search() {
  const [inputValue, setInputValue] = useState('');
  const [filterOptions, setFilterOptions] = useState([]);
  const [submittedText, setSubmittedText] = useState(''); // Track the submitted value
  const [uclaBuildings, setUclaBuildings] = useState([]);

useEffect (()=>{
  const loadLandmarks = async () => {try { 
    const raw_landmark_data = await fetch(LANDMARK_API_URL);

    if (!raw_landmark_data){
      alert ("Can Not Retreive LandMarkData!");
      raw_landmark_data={};  //I have added empty arrays and alerts if this fails and not errors so the app can still run (may change later to actuall error catches)
     }
 landmark_data = await raw_landmark_data.json();
  const uclaBuildings_names = landmark_data.landmarks ? landmark_data.landmarks.map(landmark => landmark.name) : [];
 setUclaBuildings(uclaBuildings_names);
}
 
 catch (error){
  alert("Error retriving buildings");
  setUclaBuildings([]);
 }};
 loadLandmarks();
  },[]);
  

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
