import { Heart, Plus } from "lucide-react-native";
import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import QuantityControl from "./QuantityControl";
import { useTheme } from "../context/ThemeContext";

const ProductCard = ({
  product,
  quantity,
  wishlisted,
  onAdd,
  onDecrease,
  onWishlist,
  onPress,
}) => {
  const { colors, isDarkMode } = useTheme();

  return (
    <View style={[styles.card, { backgroundColor: colors.white, borderColor: isDarkMode ? "#1f3135" : "#eef2f7" }]}>
      <TouchableOpacity activeOpacity={0.9} onPress={onPress} style={styles.cardClickArea}>
        <LinearGradient 
          colors={isDarkMode ? ["#101a1c", "#0a1214"] : ["#f8fafc", "#e0f2fe"]} 
          style={styles.imagePanel}
        >
          <TouchableOpacity
            style={[styles.wishlistBtn, wishlisted && styles.wishlistBtnActive]}
            activeOpacity={0.82}
            onPress={onWishlist}
          >
            <Heart
              size={17}
              color={wishlisted ? "#ffffff" : "#dc2626"}
              fill={wishlisted ? "#ffffff" : "transparent"}
            />
          </TouchableOpacity>
          <Image source={product.image} style={styles.productImage} />
        </LinearGradient>

        <Text style={[styles.name, { color: colors.slate }]} numberOfLines={2}>
          {product.name}
        </Text>
      </TouchableOpacity>

      <View style={styles.meta}>
        <Text style={[styles.price, { color: colors.teal }]}>Rs. {product.price}</Text>
        <Text style={[styles.pcs, { color: colors.muted }]}>{product.pcs} pcs</Text>
      </View>

      {quantity > 0 ? (
        <QuantityControl quantity={quantity} onDecrease={onDecrease} onIncrease={onAdd} />
      ) : (
        <TouchableOpacity 
          style={[styles.addButton, { backgroundColor: colors.teal }]} 
          activeOpacity={0.86} 
          onPress={onAdd}
        >
          <Text style={[styles.addText, { color: "#ffffff" }]}>Add to Cart</Text>
          <View style={styles.addIcon}>
            <Plus size={15} color={isDarkMode ? "#0b1315" : "#0f766e"} strokeWidth={3} />
          </View>
        </TouchableOpacity>
      )}
    </View>
  );
};

export default ProductCard;

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    borderWidth: 1,
    elevation: 5,
    marginBottom: 18,
    padding: 10,
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.08,
    shadowRadius: 18,
    width: "48%",
  },
  cardClickArea: {
    width: "100%",
  },
  imagePanel: {
    alignItems: "center",
    borderRadius: 17,
    height: 145,
    justifyContent: "center",
    marginBottom: 12,
    overflow: "hidden",
  },
  wishlistBtn: {
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderRadius: 13,
    height: 32,
    justifyContent: "center",
    position: "absolute",
    right: 9,
    top: 9,
    width: 32,
    zIndex: 2,
  },
  wishlistBtnActive: {
    backgroundColor: "#dc2626",
  },
  productImage: {
    height: 124,
    resizeMode: "contain",
    width: "92%",
  },
  name: {
    fontSize: 14,
    fontWeight: "900",
    lineHeight: 18,
    minHeight: 36,
  },
  meta: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
    marginTop: 8,
  },
  price: {
    fontSize: 16,
    fontWeight: "900",
  },
  pcs: {
    fontSize: 12,
    fontWeight: "800",
  },
  addButton: {
    alignItems: "center",
    borderRadius: 15,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingLeft: 13,
    paddingRight: 7,
    paddingVertical: 7,
  },
  addText: {
    fontSize: 13,
    fontWeight: "900",
  },
  addIcon: {
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderRadius: 11,
    height: 25,
    justifyContent: "center",
    width: 25,
  },
});
