import { Image, StyleSheet, View, ActivityIndicator, Modal, Pressable,Text } from "react-native";
import React, { useEffect, useState } from "react";
import { BorderButton, WhiteButton } from "../components/Button";
import { useNavigation } from "@react-navigation/native";
import { Footer, ButtonView, Heading, Subheading } from "../styles/styles";
import { StatusBar } from "expo-status-bar";
import AsyncStorage from "@react-native-async-storage/async-storage";
import CheckInternet from "../components/CheckInternet";

const HomeScreen = () => {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);

  const LoginScreen = () => {
    navigation.navigate("Login");
  };
  const RegisterScreen = () => {
    navigation.navigate("Register");
  };

  useEffect(() => {
    const checkAutoLogin = async () => {
      // Retrieve the stored JWT token and creation time from AsyncStorage
      const token = await AsyncStorage.getItem("token");
      const creationTime = await AsyncStorage.getItem("creationTime");

      const success = await AsyncStorage.getItem("Sucess");
      if (token && creationTime && success) {
        const currentTime = new Date().getTime();
        const tokenCreationTime = new Date(parseInt(creationTime, 10));

        // Check if the token is within the desired timeframe (e.g., 1 week)
        const weekInMilliseconds = 15 * 24 * 60 * 60 * 1000;
        // const weekInMilliseconds = 0.2 * 60 * 1000;
        if (currentTime - tokenCreationTime <= weekInMilliseconds) {
          navigation.replace("Main"); // Replace with the appropriate screen name
        } else {
          // setLoading(false);
          setModalVisible(!modalVisible)
          AsyncStorage.clear();
          
        }
      }

      setLoading(false);
    };

    checkAutoLogin();
  }, []);

  return (
    <View style={styles.container}>
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          Alert.alert('Modal has been closed.');
          setModalVisible(!modalVisible);
        }}>
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={styles.modalText}>Your session has expired!</Text>
            <Text style={styles.modalText}>Please Login!</Text>

            <Pressable
              style={[styles.button, styles.buttonClose]}
              onPress={() => {setModalVisible(!modalVisible)
                navigation.navigate('Login')
              }}>
              <Text style={styles.textStyle}>Login</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
      {loading ? (
        <ActivityIndicator size="large" color="#0c8a7b" />
      ) : (
        <>
          <Image source={require("../../assets/logo.png")} marginTop="auto" />
          <Footer>
            <Heading>Welcome</Heading>
            <Subheading>
              "Deliver Now to your preferable location instant" means that you
              want the item to be delivered to your preferred location
              immediately.
            </Subheading>
            <ButtonView>
              <WhiteButton onPress={RegisterScreen} title="Sign up" bg="#fff" />
              <BorderButton
                onPress={LoginScreen}
                title="Sign in"
                bg="#0C8A7B"
              />
            </ButtonView>
          </Footer>
          <CheckInternet />
        </>
      )}
      <StatusBar style="dark" />
    </View>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontFamily: "Montserrat-Regular",
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22,
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  button: {
    borderRadius: 10,
    padding: 10,
    elevation: 2,
  },
  buttonOpen: {
    backgroundColor: '#0C8A7B',
  },
  buttonClose: {
    backgroundColor: '#0C8A7B',
  },
  textStyle: {
    color: 'white',
    // fontWeight: 'bold',
    textAlign: 'center',
    fontFamily: "Montserrat_600SemiBold",
    paddingHorizontal:25
  },
  modalText: {
    marginBottom: 15,
    textAlign: 'center',
    fontFamily: "Montserrat_400Regular",

  },
});
