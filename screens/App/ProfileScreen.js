// screens/App/ProfileScreen.js
import React, { useContext } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { AuthContext } from '../../context/AuthContext';

const ProfileScreen = ({ navigation }) => {
  const { user, logout } = useContext(AuthContext);

  return (
    <View style={styles.container}>
      <Image source={require('../../assets/cat-profile.png')} style={styles.profileImage} />
      <Text style={styles.title}>Perfil</Text>
      <View style={styles.infoBox}>
        <Text style={styles.label}>Nombre:</Text>
        <Text style={styles.info}>{user?.name}</Text>
      </View>
      <View style={styles.infoBox}>
        <Text style={styles.label}>Email:</Text>
        <Text style={styles.info}>{user?.email}</Text>
      </View>
      <TouchableOpacity style={styles.logoutButton} onPress={logout}>
        <Text style={styles.logoutButtonText}>Cerrar Sesión</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate('Home')} style={styles.backButton}>
        <Text style={styles.backButtonText}>Volver al Home</Text>
      </TouchableOpacity>
    </View>
  );
};
// ... (copia y pega los estilos de la respuesta anterior de "ProfileScreen")
const styles = StyleSheet.create({
    container: { flex: 1, alignItems: 'center', backgroundColor: '#FFFFFF', paddingTop: 60, paddingHorizontal: 20 },
    profileImage: { width: 120, height: 120, borderRadius: 60, marginBottom: 20 },
    title: { fontSize: 28, fontWeight: 'bold', color: '#333', marginBottom: 40 },
    infoBox: { width: '100%', backgroundColor: '#F0F0F0', borderRadius: 10, padding: 15, marginBottom: 15 },
    label: { fontSize: 14, color: '#888' },
    info: { fontSize: 18, color: '#333', marginTop: 5 },
    logoutButton: { width: '100%', height: 50, backgroundColor: '#F44336', borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginTop: 30 },
    logoutButtonText: { color: '#FFFFFF', fontSize: 18, fontWeight: 'bold' },
    backButton: { marginTop: 20 },
    backButtonText: { color: '#4285F4', fontSize: 16 },
});
export default ProfileScreen;