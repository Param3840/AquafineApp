import { ShoppingBag } from "lucide-react-native";
import React, { useMemo, useState } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import BottomNavbar from "../components/BottomNavbar";
import Header from "../components/Header";
import ProductCard from "../components/ProductCard";
import { useAuth } from "../context/AuthContext";
import { colors } from "../styles/theme";
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
  const [screen, setScreen] = useState("home");
  const [authScreen, setAuthScreen] = useState("login");
  const [category, setCategory] = useState("All");
  const [cart, setCart] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [toast, setToast] = useState("");

  const visibleProducts = useMemo(() => {
    if (category === "All") return products;
    return products.filter((item) => item.category === category);
  }, [category]);

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
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
      if (existing) {
        return items.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item,
        );
      }
      return [...items, { ...product, quantity: 1 }];
    });
    showCartToast();
  };

  const decreaseCartQuantity = (product) => {
    setCart((items) =>
      items
        .map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity - 1 } : item,
        )
        .filter((item) => item.quantity > 0),
    );
  };

  const toggleWishlist = (product) => {
    setWishlist((items) => {
      if (items.some((item) => item.id === product.id)) {
        return items.filter((item) => item.id !== product.id);
      }
      return [...items, product];
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

  const renderProduct = (product) => (
    <ProductCard
      key={product.id}
      product={product}
      quantity={getCartQuantity(product.id)}
      wishlisted={wishlist.some((item) => item.id === product.id)}
      onAdd={() => addToCart(product)}
      onDecrease={() => decreaseCartQuantity(product)}
      onWishlist={() => toggleWishlist(product)}
    />
  );

  const renderHome = () => (
    <>
      <Header />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>Bottle Collection</Text>
            <Text style={styles.sectionSub}>Bulk packs with polished presentation</Text>
          </View>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryRow}>
          {categories.map((item) => (
            <TouchableOpacity
              key={item}
              style={[styles.categoryChip, category === item && styles.categoryChipActive]}
              activeOpacity={0.82}
              onPress={() => setCategory(item)}
            >
              <Text style={[styles.categoryText, category === item && styles.categoryTextActive]}>
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
        <View style={styles.authPage}>
          <Text style={styles.loadingText}>Loading</Text>
        </View>
      );
    }
    return (
      <View style={styles.authPage}>
        {isAuthenticated ? <ProfileScreen onWishlist={() => setScreen("wishlist")} /> : renderAuth()}
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
            setScreen("home");
          }}
        />
      );
    }
    return renderHome();
  };

  return (
    <SafeAreaView style={styles.container} edges={["left", "right", "bottom"]}>
      {renderScreen()}
      {!!toast && (
        <View style={styles.toast}>
          <ShoppingBag size={16} color={colors.white} />
          <Text style={styles.toastText}>{toast}</Text>
        </View>
      )}
      <BottomNavbar active={screen} onChange={setScreen} />
    </SafeAreaView>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
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
    color: colors.slate,
    fontSize: 22,
    fontWeight: "900",
  },
  sectionSub: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: "600",
    marginTop: 4,
  },
  categoryRow: {
    paddingBottom: 20,
    paddingTop: 18,
  },
  categoryChip: {
    backgroundColor: colors.white,
    borderColor: colors.border,
    borderRadius: 18,
    borderWidth: 1,
    marginRight: 10,
    paddingHorizontal: 16,
    paddingVertical: 9,
  },
  categoryChipActive: {
    backgroundColor: colors.teal,
    borderColor: colors.teal,
  },
  categoryText: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: "800",
  },
  categoryTextActive: {
    color: colors.white,
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
  loadingText: {
    color: colors.muted,
    fontSize: 15,
    fontWeight: "800",
  },
  toast: {
    alignItems: "center",
    alignSelf: "center",
    backgroundColor: colors.teal,
    borderRadius: 999,
    bottom: 102,
    elevation: 10,
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 10,
    position: "absolute",
    shadowColor: colors.slate,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 18,
  },
  toastText: {
    color: colors.white,
    fontSize: 13,
    fontWeight: "900",
    marginLeft: 7,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: colors.bg,
    alignItems: "center",
    justifyContent: "center",
  },
});
