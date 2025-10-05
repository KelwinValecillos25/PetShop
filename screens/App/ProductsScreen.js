// screens/App/ProductsScreen.js
import React, { useState, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, Alert, Image, StyleSheet, Modal } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';

// Datos iniciales si no hay nada guardado
const INITIAL_PRODUCTS = [
  { id: '1', name: 'Dog Chow - 3Kg', category: 'perro', price: '15.00', image: require('../../assets/dog-food.png') },
  { id: '2', name: 'Juguete para Gato', category: 'gato', price: '5.00', image: require('../../assets/cat-toy.png') },
];

const ProductsScreen = ({ navigation }) => {
  const [products, setProducts] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentProduct, setCurrentProduct] = useState({ id: null, name: '', category: '', price: '' });
  const [dollarRate, setDollarRate] = useState('36.50');

  const loadData = async () => {
    try {
      let storedProducts = await AsyncStorage.getItem('products');
      if (!storedProducts) {
        await AsyncStorage.setItem('products', JSON.stringify(INITIAL_PRODUCTS));
        storedProducts = JSON.stringify(INITIAL_PRODUCTS);
      }
      setProducts(JSON.parse(storedProducts));
      const storedRate = await AsyncStorage.getItem('dollarRate');
      if (storedRate) setDollarRate(storedRate);
    } catch (e) { Alert.alert("Error", "No se pudieron cargar los datos."); }
  };
  
  useFocusEffect(useCallback(() => { loadData(); }, []));

  const handleRateChange = async (rate) => {
    setDollarRate(rate);
    await AsyncStorage.setItem('dollarRate', rate);
  };

  const saveProducts = async (newProducts) => {
    await AsyncStorage.setItem('products', JSON.stringify(newProducts));
    setProducts(newProducts);
  };

  const handleSaveProduct = () => {
    if (!currentProduct.name || !currentProduct.category || !currentProduct.price || isNaN(currentProduct.price)) {
        Alert.alert("Error", "Por favor, completa todos los campos con valores válidos.");
        return;
    }
    const categoryLower = currentProduct.category.toLowerCase();
    if (categoryLower !== 'perro' && categoryLower !== 'gato') {
        Alert.alert("Categoría Inválida", "La categoría debe ser 'perro' o 'gato'.");
        return;
    }

    let updatedProducts;

    if (isEditing) {
      // Si se está editando, mantener la imagen original a menos que se cambie la categoría
      updatedProducts = products.map(p => {
        if (p.id === currentProduct.id) {
          // Si la categoría cambia, actualiza la imagen también
          const newImage = categoryLower === 'perro' 
            ? require('../../assets/dog-food.png') 
            : require('../../assets/cat-toy.png');
          return { ...currentProduct, category: categoryLower, image: newImage };
        }
        return p;
      });
    } else {
      // Si es un producto nuevo, asignar la imagen según la categoría
      const newImage = categoryLower === 'perro' 
        ? require('../../assets/dog-food.png') 
        : require('../../assets/cat-toy.png');
      
      const newProduct = { 
        ...currentProduct, 
        id: Date.now().toString(), 
        category: categoryLower,
        image: newImage 
      };
      updatedProducts = [...products, newProduct];
    }

    saveProducts(updatedProducts);
    setModalVisible(false);
  };

  const handleDeleteProduct = (id) => {
    Alert.alert("Confirmar", "¿Seguro que quieres eliminar este producto?", [
      { text: "Cancelar" },
      { text: "Eliminar", onPress: () => saveProducts(products.filter(p => p.id !== id)), style: "destructive" }
    ]);
  };

  const openModal = (product = null) => {
    if (product) {
      setIsEditing(true);
      setCurrentProduct(product);
    } else {
      setIsEditing(false);
      setCurrentProduct({ id: null, name: '', category: '', price: '' });
    }
    setModalVisible(true);
  };
  
  // El resto del código JSX es el mismo que en la versión anterior
  return (
    <View style={styles.container}>
      <View style={styles.header}><Text style={styles.headerTitle}>Products</Text></View>
      <View style={styles.rateContainer}>
        <Text style={styles.rateLabel}>Tasa del Dólar (Bs):</Text>
        <TextInput style={styles.rateInput} value={dollarRate} onChangeText={handleRateChange} keyboardType="numeric" />
      </View>
      <TouchableOpacity style={styles.addButton} onPress={() => openModal()}>
        <Text style={styles.addButtonText}>Agregar Nuevo Producto</Text>
      </TouchableOpacity>
      <FlatList
        data={products}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={styles.productItem}>
            <Image source={item.image} style={styles.productImage} />
            <View style={styles.productInfo}>
              <Text style={styles.productName}>{item.name}</Text>
              <Text style={styles.productPrice}>${parseFloat(item.price).toFixed(2)}</Text>
            </View>
            <View style={styles.productActions}>
                <TouchableOpacity style={styles.actionButton} onPress={() => openModal(item)}><Text style={styles.actionButtonText}>Update</Text></TouchableOpacity>
                <TouchableOpacity style={[styles.actionButton, styles.deleteButton]} onPress={() => handleDeleteProduct(item.id)}><Text style={styles.actionButtonText}>Delete</Text></TouchableOpacity>
            </View>
          </View>
        )}
      />
      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={styles.modalTitle}>{isEditing ? 'Editar Producto' : 'Nuevo Producto'}</Text>
            <TextInput placeholder="Nombre" value={currentProduct.name} onChangeText={text => setCurrentProduct({...currentProduct, name: text})} style={styles.modalInput} />
            <TextInput placeholder="Categoría (perro/gato)" value={currentProduct.category} onChangeText={text => setCurrentProduct({...currentProduct, category: text})} style={styles.modalInput} autoCapitalize="none" />
            <TextInput placeholder="Precio en $" value={String(currentProduct.price)} onChangeText={text => setCurrentProduct({...currentProduct, price: text})} keyboardType="numeric" style={styles.modalInput} />
            <TouchableOpacity style={styles.modalSaveButton} onPress={handleSaveProduct}><Text style={styles.modalButtonText}>Guardar</Text></TouchableOpacity>
            <TouchableOpacity style={styles.modalCancelButton} onPress={() => setModalVisible(false)}><Text style={styles.modalCancelText}>Cancelar</Text></TouchableOpacity>
          </View>
        </View>
      </Modal>
      <TouchableOpacity onPress={() => navigation.navigate('Home')} style={{alignSelf:'center', padding:10, backgroundColor:'#ddd', borderRadius:5, marginTop:10}}><Text>Volver al Home</Text></TouchableOpacity>
    </View>
  );
};
// ... (los estilos son los mismos que en la versión anterior)
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FFFFFF', paddingTop: 40 },
    header: { paddingHorizontal: 20, paddingBottom: 10 },
    headerTitle: { fontSize: 24, fontWeight: 'bold' },
    rateContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F0F0F0', borderRadius: 10, marginHorizontal: 20, padding: 15, marginBottom: 20 },
    rateLabel: { fontSize: 16, fontWeight: 'bold', marginRight: 10 },
    rateInput: { flex: 1, height: 40, backgroundColor: '#FFFFFF', borderRadius: 5, paddingHorizontal: 10, fontSize: 16 },
    addButton: { backgroundColor: '#4CAF50', borderRadius: 10, paddingVertical: 15, marginHorizontal: 20, marginBottom: 20, alignItems: 'center' },
    addButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
    productItem: { flexDirection: 'row', backgroundColor: '#FFFFFF', borderRadius: 15, padding: 15, marginHorizontal: 20, marginBottom: 15, alignItems: 'center', elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.2, shadowRadius: 2 },
    productImage: { width: 60, height: 60, resizeMode: 'contain', marginRight: 15 },
    productInfo: { flex: 1 },
    productName: { fontSize: 16, fontWeight: 'bold', marginBottom: 5 },
    productPrice: { fontSize: 14, color: '#666' },
    productActions: { flexDirection: 'column' },
    actionButton: { backgroundColor: '#FFC107', borderRadius: 8, paddingVertical: 8, paddingHorizontal: 15, marginBottom: 8 },
    deleteButton: { backgroundColor: '#F44336' },
    actionButtonText: { color: '#FFFFFF', fontSize: 12, fontWeight: 'bold' },
    centeredView: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
    modalView: { width: '85%', backgroundColor: 'white', borderRadius: 20, padding: 25, alignItems: 'center', elevation: 5 },
    modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 20 },
    modalInput: { width: '100%', height: 45, backgroundColor: '#F0F0F0', borderRadius: 10, paddingHorizontal: 15, marginBottom: 15, fontSize: 16 },
    modalSaveButton: { backgroundColor: '#4CAF50', borderRadius: 10, paddingVertical: 12, paddingHorizontal: 40, marginTop: 10 },
    modalButtonText: { color: 'white', fontWeight: 'bold' },
    modalCancelButton: { marginTop: 15 },
    modalCancelText: { color: '#888' },
});

export default ProductsScreen;