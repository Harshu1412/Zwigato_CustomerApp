import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  ActivityIndicator,
  Modal,
} from "react-native";
import React, { useEffect, useState } from "react";
// import Ionicons from "react-native-vector-icons/Ionicons";
import { Ionicons } from '@expo/vector-icons'; 
import { Snackbar } from "react-native-paper";
import Titlebar from "../components/TitileBar";
import CustomOutlinedTextInput from "../components/CustomOutlinedTextInput";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { api } from "../../Api";
import App from "../../App";
import CheckInternet from "../components/CheckInternet";
import { ToastAndroid } from "react-native";

const deviceHeight = Dimensions.get("window").height;

const Feedback = ({ route }) => {
  const { driver_orderId, fetchData } = route.params;
  const navigation = useNavigation();
  const [authToken, setAuthToken] = useState("");
  const [comment, setComment] = useState("");
  const [rating, setRating] = useState(0);
  const [pressed, setPressed] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [driverName, setDriverName] = useState("");
  const [image, setImage] = useState("");
  const [loader, setLoader] = useState(true);
  const [apiError, setApiError] = useState(null);
  const [show, setShow] = useState(false);

  AsyncStorage.getItem("token").then((token) => {
    setAuthToken(token);
  });
  const StarRating = () => {
    const handleRating = (index) => {
      setPressed(true);
      setRating(index);
      // console.log(rating);
    };

    const stars = [];
    for (let i = 1; i <= 5; i++) {
      const name = i <= rating ? "star-sharp" : "star-outline";
      const color = pressed && i <= rating ? "#ffd700" : "#c7c7c7";
      stars.push(
        <TouchableOpacity key={i} onPress={() => handleRating(i)}>
          <Ionicons name={name} size={34} color={color} />
        </TouchableOpacity>
      );
    }
    return <View style={styles.container}>{stars}</View>;
  };

  const handleSubmit = async () => {
    if (rating === 0 || comment.length === 0) {
      setSnackbarVisible(true);
    } else {
      const trimmedComment = comment.trim();
      const requestOptions = {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          comment: trimmedComment,
          stars: rating,
          order_id: driver_orderId,
        }),
      };

      try {
        await fetch(api + "feedback/save", requestOptions).then((response) => {
          response.json().then((data) => {
            // console.log(data);
            ToastAndroid.showWithGravityAndOffset(
              "Feedback Given Successfully!",
              ToastAndroid.SHORT,
              ToastAndroid.BOTTOM,
              25,
              50
            );
            console.log(trimmedComment);
            fetchData();
            navigation.goBack();
          });
        });
      } catch (error) {
        if (error.message === "Network request failed") {
          setShow(true);
          setApiError(
            "Network request failed. Please check your internet connection."
          );
        }
        console.error(error);
      }
    }
  };

  useEffect(() => {
    if (
      authToken !== null &&
      authToken !== undefined &&
      authToken.length !== 0
    ) {
      getDriverData();
    }
  }, [authToken]);

  const getDriverData = async () => {
    setLoader(true);
    console.log("calls");
    // console.log("a gya mai", driver_orderId);
    const requestOptions = {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
    };
    try {
      await fetch(
        `${api}feedback/driver_feedback/${driver_orderId}`,
        requestOptions
      ).then((response) => {
        console.log(response.ok);
        response.json().then((data) => {

          const firstName = data.data.name.split(" ")[0];
          setDriverName(firstName);
          // setDriverName(data.data.name);
          setImage(api + data.data.photo_uri);
          setLoader(false);
        });
      });
    } catch (error) {
      console.error("=============", error);
      if (error.message === "Network request failed") {
        setShow(true);
        setApiError(
          "Network request failed. Please check your internet connection."
        );
      }
      setLoader(false);
    }
  };

  return (
    <>
      {loader && (
        <View>
          <Modal animationType="slide" transparent={true} visible={loader}>
            <View style={styles.centeredView}>
              <View style={styles.modalView}>
                <ActivityIndicator size={40} />
              </View>
            </View>
          </Modal>
        </View>
      )}
      <>
        <View style={{ width: "90%", marginTop: 5, alignSelf: "center" }}>
          <Titlebar title={"Feedback"} />
        </View>
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, alignItems: "center" }}
        >
          <View
            style={{
              height: "77%",
              width: "90%",
              alignItems: "center",
            }}
          >
            <Image
              style={{
                width: 110,
                height: 110,
                borderRadius: 55,
              }}
              source={{
                uri: image,
              }}
            />
            <Text
              style={{
                fontSize: 24,
                fontWeight: "600",
                marginTop: 11,
                marginBottom: 14,
              }}
            >
              {driverName}
            </Text>
            <View
              style={{
                flexDirection: "row",
                width: "55%",
                justifyContent: "space-around",
              }}
            >
              <StarRating />
            </View>
            <Text
              style={{
                fontSize: 24,
                fontWeight: "600",
                marginTop: 10,
                marginBottom: 5,
              }}
            >
              Feedback
            </Text>
            <Text>Share your feedback for driver</Text>
            <View style={{ width: "100%", height: 200 }}>
              <CustomOutlinedTextInput
                numberOfLines={5}
                multiline={true}
                onChangeText={(text) => setComment(text)}
                value={comment}
                label={"Comment"}
                width="100%"
              />
            </View>
          </View>

          <View
            style={{
              position: "absolute",
              top: deviceHeight - 140,
              width: "100%",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <TouchableOpacity
              onPress={() => handleSubmit()}
              style={{
                backgroundColor: "black",
                height: 50,
                width: "90%",
                borderRadius: 7,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text style={{ color: "white" }}>Submit</Text>
            </TouchableOpacity>
          </View>
          <Snackbar
            visible={snackbarVisible}
            onDismiss={() => setSnackbarVisible(false)}
            duration={1000}
          >
            {rating === 0 || comment === ""
              ? "Please enter a comment and rating"
              : ""}
          </Snackbar>
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
const styles = StyleSheet.create({
  container: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 22,
  },
  modalView: {
    margin: 20,
    borderRadius: 20,
    width: "60%",
    height: "20%",
    justifyContent: "center",
    alignItems: "center",
  },
});

export default Feedback;
