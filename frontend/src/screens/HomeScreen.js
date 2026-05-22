import { ShoppingBag } from "lucide-react-native";
import React, { useMemo, useState, useEffect } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View, ActivityIndicator, Share } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import BottomNavbar from "../components/BottomNavbar";
import Header from "../components/Header";
import ProductCard from "../components/ProductCard";
import ProductPopupModal from "../components/ProductPopupModal";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { categories, products } from "../utils/constants";
import CartScreen from "./CartScreen";
import CheckoutScreen from "./CheckoutScreen";
import ForgotPasswordScreen from "./ForgotPasswordScreen";
import LoginScreen from "./LoginScreen";
import ProfileScreen from "./ProfileScreen";
import SignupScreen from "./SignupScreen";
import WishlistScreen from "./WishlistScreen";

const HomeScreen = () => {
  const { isAuthenticated, loading } = useAuth();
  const { colors, isDarkMode } = useTheme();
  const [screen, setScreen] = useState("home");
  const [authScreen, setAuthScreen] = useState("login");
  const [category, setCategory] = useState("All");
  const [cart, setCart] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [toast, setToast] = useState("");

  // Product Popup Modal States
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  // Restore Cart & Wishlist from AsyncStorage on Mount
  useEffect(() => {
    const restoreSavedData = async () => {
      try {
        const savedCart = await AsyncStorage.getItem("aquafine_cart");
        const savedWishlist = await AsyncStorage.getItem("aquafine_wishlist");
        if (savedCart) setCart(JSON.parse(savedCart));
        if (savedWishlist) setWishlist(JSON.parse(savedWishlist));
      } catch (err) {
        console.log("Failed to restore cart/wishlist state", err);
      }
    };
    restoreSavedData();
  }, []);

  // Sync Cart to AsyncStorage
  const saveCartToStorage = async (newCart) => {
    try {
      await AsyncStorage.setItem("aquafine_cart", JSON.stringify(newCart));
    } catch (err) {
      console.log("Failed to save cart to AsyncStorage", err);
    }
  };

  // Sync Wishlist to AsyncStorage
  const saveWishlistToStorage = async (newWishlist) => {
    try {
      await AsyncStorage.setItem("aquafine_wishlist", JSON.stringify(newWishlist));
    } catch (err) {
      console.log("Failed to save wishlist to AsyncStorage", err);
    }
  };

  const visibleProducts = useMemo(() => {
    if (category === "All") return products;
    return products.filter((item) => item.category === category);
  }, [category]);

  if (loading) {
    return (
      <SafeAreaView style={[styles.loadingContainer, { backgroundColor: colors.bg }]}>
        <ActivityIndicator size="large" color={colors.teal} />
      </SafeAreaView>
    );
  }

  const cartTotal = cart.reduce((total, item) => total + item.price * item.quantity, 0);

  const showCartToast = () => {
    setToast("Product Added");
    setTimeout(() => setToast(""), 1300);
  };

  const getCartQuantity = (productId) =>
    cart.find((item) => item.id === productId)?.quantity || 0;

  const addToCart = (product) => {
    setCart((items) => {
      const existing = items.find((item) => item.id === product.id);
      let updated;
      if (existing) {
        updated = items.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item,
        );
      } else {
        updated = [...items, { ...product, quantity: 1 }];
      }
      saveCartToStorage(updated);
      return updated;
    });
    showCartToast();
  };

  const decreaseCartQuantity = (product) => {
    setCart((items) => {
      const updated = items
        .map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity - 1 } : item,
        )
        .filter((item) => item.quantity > 0);
      saveCartToStorage(updated);
      return updated;
    });
  };

  const toggleWishlist = (product) => {
    setWishlist((items) => {
      let updated;
      if (items.some((item) => item.id === product.id)) {
        updated = items.filter((item) => item.id !== product.id);
      } else {
        updated = [...items, product];
      }
      saveWishlistToStorage(updated);
      return updated;
    });
  };

  const openCheckout = () => {
    if (!cart.length) return;
    if (!isAuthenticated) {
      setAuthScreen("login");
      setScreen("profile");
      return;
    }
    setScreen("checkout");
  };

  // Product Popup Modal Trigger
  const openProductDetails = (product) => {
    setSelectedProduct(product);
    setModalVisible(true);
  };

  // Product Native OS-level Sharing System
  const shareProduct = async (product) => {
    try {
      const result = await Share.share({
        title: `Check out ${product.name} on Aquafine`,
        message: `Hey! Check out this premium bottled water: *${product.name}* (${product.pcs} pcs pack). Only *Rs. ${product.price}*!\n\nRefreshment with a polished presentation, perfect for home, offices, and major events. Get it here: https://aquafine.com/product/${product.id}`,
      });
    } catch (error) {
      console.log("Error launching share sheet:", error.message);
    }
  };

  const renderProduct = (product) => (
    <ProductCard
      key={product.id}
      product={product}
      quantity={getCartQuantity(product.id)}
      wishlisted={wishlist.some((item) => item.id === product.id)}
      onAdd={() => addToCart(product)}
      onDecrease={() => decreaseCartQuantity(product)}
      onWishlist={() => toggleWishlist(product)}
      onPress={() => openProductDetails(product)}
    />
  );

  const renderHome = () => (
    <>
      <Header />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.sectionHeader}>
          <View>
            <Text style={[styles.sectionTitle, { color: colors.slate }]}>Bottle Collection</Text>
            <Text style={[styles.sectionSub, { color: colors.muted }]}>Bulk packs with polished presentation</Text>
          </View>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryRow}>
          {categories.map((item) => (
            <TouchableOpacity
              key={item}
              style={[
                styles.categoryChip, 
                { backgroundColor: colors.white, borderColor: colors.border },
                category === item && [styles.categoryChipActive, { backgroundColor: colors.teal, borderColor: colors.teal }]
              ]}
              activeOpacity={0.82}
              onPress={() => setCategory(item)}
            >
              <Text style={[styles.categoryText, { color: colors.muted }, category === item && styles.categoryTextActive]}>
                {item}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        <View style={styles.productGrid}>{visibleProducts.map(renderProduct)}</View>
      </ScrollView>
    </>
  );

  const renderAuth = () => {
    if (authScreen === "signup") {
      return (
        <SignupScreen
          onLogin={() => setAuthScreen("login")}
          onSuccess={() => setScreen("profile")}
        />
      );
    }
    if (authScreen === "forgot") {
      return <ForgotPasswordScreen onLogin={() => setAuthScreen("login")} />;
    }
    return (
      <LoginScreen
        onSignup={() => setAuthScreen("signup")}
        onForgot={() => setAuthScreen("forgot")}
        onSuccess={() => setScreen("profile")}
      />
    );
  };

  const renderProfile = () => {
    if (loading) {
      return (
        <View style={[styles.authPage, { backgroundColor: colors.bg }]}>
          <Text style={[styles.loadingText, { color: colors.muted }]}>Loading</Text>
        </View>
      );
    }
    if (isAuthenticated) {
      return (
        <View style={[styles.authPage, { backgroundColor: colors.bg }]}>
          <ProfileScreen onWishlist={() => setScreen("wishlist")} />
        </View>
      );
    }
    return (
      <View style={[styles.authContainer, { backgroundColor: colors.bg }]}>
        {renderAuth()}
      </View>
    );
  };

  const renderScreen = () => {
    if (screen === "cart") {
      return (
        <CartScreen
          cart={cart}
          total={cartTotal}
          getQuantity={getCartQuantity}
          onAdd={addToCart}
          onDecrease={decreaseCartQuantity}
          onCheckout={openCheckout}
          onPressProduct={openProductDetails}
        />
      );
    }
    if (screen === "wishlist") {
      return (
        <WishlistScreen
          wishlist={wishlist}
          getQuantity={getCartQuantity}
          onAdd={addToCart}
          onDecrease={decreaseCartQuantity}
          onPressProduct={openProductDetails}
        />
      );
    }
    if (screen === "profile") return renderProfile();
    if (screen === "checkout") {
      return (
        <CheckoutScreen
          cart={cart}
          total={cartTotal}
          getQuantity={getCartQuantity}
          onAdd={addToCart}
          onDecrease={decreaseCartQuantity}
          onPaymentSuccess={() => {
            setCart([]);
            saveCartToStorage([]);
            setScreen("home");
          }}
        />
      );
    }
    return renderHome();
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bg }]} edges={["left", "right", "bottom"]}>
      {renderScreen()}
      {!!toast && (
        <View style={[styles.toast, { backgroundColor: colors.teal }]}>
          <ShoppingBag size={16} color="#ffffff" />
          <Text style={[styles.toastText, { color: "#ffffff" }]}>{toast}</Text>
        </View>
      )}
      <BottomNavbar active={screen} onChange={setScreen} />

      {/* Root Centered Product Details Modal */}
      <ProductPopupModal
        visible={modalVisible}
        product={selectedProduct}
        quantity={selectedProduct ? getCartQuantity(selectedProduct.id) : 0}
        wishlisted={selectedProduct ? wishlist.some((item) => item.id === selectedProduct.id) : false}
        onClose={() => setModalVisible(false)}
        onAdd={addToCart}
        onDecrease={decreaseCartQuantity}
        onWishlist={toggleWishlist}
        onShare={shareProduct}
      />
    </SafeAreaView>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 108,
    paddingHorizontal: 18,
    paddingTop: 22,
  },
  sectionHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "900",
  },
  sectionSub: {
    fontSize: 13,
    fontWeight: "600",
    marginTop: 4,
  },
  categoryRow: {
    paddingBottom: 20,
    paddingTop: 18,
  },
  categoryChip: {
    borderRadius: 18,
    borderWidth: 1,
    marginRight: 10,
    paddingHorizontal: 16,
    paddingVertical: 9,
  },
  categoryChipActive: {
    // Overridden inline
  },
  categoryText: {
    fontSize: 13,
    fontWeight: "800",
  },
  categoryTextActive: {
    color: "#ffffff",
  },
  productGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  authPage: {
    flex: 1,
    paddingBottom: 108,
    paddingHorizontal: 18,
    paddingTop: 48,
  },
  authContainer: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 18,
  },
  loadingText: {
    fontSize: 15,
    fontWeight: "800",
  },
  toast: {
    alignItems: "center",
    alignSelf: "center",
    borderRadius: 999,
    bottom: 102,
    elevation: 10,
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 10,
    position: "absolute",
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 18,
  },
  toastText: {
    fontSize: 13,
    fontWeight: "900",
    marginLeft: 7,
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
