import { View, Text, TouchableOpacity } from 'react-native';
import { Link } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function NotFoundScreen() {
  return (
    <View className="flex-1 bg-background items-center justify-center p-6">
      <View className="w-20 h-20 bg-muted rounded-2xl items-center justify-center mb-5">
        <Ionicons name="alert-circle" size={40} color="#6E6965" />
      </View>
      <Text className="text-2xl font-bold text-foreground mb-2">Page Not Found</Text>
      <Text className="text-base text-muted-foreground text-center mb-6">
        The page you're looking for doesn't exist.
      </Text>
      <Link href="/" asChild>
        <TouchableOpacity className="bg-primary px-6 py-3 rounded-xl">
          <Text className="text-white font-semibold">Go Home</Text>
        </TouchableOpacity>
      </Link>
    </View>
  );
}
