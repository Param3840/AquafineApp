import React from "react";
import { ScrollView, StyleSheet, Text } from "react-native";
import { ProductLineItem } from "./CartScreen";
import { colors } from "../styles/theme";

const WishlistScreen = ({ wishlist, getQuantity, onAdd, onDecrease }) => (
  <ScrollView contentContainerStyle={styles.page}>
    <Text style={styles.title}>Wishlist</Text>
    {wishlist.length ? (
      wishlist.map((item) => (
        <ProductLineItem
          key={item.id}
          item={item}
          quantity={getQuantity(item.id)}
          onAdd={() => onAdd(item)}
          onDecrease={() => onDecrease(item)}
        />
      ))
    ) : (
      <Text style={styles.empty}>Wishlist is empty</Text>
    )}
  </ScrollView>
);

export default WishlistScreen;

const styles = StyleSheet.create({
  page: {
    paddingBottom: 108,
    paddingHorizontal: 18,
    paddingTop: 48,
  },
  title: {
    color: colors.slate,
    fontSize: 26,
    fontWeight: "900",
    marginBottom: 18,
  },
  empty: {
    color: colors.muted,
    fontSize: 15,
    fontWeight: "700",
  },
});
