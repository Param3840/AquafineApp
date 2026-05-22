import React from "react";
import { ScrollView, StyleSheet, Text } from "react-native";
import { ProductLineItem } from "./CartScreen";
import { useTheme } from "../context/ThemeContext";

const WishlistScreen = ({ wishlist, getQuantity, onAdd, onDecrease, onPressProduct }) => {
  const { colors } = useTheme();

  return (
    <ScrollView contentContainerStyle={styles.page}>
      <Text style={[styles.title, { color: colors.slate }]}>Wishlist</Text>
      {wishlist.length ? (
        wishlist.map((item) => (
          <ProductLineItem
            key={item.id}
            item={item}
            quantity={getQuantity(item.id)}
            onAdd={() => onAdd(item)}
            onDecrease={() => onDecrease(item)}
            onPress={onPressProduct}
          />
        ))
      ) : (
        <Text style={[styles.empty, { color: colors.muted }]}>Wishlist is empty</Text>
      )}
    </ScrollView>
  );
};

export default WishlistScreen;

const styles = StyleSheet.create({
  page: {
    paddingBottom: 108,
    paddingHorizontal: 18,
    paddingTop: 48,
  },
  title: {
    fontSize: 26,
    fontWeight: "900",
    marginBottom: 18,
  },
  empty: {
    fontSize: 15,
    fontWeight: "700",
  },
});
