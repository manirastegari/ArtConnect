import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';

const ItemCardRow = ({ image, title, category, price, onPress }) => {
  // Truncate the title to 20 characters
  const truncatedTitle = title.length > 35 ? title.substring(0, 35) + '...' : title;

  return (
    <TouchableOpacity onPress={onPress} style={styles.card}>
      <View style={styles.imageContainer}>
        <Image source={{ uri: `data:image/webp;base64,${image}` }} style={styles.image} />
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.title}>{truncatedTitle}</Text>
        <View style={styles.priceCategoryContainer}>
          <Text style={styles.price}>${price}</Text>
          <Text style={styles.category}>{category}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    margin: 4,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  imageContainer: {
    marginRight: 8,
  },
  image: {
    width: 75,
    height: 55,
    borderRadius: 8,
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  priceCategoryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  price: {
    fontSize: 14,
    color: '#000',
  },
  category: {
    fontSize: 14,
    color: '#666',
  },
});

export default ItemCardRow;