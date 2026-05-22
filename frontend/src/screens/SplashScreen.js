import React, { useEffect, useRef } from "react";
import { Animated, Dimensions, Easing, StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Droplets } from "lucide-react-native";

const { width } = Dimensions.get("window");

const SplashScreen = ({ onFinish }) => {
  // Animation values
  const logoScale = useRef(new Animated.Value(0.3)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const textTranslateY = useRef(new Animated.Value(30)).current;
  const subOpacity = useRef(new Animated.Value(0)).current;
  const containerOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Cinematic Animation Sequence
    Animated.sequence([
      // Step 1: Drop Logo Scales & Fades In
      Animated.parallel([
        Animated.timing(logoScale, {
          toValue: 1.0,
          duration: 1000,
          easing: Easing.out(Easing.back(1.5)),
          useNativeDriver: true,
        }),
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 900,
          useNativeDriver: true,
        }),
      ]),
      // Step 2: "Aquafine" brand text reveals
      Animated.parallel([
        Animated.timing(textOpacity, {
          toValue: 1,
          duration: 800,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(textTranslateY, {
          toValue: 0,
          duration: 800,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
      // Step 3: Subtitle Fades in
      Animated.timing(subOpacity, {
        toValue: 1,
        duration: 600,
        easing: Easing.ease,
        useNativeDriver: true,
      }),
      // Step 4: Cinematic hold
      Animated.delay(1000),
      // Step 5: Smooth exit transition
      Animated.timing(containerOpacity, {
        toValue: 0,
        duration: 600,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
    ]).start(() => {
      // Trigger unmount state in App root
      if (onFinish) {
        onFinish();
      }
    });
  }, [onFinish, logoScale, logoOpacity, textOpacity, textTranslateY, subOpacity, containerOpacity]);

  return (
    <Animated.View style={[styles.container, { opacity: containerOpacity }]}>
      <LinearGradient
        colors={["#071113", "#0b1c20", "#082c35"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      >
        <View style={styles.glowOverlay} />

        <View style={styles.content}>
          {/* Animated Droplet Logo */}
          <Animated.View
            style={[
              styles.logoContainer,
              {
                opacity: logoOpacity,
                transform: [{ scale: logoScale }],
              },
            ]}
          >
            <View style={styles.logoCircle}>
              <Droplets size={54} color="#14b8a6" fill="rgba(20, 184, 166, 0.25)" />
            </View>
            <View style={styles.logoHalo} />
          </Animated.View>

          {/* Animated Brand Name Text */}
          <Animated.View
            style={[
              styles.textContainer,
              {
                opacity: textOpacity,
                transform: [{ translateY: textTranslateY }],
              },
            ]}
          >
            <Text style={styles.brandTitle}>
              Aqua<Text style={styles.goldText}>fine</Text>
            </Text>
          </Animated.View>

          {/* Animated Subtitle */}
          <Animated.View style={[styles.subContainer, { opacity: subOpacity }]}>
            <Text style={styles.brandSubtitle}>P R E M I U M   B O T T L E D   W A T E R</Text>
            <View style={styles.indicatorLine} />
          </Animated.View>
        </View>
      </LinearGradient>
    </Animated.View>
  );
};

export default SplashScreen;

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 9999,
  },
  glowOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "transparent",
    opacity: 0.15,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  logoContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  logoCircle: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: "rgba(20, 184, 166, 0.08)",
    borderWidth: 1.5,
    borderColor: "rgba(20, 184, 166, 0.35)",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#14b8a6",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
    elevation: 10,
    zIndex: 2,
  },
  logoHalo: {
    position: "absolute",
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 1,
    borderColor: "rgba(20, 184, 166, 0.12)",
    zIndex: 1,
  },
  textContainer: {
    alignItems: "center",
    marginBottom: 8,
  },
  brandTitle: {
    fontSize: 42,
    fontWeight: "900",
    color: "#ffffff",
    letterSpacing: 1.5,
    textShadowColor: "rgba(0, 0, 0, 0.4)",
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 6,
  },
  goldText: {
    color: "#fbbf24", // Premium gold brand accent
  },
  subContainer: {
    alignItems: "center",
    marginTop: 8,
  },
  brandSubtitle: {
    fontSize: 10,
    fontWeight: "800",
    color: "#94a3b8",
    letterSpacing: 3,
    textTransform: "uppercase",
  },
  indicatorLine: {
    height: 2,
    width: 32,
    backgroundColor: "#14b8a6",
    marginTop: 18,
    borderRadius: 1,
    opacity: 0.6,
  },
});
