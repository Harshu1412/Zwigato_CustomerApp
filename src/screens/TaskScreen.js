import {
  StyleSheet,
  Text,
  View,
  Keyboard,
  FlatList,
  TouchableOpacity,
  BackHandler,
  Modal,
  Pressable,
  Alert,
  ScrollView,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { api } from "../../Api";
import React, { useEffect, useState } from "react";
import { TextInput, DefaultTheme, Snackbar } from "react-native-paper";
import { Entypo } from "@expo/vector-icons";
import { AntDesign } from "@expo/vector-icons";
import CustomCheckbox from "./../components/Checkbox";
import Titlebar from "./../components/TitileBar";
import SvgUri from "react-native-svg-uri";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import MapboxPlacesAutocomplete from "react-native-mapbox-places-autocomplete";
import Mapbox from "@rnmapbox/maps";
import CheckInternet from "../components/CheckInternet";
import { Feather } from "@expo/vector-icons";

const deviceHeight = Dimensions.get("window").height;
const TaskScreen1 = ({ navigation }) => {
  const [isFocused, setIsFocused] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [checkedItems, setCheckedItems] = useState([]);
  const [pickUp, setPickUp] = useState("");
  const [deliverTo, setDeliverTo] = useState("");

  const [instruction, setInstruction] = useState("");
  const [pickUpError, setPickupError] = useState(false);
  const [deliverError, setDeliverError] = useState(false);
  const [addTaskError, setAddTaskError] = useState(false);
  const [instructionError, setInstructionError] = useState(false);
  const [authToken, setAuthToken] = useState("");
  const [isModal, setIsModal] = useState(false);
  const [isModal1, setIsModal1] = useState(false);
  const [pickupLong, setPickupLong] = useState("");
  const [pickupLat, setPickupLat] = useState("");
  const [dropLong, setDropLong] = useState("");
  const [dropLat, setDropLat] = useState("");
  const [loader, setLoader] = useState(true);
  const [apiError, setApiError] = useState(null);
  const [show, setShow] = useState(false);
  const [mapboxToken, setMapboxToken] = useState("");

  AsyncStorage.getItem("-MapboxToken").then((token) => {
    setMapboxToken(token);
  });

  const MAX_WORDS = 50;
  const [colorList, setColorList] = useState([]);
  const [tokenId, setTokenId] = useState("");
  const getItems = async () => {
    setLoader(true);
    try {
      const response = await fetch(api + "Order/Category");
      // console.log(response);
      const json = await response.json();
      setColorList(json.data);
      setLoader(false);
    } catch (error) {
      if (error.message === "Network request failed") {
        setShow(true);
        setApiError(
          "Network request failed. Please check your internet connection."
        );
      }
      setLoader(false);
      console.log(error);
    }
  };
  AsyncStorage.getItem("token").then((token) => {
    setAuthToken(token);
  });
  const handleTextChange = (text) => {
    setInstructionError(false);
    setInstruction(text);
  };

  useEffect(() => {
    getItems();
  }, [tokenId]);

  useEffect(() => {
    const backAction = () => {
      navigation.goBack();
      return true;
    };

    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction
    );

    return () => backHandler.remove();
  }, []);

  const handleFocus = () => {
    setIsFocused(true);
    setIsModal(true);
    // navigation.navigate("Autocomplete")
  };
  const handleBlur = () => {
    setIsFocused(false);
  };
  const handleFocus1 = () => {
    setIsFocused(true);
    setModalVisible(!modalVisible);
    setAddTaskError(false);
    Keyboard.dismiss();
  };
  const handleFocus0 = () => {
    setIsFocused(true);
    setIsModal1(true);
  };

  const handleModal = () => {
    setModalVisible(!modalVisible);
  };

  const handleSubmit = async () => {
    // validate form inputs
    let inst = instruction.trim();
    console.log("-----", inst);
    if (pickUp.length === 0) {
      setPickupError(true);
    }
    if (deliverTo.length === 0) {
      setDeliverError(true);
    }
    if (checkedItems.length === 0) {
      setAddTaskError(true);
    }
    if (instruction.length === 0) {
      setInstructionError(true);
    }

    // clear error messages
    if (pickUp.length !== 0) {
      setPickupError(false);
    }
    if (deliverTo.length !== 0) {
      setDeliverError(false);
    }
    if (checkedItems.length !== 0) {
      setAddTaskError(false);
    }
    if (instruction.length !== 0) {
      setInstructionError(false);
    }

    // submit form if there are no errors
    if (
      pickUp.length !== 0 &&
      deliverTo.length !== 0 &&
      checkedItems.length !== 0 &&
      instruction.length !== 0
    ) {
      const requestOptions = {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          pickup_from: pickUp,
          deliver_to: deliverTo,
          instruction: inst,
          category_item_type: checkedItems,
          pickup_latitude: pickupLat,
          pickup_longitude: pickupLong,
          delivery_latitude: dropLat,
          delivery_longitude: dropLong,
        }),
      };
      try {
        const response = await fetch(api + "task", requestOptions);
        const data = await response.json();
        // console.log("------------", data);
        // console.log("Token_id", data.order.id);
        // console.log(data.order.id);
        setTokenId(data.order.id);
        navigation.navigate("PlaceOrderDetial", {
          inst,
          pickUp,
          deliverTo,
          checkedItems,
          tokenId: data.order.id,
          pickupLat,
          pickupLong,
          dropLat,
          dropLong,
        });
      } catch (error) {
        console.log(error);
      }
    }
  };

  return (
    <>
      {loader && (
        <View>
          <Modal animationType="slide" transparent={true} visible={loader}>
            <View style={styles.centeredVieW}>
              <View style={styles.modalVieW}>
                <ActivityIndicator size={40} />
              </View>
            </View>
          </Modal>
        </View>
      )}
      <View
        style={{
          width: "100%",
          marginTop: 10,
          alignSelf: "center",
          backgroundColor: "white",
          paddingHorizontal: "5%",
        }}
      >
        <Titlebar title={"Task"} />
      </View>
      <ScrollView contentContainerStyle={styles.mainView}>
        <Pressable style={styles.textinputsView} onPress={() => handleFocus()}>
          <TextInput
            label="Pickup from"
            mode="outlined"
            editable={false}
            value={pickUp}
            selection={{ start: 0 }}
            onChangeText={(text) => setPickUp(text)}
            onFocus={handleFocus}
            onBlur={handleBlur}
            right={
              <TextInput.Icon
                icon={() => (
                  <Ionicons
                    name="location-outline"
                    size={22}
                    color="black"
                    onPress={() => navigation.navigate("MapBoxScreen")}
                  />
                )}
              />
            }
            theme={{
              ...DefaultTheme,
              roundness: 10,
              colors: { primary: "#0C8A7B", background: "black" },
            }}
            style={{
              backgroundColor: "white",
              borderColor: isFocused ? "#0C8A7B" : "#808080",
              color: "black",
            }}
          />
        </Pressable>
        <Modal
          animationType="slide"
          visible={isModal}
          presentationStyle="overFullScreen"
          onRequestClose={() => setIsModal(!isModal)}
        >
          <View style={styles.centeredView}>
            <View>
              <MapboxPlacesAutocomplete
                id="origin"
                placeholder="Pickup Address"
                value={pickUp}
                accessToken={mapboxToken}
                onPlaceSelect={(data) => {
                  setPickUp(data.place_name);
                  setIsModal(false);
                  setPickupError(false);
                  console.log(data.geometry.coordinates[0]);
                  setPickupLong(data.geometry.coordinates[0]);
                  setPickupLat(data.geometry.coordinates[1]);
                }}
                onClearInput={({ id }) => {
                  id === "origin" && setPickUp(null);
                }}
                countryId="IN"
                inputStyle={{
                  backgroundColor: "white",
                  borderWidth: 1,
                  borderRadius: 10,
                  height: "150%",
                }}
                containerStyle={{
                  marginTop: 15,

                  width: "92%",

                  alignSelf: "center",
                }}
              />
            </View>
          </View>
        </Modal>

        {pickUpError ? (
          <Text
            style={{ color: "red", alignSelf: "flex-start", marginLeft: 25 }}
          >
            Select pickup loacation
          </Text>
        ) : null}
        {/*deliver to view */}
        <Pressable style={styles.textinputsView} onPress={() => handleFocus0()}>
          <TextInput
            label="Deliver to"
            mode="outlined"
            selection={{ start: 0 }}
            editable={false}
            value={deliverTo}
            onChangeText={(text) => {
              setDeliverTo(text);
            }}
            onFocus={handleFocus0}
            // onBlur={handleBlur0}
            right={
              <TextInput.Icon
                icon={() => (
                  <Entypo name="location-pin" size={24} color="orange" />
                )}
              />
            }
            theme={{
              ...DefaultTheme,
              roundness: 10,
              colors: { primary: "#0C8A7B", background: "black" },
            }}
            style={{
              backgroundColor: "white",
              borderColor: isFocused ? "#0C8A7B" : "#808080",
              color: "black",
            }}
          />
        </Pressable>

        <Modal
          animationType="slide"
          visible={isModal1}
          presentationStyle="overFullScreen"
          onRequestClose={() => setIsModal1(!isModal1)}
        >
          <View style={styles.centeredView}>
            <View>
              <MapboxPlacesAutocomplete
                id="origin"
                placeholder="Destination Address"
                value={deliverTo}
                accessToken={mapboxToken}
                onPlaceSelect={(data) => {
                  setDeliverTo(data.place_name);
                  setDeliverError(false);
                  setIsModal1(false);
                  console.log(data.geometry.coordinates[0]);
                  setDropLong(data.geometry.coordinates[0]);
                  setDropLat(data.geometry.coordinates[1]);
                }}
                onClearInput={({ id }) => {
                  id === "origin" && setDeliverTo(null);
                }}
                countryId="IN"
                inputStyle={{
                  backgroundColor: "white",
                  height: "150%",
                  borderWidth: 1,
                  borderRadius: 8,
                }}
                containerStyle={{
                  marginTop: 15,
                  width: "92%",
                  alignSelf: "center",
                }}
              />
            </View>
          </View>
        </Modal>

        {deliverError ? (
          <Text
            style={{ color: "red", alignSelf: "flex-start", marginLeft: 25 }}
          >
            Select delivery loacation
          </Text>
        ) : null}

        <Pressable
          style={styles.textinputsView}
          onPress={() => {
            setAddTaskError(false);
            setModalVisible(!modalVisible);
          }}
        >
          <TextInput
            editable={false}
            label="Add task details"
            mode="outlined"
            // onPress={() => Keyboard.dismiss()}
            onFocus={handleFocus1}
            onBlur={handleBlur}
            value={checkedItems.join(", ")}
            multiline={true}
            right={
              <TextInput.Icon
                icon={() =>
                  !modalVisible ? (
                    <AntDesign name="down" size={24} color="black" />
                  ) : (
                    <AntDesign name="up" size={24} color="black" />
                  )
                }
                onPress={handleModal}
              />
            }
            theme={{
              ...DefaultTheme,
              roundness: 10,
              colors: { primary: "#0C8A7B", background: "black" },
            }}
            style={{
              backgroundColor: "white",
              borderColor: isFocused ? "#0C8A7B" : "#808080",
              color: "black",
            }}
          />
        </Pressable>

        {addTaskError && !modalVisible ? (
          <Text
            style={{ color: "red", alignSelf: "flex-start", marginLeft: 25 }}
          >
            please select item
          </Text>
        ) : null}

        {modalVisible && (
          <View style={styles.modalViewhere}>
            <ScrollView>
              {colorList.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={{
                    flexDirection: "row",
                    marginBottom: 12,
                    marginTop: 3,
                    marginLeft: 8,
                    alignItems: "center",
                  }}
                  onPress={() => {
                    if (checkedItems.includes(item.name)) {
                      setCheckedItems(
                        checkedItems.filter((name) => name !== item.name)
                      );
                    } else {
                      setCheckedItems([...checkedItems, item.name]);
                    }
                  }}
                >
                  <SvgUri
                    width={28}
                    height={28}
                    style={{ marginRight: 10 }}
                    source={{ uri: api + item.path }}
                  />

                  <Text style={{}}>{item.name}</Text>
                  <CustomCheckbox
                    item={item}
                    isChecked={checkedItems.includes(item.name)}
                    onToggle={(item) => {
                      if (checkedItems.includes(item.name)) {
                        setCheckedItems(
                          checkedItems.filter((name) => name !== item.name)
                        );
                      } else {
                        setCheckedItems([...checkedItems, item.name]);
                      }
                    }}
                  />
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}
        {!modalVisible && (
          <View style={{ marginTop: "4%", width: "90%", height: 150 }}>
            <TextInput
              label="Instructions"
              mode="outlined"
              value={instruction}
              onChangeText={handleTextChange}
              // onFocus={handleFocus}
              // onBlur={handleBlur}

              multiline
              numberOfLines={6}
              maxLength={500}
              theme={{
                ...DefaultTheme,
                roundness: 10,
                colors: { primary: "#0C8A7B", background: "black" },
              }}
              style={{
                textAlignVertical: "",
                // height: 100,
                backgroundColor: "white",
                borderColor: isFocused ? "#0C8A7B" : "#808080",
                color: "black",
              }}
            />
          </View>
        )}
        {instruction.length > 500 && (
          <Text
            style={{ color: "red", alignSelf: "flex-start", marginLeft: 25 }}
          >
            Instructions should not exceed 500 characters.
          </Text>
        )}

        {instructionError ? (
          <Text
            style={{ color: "red", alignSelf: "flex-start", marginLeft: 25 }}
          >
            Please write something
          </Text>
        ) : null}

        <View style={styles.buttonView}>
          <TouchableOpacity
            style={{
              width: "100%",
              height: 53,
              backgroundColor: "black",
              borderRadius: 10,
              justifyContent: "center",
              alignItems: "center",
            }}
            onPress={() => handleSubmit()}
          >
            <Text style={{ color: "white" }}>Submit</Text>
          </TouchableOpacity>
        </View>
        <Snackbar
          visible={show}
          duration={1000}
          onDismiss={() => setShow(false)}
        >
          {apiError}
        </Snackbar>
        <CheckInternet />
      </ScrollView>
    </>
  );
};

export default TaskScreen1;

const styles = StyleSheet.create({
  mainView: {
    backgroundColor: "white",
    alignItems: "center",
    // flex: 1,
    flexGrow: 1,
  },
  textinputsView: {
    marginTop: "4%",
    width: "90%",
  },
  modalViewhere: {
    marginLeft: 20,
    marginRight: 20,
    backgroundColor: "white",
    borderRadius: 8,
    flexDirection: "row",
    alignSelf: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  buttonView: {
    width: "92%",
    // marginTop: "auto",
    position: "absolute",
    top: deviceHeight - 150,

    // paddingVertical: 10,
    // bottom: 10,
    // position: "absolute",
  },
  centeredView: {
    flex: 1,
  },
  modalView: {
    margin: 20,
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
    borderRadius: 20,
    padding: 10,
    elevation: 2,
  },
  buttonOpen: {
    backgroundColor: "#F194FF",
  },
  buttonClose: {
    backgroundColor: "#2196F3",
    marginTop: "auto",
  },
  textStyle: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
  },
  modalText: {
    marginBottom: 15,
    textAlign: "center",
  },
  centeredVieW: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 22,
  },
  modalVieW: {
    margin: 20,

    borderRadius: 20,
    width: "70%",
    height: "20%",
    justifyContent: "center",
    alignItems: "center",
  },
});
