import { Heart, Plus } from "lucide-react-native";
import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import QuantityControl from "./QuantityControl";
import { colors } from "../styles/theme";

const ProductCard = ({
  product,
  quantity,
  wishlisted,
  onAdd,
  onDecrease,
  onWishlist,
}) => (
  <View style={styles.card}>
    <LinearGradient colors={["#f8fafc", "#e0f2fe"]} style={styles.imagePanel}>
      <TouchableOpacity
        style={[styles.wishlistBtn, wishlisted && styles.wishlistBtnActive]}
        activeOpacity={0.82}
        onPress={onWishlist}
      >
        <Heart
          size={17}
          color={wishlisted ? colors.white : colors.red}
          fill={wishlisted ? colors.white : "transparent"}
        />
      </TouchableOpacity>
      <Image source={product.image} style={styles.productImage} />
    </LinearGradient>

    <Text style={styles.name} numberOfLines={2}>
      {product.name}
    </Text>
    <View style={styles.meta}>
      <Text style={styles.price}>Rs. {product.price}</Text>
      <Text style={styles.pcs}>{product.pcs} pcs</Text>
    </View>

    {quantity > 0 ? (
      <QuantityControl quantity={quantity} onDecrease={onDecrease} onIncrease={onAdd} />
    ) : (
      <TouchableOpacity style={styles.addButton} activeOpacity={0.86} onPress={onAdd}>
        <Text style={styles.addText}>Add to Cart</Text>
        <View style={styles.addIcon}>
          <Plus size={15} color={colors.teal} strokeWidth={3} />
        </View>
      </TouchableOpacity>
    )}
  </View>
);

export default ProductCard;

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderColor: "#eef2f7",
    borderRadius: 20,
    borderWidth: 1,
    elevation: 5,
    marginBottom: 18,
    padding: 10,
    shadowColor: colors.slate,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.08,
    shadowRadius: 18,
    width: "48%",
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
    backgroundColor: colors.white,
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
    backgroundColor: colors.red,
  },
  productImage: {
    height: 124,
    resizeMode: "contain",
    width: "92%",
  },
  name: {
    color: "#14213d",
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
    color: colors.teal,
    fontSize: 16,
    fontWeight: "900",
  },
  pcs: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: "800",
  },
  addButton: {
    alignItems: "center",
    backgroundColor: colors.teal,
    borderRadius: 15,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingLeft: 13,
    paddingRight: 7,
    paddingVertical: 7,
  },
  addText: {
    color: colors.white,
    fontSize: 13,
    fontWeight: "900",
  },
  addIcon: {
    alignItems: "center",
    backgroundColor: colors.white,
    borderRadius: 11,
    height: 25,
    justifyContent: "center",
    width: 25,
  },
});
