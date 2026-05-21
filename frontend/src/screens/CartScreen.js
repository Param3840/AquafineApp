import { Plus } from "lucide-react-native";
import React from "react";
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import QuantityControl from "../components/QuantityControl";
import { colors } from "../styles/theme";

const CartScreen = ({ cart, total, getQuantity, onAdd, onDecrease, onCheckout }) => (
  <ScrollView contentContainerStyle={styles.page}>
    <Text style={styles.title}>Cart</Text>
    {cart.length ? (
      cart.map((item) => (
        <View key={item.id} style={styles.lineItem}>
          <Image source={item.image} style={styles.image} />
          <View style={styles.info}>
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.meta}>Rs. {item.price} / {item.pcs} pcs</Text>
          </View>
          <QuantityControl
            compact
            quantity={getQuantity(item.id)}
            onDecrease={() => onDecrease(item)}
            onIncrease={() => onAdd(item)}
          />
        </View>
      ))
    ) : (
      <Text style={styles.empty}>Cart is empty</Text>
    )}
    {!!cart.length && (
      <View style={styles.totalBox}>
        <View>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValue}>Rs. {total}</Text>
        </View>
        <TouchableOpacity style={styles.checkoutButton} onPress={onCheckout}>
          <Text style={styles.checkoutText}>Checkout</Text>
        </TouchableOpacity>
      </View>
    )}
  </ScrollView>
);

export default CartScreen;

export const ProductLineItem = ({ item, quantity, onAdd, onDecrease }) => (
  <View style={styles.lineItem}>
    <Image source={item.image} style={styles.image} />
    <View style={styles.info}>
      <Text style={styles.name}>{item.name}</Text>
      <Text style={styles.meta}>Rs. {item.price} / {item.pcs} pcs</Text>
    </View>
    {quantity > 0 ? (
      <QuantityControl compact quantity={quantity} onDecrease={onDecrease} onIncrease={onAdd} />
    ) : (
      <TouchableOpacity style={styles.smallAction} onPress={onAdd}>
        <Plus size={16} color={colors.white} />
      </TouchableOpacity>
    )}
  </View>
);

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
  lineItem: {
    alignItems: "center",
    backgroundColor: colors.white,
    borderColor: colors.border,
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: "row",
    marginBottom: 12,
    padding: 10,
  },
  image: {
    height: 64,
    resizeMode: "contain",
    width: 58,
  },
  info: {
    flex: 1,
    marginLeft: 12,
  },
  name: {
    color: colors.slate,
    fontSize: 14,
    fontWeight: "900",
  },
  meta: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: "700",
    marginTop: 5,
  },
  smallAction: {
    alignItems: "center",
    backgroundColor: colors.teal,
    borderRadius: 12,
    height: 34,
    justifyContent: "center",
    width: 34,
  },
  totalBox: {
    alignItems: "center",
    backgroundColor: colors.white,
    borderColor: "#dbeafe",
    borderRadius: 20,
    borderWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
    padding: 16,
  },
  totalLabel: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: "800",
  },
  totalValue: {
    color: colors.slate,
    fontSize: 22,
    fontWeight: "900",
    marginTop: 3,
  },
  checkoutButton: {
    alignItems: "center",
    backgroundColor: colors.teal,
    borderRadius: 15,
    justifyContent: "center",
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  checkoutText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: "900",
  },
});
