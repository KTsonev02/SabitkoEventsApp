import { View, Text, FlatList } from 'react-native'
import React, { useContext, useEffect, useState } from 'react'
import axios from 'axios'
import ClubCard from '../../../components/Clubs/ClubCard'; // Adjust the path as needed
import { Colors } from 'react-native/Libraries/NewAppScreen'
import Button from '@/components/Shared/Button';
import { AuthContext } from '@/context/AuthContext';
import { useRouter } from 'expo-router';

export type CLUB = {
  id: number,
  name: string,
  club_logo: string,
  about: string,
  createdon: string
  isFollowed:boolean
}

export default function ExploreClubs() {
  const [clubList, setClubList] = useState<CLUB[]>([]);
  const {user} = useContext(AuthContext)
  const [followedClub, setFollowedClub] = useState<any[]>([]);
  const [loading, setLoading]=useState(false);
  const router = useRouter();
  useEffect(() => {
    GetAllClubs();
  }, [])

  const GetAllClubs = async () => {
    setLoading(true)
    console.log('Fetching clubs from:', process.env.EXPO_PUBLIC_HOST_URL + '/clubs');
    try {
      const result = await axios.get(process.env.EXPO_PUBLIC_HOST_URL + '/clubs');
      console.log("Fetched clubs:", result.data);
      setClubList(result.data);
      GetUserFollowedClubs();
      setLoading(false)
    } catch (error) {
      console.error("❌ Error loading clubs:", error);
    }
  }

  const GetUserFollowedClubs = async () => {
    if (!user?.email) return;
    try {
        const result = await axios.get(`${process.env.EXPO_PUBLIC_HOST_URL}/clubfollower?u_email=${user.email}`);
        setFollowedClub(result.data); // Запазваме raw данните от API
    } catch (error) {
        console.error("Failed to fetch followed clubs:", error);
    }
};

const onAddClubBtnClick = () => {
  router.push('../add-clubs');
};

  const isFollowed = (clubId: number) => {
    return followedClub.some((item) => item.club_id === clubId); // Използваме .some() вместо .find()
};

  return (
    <View>
      <View style={{
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 15,
        backgroundColor: Colors.WHITE, 
        margin: 10,
        borderWidth: 1,
        borderStyle: 'dotted'
      }}>
      <Text style={{fontSize: 16}}>Create new Teams / Clubs</Text>
      <Button text = '+ Add' onPress={() => onAddClubBtnClick()} />
      </View>
    <FlatList
      data={clubList}
      numColumns={2}
      onRefresh={GetAllClubs}
      refreshing={loading}
      renderItem={({ item: CLUB, index}) => (
        <ClubCard {... CLUB} isFollowed={isFollowed(CLUB.id)}
        refreshData={GetAllClubs}
        />
      )} 
      />
      </View>
  )
  }
