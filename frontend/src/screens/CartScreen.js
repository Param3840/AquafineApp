import { Plus } from "lucide-react-native";
import React from "react";
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import QuantityControl from "../components/QuantityControl";
import { useTheme } from "../context/ThemeContext";

const CartScreen = ({ cart, total, getQuantity, onAdd, onDecrease, onCheckout, onPressProduct }) => {
  const { colors, isDarkMode } = useTheme();

  return (
    <ScrollView contentContainerStyle={styles.page}>
      <Text style={[styles.title, { color: colors.slate }]}>Cart</Text>
      {cart.length ? (
        cart.map((item) => (
          <View key={item.id} style={[styles.lineItem, { backgroundColor: colors.white, borderColor: colors.border }]}>
            <TouchableOpacity 
              activeOpacity={0.8} 
              onPress={() => onPressProduct && onPressProduct(item)}
              style={styles.clickableArea}
            >
              <Image source={item.image} style={styles.image} />
              <View style={styles.info}>
                <Text style={[styles.name, { color: colors.slate }]}>{item.name}</Text>
                <Text style={[styles.meta, { color: colors.muted }]}>Rs. {item.price} / {item.pcs} pcs</Text>
              </View>
            </TouchableOpacity>
            <QuantityControl
              compact
              quantity={getQuantity(item.id)}
              onDecrease={() => onDecrease(item)}
              onIncrease={() => onAdd(item)}
            />
          </View>
        ))
      ) : (
        <Text style={[styles.empty, { color: colors.muted }]}>Cart is empty</Text>
      )}
      {!!cart.length && (
        <View style={[styles.totalBox, { backgroundColor: colors.white, borderColor: isDarkMode ? "#1f3135" : "#dbeafe" }]}>
          <View>
            <Text style={[styles.totalLabel, { color: colors.muted }]}>Total</Text>
            <Text style={[styles.totalValue, { color: colors.slate }]}>Rs. {total}</Text>
          </View>
          <TouchableOpacity style={[styles.checkoutButton, { backgroundColor: colors.teal }]} onPress={onCheckout}>
            <Text style={[styles.checkoutText, { color: "#ffffff" }]}>Checkout</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
};

export default CartScreen;

export const ProductLineItem = ({ item, quantity, onAdd, onDecrease, onPress }) => {
  const { colors, isDarkMode } = useTheme();

  return (
    <View style={[styles.lineItem, { backgroundColor: colors.white, borderColor: colors.border }]}>
      <TouchableOpacity 
        activeOpacity={0.8} 
        onPress={() => onPress && onPress(item)}
        style={styles.clickableArea}
      >
        <Image source={item.image} style={styles.image} />
        <View style={styles.info}>
          <Text style={[styles.name, { color: colors.slate }]}>{item.name}</Text>
          <Text style={[styles.meta, { color: colors.muted }]}>Rs. {item.price} / {item.pcs} pcs</Text>
        </View>
      </TouchableOpacity>
      {quantity > 0 ? (
        <QuantityControl compact quantity={quantity} onDecrease={onDecrease} onIncrease={onAdd} />
      ) : (
        <TouchableOpacity style={[styles.smallAction, { backgroundColor: colors.teal }]} onPress={onAdd}>
          <Plus size={16} color="#ffffff" />
        </TouchableOpacity>
      )}
    </View>
  );
};

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
  lineItem: {
    alignItems: "center",
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: "row",
    marginBottom: 12,
    padding: 10,
  },
  clickableArea: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  image: {
    height: 64,
    resizeMode: "contain",
    width: 58,
  },
  info: {
    flex: 1,
    marginLeft: 12,
    paddingRight: 8,
  },
  name: {
    fontSize: 14,
    fontWeight: "900",
  },
  meta: {
    fontSize: 12,
    fontWeight: "700",
    marginTop: 5,
  },
  smallAction: {
    alignItems: "center",
    borderRadius: 12,
    height: 34,
    justifyContent: "center",
    width: 34,
  },
  totalBox: {
    alignItems: "center",
    borderRadius: 20,
    borderWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
    padding: 16,
  },
  totalLabel: {
    fontSize: 13,
    fontWeight: "800",
  },
  totalValue: {
    fontSize: 22,
    fontWeight: "900",
    marginTop: 3,
  },
  checkoutButton: {
    alignItems: "center",
    borderRadius: 15,
    justifyContent: "center",
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  checkoutText: {
    fontSize: 14,
    fontWeight: "900",
  },
});
