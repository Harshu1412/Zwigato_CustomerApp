import {
  View,
  Text,
  StyleSheet,
  Button,
  TouchableOpacity,
  SafeAreaView,
  Modal,
  Alert,
  Pressable,
  ScrollView,
  TextInput,
  BackHandler,
  ActivityIndicator,
} from "react-native";
import React, { useEffect, useState, useCallback } from "react";
import { StatusBar } from "expo-status-bar";
import styled from "styled-components/native";
import { AntDesign, Entypo } from "@expo/vector-icons";
import { Avatar } from "react-native-elements";
import { BlackButton } from "../components/Button";
import * as ImagePicker from "expo-image-picker";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import CountryPicker from "react-native-country-picker-modal";
import TextInputs from "../components/TextInputs";
import { api } from "../../Api";
import { Snackbar } from "react-native-paper";
import CheckInternet from "../components/CheckInternet";
import { codeFinder } from "../components/CountryCode";
import { ErrorText } from "./../styles/styles";

const MView = styled.View`
flex:1;
background-color:white
margin-top:20px;
`;

const AvatarView = styled.View`
  justify-content: center;
  align-items: center;
  margin-top: 20px;
`;
const AvatarText = styled.Text`
margin-top:10px;
font-size:22px;
text-align:center;
color:black
fontFamily:"Montserrat_500Medium"
`;

