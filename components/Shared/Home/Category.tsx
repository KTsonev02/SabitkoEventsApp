import { View, Text, FlatList, Image, StyleSheet, Dimensions, TouchableOpacity } from 'react-native'
import React from 'react'
import { useRouter } from 'expo-router'

const categoryOptions=[
    {
        name: 'Upcoming Event',
        banner: require('@/assets/images/upcoming_events.jpg'),
        path: '(tabs)/Event',
    },
    {
        name: 'Latest Event',
        banner: require('@/assets/images/upcoming_events.jpg'),
        path: '(tabs)/Home',
    },
    {
        name: 'Add Event',
        banner: require('@/assets/images/upcoming_events.jpg'),
        path: '/add-event',
    },

    {
        name: 'Add Event',
        banner: require('@/assets/images/upcoming_events.jpg'),
        path: '/add-post',
    }
]

export default function Category() {

   const router=useRouter();
  return (
    <View style={{marginTop: 15}}>
      <FlatList 
      numColumns={2}
      data = {categoryOptions}
      renderItem={({item, index})=>(
        <TouchableOpacity
        //@ts-ignore
        onPress={()=>router.push(item.path)}
         style = {styles.cardContainer}> 
            <Image source={item.banner}
              style = {styles.bannerImage}
            />
            <Text style={styles.text}>{item.name}</Text>
        </TouchableOpacity>
      )}
      />
    </View>
  )
}

const styles = StyleSheet.create({
    cardContainer:{
        margin: 5
    },
    bannerImage: {
        width: Dimensions.get('screen').width* 0.43,
        height: 80,
        objectFit: 'cover',
        borderRadius: 10,
    },
    text:{
        position: 'absolute',
        padding: 10,
        fontSize: 18,
        fontWeight: 'bold',
        color: 'purple',
    }

})