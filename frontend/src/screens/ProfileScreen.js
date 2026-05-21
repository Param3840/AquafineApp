import { Heart, HelpCircle, LogOut, MapPin, Package, Settings, User } from "lucide-react-native";
import React from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useAuth } from "../context/AuthContext";
import { colors } from "../styles/theme";

const profileItems = [
  { label: "Orders", icon: Package },
  { label: "Account Details", icon: User },
  { label: "Saved Addresses", icon: MapPin },
  { label: "Wishlist", icon: Heart, target: "wishlist" },
  { label: "Settings", icon: Settings },
  { label: "Help & Support", icon: HelpCircle },
];

const ProfileScreen = ({ onWishlist }) => {
  const { user, logout } = useAuth();

  return (
    <ScrollView contentContainerStyle={styles.page}>
      <View style={styles.profileHero}>
        <View style={styles.avatar}>
          <User size={30} color={colors.white} />
        </View>
        <View>
          <Text style={styles.profileName}>{user?.fullName || user?.name}</Text>
          <Text style={styles.profileMobile}>{user?.mobile}</Text>
        </View>
      </View>

      {profileItems.map((item) => {
        const Icon = item.icon;
        return (
          <TouchableOpacity
            key={item.label}
            style={styles.profileItem}
            onPress={() => item.target === "wishlist" && onWishlist()}
          >
            <Icon size={21} color={colors.teal} />
            <Text style={styles.profileItemText}>{item.label}</Text>
          </TouchableOpacity>
        );
      })}

      <TouchableOpacity style={styles.logoutButton} onPress={logout}>
        <LogOut size={20} color={colors.red} />
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default ProfileScreen;

const styles = StyleSheet.create({
  page: {
    paddingBottom: 108,
    paddingHorizontal: 18,
    paddingTop: 48,
  },
  profileHero: {
    alignItems: "center",
    backgroundColor: colors.white,
    borderColor: colors.border,
    borderRadius: 22,
    borderWidth: 1,
    flexDirection: "row",
    marginBottom: 16,
    padding: 16,
  },
  avatar: {
    alignItems: "center",
    backgroundColor: colors.teal,
    borderRadius: 18,
    height: 58,
    justifyContent: "center",
    marginRight: 14,
    width: 58,
  },
  profileName: {
    color: colors.slate,
    fontSize: 21,
    fontWeight: "900",
  },
  profileMobile: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: "700",
    marginTop: 3,
  },
  profileItem: {
    alignItems: "center",
    backgroundColor: colors.white,
    borderColor: colors.border,
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: "row",
    marginBottom: 10,
    padding: 15,
  },
  profileItemText: {
    color: colors.slate,
    fontSize: 15,
    fontWeight: "800",
    marginLeft: 12,
  },
  logoutButton: {
    alignItems: "center",
    backgroundColor: "#fff1f2",
    borderColor: "#fecdd3",
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: "row",
    marginTop: 4,
    padding: 15,
  },
  logoutText: {
    color: colors.red,
    fontSize: 15,
    fontWeight: "900",
    marginLeft: 12,
  },
});
