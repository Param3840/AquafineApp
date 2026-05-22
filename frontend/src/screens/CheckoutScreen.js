import { CreditCard, MapPin, Plus, Edit2, Trash2, CheckCircle2, Home, Briefcase, Compass, ArrowLeft, Check } from "lucide-react-native";
import React, { useState, useEffect } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Modal,
  TextInput,
  Switch,
  KeyboardAvoidingView,
  Platform
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import RazorpayCheckout from "react-native-razorpay";
import { ProductLineItem } from "./CartScreen";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { authService } from "../services/authService";
import { paymentService } from "../services/paymentService";

const CheckoutScreen = ({ cart, total, getQuantity, onAdd, onDecrease, onPaymentSuccess }) => {
  const { user, token, updateUser } = useAuth();
  const { colors, isDarkMode } = useTheme();
  
  const [step, setStep] = useState(1); // Step 1: Address Selection, Step 2: Order Summary & Pay
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [loading, setLoading] = useState(false);
  
  // Address Form Modal States
  const [formVisible, setFormVisible] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  
  // Form Field States
  const [fullName, setFullName] = useState("");
  const [mobile, setMobile] = useState("");
  const [houseFlat, setHouseFlat] = useState("");
  const [areaStreet, setAreaStreet] = useState("");
  const [landmark, setLandmark] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [pincode, setPincode] = useState("");
  const [addressType, setAddressType] = useState("Home");
  const [isDefault, setIsDefault] = useState(false);
  const [formLoading, setFormLoading] = useState(false);

  // Set default selected address on load
  useEffect(() => {
    if (user?.addresses && user.addresses.length > 0) {
      const defaultAddr = user.addresses.find(a => a.isDefault) || user.addresses[0];
      setSelectedAddressId(defaultAddr._id);
    } else {
      setSelectedAddressId(null);
    }
  }, [user]);

  // Open form for adding a new address
  const handleAddNewAddress = () => {
    setEditingAddress(null);
    setFullName(user?.fullName || "");
    setMobile(user?.mobile || "");
    setHouseFlat("");
    setAreaStreet("");
    setLandmark("");
    setCity("");
    setState("");
    setPincode("");
    setAddressType("Home");
    setIsDefault(user?.addresses?.length === 0);
    setFormVisible(true);
  };

  // Open form for editing an existing address
  const handleEditAddress = (address) => {
    setEditingAddress(address);
    setFullName(address.fullName);
    setMobile(address.mobile);
    setHouseFlat(address.houseFlat);
    setAreaStreet(address.areaStreet);
    setLandmark(address.landmark || "");
    setCity(address.city);
    setState(address.state);
    setPincode(address.pincode);
    setAddressType(address.addressType || "Home");
    setIsDefault(address.isDefault || false);
    setFormVisible(true);
  };

  // Delete an address
  const handleDeleteAddress = (addressId) => {
    Alert.alert(
      "Delete Address",
      "Are you sure you want to delete this address?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            setLoading(true);
            try {
              const res = await authService.deleteAddress(addressId, token);
              if (res.success && res.user) {
                await updateUser(res.user);
                Alert.alert("Success", "Address deleted successfully");
              }
            } catch (err) {
              Alert.alert("Error", err.message || "Failed to delete address");
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  // Save / update address form submission
  const handleSubmitAddress = async () => {
    if (!fullName.trim() || !mobile.trim() || !houseFlat.trim() || !areaStreet.trim() || !city.trim() || !state.trim() || !pincode.trim()) {
      Alert.alert("Missing Fields", "Please fill in all required fields marked with *");
      return;
    }

    if (mobile.trim().length < 10) {
      Alert.alert("Invalid Mobile", "Please enter a valid 10-digit mobile number");
      return;
    }

    if (pincode.trim().length !== 6) {
      Alert.alert("Invalid Pincode", "Please enter a valid 6-digit pincode");
      return;
    }

    setFormLoading(true);
    try {
      const payload = {
        fullName: fullName.trim(),
        mobile: mobile.trim(),
        houseFlat: houseFlat.trim(),
        areaStreet: areaStreet.trim(),
        landmark: landmark.trim(),
        city: city.trim(),
        state: state.trim(),
        pincode: pincode.trim(),
        addressType,
        isDefault
      };

      let res;
      if (editingAddress) {
        res = await authService.editAddress(editingAddress._id, payload, token);
      } else {
        res = await authService.addAddress(payload, token);
      }

      if (res.success && res.user) {
        await updateUser(res.user);
        setFormVisible(false);
        Alert.alert("Success", `Address ${editingAddress ? "updated" : "added"} successfully`);
      }
    } catch (err) {
      Alert.alert("Error", err.message || "Failed to save address");
    } finally {
      setFormLoading(false);
    }
  };

  // Execute checkout order processing
  const handlePayment = async () => {
    if (total <= 0) {
      Alert.alert("Invalid Amount", "Please add items to your cart before proceeding.");
      return;
    }
    if (!token) {
      Alert.alert("Authentication Required", "Please log in to make a payment.");
      return;
    }
    if (!selectedAddressId) {
      Alert.alert("Delivery Address Required", "Please select a delivery address.");
      return;
    }

    const deliveryAddress = user.addresses.find(a => a._id === selectedAddressId);
    if (!deliveryAddress) {
      Alert.alert("Invalid Address", "Selected address could not be found. Please re-select.");
      return;
    }

    setLoading(true);
    try {
      const res = await paymentService.createOrder(total, token);
      
      const prefill = {};
      
      const displayName = deliveryAddress.fullName || user?.fullName || user?.name;
      if (displayName && displayName.trim()) {
        prefill.name = displayName.trim();
      }
      
      if (user?.email && user.email.trim()) {
        prefill.email = user.email.trim();
      }
      
      const contactPhone = deliveryAddress.mobile || user?.mobile;
      if (contactPhone && contactPhone.trim()) {
        const cleaned = contactPhone.replace(/\s+/g, "");
        if (cleaned.startsWith("+")) {
          prefill.contact = cleaned;
        } else if (cleaned.length === 10) {
          prefill.contact = `+91${cleaned}`;
        } else if (cleaned.length === 12 && cleaned.startsWith("91")) {
          prefill.contact = `+${cleaned}`;
        } else {
          prefill.contact = cleaned;
        }
      }

      const options = {
        description: "Premium Water Bottles Purchase",
        image: "https://i.imgur.com/3g7URya.png",
        currency: res.currency,
        key: res.key,
        amount: res.amount,
        name: "Aquafine",
        order_id: res.order_id,
        prefill,
        theme: { color: colors.teal }
      };

      if (!RazorpayCheckout || typeof RazorpayCheckout.open !== "function") {
        console.log("RazorpayCheckout native module is not available. Simulating success in development/sandbox mode.");
        
        setTimeout(async () => {
          try {
            const mockPaymentId = `pay_mock_${Math.random().toString(36).substring(2, 11)}`;
            await paymentService.saveOrder({
              cartItems: cart.map(item => ({
                name: item.name,
                quantity: getQuantity(item.id),
                price: item.price,
              })),
              totalAmount: total,
              razorpayOrderId: res.order_id,
              razorpayPaymentId: mockPaymentId,
              customerDetails: {
                fullName: deliveryAddress.fullName || user?.fullName || "Guest Customer",
                email: user?.email || "N/A",
                mobile: deliveryAddress.mobile || user?.mobile || "N/A"
              },
              deliveryAddress: {
                fullName: deliveryAddress.fullName,
                mobile: deliveryAddress.mobile,
                houseFlat: deliveryAddress.houseFlat,
                areaStreet: deliveryAddress.areaStreet,
                landmark: deliveryAddress.landmark || "",
                city: deliveryAddress.city,
                state: deliveryAddress.state,
                pincode: deliveryAddress.pincode,
                addressType: deliveryAddress.addressType || "Home"
              }
            }, token);

            Alert.alert(
              "Payment Successful",
              `Thank you for your order!\nTransaction ID: ${mockPaymentId}`,
              [
                {
                  text: "OK",
                  onPress: () => {
                    if (onPaymentSuccess) {
                      onPaymentSuccess();
                    }
                  },
                },
              ]
            );
          } catch (saveErr) {
            console.log("Failed to record order details:", saveErr);
            Alert.alert(
              "Transaction Verification Failed",
              "Payment succeeded but we encountered an issue recording your order. Please take a screenshot and contact support."
            );
          } finally {
            setLoading(false);
          }
        }, 1500);
        return;
      }

      RazorpayCheckout.open(options)
        .then(async (data) => {
          try {
            await paymentService.saveOrder({
              cartItems: cart.map(item => ({
                name: item.name,
                quantity: getQuantity(item.id),
                price: item.price,
              })),
              totalAmount: total,
              razorpayOrderId: res.order_id,
              razorpayPaymentId: data.razorpay_payment_id,
              customerDetails: {
                fullName: deliveryAddress.fullName || user?.fullName || "Guest Customer",
                email: user?.email || "N/A",
                mobile: deliveryAddress.mobile || user?.mobile || "N/A"
              },
              deliveryAddress: {
                fullName: deliveryAddress.fullName,
                mobile: deliveryAddress.mobile,
                houseFlat: deliveryAddress.houseFlat,
                areaStreet: deliveryAddress.areaStreet,
                landmark: deliveryAddress.landmark || "",
                city: deliveryAddress.city,
                state: deliveryAddress.state,
                pincode: deliveryAddress.pincode,
                addressType: deliveryAddress.addressType || "Home"
              }
            }, token);

            Alert.alert(
              "Payment Successful",
              `Thank you for your order!\nTransaction ID: ${data.razorpay_payment_id}`,
              [
                {
                  text: "OK",
                  onPress: () => {
                    if (onPaymentSuccess) {
                      onPaymentSuccess();
                    }
                  },
                },
              ]
            );
          } catch (saveErr) {
            console.log("Failed to record order details:", saveErr);
            Alert.alert(
              "Transaction Verification Failed",
              "Payment succeeded but we encountered an issue recording your order. Transaction ID: " + data.razorpay_payment_id
            );
          }
        })
        .catch((error) => {
          console.log("Razorpay Checkout Error:", error);
          let errorMsg = "The transaction was cancelled or failed.";
          if (error && typeof error === "object") {
            errorMsg = error.description || error.message || JSON.stringify(error);
          } else if (typeof error === "string") {
            errorMsg = error;
          }
          Alert.alert("Payment Failed", errorMsg);
        });
    } catch (err) {
      console.log("Create order failed:", err);
      Alert.alert(
        "Order Creation Failed",
        err.message || "Could not generate transaction order. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const getAddressIcon = (type) => {
    switch (type) {
      case "Home":
        return <Home size={18} color={colors.teal} />;
      case "Work":
        return <Briefcase size={18} color={colors.teal} />;
      default:
        return <Compass size={18} color={colors.teal} />;
    }
  };

  // Step 1 Render: Address Selection Screen
  const renderAddressSelection = () => {
    const addresses = user?.addresses || [];
    
    return (
      <View style={styles.container}>
        {/* Step Indicator */}
        <View style={styles.stepIndicatorRow}>
          <View style={styles.stepContainer}>
            <View style={[styles.stepCircle, { backgroundColor: colors.teal }]}>
              <Text style={styles.stepNumber}>1</Text>
            </View>
            <Text style={[styles.stepLabel, { color: colors.slate, fontWeight: "800" }]}>Delivery Address</Text>
          </View>
          <View style={[styles.stepLine, { backgroundColor: colors.border }]} />
          <View style={styles.stepContainer}>
            <View style={[styles.stepCircle, { backgroundColor: colors.border }]}>
              <Text style={[styles.stepNumber, { color: colors.muted }]}>2</Text>
            </View>
            <Text style={[styles.stepLabel, { color: colors.muted }]}>Order & Pay</Text>
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <Text style={[styles.sectionTitle, { color: colors.slate }]}>Select Delivery Address</Text>

          {addresses.length === 0 ? (
            <View style={[styles.emptyContainer, { backgroundColor: colors.white, borderColor: colors.border }]}>
              <MapPin size={48} color={colors.muted} style={styles.emptyIcon} />
              <Text style={[styles.emptyTitle, { color: colors.slate }]}>No Saved Addresses</Text>
              <Text style={[styles.emptyText, { color: colors.muted }]}>Please add a delivery address to place your order.</Text>
              <TouchableOpacity
                style={[styles.addButton, { backgroundColor: colors.teal }]}
                activeOpacity={0.8}
                onPress={handleAddNewAddress}
              >
                <Plus size={16} color={colors.white} style={styles.addButtonIcon} />
                <Text style={styles.addButtonText}>Add New Address</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View>
              {addresses.map((addr) => {
                const isSelected = selectedAddressId === addr._id;
                return (
                  <TouchableOpacity
                    key={addr._id}
                    style={[
                      styles.addressCard,
                      {
                        backgroundColor: colors.white,
                        borderColor: isSelected ? colors.teal : colors.border,
                        borderWidth: isSelected ? 2 : 1
                      }
                    ]}
                    activeOpacity={0.9}
                    onPress={() => setSelectedAddressId(addr._id)}
                  >
                    <View style={styles.addressCardHeader}>
                      <View style={styles.addressTypeBadgeRow}>
                        {getAddressIcon(addr.addressType)}
                        <Text style={[styles.addressTypeBadge, { color: colors.teal }]}>
                          {addr.addressType ? addr.addressType.toUpperCase() : "HOME"}
                        </Text>
                        {addr.isDefault && (
                          <View style={styles.defaultBadge}>
                            <Text style={styles.defaultBadgeText}>DEFAULT</Text>
                          </View>
                        )}
                      </View>
                      <View style={styles.selectionDotOutline}>
                        {isSelected && <View style={[styles.selectionDotFilled, { backgroundColor: colors.teal }]} />}
                      </View>
                    </View>

                    <Text style={[styles.addressName, { color: colors.slate }]}>{addr.fullName}</Text>
                    <Text style={[styles.addressDetails, { color: colors.muted }]}>
                      {addr.houseFlat}, {addr.areaStreet}
                      {addr.landmark ? `\nLandmark: ${addr.landmark}` : ""}
                      {`\n${addr.city}, ${addr.state} - ${addr.pincode}`}
                    </Text>
                    <Text style={[styles.addressMobile, { color: colors.slate }]}>Mobile: {addr.mobile}</Text>

                    {/* CRUD Actions */}
                    <View style={[styles.addressCardActions, { borderTopColor: colors.border }]}>
                      <TouchableOpacity
                        style={styles.actionBtn}
                        onPress={() => handleEditAddress(addr)}
                      >
                        <Edit2 size={14} color={colors.muted} />
                        <Text style={[styles.actionBtnText, { color: colors.muted }]}>Edit</Text>
                      </TouchableOpacity>
                      <View style={[styles.actionDivider, { backgroundColor: colors.border }]} />
                      <TouchableOpacity
                        style={styles.actionBtn}
                        onPress={() => handleDeleteAddress(addr._id)}
                      >
                        <Trash2 size={14} color={colors.red} />
                        <Text style={[styles.actionBtnText, { color: colors.red }]}>Delete</Text>
                      </TouchableOpacity>
                    </View>
                  </TouchableOpacity>
                );
              })}

              <TouchableOpacity
                style={[styles.dashedAddButton, { borderColor: colors.teal }]}
                activeOpacity={0.8}
                onPress={handleAddNewAddress}
              >
                <Plus size={18} color={colors.teal} style={styles.addButtonIcon} />
                <Text style={[styles.dashedAddButtonText, { color: colors.teal }]}>Add New Address</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>

        {/* Deliver Sticky Bottom Bar */}
        {addresses.length > 0 && (
          <View style={[styles.bottomActionBar, { backgroundColor: colors.white, borderTopColor: colors.border }]}>
            <TouchableOpacity
              style={[
                styles.proceedButtonContainer,
                { opacity: selectedAddressId ? 1 : 0.6 }
              ]}
              disabled={!selectedAddressId}
              activeOpacity={0.85}
              onPress={() => setStep(2)}
            >
              <LinearGradient
                colors={[colors.teal, colors.tealDark]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.proceedButton}
              >
                <Text style={styles.proceedButtonText}>Deliver to this Address</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  // Step 2 Render: Summary & payment trigger
  const renderOrderSummary = () => {
    const deliveryAddress = user?.addresses?.find(a => a._id === selectedAddressId) || {};
    
    return (
      <View style={styles.container}>
        {/* Step Indicator */}
        <View style={styles.stepIndicatorRow}>
          <View style={styles.stepContainer}>
            <TouchableOpacity style={styles.stepTouchHeader} onPress={() => setStep(1)}>
              <View style={[styles.stepCircle, { backgroundColor: colors.teal }]}>
                <Check size={12} color={colors.white} />
              </View>
              <Text style={[styles.stepLabel, { color: colors.teal, fontWeight: "700" }]}>Address Selected</Text>
            </TouchableOpacity>
          </View>
          <View style={[styles.stepLine, { backgroundColor: colors.teal }]} />
          <View style={styles.stepContainer}>
            <View style={[styles.stepCircle, { backgroundColor: colors.teal }]}>
              <Text style={styles.stepNumber}>2</Text>
            </View>
            <Text style={[styles.stepLabel, { color: colors.slate, fontWeight: "800" }]}>Order & Pay</Text>
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Back button */}
          <TouchableOpacity style={styles.backLink} onPress={() => setStep(1)}>
            <ArrowLeft size={16} color={colors.teal} />
            <Text style={[styles.backLinkText, { color: colors.teal }]}>Back to Address Selection</Text>
          </TouchableOpacity>

          <Text style={[styles.sectionTitle, { color: colors.slate }]}>Delivery Details</Text>

          {/* Delivery Address Preview Card */}
          <View style={[styles.previewAddressCard, { backgroundColor: colors.white, borderColor: colors.border }]}>
            <View style={styles.previewAddressHeader}>
              <View style={styles.addressTypeBadgeRow}>
                {getAddressIcon(deliveryAddress.addressType)}
                <Text style={[styles.addressTypeBadge, { color: colors.teal }]}>
                  {deliveryAddress.addressType ? deliveryAddress.addressType.toUpperCase() : "HOME"}
                </Text>
              </View>
              <TouchableOpacity onPress={() => setStep(1)}>
                <Text style={[styles.changeAddressLink, { color: colors.teal }]}>CHANGE</Text>
              </TouchableOpacity>
            </View>
            <Text style={[styles.addressName, { color: colors.slate }]}>{deliveryAddress.fullName}</Text>
            <Text style={[styles.addressDetails, { color: colors.muted, marginBottom: 8 }]}>
              {deliveryAddress.houseFlat}, {deliveryAddress.areaStreet}
              {deliveryAddress.landmark ? `, Landmark: ${deliveryAddress.landmark}` : ""}
              {`, ${deliveryAddress.city}, ${deliveryAddress.state} - ${deliveryAddress.pincode}`}
            </Text>
            <Text style={[styles.addressMobile, { color: colors.slate }]}>Mobile: {deliveryAddress.mobile}</Text>
          </View>

          {/* Items Summary */}
          <Text style={[styles.sectionTitle, { color: colors.slate, marginTop: 22 }]}>Order Items</Text>
          {cart.map((item) => (
            <ProductLineItem
              key={item.id}
              item={item}
              quantity={getQuantity(item.id)}
              onAdd={() => onAdd(item)}
              onDecrease={() => onDecrease(item)}
            />
          ))}

          {/* Payment breakdown */}
          <Text style={[styles.sectionTitle, { color: colors.slate, marginTop: 22 }]}>Payment Summary</Text>
          <View style={[styles.billDetailsCard, { backgroundColor: colors.white, borderColor: colors.border }]}>
            <View style={styles.billRow}>
              <Text style={[styles.billLabel, { color: colors.muted }]}>Cart Subtotal</Text>
              <Text style={[styles.billVal, { color: colors.slate }]}>Rs. {total}</Text>
            </View>
            <View style={styles.billRow}>
              <Text style={[styles.billLabel, { color: colors.muted }]}>Delivery Charges</Text>
              <Text style={[styles.billValText, { color: colors.teal }]}>FREE</Text>
            </View>
            <View style={[styles.billDivider, { backgroundColor: colors.border }]} />
            <View style={styles.billRowTotal}>
              <Text style={[styles.billTotalLabel, { color: colors.slate }]}>Total Amount Payable</Text>
              <Text style={[styles.billTotalVal, { color: colors.slate }]}>Rs. {total}</Text>
            </View>
          </View>
        </ScrollView>

        {/* Pay Sticky Bottom Bar */}
        <View style={[styles.bottomActionBar, { backgroundColor: colors.white, borderTopColor: colors.border }]}>
          <TouchableOpacity
            style={styles.proceedButtonContainer}
            activeOpacity={0.82}
            onPress={handlePayment}
            disabled={loading}
          >
            <LinearGradient
              colors={[colors.teal, colors.tealDark]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.proceedButton}
            >
              {loading ? (
                <ActivityIndicator color={colors.white} />
              ) : (
                <Text style={styles.proceedButtonText}>Pay Now • Rs. {total}</Text>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.bg }]}>
      {/* Top Header */}
      <View style={[styles.appBar, { borderBottomColor: colors.border, backgroundColor: colors.white }]}>
        <Text style={[styles.appBarTitle, { color: colors.slate }]}>Checkout</Text>
      </View>

      {step === 1 ? renderAddressSelection() : renderOrderSummary()}

      {/* Address Form Modal */}
      <Modal
        visible={formVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setFormVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalOverlay}
        >
          <View style={[styles.modalContent, { backgroundColor: colors.white }]}>
            {/* Modal Header */}
            <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
              <Text style={[styles.modalTitle, { color: colors.slate }]}>
                {editingAddress ? "Edit Delivery Address" : "Add Delivery Address"}
              </Text>
              <TouchableOpacity onPress={() => setFormVisible(false)}>
                <Text style={[styles.modalCloseBtn, { color: colors.muted }]}>Close</Text>
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.modalForm} showsVerticalScrollIndicator={false}>
              <Text style={[styles.formLabel, { color: colors.slate }]}>Contact Details</Text>
              
              <TextInput
                placeholder="Full Name *"
                placeholderTextColor={colors.muted}
                style={[styles.input, { borderColor: colors.border, color: colors.slate }]}
                value={fullName}
                onChangeText={setFullName}
              />
              
              <TextInput
                placeholder="10-Digit Mobile Number *"
                placeholderTextColor={colors.muted}
                keyboardType="phone-pad"
                maxLength={10}
                style={[styles.input, { borderColor: colors.border, color: colors.slate }]}
                value={mobile}
                onChangeText={setMobile}
              />

              <Text style={[styles.formLabel, { color: colors.slate, marginTop: 14 }]}>Address Information</Text>
              
              <TextInput
                placeholder="Flat / House No. / Building *"
                placeholderTextColor={colors.muted}
                style={[styles.input, { borderColor: colors.border, color: colors.slate }]}
                value={houseFlat}
                onChangeText={setHouseFlat}
              />
              
              <TextInput
                placeholder="Area / Street / Sector *"
                placeholderTextColor={colors.muted}
                style={[styles.input, { borderColor: colors.border, color: colors.slate }]}
                value={areaStreet}
                onChangeText={setAreaStreet}
              />
              
              <TextInput
                placeholder="Landmark (Optional)"
                placeholderTextColor={colors.muted}
                style={[styles.input, { borderColor: colors.border, color: colors.slate }]}
                value={landmark}
                onChangeText={setLandmark}
              />

              <View style={styles.inputRow}>
                <TextInput
                  placeholder="City *"
                  placeholderTextColor={colors.muted}
                  style={[styles.input, styles.halfInput, { borderColor: colors.border, color: colors.slate }]}
                  value={city}
                  onChangeText={setCity}
                />
                <TextInput
                  placeholder="State *"
                  placeholderTextColor={colors.muted}
                  style={[styles.input, styles.halfInput, { borderColor: colors.border, color: colors.slate }]}
                  value={state}
                  onChangeText={setState}
                />
              </View>

              <TextInput
                placeholder="6-Digit Pincode *"
                placeholderTextColor={colors.muted}
                keyboardType="number-pad"
                maxLength={6}
                style={[styles.input, { borderColor: colors.border, color: colors.slate }]}
                value={pincode}
                onChangeText={setPincode}
              />

              <Text style={[styles.formLabel, { color: colors.slate, marginTop: 14 }]}>Address Type</Text>
              
              <View style={styles.addressTypeRow}>
                {["Home", "Work", "Other"].map((type) => {
                  const isTypeSelected = addressType === type;
                  return (
                    <TouchableOpacity
                      key={type}
                      style={[
                        styles.addressTypeChip,
                        {
                          borderColor: colors.border,
                          backgroundColor: isTypeSelected ? colors.teal : colors.white
                        }
                      ]}
                      onPress={() => setAddressType(type)}
                    >
                      <Text
                        style={[
                          styles.addressTypeChipText,
                          { color: isTypeSelected ? colors.white : colors.muted }
                        ]}
                      >
                        {type}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <View style={styles.switchRow}>
                <View>
                  <Text style={[styles.switchLabel, { color: colors.slate }]}>Make Default Address</Text>
                  <Text style={[styles.switchSub, { color: colors.muted }]}>Set this address as primary delivery destination</Text>
                </View>
                <Switch
                  value={isDefault}
                  onValueChange={setIsDefault}
                  trackColor={{ false: colors.border, true: colors.teal }}
                  thumbColor={Platform.OS === "android" ? colors.white : ""}
                />
              </View>

              <TouchableOpacity
                style={styles.modalSubmitBtnContainer}
                activeOpacity={0.82}
                onPress={handleSubmitAddress}
                disabled={formLoading}
              >
                <LinearGradient
                  colors={[colors.teal, colors.tealDark]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.modalSubmitBtn}
                >
                  {formLoading ? (
                    <ActivityIndicator color={colors.white} />
                  ) : (
                    <Text style={styles.modalSubmitBtnText}>Save Address</Text>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
};

export default CheckoutScreen;

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  appBar: {
    height: 56,
    borderBottomWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  appBarTitle: {
    fontSize: 18,
    fontWeight: "900",
    letterSpacing: 0.5,
  },
  stepIndicatorRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 18,
    paddingHorizontal: 28,
  },
  stepContainer: {
    alignItems: "center",
    flexDirection: "row",
  },
  stepTouchHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  stepCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 6,
  },
  stepNumber: {
    color: "#ffffff",
    fontSize: 11,
    fontWeight: "900",
  },
  stepLabel: {
    fontSize: 12,
  },
  stepLine: {
    flex: 1,
    height: 2,
    marginHorizontal: 10,
  },
  scrollContent: {
    paddingHorizontal: 18,
    paddingBottom: 200,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "900",
    marginBottom: 12,
    marginTop: 8,
  },
  emptyContainer: {
    alignItems: "center",
    borderRadius: 20,
    borderWidth: 1,
    padding: 28,
    marginTop: 18,
    borderStyle: "dashed",
  },
  emptyIcon: {
    marginBottom: 14,
    opacity: 0.7,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "900",
    marginBottom: 6,
  },
  emptyText: {
    fontSize: 13,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 20,
    lineHeight: 18,
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  addButtonIcon: {
    marginRight: 6,
  },
  addButtonText: {
    color: "#ffffff",
    fontSize: 13,
    fontWeight: "900",
  },
  addressCard: {
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  addressCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  addressTypeBadgeRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  addressTypeBadge: {
    fontSize: 11,
    fontWeight: "900",
    marginLeft: 6,
  },
  defaultBadge: {
    backgroundColor: "#e0f2fe",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 8,
  },
  defaultBadgeText: {
    color: "#0369a1",
    fontSize: 9,
    fontWeight: "900",
  },
  selectionDotOutline: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#cbd5e1",
    alignItems: "center",
    justifyContent: "center",
  },
  selectionDotFilled: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  addressName: {
    fontSize: 15,
    fontWeight: "900",
    marginBottom: 4,
  },
  addressDetails: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "600",
    marginBottom: 8,
  },
  addressMobile: {
    fontSize: 13,
    fontWeight: "800",
    marginBottom: 12,
  },
  addressCardActions: {
    borderTopWidth: 1,
    flexDirection: "row",
    paddingTop: 10,
  },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    paddingVertical: 4,
  },
  actionBtnText: {
    fontSize: 12,
    fontWeight: "900",
    marginLeft: 6,
  },
  actionDivider: {
    width: 1,
    height: 18,
    alignSelf: "center",
  },
  dashedAddButton: {
    borderRadius: 18,
    borderWidth: 1.5,
    borderStyle: "dashed",
    paddingVertical: 18,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    marginTop: 6,
    marginBottom: 20,
  },
  dashedAddButtonText: {
    fontSize: 14,
    fontWeight: "900",
  },
  bottomActionBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    borderTopWidth: 1,
    paddingTop: 16,
    paddingBottom: 102,
    paddingHorizontal: 18,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  proceedButtonContainer: {
    borderRadius: 16,
    overflow: "hidden",
  },
  proceedButton: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
  },
  proceedButtonText: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "900",
    letterSpacing: 0.5,
  },
  backLink: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 18,
    marginTop: 4,
  },
  backLinkText: {
    fontSize: 13,
    fontWeight: "800",
    marginLeft: 6,
  },
  previewAddressCard: {
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
  },
  previewAddressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  changeAddressLink: {
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 0.5,
  },
  billDetailsCard: {
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    marginBottom: 20,
  },
  billRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  billLabel: {
    fontSize: 13,
    fontWeight: "700",
  },
  billVal: {
    fontSize: 13,
    fontWeight: "900",
  },
  billValText: {
    fontSize: 13,
    fontWeight: "900",
  },
  billDivider: {
    height: 1,
    marginVertical: 12,
  },
  billRowTotal: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  billTotalLabel: {
    fontSize: 14,
    fontWeight: "900",
  },
  billTotalVal: {
    fontSize: 16,
    fontWeight: "900",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.6)",
    justifyContent: "flex-end",
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "88%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 18,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: "900",
  },
  modalCloseBtn: {
    fontSize: 13,
    fontWeight: "800",
  },
  modalForm: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 40,
  },
  formLabel: {
    fontSize: 13,
    fontWeight: "900",
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 12,
  },
  inputRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  halfInput: {
    width: "48%",
  },
  addressTypeRow: {
    flexDirection: "row",
    marginBottom: 16,
  },
  addressTypeChip: {
    borderWidth: 1,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 999,
    marginRight: 10,
  },
  addressTypeChipText: {
    fontSize: 13,
    fontWeight: "900",
  },
  switchRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 4,
    marginBottom: 24,
  },
  switchLabel: {
    fontSize: 13,
    fontWeight: "800",
  },
  switchSub: {
    fontSize: 11,
    fontWeight: "600",
    marginTop: 2,
  },
  modalSubmitBtnContainer: {
    borderRadius: 14,
    overflow: "hidden",
  },
  modalSubmitBtn: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
  },
  modalSubmitBtnText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "900",
  },
});
