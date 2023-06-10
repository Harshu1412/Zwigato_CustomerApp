import {
  Text,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  FlatList
} from "react-native";
import React, { useEffect, useState } from "react";
import { Container, CenteredView } from "../styles/styles";
import { Header } from "../components/Header";
import { HorizontalScroll } from "../components/HorizontalScroll";
import { OrderCard } from "../components/OrderCard";
import { StatusBar } from "expo-status-bar";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Titlebar from "../components/TitileBar";
import { View, BackHandler } from "react-native";
import { api } from "../../Api";
import CheckInternet from "../components/CheckInternet";
import messaging from "@react-native-firebase/messaging";
import { useCallback } from "react";
import { Snackbar } from "react-native-paper";

export const OrdersScreen = ({ navigation }) => {
  const [authToken, setAuthToken] = useState("");
  const [orders, setOrders] = useState([]);
  const [list, setList] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [cancel, setCancel] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [show, setShow] = useState(false);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      fetchData();
      setRefreshing(false);
    }, 1000);
  }, [list]);
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

  AsyncStorage.getItem("token").then((token) => {
    setAuthToken(token);
  });
  // console.log(orders);
  const handleListChange = (value) => {
    setIsLoading(true);
    setOrders([]);
    switch (value) {
      case "Pending":
        value = "0";
        break;
      case "Accepted":
        value = "1";
        break;
      case "Completed":
        value = "2";
        break;
      case "Cancelled":
        value = "3";
        break;
      default:
        value = null;
        break;
    }
    setList(value);
  };

  async function fetchData() {
    setIsLoading(true);

    let token = "";
    try {
      token = await AsyncStorage.getItem("token");
    } catch (error) {
      // console.log("cannot get token", error);
    }

    const requestOptions = {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    };
    try {
      const response = await fetch(`${api}orders/${list}`, requestOptions);
      // console.log(response.ok);
      if (response.ok) {
        const data = await response.json();

        // console.log(data);
        if (data.orders) {
          // setDriver_feedback(data.orders.driver_feedback);
          setOrders(data.orders);
          setIsLoading(false);
        }
      }
    } catch (error) {
      // console.log(error);
      if (error.message === "Network request failed") {
        setShow(true);
        setApiError(
          "Network request failed. Please check your internet connection."
        );
      }
      setIsLoading(false);
    }
  }

  const showApiError = () =>{
    setShow(true)
    setApiError("Network request failed.")
  }

  useEffect(() => {
    if (authToken) {
      fetchData();
    }
  }, [authToken, list]);

  const convertDate = (str) => {
    const date = new Date(str);

    const options = {
      day: "numeric",
      month: "short",
      year: "numeric",
    };
    const formattedDate = date.toLocaleDateString("en-US", options);

    const timeOptions = {
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    };
    const formattedTime = date.toLocaleTimeString("en-US", timeOptions);
    const finalFormattedDate = `${formattedDate}, ${formattedTime}`;
    return finalFormattedDate;
  };
  // console.log(orders[0].Payment.last4);

  useEffect(() => {
    const unsubscribe = messaging().onMessage(async (remoteMessage) => {
      title = JSON.stringify(remoteMessage);
      const jsonObj = JSON.parse(title);
      console.log("-----------------", jsonObj);
      if (
        jsonObj.notification.title === "Order Completed" ||
        jsonObj.notification.title === "Order Accepted" || 
        jsonObj.notification.title === "Order Cancelled"
      ) {
        fetchData();
      }
    });
    return unsubscribe;
  }, [list]);
  const renderItems = (item) => {
    // console.log(item.Card);
    let lastDigit = "";
    let cardName = "";
    if(item.Card !== null){

      lastDigit = item.Card.card_no
      cardName = item.Card.name
      if(lastDigit === null || lastDigit === ""){
        lastDigit ="4242"
      }
      if(cardName === null || cardName === ""){
        cardName = "visa"
      }
    } else{
      lastDigit = "4242"
      cardName = "mastercard"
    }
    // console.log(cardName);
    return (
      <OrderCard
        key={item.order_id}
        user_id={item.user_id}
        orderId={item.order_id}
        item_type={item.category_item_type}
        status={item.status || item.order_status}
        Pickup_from={item.pickup_from}
        Deliver_To={item.deliver_to}
        Billing_Details={item.billing_details}
        timing={convertDate(item.createdAt)}
        pickup_latitude={item.pickup_latitude}
        pickup_longitude={item.pickup_longitude}
        delivery_latitude={item.delivery_latitude}
        delivery_longitude={item.delivery_longitude}
        driver_id={item.driver_id}
        distance={item.distance_km}
        driver_feedback={item.driver_feedback}
        completed_timing={item.order_completed_time || ""}
        order_pin={item.order_pin}
        fetchData={fetchData}
        addtional_charge={item.additional_charge}
        instruction={item.instruction}
        showApiError={showApiError}
        lastDigit = {lastDigit}
        cardName = {cardName}
      />
    );
  };

  return (
    <View flex={1}>
      <View marginHorizontal="5%">
        <Titlebar title="Orders" />
      </View>
      <HorizontalScroll inputSelect={handleListChange} />
      {isLoading ? (
        <CenteredView>
          <ActivityIndicator size="large" color="#0000ff" />
        </CenteredView>
      ) : orders.length === 0 ? (
        <CenteredView>
          <Text>No Order Yet! Place an order!!!</Text>
        </CenteredView>
      ) : (
        // <ScrollView
        //   showsVerticalScrollIndicator={false}
        //   refreshControl={
        //     <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        //   }
        // >
        //   {orders.map((order) => (
        //     <OrderCard
        //       key={order.order_id}
        //       user_id={order.user_id}
        //       orderId={order.order_id}
        //       item_type={order.category_item_type}
        //       status={order.status || order.order_status}
        //       Pickup_from={order.pickup_from}
        //       Deliver_To={order.deliver_to}
        //       Billing_Details={order.billing_details}
        //       timing={convertDate(order.createdAt)}
        //       pickup_latitude={order.pickup_latitude}
        //       pickup_longitude={order.pickup_longitude}
        //       delivery_latitude={order.delivery_latitude}
        //       delivery_longitude={order.delivery_longitude}
        //       driver_id={order.driver_id}
        //       distance={order.distance_km}
        //       driver_feedback={order.driver_feedback}
        //       completed_timing={order.order_completed_time || ""}
        //       order_pin={order.order_pin}
        //       fetchData={fetchData}
        //       addtional_charge={order.additional_charge}
        //       instruction={order.instruction}
        //     />
        //   ))}
        // </ScrollView>
        <FlatList
          data={orders}
          keyExtractor={(item) => item.order_id}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          renderItem={({ item }) => renderItems(item)}
        />

      )}
      <Snackbar visible={show} duration={1000} onDismiss={() => setShow(false)}>
        {apiError}
      </Snackbar>
      <CheckInternet />
      <StatusBar style="dark" />
    </View>
  );
};
