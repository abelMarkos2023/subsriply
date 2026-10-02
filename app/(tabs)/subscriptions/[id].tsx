import { useLocalSearchParams } from "expo-router";
import { Text, TouchableOpacity, View } from "react-native";

export default function Subscription() {
  const { id } = useLocalSearchParams();
  return (
        <View>
            <Text className="text-xl font-bold text-success">
                Welcome to {id} subscription Plan
            </Text>

            <TouchableOpacity onPress={()=>{    console.log('onboarding');  }}>
                <Text>onBoarding</Text>
            </TouchableOpacity>
        </View>
    )
}