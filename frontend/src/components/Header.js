import { ChevronRight, Droplets, Sparkles } from "lucide-react-native";
import React from "react";
import {
  Alert,
  Linking,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { colors } from "../styles/theme";

const Header = () => {
  const handleCustomisePress = async () => {
    const phoneNumber = "8271748494";
    const message =
      "Hello Aquafine, I want customised bottles for my business/event.";
    const url = `whatsapp://send?phone=${phoneNumber}&text=${encodeURIComponent(message)}`;
    const webUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;

    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        const webSupported = await Linking.canOpenURL(webUrl);
        if (webSupported) {
          await Linking.openURL(webUrl);
        } else {
          Alert.alert(
            "WhatsApp Not Found",
            "WhatsApp is not installed on your device.",
          );
        }
      }
    } catch (error) {
      Alert.alert("Error", "Unable to open WhatsApp.");
    }
  };

  return (
    <LinearGradient
      colors={[colors.tealDark, colors.teal, colors.gold]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.header}
    >
      <View style={styles.brandWrap}>
        <View style={styles.logoShell}>
          <Droplets
            size={28}
            color={colors.white}
            fill="rgba(255,255,255,0.24)"
          />
        </View>
        <View>
          <Text style={styles.brand}>Aquafine</Text>
          <Text style={styles.brandSub}>Premium bottled water</Text>
        </View>
      </View>

      <View style={styles.hero}>
        <View style={styles.eyebrow}>
          <Sparkles size={14} color="#fde68a" />
          <Text style={styles.eyebrowText}>Custom branding ready</Text>
        </View>
        <Text style={styles.heroTitle}>
          Bottles that look as fresh as they taste.
        </Text>

        <TouchableOpacity
          style={styles.ctaButton}
          activeOpacity={0.85}
          onPress={handleCustomisePress}
        >
          <Text style={styles.ctaButtonText}>
            Click Here for Customise Bottles
          </Text>
          <ChevronRight size={15} color={colors.teal} strokeWidth={3} />
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
};

export default Header;

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 20,
    paddingTop: 42,
    paddingBottom: 28,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  brandWrap: {
    alignItems: "center",
    flexDirection: "row",
  },
  logoShell: {
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.18)",
    borderColor: "rgba(255,255,255,0.32)",
    borderRadius: 16,
    borderWidth: 1,
    height: 48,
    justifyContent: "center",
    marginRight: 12,
    width: 48,
  },
  brand: {
    color: colors.white,
    fontSize: 23,
    fontWeight: "800",
  },
  brandSub: {
    color: "rgba(255,255,255,0.78)",
    fontSize: 12,
    fontWeight: "600",
    marginTop: 1,
  },
  hero: {
    marginTop: 28,
  },
  eyebrow: {
    alignItems: "center",
    flexDirection: "row",
    marginBottom: 8,
  },
  eyebrowText: {
    color: "#fef3c7",
    fontSize: 12,
    fontWeight: "800",
    marginLeft: 6,
    textTransform: "uppercase",
  },
  heroTitle: {
    color: colors.white,
    fontSize: 27,
    fontWeight: "900",
    lineHeight: 33,
  },
  ctaButton: {
    alignItems: "center",
    alignSelf: "flex-end",
    backgroundColor: colors.white,
    borderRadius: 14,
    flexDirection: "row",
    marginTop: 16,
    paddingHorizontal: 15,
    paddingVertical: 10,
    shadowColor: colors.slate,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 3,
  },
  ctaButtonText: {
    color: colors.teal,
    fontSize: 13,
    fontWeight: "800",
    marginRight: 6,
  },
});
