import { StyleSheet, Text, View, Image } from "react-native";
import React, { useState } from "react";
import Mapbox from "@rnmapbox/maps";
import AsyncStorage from "@react-native-async-storage/async-storage";

Mapbox.setWellKnownTileServer("Mapbox");

const Maps = ({ pickupLong, pickupLat, dropLong, dropLat }) => {
  const [mapboxToken, setMapboxToken] = useState("");
  AsyncStorage.getItem("-MapboxToken").then((token) => {
    setMapboxToken(token);
  });

  Mapbox.setAccessToken(mapboxToken);
  return (
    <View
      pointerEvents="none"
      style={{ width: "92%", height: "100%", borderWidth: 1 }}
    >
      <Mapbox.MapView style={{ width: "100%", height: "100%" }}>
        <Mapbox.Camera zoomLevel={12} centerCoordinate={[dropLong, dropLat]} />

        <Mapbox.MarkerView
          id="markerId"
          coordinate={[dropLong, dropLat]}
          anchor={{ x: 0.5, y: 1 }}
        >
          <View style={styles.markerContainer}>
            <Image
              source={require("../../assets/hom-loc.png")}
              style={styles.markerImage}
            />
          </View>
        </Mapbox.MarkerView>

        {/* <Mapbox.MarkerView
                  id="markerId"
                  coordinate={[pickupLong, pickupLat]}
                  anchor={{ x: 0.5, y: 1 }}
                >
                  <View style={styles.markerContainer}>
                    <Image
                      source={require("../../assets/pickup-loc.png")}
                      style={styles.markerImage}
                    />
                  </View>
                </Mapbox.MarkerView> */}

        <Mapbox.ShapeSource
          id="lineSource"
          shape={{
            type: "FeatureCollection",
            features: [
              {
                type: "Feature",
                geometry: {
                  type: "LineString",
                  coordinates: [
                    [pickupLong, pickupLat],
                    [dropLong, dropLat],
                  ],
                },
              },
            ],
          }}
        >
          <Mapbox.LineLayer
            id="lineLayer"
            style={{
              lineWidth: 3,
              lineColor: "blue",
            }}
          />
        </Mapbox.ShapeSource>
      </Mapbox.MapView>
    </View>
  );
};

export default Maps;

const styles = StyleSheet.create({
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
