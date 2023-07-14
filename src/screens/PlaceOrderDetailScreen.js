import {
  ActivityIndicator,
  Image,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  Modal,
  Dimensions,
} from "react-native";
import React, { useState, useEffect, useLayoutEffect } from "react";
import { TextInput, DefaultTheme, Snackbar } from "react-native-paper";
import { Entypo } from "@expo/vector-icons";
import { EvilIcons } from "@expo/vector-icons";
// import { useRoute } from "@react-navigation/native";
import { Keyboard } from "react-native";
import Titlebar from "../components/TitileBar";
import Buttons from "../components/Button";
import { api } from "../../Api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ScrollView } from "react-native";
import CheckInternet from "../components/CheckInternet";
import Mapbox from "@rnmapbox/maps";
import Maps from "../components/Maps";

Mapbox.setWellKnownTileServer("Mapbox");

const PlaceOrderDetailScreen = ({ route }) => {
  const {
    inst,
    pickUp,
    deliverTo,
    checkedItems,
    tokenId,
    pickupLat,
    pickupLong,
    dropLat,
    dropLong,
  } = route.params;

  const [isFocused, setIsFocused] = useState(false);
  const [taskdetails, setTaskdetails] = useState();
  const [authToken, setAuthToken] = useState("");
  const [price, setPrice] = useState("");
  const [loading, setLoading] = useState(true);
  const [distanceFee, setDistanceFee] = useState("");
  const [distance, setDistance] = useState("");
  const [itemPrice, setItemPrice] = useState("");
  const [apiError, setApiError] = useState(null);
  const [show, setShow] = useState(false);

  const [mapboxToken, setMapboxToken] = useState("");
  AsyncStorage.getItem("-MapboxToken").then((token) => {
    setMapboxToken(token);
  });

  Mapbox.setAccessToken(mapboxToken);
  AsyncStorage.getItem("token").then((token) => {
    setAuthToken(token);
  });
  const handleFocus = () => {
    Keyboard.dismiss();
    setIsFocused(true);
  };
  const handleBlur = () => {
    setIsFocused(false);
  };

  const gettaskDetails = async () => {
    const requestOptions = {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
    };
    try {
      const response = await fetch(api + "taskdetails", requestOptions);
      const json = await response.json();
      setDistanceFee(json.taskupdate.additional_charge);
      setLoading(false);
      setDistance(json.taskupdate.distance_km);
      setTaskdetails(json.taskupdate);
      setPrice(json.taskupdate.billing_details);
      itemfee = Math.abs(
        json.taskupdate.billing_details - json.taskupdate.additional_charge
      );
      setItemPrice(itemfee);
    } catch (error) {
      setLoading(false);
      if (error.message === "Network request failed") {
        setShow(true);
        setApiError(
          "Network request failed. Please check your internet connection."
        );
      }
      console.log(error);
    }
  };
  useEffect(() => {
    if (
      authToken !== null &&
      authToken !== undefined &&
      authToken.length !== 0
    ) {
      gettaskDetails();
    }
  }, [authToken, tokenId]);

  const MapImage = require("../../assets/MapImage.png");

  return (
    <>
      {loading && (
        <View>
          <Modal animationType="slide" transparent={true} visible={loading}>
            <View style={styles.centeredView}>
              <View style={styles.modalView}>
                <ActivityIndicator size={40} />
              </View>
            </View>
          </Modal>
        </View>
      )}
      <>
        <View
          style={{
            width: "103%",
            marginTop: 10,
            backgroundColor: "white",
            alignSelf: "center",
            paddingHorizontal: "5%",
          }}
        >
          <Titlebar title={"Order Details"} />
        </View>
        <ScrollView contentContainerStyle={{}}>
          <View
            style={{
              backgroundColor: "white",
              alignItems: "center",
              flex: 1,
            }}
          >
            <View style={{ marginTop: "1%", width: "92%" }}>
              <TextInput
                label="Pickup from"
                mode="outlined"
                value={pickUp}
                editable={false}
                multiline
                onFocus={handleFocus}
                onBlur={handleBlur}
                right={
                  <TextInput.Icon
                    icon={() => (
                      <EvilIcons name="location" size={24} color="black" />
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
            </View>
            <View style={{ marginTop: 15, width: "92%" }}>
              <TextInput
                label="Deliver to"
                mode="outlined"
                value={deliverTo}
                editable={false}
                multiline
                onFocus={handleFocus}
                onBlur={handleBlur}
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
            </View>
            <View
              style={{
                padding: 10,
                flexWrap: "wrap",
                marginTop: 15,
                backgroundColor: "white",
                borderRadius: 8,
                width: "92%",
                flexDirection: "row",
                alignItems: "center",
                alignSelf: "center",
                shadowColor: "#000",
                shadowOffset: {
                  width: 0,
                  height: 2,
                },
                shadowOpacity: 0.25,
                shadowRadius: 3.84,
                elevation: 4,
              }}
            >
              <Text
                style={{
                  fontWeight: "400",
                  fontSize: 14,
                  fontFamily: "Montserrat_400Regular",
                }}
              >
                Item Type :
              </Text>
              <Text
                style={{
                  flexWrap: "wrap",
                  fontFamily: "Montserrat_400Regular",
                }}
              >
                {checkedItems.join(",  ")}
              </Text>
            </View>
            <View
              style={{
                width: "92%",
                paddingVertical: 10,
                borderWidth: 1,
                marginTop: 15,
                borderRadius: 8,
                borderColor: "#D8D6D4",
              }}
            >
              <View style={{ marginTop: 13, marginLeft: 16 }}>
                <Text
                  style={{
                    fontFamily: "Montserrat_600SemiBold",
                    fontSize: 14,
                  }}
                >
                  Billing Details
                </Text>
              </View>
              <View style={{ flexDirection: "row" }}>
                <View
                  style={{
                    marginLeft: 16,
                    marginTop: 10,
                  }}
                >
                  <Text
                    style={{
                      marginLeft: 3,
                      color: "#000",
                      fontWeight: "500",
                      fontSize: 14,
                      fontFamily: "Montserrat_400Regular",
                    }}
                  >
                    Item Fee
                  </Text>
                </View>
                <View
                  style={{ marginTop: 10, position: "absolute", right: 25 }}
                >
                  <Text
                    style={{
                      fontWeight: "600",
                      fontSize: 14,
                      fontFamily: "Montserrat_600SemiBold",
                    }}
                  >
                    $ {itemPrice}
                  </Text>
                </View>
              </View>
              <View style={{ flexDirection: "row" }}>
                <View
                  style={{
                    borderBottomWidth: 1,
                    marginLeft: 16,
                    marginTop: 10,
                    borderStyle: "dotted",
                    borderColor: "#B4B4B4",
                  }}
                >
                  <Text
                    style={{
                      marginLeft: 3,
                      color: "#0AB7EE",
                      fontWeight: "500",
                      fontSize: 14,
                      fontFamily: "Montserrat_400Regular",
                    }}
                  >
                    Delivery fee for {distance} km
                  </Text>
                </View>
                <View
                  style={{ marginTop: 10, position: "absolute", right: 25 }}
                >
                  <Text
                    style={{
                      fontWeight: "600",
                      fontSize: 14,
                      fontFamily: "Montserrat_600SemiBold",
                    }}
                  >
                    + $ {distanceFee}
                  </Text>
                </View>
              </View>

              <View
                style={{
                  borderBottomWidth: 1,
                  marginTop: 16,
                  marginLeft: 16,
                  marginRight: 16,
                  borderColor: "#B4B4B4",
                }}
              ></View>
              <View style={{ flexDirection: "row" }}>
                <View style={{ marginLeft: 16, marginTop: 14 }}>
                  <Text
                    style={{
                      fontFamily: "Montserrat_600SemiBold",
                      fontSize: 14,
                    }}
                  >
                    To Pay
                  </Text>
                </View>
                <View
                  style={{ marginTop: 14, position: "absolute", right: 25 }}
                >
                  <Text
                    style={{
                      fontFamily: "Montserrat_600SemiBold",
                      fontSize: 14,
                    }}
                  >
                    $ {price}
                  </Text>
                </View>
              </View>
            </View>
          </View>
          <View
            style={{
              backgroundColor: "white",
              alignItems: "center",
              flex: 1,
            }}
          >
            <View
              style={{
                width: "100%",
                height: 200,
                marginTop: 14,
                alignItems: "center",
              }}
            >
              <Maps
                pickupLong={pickupLong}
                pickupLat={pickupLat}
                dropLong={dropLong}
                dropLat={dropLat}
              />
            </View>
            <View
              style={{
                marginTop: 15,
                backgroundColor: "white",
                borderRadius: 8,
                width: "92%",
                alignSelf: "center",
                shadowColor: "#000",
                shadowOffset: {
                  width: 0,
                  height: 2,
                },
                shadowOpacity: 0.25,
                shadowRadius: 3.84,
                elevation: 4,
              }}
            >
              <View style={{ marginTop: 13, marginLeft: 15 }}>
                <Text
                  style={{
                    fontSize: 14,
                    fontFamily: "Montserrat_600SemiBold",
                  }}
                >
                  Instruction
                </Text>
              </View>
              <View style={{ marginTop: 5, marginLeft: 15, marginBottom: 5 }}>
                <Text
                  style={{
                    fontSize: 12,
                    fontFamily: "Montserrat_400Regular",
                  }}
                >
                  {inst}
                </Text>
              </View>
            </View>
            <View
              style={{
                marginTop: "auto",
                paddingVertical: 10,
                width: "92%",
              }}
            >
              <Buttons
                Name={"Payment"}
                press={"Pay"}
                tokenId={tokenId}
                price={price}
                distance={distance}
              />
            </View>
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
    </>
  );
};

export default PlaceOrderDetailScreen;

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 22,
  },
  modalView: {
    margin: 20,

    borderRadius: 20,
    width: "70%",
    height: "20%",
    justifyContent: "center",
    alignItems: "center",
  },
  markerContainer: {
    height: 50,
    width: 50,
    alignItems: "center",
    justifyContent: "center",
  },
  markerImage: {
    height: 40,
    width: 40,
  },
});
