import { SWMANSION_URL } from "@/config/constants";
import { Image } from "expo-image";
import React from "react";
import { Linking, StyleSheet, TouchableOpacity } from "react-native";

export function SWMLogo() {
  return (
    <TouchableOpacity onPress={() => Linking.openURL(SWMANSION_URL)}>
      <Image
        source={require("@/assets/svg/swmansion-logo.svg")}
        style={styles.companyLogo}
        contentFit="contain"
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  companyLogo: {
    height: 48,
    width: 100,
  },
});
