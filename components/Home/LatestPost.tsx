import { View, Text, Pressable, StyleSheet } from 'react-native'
import React, { useEffect, useState } from 'react'
import Colors from '../../app/constants/Colors';
import axios from 'axios';
import PostList from '../Post/PostList';

export default function LatestPost() {
    const [selectedTab, setSelectedTab] = useState(0);
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        GetPosts();
    }, [selectedTab]); // <- важно: при смяна на таба презареждай постовете

    const GetPosts = async () => {
        setLoading(true);

        let orderField = selectedTab === 0 ? 'post.id' : 'post.likes_count'; 
        // Ако е Latest -> сортирай по id (нови)
        // Ако е Trending -> сортирай по likes_count (харесвания)

        try {
            const result = await axios.get(`${process.env.EXPO_PUBLIC_HOST_URL}/post?club=0&orderField=${orderField}`);
            setPosts(result.data);
        } catch (error) {
            console.error('Грешка при зареждане на постовете:', error);
        }
        
        setLoading(false);
    }

    return (
        <View style={{ marginTop: 15, marginBottom: 15 }}>
            <View style={{ flexDirection: 'row', gap: 8 }}>
                <Pressable onPress={() => setSelectedTab(0)}>
                    <Text style={[styles.tabtext, 
                        { backgroundColor: selectedTab == 0 ? Colors.PRIMARY : Colors.WHITE,
                          color: selectedTab == 0 ? Colors.WHITE : Colors.PRIMARY }
                    ]}>
                        Latest
                    </Text>
                </Pressable>
                <Pressable onPress={() => setSelectedTab(1)}>
                    <Text style={[styles.tabtext, 
                        { backgroundColor: selectedTab == 1 ? Colors.PRIMARY : Colors.WHITE,
                          color: selectedTab == 1 ? Colors.WHITE : Colors.PRIMARY }
                    ]}>
                        Trending
                    </Text>
                </Pressable>
            </View>

            <PostList 
                posts={posts}
                loading={loading}
                OnRefresh={GetPosts}
            />
        </View>
    )
}

const styles = StyleSheet.create({
    tabtext: {
        padding: 4, 
        fontSize: 20, 
        paddingHorizontal: 15, 
        borderRadius: 99,
        marginBottom: 15,
    }
})
