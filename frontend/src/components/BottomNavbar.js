import { Heart, Home, ShoppingBag, User } from "lucide-react-native";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useTheme } from "../context/ThemeContext";

const items = [
  { key: "home", label: "Home", icon: Home },
  { key: "cart", label: "Cart", icon: ShoppingBag },
  { key: "wishlist", label: "Wishlist", icon: Heart },
  { key: "profile", label: "Profile", icon: User },
];

const BottomNavbar = ({ active, onChange }) => {
  const { colors, isDarkMode } = useTheme();

  return (
    <View style={[styles.bar, { backgroundColor: colors.white, borderColor: colors.border }]}>
      {items.map((item) => {
        const Icon = item.icon;
        const isActive = active === item.key;
        return (
          <TouchableOpacity
            key={item.key}
            style={[styles.item, isActive && [styles.activeItem, { backgroundColor: colors.teal }]]}
            activeOpacity={0.85}
            onPress={() => onChange(item.key)}
          >
            <Icon
              size={21}
              color={isActive ? "#ffffff" : colors.muted}
              fill={isActive && item.key !== "cart" ? "#ffffff" : "transparent"}
            />
            <Text style={[styles.text, { color: isActive ? "#ffffff" : colors.muted }, isActive && styles.activeText]}>
              {item.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

export default BottomNavbar;

const styles = StyleSheet.create({
  bar: {
    alignItems: "center",
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
    shadowColor: "#0f172a",
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
    borderRadius: 20,
    height: 50,
  },
  text: {
    fontSize: 10,
    fontWeight: "800",
    marginTop: 3,
  },
  activeText: {
    color: "#ffffff",
  },
});
