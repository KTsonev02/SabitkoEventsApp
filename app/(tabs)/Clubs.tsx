import { View, Text } from 'react-native'
import React, { useEffect, useState } from 'react'
import EmptyState from '@/components/Clubs/EmptyState';
import axios from 'axios';
import PostList from '@/components/Post/PostList';
import { useRouter } from 'expo-router';
import Button from '@/components/Shared/Button';

export default function Clubs() {
    const [followedClubs, setFollowedClubs] = useState([]);
    const [loading, setLoading] = useState(false);
    const router = useRouter()

    useEffect(()=>{
        GetPosts();
    }, [])

    const GetPosts= async()=>{
            setLoading(true);
            //Fetch all post from DB
            const result = await axios.get(process.env.EXPO_PUBLIC_HOST_URL
                +'/post?club=1,2&orderField=post.id');
                setFollowedClubs(result.data);
                setLoading(false);
    
        }
  return (
    <View>
        <View style={{
            padding: 20
        }}>
            <View style={{
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center'
            }}>
            <Text style={{
                fontSize: 35,
                fontWeight: "bold"
            }}>Clubs</Text>
            <Button text='Explore Clubs' onPress={()=>router.push('/explore-clubs')} />
            {followedClubs?.length==0 && <EmptyState />}
            </View>
        </View>
          <PostList posts={followedClubs}
                    loading = {loading}
                    OnRefresh = {GetPosts}
                /> 
    </View>
  )
}