import { Heart, Share2, X, ShoppingBag, ArrowLeft } from "lucide-react-native";
import React from "react";
import { Image, Modal, StyleSheet, Text, TouchableOpacity, View, ScrollView } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme } from "../context/ThemeContext";
import QuantityControl from "./QuantityControl";

const ProductPopupModal = ({
  visible,
  product,
  quantity,
  wishlisted,
  onClose,
  onAdd,
  onDecrease,
  onWishlist,
  onShare,
}) => {
  const { colors, isDarkMode } = useTheme();

  if (!product) return null;

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        {/* Semi-transparent Backdrop with Click-to-Close */}
        <TouchableOpacity 
          style={styles.backdrop} 
          activeOpacity={1} 
          onPress={onClose} 
        />

        {/* Premium Centered Card */}
        <View style={[styles.card, { backgroundColor: colors.white, borderColor: colors.border }]}>
          {/* Header Action Controls */}
          <View style={styles.header}>
            <TouchableOpacity 
              style={[styles.circleBtn, { backgroundColor: isDarkMode ? "#101a1c" : "#f1f5f9" }]} 
              onPress={onClose}
            >
              <X size={20} color={colors.slate} />
            </TouchableOpacity>

            <View style={styles.headerRight}>
              <TouchableOpacity 
                style={[styles.circleBtn, { backgroundColor: isDarkMode ? "#101a1c" : "#f1f5f9" }]} 
                onPress={() => onShare(product)}
              >
                <Share2 size={19} color={colors.teal} />
              </TouchableOpacity>

              <TouchableOpacity 
                style={[
                  styles.circleBtn, 
                  { backgroundColor: wishlisted ? "#dc2626" : (isDarkMode ? "#101a1c" : "#f1f5f9") },
                  wishlisted && styles.wishlistBtnActive
                ]} 
                onPress={() => onWishlist(product)}
              >
                <Heart 
                  size={19} 
                  color={wishlisted ? "#ffffff" : "#dc2626"} 
                  fill={wishlisted ? "#ffffff" : "transparent"} 
                />
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            {/* Banner/Image Section */}
            <LinearGradient 
              colors={isDarkMode ? ["#101a1c", "#0a1214"] : ["#f0f9ff", "#e0f2fe"]} 
              style={styles.imagePanel}
            >
              <Image source={product.image} style={styles.productImage} />
            </LinearGradient>

            {/* Content Section */}
            <View style={styles.detailsContainer}>
              <View style={styles.namePriceRow}>
                <View style={{ flex: 1, paddingRight: 10 }}>
                  <Text style={[styles.name, { color: colors.slate }]}>{product.name}</Text>
                  <Text style={[styles.pcs, { color: colors.muted }]}>{product.pcs} pcs pack</Text>
                </View>
                <Text style={[styles.price, { color: colors.teal }]}>Rs. {product.price}</Text>
              </View>

              {/* Description */}
              <View style={[styles.divider, { backgroundColor: colors.border }]} />
              <Text style={[styles.descTitle, { color: colors.slate }]}>About this product</Text>
              <Text style={[styles.descText, { color: colors.muted }]}>
                {product.description || "Experience pure refreshment with Aquafine. Sourced from pristine deep-water wells and refined using multi-stage advanced purification systems. Our polished presentation brings elegance to homes, meetings, and major business events."}
              </Text>
              <View style={[styles.divider, { backgroundColor: colors.border }]} />

              {/* Actions Grid */}
              <View style={styles.actionsRow}>
                <View style={{ flex: 1, marginRight: 12 }}>
                  {quantity > 0 ? (
                    <QuantityControl quantity={quantity} onDecrease={() => onDecrease(product)} onIncrease={() => onAdd(product)} />
                  ) : (
                    <TouchableOpacity 
                      style={[styles.addCartBtn, { backgroundColor: colors.teal }]} 
                      activeOpacity={0.88}
                      onPress={() => onAdd(product)}
                    >
                      <ShoppingBag size={18} color="#ffffff" style={{ marginRight: 8 }} />
                      <Text style={styles.addCartText}>Add to Cart</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

export default ProductPopupModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(15, 23, 42, 0.65)", // glassmorphism background overlay
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  card: {
    width: "88%",
    maxHeight: "82%",
    borderRadius: 30,
    borderWidth: 1,
    overflow: "hidden",
    elevation: 20,
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.22,
    shadowRadius: 28,
  },
  header: {
    position: "absolute",
    top: 15,
    left: 15,
    right: 15,
    flexDirection: "row",
    justifyContent: "space-between",
    zIndex: 10,
  },
  headerRight: {
    flexDirection: "row",
    gap: 8,
  },
  circleBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: "center",
    alignItems: "center",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  wishlistBtnActive: {
    backgroundColor: "#dc2626",
  },
  scrollContent: {
    paddingBottom: 20,
  },
  imagePanel: {
    height: 250,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
  },
  productImage: {
    width: "80%",
    height: "80%",
    resizeMode: "contain",
  },
  detailsContainer: {
    padding: 22,
  },
  namePriceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  name: {
    fontSize: 20,
    fontWeight: "900",
    lineHeight: 24,
  },
  pcs: {
    fontSize: 13,
    fontWeight: "700",
    marginTop: 5,
  },
  price: {
    fontSize: 22,
    fontWeight: "900",
  },
  divider: {
    height: 1,
    marginVertical: 18,
  },
  descTitle: {
    fontSize: 14,
    fontWeight: "800",
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  descText: {
    fontSize: 13,
    lineHeight: 19,
    fontWeight: "500",
  },
  actionsRow: {
    flexDirection: "row",
    marginTop: 6,
  },
  addCartBtn: {
    height: 48,
    borderRadius: 16,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    elevation: 4,
    shadowColor: "#0f766e",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
  },
  addCartText: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "900",
  },
});