const BorderView = styled(View)`
  border: 1px solid lightgrey;
  padding: 5px 20px;
  border-radius: 5px;
  margin: 10px 0px;
`;
const PhoneInputView = styled(View)`
  padding-vertical: 4px;
  flex-direction: row;
  align-items: center;
`;
const FterView = styled.View`
flex:1
background-color:white;
width:100%;
// height:90%;
border-top-left-radius:20px;
border-top-right-radius:20px;
padding:10px;

`;
const EditProfile = ({ route }) => {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [editable, setEditable] = useState(false);
  const [buttonText, setButtonText] = useState("Edit Profile");
  const [photo, setPhoto] = useState(null);
  const [callingCode, setCallingCode] = useState("91");
  const [countryCode, setCountryCode] = useState("IN");
  const [error, setError] = useState("");
  const [error1, setError1] = useState("");
  const [error2, setError2] = useState("");
  const [error3, setError3] = useState("");
  const navigation = useNavigation();
  const [authToken, setAuthToken] = useState("");
  const [show, setShow] = useState(false);
  const [message, setMessage] = useState("");
  const [saveError, setSaveError] = useState("");
  const [photoError, setPhotoError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mainLoading, setMainLoading] = useState(false);
  const [userData, setUserData] = useState(null);
  AsyncStorage.getItem("token").then((token) => {
    setAuthToken(token);
  });

  useEffect(() => {
    const fetchData = async () => {
      if (
        authToken !== null &&
        authToken !== undefined &&
        authToken.length !== 0 &&
        userData == null
      ) {
        try {
          setMainLoading(true);

          const requestOptions = {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${authToken}`,
            },
          };
          const response = await fetch(api + "getuser", requestOptions);
          console.log(response.status);

          const json = await response.json();
          // console.log(json);

          if (json && json.data.phone) {
            setUserData(json.data);
            setPhone(json.data.phone);
            const callCode = json.data.calling_code;
            const flag = codeFinder(callCode);
            setCountryCode(flag);
          }
          if (json && json.data.name) {
            setName(json.data.name);
            setEmail(json.data.email);
            setAddress(json.data.address);
            setPhoto(api + json.data.photo_uri);
            AsyncStorage.setItem("name", json.data.name);
            AsyncStorage.setItem("-photo", api + json.data.photo_uri);
          } else {
          }
        } catch (error) {
          if (error.message === "Network request failed") {
            setShow(true);
            setMessage(
              "Network request failed. Please check your internet connection."
            );
            navigation.goBack();
          }
          setMainLoading(false);
          // console.log("Error fetching data:", error);
        } finally {
          setMainLoading(false);
        }
      }
    };
    fetchData();
  }, [authToken, handleSavePress]);

  useEffect(() => {
    const backAction = async () => {
      if (name === "" || name === null) {
        setError("Enter Name");
        return true; // Prevent the back action
      } else if (!isValidEmail(email)) {
        setError1("Enter email");
        return true; // Prevent the back action
      } else if (address === "" || address === null) {
        setError3("Enter address");
        return true; // Prevent the back action
      } else if (buttonText === "Save") {
        // try {
        //   const nameValue = await AsyncStorage.getItem("name");
        //   const photoValue = await AsyncStorage.getItem("-photo");
        //   if (nameValue !== null) {
        //     console.log(nameValue); // This will log the stored value of "name"
        //     console.log(nameValue.length); // This will log the length of the stored value
        //     if(photoValue !== null){
        //       navigation.goBack();
        //       return true;
        //     } else {
        //       setPhotoError("Please upload photo")
        //       return true;
        //     }
        //   } else {
        //     setSaveError("Save Details First!!");
        //     return true;
        //   }
        // } catch (error) {
        //   console.log("Error retrieving data from AsyncStorage:", error);
        // }
        try {
          const nameValue = await AsyncStorage.getItem("name");
          const photoValue = await AsyncStorage.getItem("-photo");

          if (nameValue === null || photoValue === null) {
            if (photoValue === null) {
              setPhotoError("Please upload photo");
              return true;
            } else if (nameValue === null) {
              setSaveError("Save Details First!!");
              return true;
            }
            // return true; // Prevent the back action
          }

          console.log(nameValue); // This will log the stored value of "name"
          console.log(nameValue.length); // This will log the length of the stored value

          navigation.goBack();
          return true;
        } catch (error) {
          console.log("Error retrieving data from AsyncStorage:", error);
        }
      } else {
        navigation.goBack();
        return true;
      }
    };
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction
    );

    return () => backHandler.remove();
  }, [name, address, email, buttonText, photo]);
  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };
  const handleSavePress = async () => {
    setMainLoading(true);
    setError2(null);
    const nameRegex = /^[a-zA-Z\s]{2,33}$/;
    const addressRegex = /^[a-zA-Z0-9\s\-\#\,\.]+$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    const phoneRegex = /^[0-9]{10}$/;
    // Check if inputs are valid
    if (!nameRegex.test(name) || !name) {
      setError("Invalid Name", "Please enter a valid name.");
      setMainLoading(false);

      return;
    }
    if (!emailRegex.test(email) || !email) {
      setError1("Invalid Email", "Please enter a valid email address.");
      setMainLoading(false);

      return;
    }
    // if (!phoneRegex.test(phone)) {
    //   setError2("Invalid Phone", "Please enter a valid 10-digit phone number.");
    //   return;
    // }
    if (!addressRegex.test(address) || !address) {
      setError3(
        "Invalid Address",
        "Please enter a valid 10-digit phone number."
      );
      setMainLoading(false);

      return;
    }
    await AsyncStorage.setItem("name", name);
    console.log(name);
    try {
      const nameValue = await AsyncStorage.getItem("name");
      const photoValue = await AsyncStorage.getItem("-photo");

      if (nameValue === null || photoValue === null) {
        if (photoValue === null) {
          setMainLoading(false);

          setPhotoError("Please upload photo");
          return true;
        } else if (nameValue === null) {
          setMainLoading(false);

          setSaveError("Save Details First!!");
          return true;
        }
        // return true; // Prevent the back action
      }

      // console.log(nameValue); // This will log the stored value of "name"
      // console.log(nameValue.length); // This will log the length of the stored value

      // navigation.goBack();
      // return true;
    } catch (error) {
      setMainLoading(false);

      console.log("Error retrieving data from AsyncStorage:", error);
    }
    setMainLoading(true);
    setLoading(true);
    setEditable(false);
    await handleUpdate();
    // handleSubmit();
    // setButtonText("Edit Profile");
    setSaveError("");
  };
  const handleEditPress = () => {
    setError2(null);
    setEditable(true);
    setButtonText("Save");
  };

  const handleTakePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    setModalVisible(false);
    if (status === "granted") {
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: false,
        aspect: [4, 3],
        quality: 0.5,
      });
      if (!result.canceled) {
        const photoUri = result.assets[0].uri;
        // console.log(photoUri);
        setPhoto(photoUri);
        setPhotoError(false);
        await AsyncStorage.setItem("-photo", photoUri);
      }
    } else {
      alert("Camera permission not granted");
    }
  };

  const getProfilePicture = async () => {
    const photoUri = await AsyncStorage.getItem(`-photo`);
    if (photoUri !== "") {
      setPhoto(photoUri);
    }
  };

  useFocusEffect(
    useCallback(() => {
      getProfilePicture();
    }, [])
  );

  const pickImage = useCallback(async () => {
    setModalVisible(false);
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsEditing: false,
        aspect: [4, 3],
        quality: 0.5,
      });
      if (!result.canceled) {
        const photoUri = result.assets[0].uri;
        setPhoto(photoUri);
        setPhotoError(false);
        await AsyncStorage.setItem("-photo", photoUri);
      }
    } catch (error) {
      console.log(error);
    }
  }, [photo]);
  const formdata = new FormData();
  const handleUpdate = async () => {
    console.log(phone, address, email, name, photo);
    if (!photo) {
      formdata.append("name", name);
      formdata.append("email", email);
      formdata.append("phone", phone);
      formdata.append("address", address);
      formdata.append("calling_code", callingCode);
    } else {
      formdata.append("photo_uri", {
        uri: photo,
        name: "image.jpg",
        type: "image/jpeg",
      });

      formdata.append("name", name);
      formdata.append("email", email);
      formdata.append("phone", phone);
      formdata.append("address", address);
      formdata.append("calling_code", callingCode);
    }
    let token = "";
    try {
      token = await AsyncStorage.getItem("token");
    } catch (error) {
      console.log("cannot get token", error);
    }
    const requestOptions = {
      method: "POST",
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${token}`,
      },
      body: formdata,
    };
    console.log(requestOptions);
    console.log(formdata._parts);

    try {
      console.log("here");
      const response = await fetch(api + "update", requestOptions);

      console.log(response.ok);
      if (response.ok) {
        console.log(response.status);
        const data = await response.json();

        setShow(true);
        setMessage("Profile Updated Successfully.");
        setButtonText("Edit Profile");

        setTimeout(() => {
          setMainLoading(false);
          setShow(false);
        }, 1000);
      }

      setLoading(false);
    } catch (error) {
      if (error.message === "Network request failed") {
        setEditable(true);
        setButtonText("Save");
        setShow(true);
        setMessage("Unable to save data. Please save again");
        setMainLoading(false);
      }
      console.log(error);
      setLoading(false);
    }
  };
  return (
    <>
      {mainLoading && (
        <View>
          <Modal animationType="none" transparent visible={mainLoading}>
            <View style={styles.centeredView1}>
              <View style={styles.modalView1}>
                <ActivityIndicator size={40} />
              </View>
            </View>
          </Modal>
        </View>
      )}
      <SafeAreaView style={{ flex: 1, backgroundColor: "white", padding: 8 }}>
        <MView>
          <Modal
            animationType="slide"
            transparent={true}
            visible={modalVisible}
            onRequestClose={() => {
              setModalVisible(!modalVisible);
            }}
          >
            <View style={styles.centeredView}>
              <View style={styles.modalView}>
                <Text style={styles.modalText}>Choose an Option</Text>
                <View style={{ flexDirection: "row" }}>
                  <Pressable
                    style={[styles.button, styles.buttonClose]}
                    onPress={pickImage}
                  >
                    <Text style={styles.textStyle}>Gallery</Text>
                  </Pressable>
                  <Pressable
                    style={[styles.button, styles.buttonClose]}
                    onPress={handleTakePhoto}
                  >
                    <Text style={styles.textStyle}>Camera</Text>
                  </Pressable>
                </View>
              </View>
            </View>
          </Modal>
          <View
            style={{
              height: 53,
              marginTop: 10,
              backgroundColor: "white",
              borderRadius: 8,
              width: "94%",
              flexDirection: "row",
              alignItems: "center",
              alignSelf: "center",
              justifyContent: "center",
              marginBottom: 20,
              shadowColor: "#000",
              shadowOffset: {
                width: 0,
                height: 2,
              },
              shadowOpacity: 0.25,
              shadowRadius: 3.84,
              elevation: 5,
            }}
          >
            <View style={{ position: "absolute", left: 15 }}>
              <TouchableOpacity
                onPress={async () => {
                  if (name === "" || name === null) {
                    setError("Enter Name");
                    return true;
                  } else if (!isValidEmail(email)) {
                    setError1("Enter email");
                    return true;
                  } else if (address === "" || address === null) {
                    setError3("Enter address");
                    return true;
                  } else if (buttonText === "Save") {
                    try {
                      const nameValue = await AsyncStorage.getItem("name");
                      const photoValue = await AsyncStorage.getItem("-photo");

                      if (nameValue === null || photoValue === null) {
                        if (photoValue === null) {
                          setPhotoError("Please upload photo");
                          return true;
                        } else if (nameValue === null) {
                          setSaveError("Save Details First!!");
                          return true;
                        }
                        // return true; // Prevent the back action
                      }

                      console.log(nameValue); // This will log the stored value of "name"
                      console.log(nameValue.length); // This will log the length of the stored value

                      navigation.goBack();
                      return true;
                    } catch (error) {
                      console.log(
                        "Error retrieving data from AsyncStorage:",
                        error
                      );
                    }
                  } else if (!mainLoading) {
                    navigation.goBack();
                    return true;
                  }
                }}
              >
                <AntDesign name="left" size={24} color="black" />
              </TouchableOpacity>
            </View>
            <Text style={{ fontSize: 16 }}>
              {" "}
              {editable ? "Edit Profile" : "Profile"}{" "}
            </Text>
          </View>

          <AvatarView>
            {!photo && (
              <Avatar
                rounded
                size="xlarge"
                source={{
                  uri: "https://images.unsplash.com/photo-1580518337843-f959e992563b?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=387&q=80",
                }}
                activeOpacity={0.7}
              />
            )}
            {photo && (
              <Avatar
                rounded
                size={180}
                source={{ uri: photo }}
                backgroundColor="#2182BD"
              />
            )}

            {editable ? (
              <TouchableOpacity
                style={{
                  position: "absolute",
                  right: 100,
                  bottom: 10,
                  backgroundColor: "#0C8A7B",
                  borderRadius: 27,
                  padding: 10,
                }}
                onPress={() => setModalVisible(true)}
              >
                <Entypo
                  name="camera"
                  size={30}
                  color="white"
                  style={[styles.button, styles.buttonOpen]}
                />
              </TouchableOpacity>
            ) : null}
          </AvatarView>

          {photoError && <ErrorText>{photoError}</ErrorText>}
          <AvatarText>{name}</AvatarText>
          <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
            <FterView flex={1}>
              <TextInputs
                label="Name"
                maxLength={33}
                value={name}
                onChangeText={(text) => {
                  setName(text);
                  setError(null);
                }}
                disabled={!editable}
                mode="outlined"
              />
              {error && (
                <Text style={{ color: "red", alignSelf: "center" }}>
                  {error}
                </Text>
              )}
              <TextInputs
                label="Email"
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  setError1(null);
                }}
                disabled={!editable}
                mode="outlined"
              />
              {error1 && (
                <Text style={{ color: "red", alignSelf: "center" }}>
                  {error1}
                </Text>
              )}
              <BorderView>
                <Text
                  style={{
                    position: "absolute",
                    paddingHorizontal: 6,
                    top: -10,
                    left: 7,
                    backgroundColor: "white",
                    fontSize: 12,
                    fontFamily: "Montserrat_500Medium",
                    color: "lightgrey",
                  }}
                >
                  Phone
                </Text>
                <PhoneInputView>
                  <View style={{ pointerEvents: "none" }}>
                    <CountryPicker
                      withFilter
                      countryCode={countryCode}
                      withFlag
                      // withCountryNameButton
                      withAlphaFilter={false}
                      withCallingCode
                      withCurrencyButton={false}
                      onSelect={(country) => {
                        // console.log(country)
                        const { cca2, callingCode } = country;
                        setCountryCode(cca2);
                        setCallingCode(callingCode[0]);
                      }}
                      containerButtonStyle={{
                        alignItems: "center",
                        marginRight: -10,
                      }}
                    />
                  </View>
                  <Text style={{ fontSize: 14, color: "lightgrey" }}> | </Text>
                  <TextInput
                    value={phone}
                    flex={1}
                    onChangeText={(text) => {
                      setPhone(text), setError2(null);
                    }}
                    mode="outlined"
                    keyboardType={"phone-pad"}
                    maxLength={15}
                    editable={false}
                  />
                  {error2 && <Text style={{ color: "red" }}>{error2}</Text>}
                </PhoneInputView>
              </BorderView>
              <TextInputs
                label="Address"
                value={address}
                onChangeText={(text) => {
                  setAddress(text), setError3(null);
                }}
                disabled={!editable}
                mode="outlined"
              />
              {error3 && (
                <Text style={{ color: "red", alignSelf: "center" }}>
                  {error3}
                </Text>
              )}

              <View style={{ marginTop: "auto" }}>
                {saveError && (
                  <Text style={{ color: "red", alignSelf: "center" }}>
                    {saveError}
                  </Text>
                )}

                <View marginTop="auto">
                  <BlackButton
                    title={buttonText}
                    onPress={editable ? handleSavePress : handleEditPress}
                  />
                </View>
              </View>
            </FterView>
          </ScrollView>
          <Snackbar
            visible={show}
            duration={1000}
            onDismiss={() => setShow(false)}
          >
            {message}
          </Snackbar>
          <StatusBar style="dark" />
        </MView>
        <CheckInternet />
      </SafeAreaView>
    </>
  );
};

export default EditProfile;
const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignContent: "center",
  },
  camera: {
    flex: 1,
    aspectRatio: 1,
  },
  cameraContainer: {
    flex: 1,
    flexDirection: "column",
  },
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 22,
  },
  modalView: {
    margin: 20,
    // flexDirection:"row",
    backgroundColor: "white",
    borderRadius: 20,
    padding: 35,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  button: {
    //   flex: 1,
  },
  buttonOpen: {
    // backgroundColor: '#F194FF',
  },
  buttonClose: {
    borderRadius: 10,
    backgroundColor: "#0C8A7B",
    padding: 10,
    marginBottom: 10,
    marginRight: 5,
    marginLeft: 5,
  },
  textStyle: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
  },
  modalText: {
    backgroundColor: "#0C8A7B",
    padding: 10,
    color: "white",
    borderRadius: 10,
    fontWeight: "bold",
    marginBottom: 15,
    textAlign: "center",
  },
  centeredView1: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 22,
  },
  modalView1: {
    margin: 20,
    borderRadius: 20,
    width: "70%",
    height: "20%",
    justifyContent: "center",
    alignItems: "center",
  },
});
