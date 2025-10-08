import { Image as ExpoImage } from "expo-image";
import { memo } from "react";
import { StyleSheet } from "react-native";
import { ImageViewProps } from "./types";
const blurhash =
  "|rF?hV%2WCj[ayj[a|j[az_NaeWBj@ayfRayfQfQM{M|azj[azf6fQfQfQIpWXofj[ayj[j[fQayWCoeoeaya}j[ayfQa{oLj?j[WVj[ayayj[fQoff7azayj[ayj[j[ayofayayayj[fQj[ayayj[ayfjj[j[ayjuayj[";

export const ExpoImageComponent = memo(function ExpoImageComponent({
  uri,
  itemSize,
}: ImageViewProps) {
  return (
    <ExpoImage
      source={{ uri }}
      decodeFormat="rgb"
      // Disable caching to have reproducible results
      cachePolicy="memory-disk"
      recyclingKey={uri}
      placeholder={{ blurhash }}
      transition={1000}
      style={[styles.image, { width: itemSize, height: itemSize }]}
    />
  );
});

const styles = StyleSheet.create({
  image: {
    borderWidth: 1,
    borderColor: "grey",
  },
});
