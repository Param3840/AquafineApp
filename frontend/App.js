import React from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AuthProvider } from "./src/context/AuthContext";
import HomeScreen from "./src/screens/HomeScreen";

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <HomeScreen />
      </AuthProvider>
    </SafeAreaProvider>
  );
}
