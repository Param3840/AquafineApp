import { Heart, Home, ShoppingBag, User } from "lucide-react-native";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { colors } from "../styles/theme";

const items = [
  { key: "home", label: "Home", icon: Home },
  { key: "cart", label: "Cart", icon: ShoppingBag },
  { key: "wishlist", label: "Wishlist", icon: Heart },
  { key: "profile", label: "Profile", icon: User },
];

const BottomNavbar = ({ active, onChange }) => (
  <View style={styles.bar}>
    {items.map((item) => {
      const Icon = item.icon;
      const isActive = active === item.key;
      return (
        <TouchableOpacity
          key={item.key}
          style={[styles.item, isActive && styles.activeItem]}
          activeOpacity={0.85}
          onPress={() => onChange(item.key)}
        >
          <Icon
            size={21}
            color={isActive ? colors.white : colors.muted}
            fill={isActive && item.key !== "cart" ? colors.white : "transparent"}
          />
          <Text style={[styles.text, isActive && styles.activeText]}>{item.label}</Text>
        </TouchableOpacity>
      );
    })}
  </View>
);

export default BottomNavbar;

const styles = StyleSheet.create({
  bar: {
    alignItems: "center",
    backgroundColor: colors.white,
    borderColor: colors.border,
    borderRadius: 28,
    borderWidth: 1,
    bottom: 18,
    elevation: 8,
    flexDirection: "row",
    height: 72,
    justifyContent: "space-between",
    left: 18,
    paddingHorizontal: 8,
    position: "absolute",
    right: 18,
    shadowColor: colors.slate,
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.14,
    shadowRadius: 22,
  },
  item: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
  },
  activeItem: {
    backgroundColor: colors.teal,
    borderRadius: 20,
    height: 50,
  },
  text: {
    color: colors.muted,
    fontSize: 10,
    fontWeight: "800",
    marginTop: 3,
  },
  activeText: {
    color: colors.white,
  },
});
