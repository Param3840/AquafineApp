import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { colors } from "../styles/theme";

const QuantityControl = ({ quantity, onDecrease, onIncrease, compact }) => (
  <View style={[styles.wrap, compact && styles.compact]}>
    <TouchableOpacity style={styles.button} activeOpacity={0.82} onPress={onDecrease}>
      <Text style={styles.buttonText}>-</Text>
    </TouchableOpacity>
    <Text style={styles.value}>{quantity}</Text>
    <TouchableOpacity style={styles.button} activeOpacity={0.82} onPress={onIncrease}>
      <Text style={styles.buttonText}>+</Text>
    </TouchableOpacity>
  </View>
);

export default QuantityControl;

const styles = StyleSheet.create({
  wrap: {
    alignItems: "center",
    backgroundColor: colors.teal,
    borderRadius: 15,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 8,
    paddingVertical: 7,
  },
  compact: {
    minWidth: 104,
    paddingHorizontal: 7,
    paddingVertical: 6,
  },
  button: {
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.18)",
    borderRadius: 10,
    height: 28,
    justifyContent: "center",
    width: 28,
  },
  buttonText: {
    color: colors.white,
    fontSize: 19,
    fontWeight: "900",
    lineHeight: 21,
  },
  value: {
    color: colors.white,
    fontSize: 15,
    fontWeight: "900",
    marginHorizontal: 13,
  },
});
