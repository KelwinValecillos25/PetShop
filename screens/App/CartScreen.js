// screens/App/CartScreen.js
import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, Image, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';

const CartScreen = ({ navigation }) => {
  const [cartItems, setCartItems] = useState([]);
  const [dollarRate, setDollarRate] = useState(1);

  const loadCartData = async () => {
    const storedCart = await AsyncStorage.getItem('cart');
    setCartItems(storedCart ? JSON.parse(storedCart) : []);
    const storedRate = await AsyncStorage.getItem('dollarRate');
    setDollarRate(storedRate ? parseFloat(storedRate) : 1);
  };
  
  useFocusEffect(useCallback(() => { loadCartData(); }, []));
  
  const totalUSD = cartItems.reduce((sum, item) => sum + parseFloat(item.price), 0);
  const totalBS = totalUSD * dollarRate;

  const handleRemoveItem = async (indexToRemove) => {
    const updatedCart = cartItems.filter((_, index) => index !== indexToRemove);
    await AsyncStorage.setItem('cart', JSON.stringify(updatedCart));
    setCartItems(updatedCart);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}><Text style={styles.headerBack}>←</Text></TouchableOpacity>
        <Text style={styles.headerTitle}>Shopping Cart</Text>
      </View>
      {cartItems.length === 0 ? (
        <Text style={styles.emptyText}>Tu carrito está vacío.</Text>
      ) : (
        <>
          <FlatList
            data={cartItems}
            keyExtractor={(item, index) => item.id + '-' + index}
            renderItem={({ item, index }) => (
              <View style={styles.cartItem}>
                <Image source={item.image} style={styles.itemImage} />
                <View style={styles.itemDetails}>
                  <Text style={styles.itemName}>{item.name}</Text>
                  <Text style={styles.itemPrice}>${parseFloat(item.price).toFixed(2)}</Text>
                </View>
                <TouchableOpacity onPress={() => handleRemoveItem(index)}><Text style={styles.deleteButton}>Delete</Text></TouchableOpacity>
              </View>
            )}
            contentContainerStyle={{ paddingHorizontal: 20 }}
          />
          <View style={styles.totalContainer}>
            <Text style={styles.totalText}>Total: {totalBS.toFixed(2)} Bs.</Text>
            <Text style={styles.subTotalText}>(${totalUSD.toFixed(2)})</Text>
          </View>
          <TouchableOpacity style={styles.checkoutButton}><Text style={styles.checkoutText}>Proceder al Pago</Text></TouchableOpacity>
        </>
      )}
    </View>
  );
};
// ... (copia y pega los estilos de la respuesta anterior de "CartScreen")
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FFFFFF', paddingTop: 40 },
    header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingBottom: 15, borderBottomWidth: 1, borderBottomColor: '#eee' },
    headerBack: { fontSize: 24, fontWeight: 'bold', marginRight: 15 },
    headerTitle: { fontSize: 22, fontWeight: 'bold' },
    emptyText: { textAlign: 'center', marginTop: 50, fontSize: 18, color: '#888' },
    cartItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', borderRadius: 15, padding: 15, marginTop: 15, elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.2, shadowRadius: 2 },
    itemImage: { width: 60, height: 60, resizeMode: 'contain', marginRight: 15 },
    itemDetails: { flex: 1 },
    itemName: { fontSize: 16, fontWeight: 'bold' },
    itemPrice: { fontSize: 14, color: '#666', marginTop: 5 },
    deleteButton: { color: 'white', backgroundColor: '#F44336', paddingVertical: 8, paddingHorizontal: 15, borderRadius: 8, fontWeight: 'bold', overflow: 'hidden' },
    totalContainer: { padding: 20, margin: 20, backgroundColor: '#F0F0F0', borderRadius: 15, alignItems: 'center' },
    totalText: { fontSize: 22, fontWeight: 'bold' },
    subTotalText: { fontSize: 16, color: '#666', marginTop: 5 },
    checkoutButton: { backgroundColor: '#4285F4', borderRadius: 10, paddingVertical: 18, marginHorizontal: 20, marginBottom: 20, alignItems: 'center' },
    checkoutText: { color: '#FFFFFF', fontSize: 18, fontWeight: 'bold' },
});
export default CartScreen;