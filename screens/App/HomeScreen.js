import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, Image, StyleSheet, Alert, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';

const HomeScreen = ({ navigation }) => {
  const [allProducts, setAllProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState(''); // Nuevo estado para el texto de búsqueda

  const loadProducts = async () => {
    try {
        const storedProducts = await AsyncStorage.getItem('products');
        const products = storedProducts ? JSON.parse(storedProducts) : [];
        setAllProducts(products);
        setFilteredProducts(products);
    } catch(e) {
        Alert.alert("Error", "No se pudieron cargar los productos.");
    }
  };
  
  useFocusEffect(useCallback(() => { 
    loadProducts();
    // Limpiar búsqueda al volver a la pantalla
    setSearchQuery('');
    setActiveCategory('all');
  }, []));

  // Hook para filtrar productos cuando cambia la categoría o el texto de búsqueda
  useEffect(() => {
    let productsToFilter = allProducts;

    // 1. Primero, filtrar por la categoría activa
    if (activeCategory !== 'all') {
      productsToFilter = productsToFilter.filter(p => p.category === activeCategory);
    }

    // 2. Luego, filtrar por el texto de búsqueda sobre el resultado anterior
    if (searchQuery.trim() !== '') {
      productsToFilter = productsToFilter.filter(p => 
        p.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    setFilteredProducts(productsToFilter);
  }, [searchQuery, activeCategory, allProducts]);


  const filterByCategory = (category) => {
    // Si se presiona la misma categoría, se deselecciona
    if (activeCategory === category) {
      setActiveCategory('all');
    } else {
      setActiveCategory(category);
    }
  };

  const addToCart = async (product) => {
    try {
        let cart = await AsyncStorage.getItem('cart');
        cart = cart ? JSON.parse(cart) : [];
        cart.push(product);
        await AsyncStorage.setItem('cart', JSON.stringify(cart));
        Alert.alert("Éxito", `${product.name} añadido al carrito.`);
    } catch(e) { Alert.alert("Error", "No se pudo añadir al carrito."); }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>PetShop</Text>
        <View style={styles.headerIcons}>
            <TouchableOpacity onPress={() => navigation.navigate('Cart')}><Text style={styles.icon}>🛒</Text></TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.navigate('Profile')}><Text style={styles.icon}>👤</Text></TouchableOpacity>
        </View>
      </View>

      {/* La barra de búsqueda ahora actualiza el estado 'searchQuery' */}
      <TextInput 
        style={styles.searchBar} 
        placeholder="Busca un producto..." 
        value={searchQuery}
        onChangeText={setSearchQuery} // Actualiza el estado en tiempo real
      />

      <View style={styles.categoryContainer}>
        <TouchableOpacity style={[styles.categoryButton, activeCategory === 'perro' && styles.categoryActive]} onPress={() => filterByCategory('perro')}><Text style={[styles.categoryText, activeCategory === 'perro' && styles.categoryTextActive]}>Perros</Text></TouchableOpacity>
        <TouchableOpacity style={[styles.categoryButton, activeCategory === 'gato' && styles.categoryActive]} onPress={() => filterByCategory('gato')}><Text style={[styles.categoryText, activeCategory === 'gato' && styles.categoryTextActive]}>Gatos</Text></TouchableOpacity>
      </View>
      
      <View style={styles.promoContainer}>
        <Image source={require('../../assets/dog-home.png')} style={styles.promoImage} />
        <Image source={require('../../assets/cat-home.png')} style={styles.promoImage} />
      </View>
      
      <Text style={styles.sectionTitle}>Productos</Text>
      {filteredProducts.length > 0 ? (
        <FlatList
          data={filteredProducts}
          keyExtractor={item => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          renderItem={({ item }) => (
            <View style={styles.productCard}>
              <Image source={item.image} style={styles.productImage} />
              <Text style={styles.productName}>{item.name}</Text>
              <Text style={styles.productPrice}>${parseFloat(item.price).toFixed(2)}</Text>
              <TouchableOpacity style={styles.addButton} onPress={() => addToCart(item)}><Text style={styles.addButtonText}>Add</Text></TouchableOpacity>
            </View>
          )}
          contentContainerStyle={{ paddingHorizontal: 20 }}
        />
      ) : (
        <Text style={styles.noProductsText}>No se encontraron productos.</Text>
      )}

      <TouchableOpacity onPress={() => navigation.navigate('Products')} style={styles.manageButton}><Text style={styles.manageButtonText}>Gestionar Productos</Text></TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FFFFFF', paddingTop: 40, },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingBottom: 10 },
    headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#FF9800' },
    headerIcons: { flexDirection: 'row' },
    icon: { fontSize: 24, marginLeft: 15 },
    searchBar: { height: 45, backgroundColor: '#F0F0F0', borderRadius: 10, paddingHorizontal: 15, marginHorizontal: 20, marginVertical: 20, fontSize: 16 },
    categoryContainer: { flexDirection: 'row', paddingHorizontal: 20, marginBottom: 20 },
    categoryButton: { backgroundColor: '#F0F0F0', borderRadius: 20, paddingVertical: 10, paddingHorizontal: 20, marginRight: 10 },
    categoryActive: { backgroundColor: '#4285F4' },
    categoryText: { color: '#888', fontWeight: 'bold' },
    categoryTextActive: { color: '#FFFFFF' },
    promoContainer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginBottom: 20, height: 120 },
    promoImage: { width: '40%', height: '100%', resizeMode: 'contain' },
    sectionTitle: { fontSize: 20, fontWeight: 'bold', paddingHorizontal: 20, marginBottom: 15 },
    productCard: { width: 160, marginRight: 15, backgroundColor: '#FFF', borderRadius: 15, padding: 10, alignItems: 'center', elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.2, shadowRadius: 2 },
    productImage: { width: 80, height: 80, resizeMode: 'contain', marginBottom: 10 },
    productName: { fontWeight: 'bold', textAlign: 'center', height: 40 },
    productPrice: { color: '#666', marginBottom: 10 },
    addButton: { backgroundColor: '#4285F4', borderRadius: 8, paddingVertical: 8, paddingHorizontal: 25 },
    addButtonText: { color: '#FFFFFF', fontWeight: 'bold' },
    manageButton: { alignSelf: 'center', backgroundColor: '#ddd', padding: 15, borderRadius: 10, marginVertical: 30 },
    manageButtonText: { fontWeight: 'bold' },
    noProductsText: { textAlign: 'center', color: '#888', marginVertical: 20, fontSize: 16 }
});

export default HomeScreen;
