import { 
  ArrowLeft, 
  HelpCircle, 
  LogOut, 
  MapPin, 
  Package, 
  Settings, 
  User, 
  ChevronRight, 
  Plus, 
  Trash2, 
  Edit3, 
  Compass, 
  Phone, 
  Mail, 
  MessageSquare, 
  Check, 
  Bell, 
  Shield, 
  FileText, 
  Globe 
} from "lucide-react-native";
import React, { useState, useEffect } from "react";
import { 
  ScrollView, 
  StyleSheet, 
  Text, 
  TouchableOpacity, 
  View, 
  TextInput, 
  ActivityIndicator, 
  Alert, 
  Linking,
  Switch
} from "react-native";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { API_BASE_URL } from "../utils/constants";

const ProfileScreen = ({ onWishlist }) => {
  const { user, token, logout, updateUser } = useAuth();
  const { colors, isDarkMode, toggleTheme } = useTheme();

  // Navigation state for sub-dashboards
  const [subView, setSubView] = useState(null); // 'orders', 'account', 'addresses', 'settings', 'help'

  // Sub-view active edit states
  const [loadingAction, setLoadingAction] = useState(false);

  // --- 1. ORDERS STATES ---
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  useEffect(() => {
    if (subView === "orders") {
      fetchOrders();
    }
  }, [subView]);

  const fetchOrders = async () => {
    setLoadingOrders(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/orders/my-orders`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
      }
    } catch (err) {
      console.log("Error fetching orders:", err);
    } finally {
      setLoadingOrders(false);
    }
  };

  // --- 2. ACCOUNT EDIT STATES ---
  const [editName, setEditName] = useState(user?.fullName || "");
  const [editEmail, setEditEmail] = useState(user?.email || "");
  const [editMobile, setEditMobile] = useState(user?.mobile || "");

  const handleUpdateProfile = async () => {
    if (!editName || !editEmail || !editMobile) {
      Alert.alert("Error", "All fields are required");
      return;
    }
    setLoadingAction(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ fullName: editName, email: editEmail, mobile: editMobile })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        await updateUser(data.user);
        Alert.alert("Success", "Profile updated successfully!");
        setSubView(null);
      } else {
        Alert.alert("Error", data.message || "Failed to update profile");
      }
    } catch (err) {
      Alert.alert("Error", "Server connection failed");
    } finally {
      setLoadingAction(false);
    }
  };

  // --- 3. SAVED ADDRESS STATES & CRUD ---
  const [addressFormOpen, setAddressFormOpen] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState(null); // id if editing
  const [addrName, setAddrName] = useState("");
  const [addrLine, setAddrLine] = useState("");
  const [addrCity, setAddrCity] = useState("");
  const [addrState, setAddrState] = useState("");
  const [addrPincode, setAddrPincode] = useState("");
  const [addrPhone, setAddrPhone] = useState("");
  const [addrLat, setAddrLat] = useState(null);
  const [addrLng, setAddrLng] = useState(null);
  const [addrDefault, setAddrDefault] = useState(false);
  const [fetchingGeo, setFetchingGeo] = useState(false);

  const resetAddressForm = () => {
    setEditingAddressId(null);
    setAddressFormOpen(false);
    setAddrName("");
    setAddrLine("");
    setAddrCity("");
    setAddrState("");
    setAddrPincode("");
    setAddrPhone("");
    setAddrLat(null);
    setAddrLng(null);
    setAddrDefault(false);
  };

  const startEditAddress = (addr) => {
    setEditingAddressId(addr._id);
    setAddrName(addr.fullName);
    setAddrLine(addr.addressLine);
    setAddrCity(addr.city);
    setAddrState(addr.state);
    setAddrPincode(addr.pincode);
    setAddrPhone(addr.phone);
    setAddrLat(addr.latitude || null);
    setAddrLng(addr.longitude || null);
    setAddrDefault(addr.isDefault);
    setAddressFormOpen(true);
  };

  const handleFetchLocation = () => {
    setFetchingGeo(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setAddrLat(position.coords.latitude);
          setAddrLng(position.coords.longitude);
          setFetchingGeo(false);
          Alert.alert("GPS Success", "Current coordinates pre-populated successfully!");
        },
        (error) => {
          setFetchingGeo(false);
          Alert.alert("GPS Error", "Failed to retrieve location coordinates automatically. Please fill manually.");
        },
        { enableHighAccuracy: true, timeout: 15000 }
      );
    } else {
      setFetchingGeo(false);
      Alert.alert("Error", "Geolocation is not supported by your device");
    }
  };

  const handleSaveAddress = async () => {
    if (!addrName || !addrLine || !addrCity || !addrState || !addrPincode || !addrPhone) {
      Alert.alert("Error", "Please fill in all required delivery address fields");
      return;
    }
    setLoadingAction(true);
    try {
      const payload = {
        fullName: addrName,
        addressLine: addrLine,
        city: addrCity,
        state: addrState,
        pincode: addrPincode,
        phone: addrPhone,
        latitude: addrLat,
        longitude: addrLng,
        isDefault: addrDefault
      };

      const url = editingAddressId 
        ? `${API_BASE_URL}/api/auth/addresses/${editingAddressId}`
        : `${API_BASE_URL}/api/auth/addresses`;
      
      const method = editingAddressId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (res.ok && data.success) {
        await updateUser(data.user);
        Alert.alert("Success", editingAddressId ? "Address updated!" : "Address added successfully!");
        resetAddressForm();
      } else {
        Alert.alert("Error", data.message || "Failed to save address");
      }
    } catch (err) {
      Alert.alert("Error", "Connection error");
    } finally {
      setLoadingAction(false);
    }
  };

  const handleDeleteAddress = (addressId) => {
    Alert.alert(
      "Confirm Delete",
      "Are you sure you want to permanently delete this delivery address?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            setLoadingAction(true);
            try {
              const res = await fetch(`${API_BASE_URL}/api/auth/addresses/${addressId}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` }
              });
              const data = await res.json();
              if (res.ok && data.success) {
                await updateUser(data.user);
              } else {
                Alert.alert("Error", data.message || "Failed to delete address");
              }
            } catch (err) {
              Alert.alert("Error", "Connection error");
            } finally {
              setLoadingAction(false);
            }
          }
        }
      ]
    );
  };

  // --- 4. HELP & SUPPORT WHATSAPP TRIGGER ---
  const handleWhatsAppSupport = async () => {
    const phoneNumber = "8271748494";
    const message = `Hello Aquafine Support, I need help regarding my account or order.\nName: ${user?.fullName}\nMobile: ${user?.mobile}`;
    const url = `whatsapp://send?phone=${phoneNumber}&text=${encodeURIComponent(message)}`;
    const webUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;

    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        await Linking.openURL(webUrl);
      }
    } catch (err) {
      Alert.alert("Error", "Unable to launch WhatsApp support chat.");
    }
  };

  // --- 5. SETTINGS CONTROLS (MOCK NOTIFS & DELETE) ---
  const [notifsEnabled, setNotifsEnabled] = useState(true);
  const [langSelect, setLangSelect] = useState("English");

  const handleDeleteAccount = () => {
    Alert.alert(
      "Danger Zone",
      "WARNING: Deleting your account will permanently wipe your profile records, saved addresses, and active orders. This action CANNOT be undone. Proceed?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete Account Permanently",
          style: "destructive",
          onPress: async () => {
            Alert.alert("Success", "Account successfully requested for deletion.");
            logout();
          }
        }
      ]
    );
  };

  // Render Sub-view Header helper
  const renderSubHeader = (title) => (
    <View style={styles.subHeader}>
      <TouchableOpacity 
        style={[styles.backBtn, { backgroundColor: colors.white, borderColor: colors.border }]} 
        onPress={() => {
          if (addressFormOpen) {
            resetAddressForm();
          } else {
            setSubView(null);
          }
        }}
      >
        <ArrowLeft size={18} color={colors.slate} />
      </TouchableOpacity>
      <Text style={[styles.subHeaderTitle, { color: colors.slate }]}>{title}</Text>
    </View>
  );

  // --- SUB-VIEW 1: ORDERS HISTORY & TIMELINE ---
  const renderOrdersSubView = () => {
    return (
      <View style={{ flex: 1 }}>
        {renderSubHeader("Order History")}
        {loadingOrders ? (
          <ActivityIndicator size="large" color={colors.teal} style={{ marginTop: 40 }} />
        ) : orders.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Package size={60} color={colors.muted} />
            <Text style={[styles.emptyText, { color: colors.slate }]}>No orders found</Text>
            <Text style={[styles.emptySub, { color: colors.muted }]}>Any orders you place will be tracked here.</Text>
          </View>
        ) : (
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollSubContainer}>
            {orders.map((order) => {
              // Map order status to progress index
              const statuses = ["Pending", "Confirmed", "Packed", "Shipped", "Delivered"];
              const currentStatusIndex = statuses.indexOf(order.orderStatus);

              return (
                <View key={order._id} style={[styles.orderCard, { backgroundColor: colors.white, borderColor: colors.border }]}>
                  <View style={styles.orderCardHeader}>
                    <Text style={[styles.orderDate, { color: colors.muted }]}>
                      {new Date(order.createdDate || order.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric"
                      })}
                    </Text>
                    <Text style={[styles.orderAmount, { color: colors.teal }]}>Rs. {order.totalAmount}</Text>
                  </View>

                  <Text style={[styles.orderId, { color: colors.slate }]} numberOfLines={1}>
                    ID: {order._id}
                  </Text>
                  <Text style={[styles.paymentId, { color: colors.muted }]} numberOfLines={1}>
                    Razorpay ID: {order.razorpayPaymentId}
                  </Text>

                  {/* Order Products list */}
                  <View style={[styles.orderItemsBox, { backgroundColor: isDarkMode ? "#101a1c" : "#f8fafc" }]}>
                    {order.products.map((p, i) => (
                      <Text key={i} style={[styles.orderProductText, { color: colors.slate }]}>
                        • {p.name} <Text style={{ fontWeight: "700" }}>x{p.quantity}</Text> (Rs. {p.price})
                      </Text>
                    ))}
                  </View>

                  {/* Timeline step indicator */}
                  <Text style={[styles.timelineTitle, { color: colors.slate }]}>Tracking Timeline</Text>
                  <View style={styles.timelineContainer}>
                    {statuses.map((step, idx) => {
                      const isCompleted = idx <= currentStatusIndex;
                      const isActive = idx === currentStatusIndex;
                      return (
                        <View key={step} style={styles.timelineStep}>
                          <View style={styles.timelineDotWrap}>
                            <View 
                              style={[
                                styles.timelineDot, 
                                { backgroundColor: isCompleted ? colors.teal : colors.border }
                              ]}
                            >
                              {isCompleted && <Check size={10} color="#ffffff" />}
                            </View>
                            {idx < statuses.length - 1 && (
                              <View 
                                style={[
                                  styles.timelineLine, 
                                  { backgroundColor: idx < currentStatusIndex ? colors.teal : colors.border }
                                ]} 
                              />
                            )}
                          </View>
                          <Text 
                            style={[
                              styles.timelineLabel, 
                              { color: isActive ? colors.teal : (isCompleted ? colors.slate : colors.muted) },
                              isActive && { fontWeight: "900" }
                            ]}
                          >
                            {step}
                          </Text>
                        </View>
                      );
                    })}
                  </View>
                </View>
              );
            })}
          </ScrollView>
        )}
      </View>
    );
  };

  // --- SUB-VIEW 2: ACCOUNT MANAGEMENT ---
  const renderAccountSubView = () => {
    return (
      <View style={{ flex: 1 }}>
        {renderSubHeader("Edit Account Details")}
        <ScrollView contentContainerStyle={styles.scrollSubContainer} keyboardShouldPersistTaps="handled">
          <View style={styles.formGroup}>
            <Text style={[styles.inputLabel, { color: colors.slate }]}>Full Name</Text>
            <TextInput
              style={[styles.textInput, { backgroundColor: colors.white, borderColor: colors.border, color: colors.slate }]}
              value={editName}
              onChangeText={setEditName}
              placeholder="Enter your name"
              placeholderTextColor={colors.muted}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={[styles.inputLabel, { color: colors.slate }]}>Email Address</Text>
            <TextInput
              style={[styles.textInput, { backgroundColor: colors.white, borderColor: colors.border, color: colors.slate }]}
              value={editEmail}
              onChangeText={setEditEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              placeholder="Enter your email"
              placeholderTextColor={colors.muted}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={[styles.inputLabel, { color: colors.slate }]}>Mobile Number</Text>
            <TextInput
              style={[styles.textInput, { backgroundColor: colors.white, borderColor: colors.border, color: colors.slate }]}
              value={editMobile}
              onChangeText={setEditMobile}
              keyboardType="phone-pad"
              placeholder="Enter your phone"
              placeholderTextColor={colors.muted}
            />
          </View>

          <TouchableOpacity 
            style={[styles.actionSubmitBtn, { backgroundColor: colors.teal }]} 
            onPress={handleUpdateProfile}
            disabled={loadingAction}
          >
            {loadingAction ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <Text style={styles.actionSubmitText}>Save Changes</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </View>
    );
  };

  // --- SUB-VIEW 3: DELIVERY ADDRESSES CRUD ---
  const renderAddressesSubView = () => {
    const userAddresses = user?.addresses || [];

    if (addressFormOpen) {
      return (
        <View style={{ flex: 1 }}>
          {renderSubHeader(editingAddressId ? "Modify Address" : "New Address")}
          <ScrollView contentContainerStyle={styles.scrollSubContainer} keyboardShouldPersistTaps="handled">
            
            <TouchableOpacity 
              style={[styles.locationBtn, { backgroundColor: isDarkMode ? "#101a1c" : "#e0f2fe", borderColor: colors.teal }]} 
              activeOpacity={0.8}
              onPress={handleFetchLocation}
              disabled={fetchingGeo}
            >
              {fetchingGeo ? (
                <ActivityIndicator size="small" color={colors.teal} style={{ marginRight: 8 }} />
              ) : (
                <Compass size={18} color={colors.teal} style={{ marginRight: 8 }} />
              )}
              <Text style={[styles.locationBtnText, { color: colors.teal }]}>
                {fetchingGeo ? "Fetching coordinates..." : "Use Current Geolocation GPS"}
              </Text>
            </TouchableOpacity>

            {addrLat && addrLng && (
              <Text style={[styles.geoCoordsText, { color: colors.teal }]}>
                GPS Coordinates Saved: {addrLat.toFixed(5)}, {addrLng.toFixed(5)}
              </Text>
            )}

            <View style={styles.formGroup}>
              <Text style={[styles.inputLabel, { color: colors.slate }]}>Receiver's Full Name</Text>
              <TextInput
                style={[styles.textInput, { backgroundColor: colors.white, borderColor: colors.border, color: colors.slate }]}
                value={addrName}
                onChangeText={setAddrName}
                placeholder="Receiver name"
                placeholderTextColor={colors.muted}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={[styles.inputLabel, { color: colors.slate }]}>Address Details (House, Street, Area)</Text>
              <TextInput
                style={[styles.textInput, { backgroundColor: colors.white, borderColor: colors.border, color: colors.slate }]}
                value={addrLine}
                onChangeText={setAddrLine}
                placeholder="Complete address line"
                placeholderTextColor={colors.muted}
              />
            </View>

            <View style={styles.rowInputs}>
              <View style={[styles.formGroup, { flex: 1, marginRight: 10 }]}>
                <Text style={[styles.inputLabel, { color: colors.slate }]}>City</Text>
                <TextInput
                  style={[styles.textInput, { backgroundColor: colors.white, borderColor: colors.border, color: colors.slate }]}
                  value={addrCity}
                  onChangeText={setAddrCity}
                  placeholder="City"
                  placeholderTextColor={colors.muted}
                />
              </View>
              <View style={[styles.formGroup, { flex: 1 }]}>
                <Text style={[styles.inputLabel, { color: colors.slate }]}>State</Text>
                <TextInput
                  style={[styles.textInput, { backgroundColor: colors.white, borderColor: colors.border, color: colors.slate }]}
                  value={addrState}
                  onChangeText={setAddrState}
                  placeholder="State"
                  placeholderTextColor={colors.muted}
                />
              </View>
            </View>

            <View style={styles.rowInputs}>
              <View style={[styles.formGroup, { flex: 1, marginRight: 10 }]}>
                <Text style={[styles.inputLabel, { color: colors.slate }]}>Pincode</Text>
                <TextInput
                  style={[styles.textInput, { backgroundColor: colors.white, borderColor: colors.border, color: colors.slate }]}
                  value={addrPincode}
                  onChangeText={setAddrPincode}
                  keyboardType="numeric"
                  placeholder="Pincode"
                  placeholderTextColor={colors.muted}
                />
              </View>
              <View style={[styles.formGroup, { flex: 1 }]}>
                <Text style={[styles.inputLabel, { color: colors.slate }]}>Contact Mobile</Text>
                <TextInput
                  style={[styles.textInput, { backgroundColor: colors.white, borderColor: colors.border, color: colors.slate }]}
                  value={addrPhone}
                  onChangeText={setAddrPhone}
                  keyboardType="phone-pad"
                  placeholder="Phone"
                  placeholderTextColor={colors.muted}
                />
              </View>
            </View>

            {/* Set Default Switch */}
            <View style={styles.switchRow}>
              <Text style={[styles.switchLabel, { color: colors.slate }]}>Set as Default Address</Text>
              <Switch
                value={addrDefault}
                onValueChange={setAddrDefault}
                thumbColor={addrDefault ? colors.teal : "#f4f3f4"}
                trackColor={{ false: "#767577", true: "#81b0ff" }}
              />
            </View>

            <TouchableOpacity 
              style={[styles.actionSubmitBtn, { backgroundColor: colors.teal }]} 
              onPress={handleSaveAddress}
              disabled={loadingAction}
            >
              {loadingAction ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <Text style={styles.actionSubmitText}>{editingAddressId ? "Save Changes" : "Save Address"}</Text>
              )}
            </TouchableOpacity>
          </ScrollView>
        </View>
      );
    }

    return (
      <View style={{ flex: 1 }}>
        {renderSubHeader("Delivery Addresses")}
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollSubContainer}>
          <TouchableOpacity 
            style={[styles.addAddressBarBtn, { backgroundColor: isDarkMode ? "#101a1c" : "#ffffff", borderColor: colors.border }]} 
            onPress={() => setAddressFormOpen(true)}
          >
            <Plus size={20} color={colors.teal} />
            <Text style={[styles.addAddressBarText, { color: colors.teal }]}>Add New Address</Text>
          </TouchableOpacity>

          {userAddresses.length === 0 ? (
            <View style={[styles.emptyContainer, { marginTop: 40 }]}>
              <MapPin size={60} color={colors.muted} />
              <Text style={[styles.emptyText, { color: colors.slate }]}>No Addresses Saved</Text>
              <Text style={[styles.emptySub, { color: colors.muted }]}>Please add an address to speed up checkouts.</Text>
            </View>
          ) : (
            userAddresses.map((addr) => (
              <View 
                key={addr._id} 
                style={[
                  styles.addressCard, 
                  { backgroundColor: colors.white, borderColor: addr.isDefault ? colors.teal : colors.border },
                  addr.isDefault && { borderWidth: 1.5 }
                ]}
              >
                {addr.isDefault && (
                  <View style={[styles.defaultBadge, { backgroundColor: colors.teal }]}>
                    <Text style={styles.defaultBadgeText}>DEFAULT</Text>
                  </View>
                )}
                <Text style={[styles.addressName, { color: colors.slate }]}>{addr.fullName}</Text>
                <Text style={[styles.addressDetails, { color: colors.muted }]}>
                  {addr.addressLine}, {addr.city}, {addr.state} - {addr.pincode}
                </Text>
                <Text style={[styles.addressPhone, { color: colors.muted }]}>Mobile: {addr.phone}</Text>
                {addr.latitude && addr.longitude && (
                  <Text style={[styles.addressGeoCoords, { color: colors.teal }]}>
                    Location Coords: {addr.latitude.toFixed(4)}, {addr.longitude.toFixed(4)}
                  </Text>
                )}

                <View style={styles.addressCardActions}>
                  <TouchableOpacity style={styles.addrCardActionBtn} onPress={() => startEditAddress(addr)}>
                    <Edit3 size={15} color={colors.teal} style={{ marginRight: 4 }} />
                    <Text style={[styles.addrCardActionText, { color: colors.teal }]}>Edit</Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.addrCardActionBtn} onPress={() => handleDeleteAddress(addr._id)}>
                    <Trash2 size={15} color={colors.red} style={{ marginRight: 4 }} />
                    <Text style={[styles.addrCardActionText, { color: colors.red }]}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </ScrollView>
      </View>
    );
  };

  // --- SUB-VIEW 4: SETTINGS PAGE UPGRADE ---
  const renderSettingsSubView = () => {
    return (
      <View style={{ flex: 1 }}>
        {renderSubHeader("Settings")}
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollSubContainer}>
          
          <View style={[styles.settingsGroupCard, { backgroundColor: colors.white, borderColor: colors.border }]}>
            <Text style={[styles.settingsGroupTitle, { color: colors.teal }]}>Preferences</Text>

            {/* Dark Mode Switch */}
            <View style={styles.settingRowItem}>
              <View style={styles.settingRowLabelWrap}>
                <Shield size={18} color={colors.slate} style={{ marginRight: 10 }} />
                <Text style={[styles.settingRowLabel, { color: colors.slate }]}>Dark Mode</Text>
              </View>
              <Switch
                value={isDarkMode}
                onValueChange={toggleTheme}
                thumbColor={isDarkMode ? colors.teal : "#f4f3f4"}
                trackColor={{ false: "#767577", true: "#81b0ff" }}
              />
            </View>

            <View style={[styles.settingsDivider, { backgroundColor: colors.border }]} />

            {/* Notification Switch */}
            <View style={styles.settingRowItem}>
              <View style={styles.settingRowLabelWrap}>
                <Bell size={18} color={colors.slate} style={{ marginRight: 10 }} />
                <Text style={[styles.settingRowLabel, { color: colors.slate }]}>Push Notifications</Text>
              </View>
              <Switch
                value={notifsEnabled}
                onValueChange={setNotifsEnabled}
                thumbColor={notifsEnabled ? colors.teal : "#f4f3f4"}
                trackColor={{ false: "#767577", true: "#81b0ff" }}
              />
            </View>

            <View style={[styles.settingsDivider, { backgroundColor: colors.border }]} />

            {/* Language Selection */}
            <TouchableOpacity 
              style={styles.settingRowItem} 
              onPress={() => {
                const nextLang = langSelect === "English" ? "Hindi" : "English";
                setLangSelect(nextLang);
                Alert.alert("Language Selected", `Language toggled to ${nextLang}`);
              }}
            >
              <View style={styles.settingRowLabelWrap}>
                <Globe size={18} color={colors.slate} style={{ marginRight: 10 }} />
                <Text style={[styles.settingRowLabel, { color: colors.slate }]}>Language</Text>
              </View>
              <View style={styles.settingRowValueWrap}>
                <Text style={[styles.settingRowValue, { color: colors.muted }]}>{langSelect}</Text>
                <ChevronRight size={16} color={colors.muted} />
              </View>
            </TouchableOpacity>
          </View>

          <View style={[styles.settingsGroupCard, { backgroundColor: colors.white, borderColor: colors.border }]}>
            <Text style={[styles.settingsGroupTitle, { color: colors.teal }]}>Legal & Policy</Text>

            <TouchableOpacity 
              style={styles.settingRowItem}
              onPress={() => Alert.alert("Privacy Policy", "Aquafine values user privacy. All details including names, phone numbers, and location coordinates are protected safely inside our secured backend database and are never shared with third parties.")}
            >
              <View style={styles.settingRowLabelWrap}>
                <FileText size={18} color={colors.slate} style={{ marginRight: 10 }} />
                <Text style={[styles.settingRowLabel, { color: colors.slate }]}>Privacy Policy</Text>
              </View>
              <ChevronRight size={16} color={colors.muted} />
            </TouchableOpacity>

            <View style={[styles.settingsDivider, { backgroundColor: colors.border }]} />

            <TouchableOpacity 
              style={styles.settingRowItem}
              onPress={() => Alert.alert("Terms & Conditions", "By placing orders on the Aquafine mobile application, you agree to our standard bulk delivery logistics and minimum order checkout parameters.")}
            >
              <View style={styles.settingRowLabelWrap}>
                <FileText size={18} color={colors.slate} style={{ marginRight: 10 }} />
                <Text style={[styles.settingRowLabel, { color: colors.slate }]}>Terms & Conditions</Text>
              </View>
              <ChevronRight size={16} color={colors.muted} />
            </TouchableOpacity>
          </View>

          {/* Version Info */}
          <Text style={[styles.appVersionText, { color: colors.muted }]}>
            Aquafine App v1.2.0 • Premium Edition
          </Text>

          {/* Delete Account */}
          <TouchableOpacity 
            style={[styles.deleteAccountBtn, { borderColor: colors.red }]} 
            onPress={handleDeleteAccount}
          >
            <Trash2 size={16} color={colors.red} style={{ marginRight: 8 }} />
            <Text style={[styles.deleteAccountText, { color: colors.red }]}>Delete Account</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    );
  };

  // --- SUB-VIEW 5: HELP & SUPPORT ---
  const renderHelpSubView = () => {
    return (
      <View style={{ flex: 1 }}>
        {renderSubHeader("Help & Support")}
        <ScrollView contentContainerStyle={styles.scrollSubContainer}>
          <View style={[styles.helpCard, { backgroundColor: colors.white, borderColor: colors.border }]}>
            <HelpCircle size={48} color={colors.teal} style={styles.helpIconCenter} />
            <Text style={[styles.helpTitle, { color: colors.slate }]}>How can we assist you?</Text>
            <Text style={[styles.helpDesc, { color: colors.muted }]}>
              Whether you need customized bulk branding order quotes, delivery dispatch inquiries, or account help, our teams are available.
            </Text>

            <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />

            {/* Branded Contacts */}
            <View style={styles.contactItemRow}>
              <Phone size={18} color={colors.teal} style={{ marginRight: 12 }} />
              <View>
                <Text style={[styles.contactLabel, { color: colors.muted }]}>Call Support Desk</Text>
                <Text style={[styles.contactValue, { color: colors.slate }]}>+91 82717 48494</Text>
              </View>
            </View>

            <View style={styles.contactItemRow}>
              <Mail size={18} color={colors.teal} style={{ marginRight: 12 }} />
              <View>
                <Text style={[styles.contactLabel, { color: colors.muted }]}>Email Support Desk</Text>
                <Text style={[styles.contactValue, { color: colors.slate }]}>support@aquafine.com</Text>
              </View>
            </View>

            {/* WhatsApp Trigger Button */}
            <TouchableOpacity 
              style={[styles.whatsappSupportBtn, { backgroundColor: "#25d366" }]} 
              activeOpacity={0.85}
              onPress={handleWhatsAppSupport}
            >
              <MessageSquare size={18} color="#ffffff" style={{ marginRight: 8 }} />
              <Text style={styles.whatsappSupportText}>Chat on WhatsApp</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    );
  };

  // If a subview is active, render it in place
  if (subView === "orders") return renderOrdersSubView();
  if (subView === "account") return renderAccountSubView();
  if (subView === "addresses") return renderAddressesSubView();
  if (subView === "settings") return renderSettingsSubView();
  if (subView === "help") return renderHelpSubView();

  // Primary list view
  const primaryMenuItems = [
    { label: "Orders", icon: Package, action: () => setSubView("orders") },
    { label: "Account Details", icon: User, action: () => setSubView("account") },
    { label: "Saved Addresses", icon: MapPin, action: () => setSubView("addresses") },
    { label: "Settings", icon: Settings, action: () => setSubView("settings") },
    { label: "Help & Support", icon: HelpCircle, action: () => setSubView("help") }
  ];

  return (
    <ScrollView contentContainerStyle={styles.page}>
      {/* Hero profile card */}
      <View style={[styles.profileHero, { backgroundColor: colors.white, borderColor: colors.border }]}>
        <View style={[styles.avatar, { backgroundColor: colors.teal }]}>
          <User size={30} color="#ffffff" />
        </View>
        <View>
          <Text style={[styles.profileName, { color: colors.slate }]}>{user?.fullName || "Valued Customer"}</Text>
          <Text style={[styles.profileMobile, { color: colors.muted }]}>{user?.mobile || "N/A"}</Text>
          <Text style={[styles.profileEmail, { color: colors.muted }]}>{user?.email || "N/A"}</Text>
        </View>
      </View>

      {/* Profile menu choices */}
      {primaryMenuItems.map((item) => {
        const Icon = item.icon;
        return (
          <TouchableOpacity
            key={item.label}
            style={[styles.profileItem, { backgroundColor: colors.white, borderColor: colors.border }]}
            activeOpacity={0.82}
            onPress={item.action}
          >
            <View style={styles.profileItemLeft}>
              <Icon size={21} color={colors.teal} />
              <Text style={[styles.profileItemText, { color: colors.slate }]}>{item.label}</Text>
            </View>
            <ChevronRight size={18} color={colors.muted} />
          </TouchableOpacity>
        );
      })}

      <TouchableOpacity 
        style={[styles.logoutButton, { backgroundColor: isDarkMode ? "#1d1214" : "#fff1f2", borderColor: isDarkMode ? "#3c1a1f" : "#fecdd3" }]} 
        activeOpacity={0.82}
        onPress={logout}
      >
        <LogOut size={20} color={colors.red} />
        <Text style={[styles.logoutText, { color: colors.red }]}>Logout</Text>
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
    borderRadius: 22,
    borderWidth: 1,
    flexDirection: "row",
    marginBottom: 20,
    padding: 18,
  },
  avatar: {
    alignItems: "center",
    borderRadius: 18,
    height: 58,
    justifyContent: "center",
    marginRight: 14,
    width: 58,
  },
  profileName: {
    fontSize: 21,
    fontWeight: "900",
  },
  profileMobile: {
    fontSize: 13,
    fontWeight: "700",
    marginTop: 3,
  },
  profileEmail: {
    fontSize: 12,
    fontWeight: "600",
    marginTop: 1,
  },
  profileItem: {
    alignItems: "center",
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
    padding: 15,
  },
  profileItemLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  profileItemText: {
    fontSize: 15,
    fontWeight: "800",
    marginLeft: 12,
  },
  logoutButton: {
    alignItems: "center",
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: "row",
    marginTop: 4,
    padding: 15,
  },
  logoutText: {
    fontSize: 15,
    fontWeight: "900",
    marginLeft: 12,
  },

  // Subheaders & Back Buttons
  subHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 18,
    paddingTop: 48,
    paddingBottom: 15,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  subHeaderTitle: {
    fontSize: 20,
    fontWeight: "900",
  },
  scrollSubContainer: {
    paddingHorizontal: 18,
    paddingBottom: 108,
    paddingTop: 10,
  },

  // Forms elements
  formGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: "800",
    marginBottom: 8,
  },
  textInput: {
    height: 48,
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 15,
    fontSize: 14,
    fontWeight: "600",
  },
  rowInputs: {
    flexDirection: "row",
  },
  actionSubmitBtn: {
    height: 48,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 15,
    elevation: 3,
    shadowColor: "#0f766e",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
  },
  actionSubmitText: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "900",
  },
  switchRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
  },
  switchLabel: {
    fontSize: 14,
    fontWeight: "800",
  },

  // Address Cards styles
  addAddressBarBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderStyle: "dashed",
    borderRadius: 16,
    height: 52,
    marginBottom: 16,
  },
  addAddressBarText: {
    fontSize: 14,
    fontWeight: "900",
    marginLeft: 8,
  },
  addressCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
    marginBottom: 12,
    position: "relative",
  },
  defaultBadge: {
    position: "absolute",
    right: 15,
    top: 15,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  defaultBadgeText: {
    color: "#ffffff",
    fontSize: 9,
    fontWeight: "900",
  },
  addressName: {
    fontSize: 16,
    fontWeight: "900",
    marginBottom: 6,
  },
  addressDetails: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "600",
    marginBottom: 4,
  },
  addressPhone: {
    fontSize: 12,
    fontWeight: "600",
  },
  addressGeoCoords: {
    fontSize: 12,
    fontWeight: "700",
    marginTop: 6,
  },
  addressCardActions: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: "#eef2f7",
    marginTop: 14,
    paddingTop: 12,
    gap: 16,
  },
  addrCardActionBtn: {
    flexDirection: "row",
    alignItems: "center",
  },
  addrCardActionText: {
    fontSize: 13,
    fontWeight: "800",
  },

  // Geolocations button
  locationBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 48,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 16,
  },
  locationBtnText: {
    fontSize: 14,
    fontWeight: "900",
  },
  geoCoordsText: {
    fontSize: 12,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 14,
  },

  // Help & Support section
  helpCard: {
    borderRadius: 24,
    borderWidth: 1,
    padding: 24,
    alignItems: "center",
  },
  helpIconCenter: {
    marginBottom: 16,
  },
  helpTitle: {
    fontSize: 20,
    fontWeight: "900",
    textAlign: "center",
    marginBottom: 8,
  },
  helpDesc: {
    fontSize: 13,
    lineHeight: 18,
    textAlign: "center",
    fontWeight: "500",
    paddingHorizontal: 10,
    marginBottom: 20,
  },
  dividerLine: {
    width: "100%",
    height: 1,
    marginBottom: 20,
  },
  contactItemRow: {
    flexDirection: "row",
    alignSelf: "flex-start",
    alignItems: "center",
    marginBottom: 16,
    paddingLeft: 8,
  },
  contactLabel: {
    fontSize: 11,
    fontWeight: "800",
  },
  contactValue: {
    fontSize: 15,
    fontWeight: "900",
    marginTop: 2,
  },
  whatsappSupportBtn: {
    width: "100%",
    height: 48,
    borderRadius: 15,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 15,
    elevation: 3,
    shadowColor: "#25d366",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
  },
  whatsappSupportText: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "900",
  },

  // Settings screen styles
  settingsGroupCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
    marginBottom: 16,
  },
  settingsGroupTitle: {
    fontSize: 12,
    fontWeight: "900",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  settingRowItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
  },
  settingRowLabelWrap: {
    flexDirection: "row",
    alignItems: "center",
  },
  settingRowLabel: {
    fontSize: 14,
    fontWeight: "800",
  },
  settingRowValueWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  settingRowValue: {
    fontSize: 13,
    fontWeight: "800",
  },
  settingsDivider: {
    height: 1,
  },
  appVersionText: {
    textAlign: "center",
    fontSize: 12,
    fontWeight: "700",
    marginVertical: 16,
  },
  deleteAccountBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderRadius: 16,
    height: 48,
  },
  deleteAccountText: {
    fontSize: 14,
    fontWeight: "900",
  },

  // Orders styles
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 30,
    paddingTop: 80,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "900",
    marginTop: 16,
    marginBottom: 6,
  },
  emptySub: {
    fontSize: 13,
    fontWeight: "600",
    textAlign: "center",
  },
  orderCard: {
    borderRadius: 22,
    borderWidth: 1,
    padding: 16,
    marginBottom: 14,
  },
  orderCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  orderDate: {
    fontSize: 13,
    fontWeight: "800",
  },
  orderAmount: {
    fontSize: 16,
    fontWeight: "900",
  },
  orderId: {
    fontSize: 12,
    fontWeight: "700",
    marginBottom: 2,
  },
  paymentId: {
    fontSize: 11,
    fontWeight: "700",
    marginBottom: 12,
  },
  orderItemsBox: {
    padding: 10,
    borderRadius: 12,
    marginBottom: 14,
  },
  orderProductText: {
    fontSize: 12,
    lineHeight: 18,
    fontWeight: "600",
    marginBottom: 4,
  },
  timelineTitle: {
    fontSize: 13,
    fontWeight: "800",
    textTransform: "uppercase",
    marginBottom: 12,
  },
  timelineContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 4,
  },
  timelineStep: {
    alignItems: "center",
    width: "18%",
  },
  timelineDotWrap: {
    alignItems: "center",
    width: "100%",
    position: "relative",
    height: 18,
    justifyContent: "center",
  },
  timelineDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    zIndex: 3,
    justifyContent: "center",
    alignItems: "center",
  },
  timelineLine: {
    position: "absolute",
    height: 2,
    width: "250%",
    left: "50%",
    zIndex: 1,
  },
  timelineLabel: {
    fontSize: 9,
    fontWeight: "700",
    marginTop: 6,
    textAlign: "center",
  },
});
