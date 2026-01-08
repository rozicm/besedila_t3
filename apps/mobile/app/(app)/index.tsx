import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { useAuth } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
import { api } from "../../lib/trpc";

export default function HomeScreen() {
  const { signOut, userId } = useAuth();
  const router = useRouter();

  // Example tRPC query - fetch songs list
  const { data, isLoading, error } = api.songs.list.useQuery(undefined, {
    enabled: !!userId,
  });

  const handleSignOut = async () => {
    try {
      await signOut();
      router.replace("/(auth)/sign-in");
    } catch (err) {
      Alert.alert("Error", "Failed to sign out");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to Lyrics App</Text>
      <Text style={styles.subtitle}>User ID: {userId}</Text>

      {isLoading && <Text>Loading songs...</Text>}
      {error && <Text style={styles.error}>Error: {error.message}</Text>}
      {data && (
        <View style={styles.dataContainer}>
          <Text style={styles.dataTitle}>Songs:</Text>
          <Text>{JSON.stringify(data, null, 2)}</Text>
        </View>
      )}

      <TouchableOpacity style={styles.button} onPress={handleSignOut}>
        <Text style={styles.buttonText}>Sign Out</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
    marginBottom: 20,
  },
  dataContainer: {
    marginTop: 20,
    padding: 15,
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
  },
  dataTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 10,
  },
  error: {
    color: "red",
    marginTop: 10,
  },
  button: {
    backgroundColor: "#FF3B30",
    borderRadius: 8,
    padding: 15,
    alignItems: "center",
    marginTop: 20,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});

