import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@clerk/clerk-expo';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../../lib/trpc';
import { Colors, BorderRadius, Spacing, FontSizes } from '../../constants/theme';

type IconName = keyof typeof Ionicons.glyphMap;

interface QuickAction {
  title: string;
  description: string;
  href: string;
  icon: IconName;
  color: string;
  bgColor: string;
}

const quickActions: QuickAction[] = [
  { title: 'Songs', description: 'Manage your song library with lyrics and metadata', href: 'songs', icon: 'musical-notes', color: Colors.blue, bgColor: `${Colors.blue}15` },
  { title: 'Rounds', description: 'Create and organize setlists for performances', href: 'rounds', icon: 'list', color: Colors.orange, bgColor: `${Colors.orange}15` },
  { title: 'Performance', description: 'Start a performance session with lyrics display', href: 'performance', icon: 'play-circle', color: Colors.red, bgColor: `${Colors.red}15` },
  { title: 'Groups', description: 'Manage your bands and invite members', href: 'groups', icon: 'people', color: Colors.green, bgColor: `${Colors.green}15` },
  { title: 'Calendar', description: 'View and manage upcoming performances', href: 'calendar', icon: 'calendar', color: Colors.purple, bgColor: `${Colors.purple}15` },
];

export default function HomeScreen() {
  const { signOut, userId } = useAuth();
  const router = useRouter();
  const [refreshing, setRefreshing] = React.useState(false);

  const songsQuery = api.songs.list.useQuery(undefined, { enabled: !!userId });
  const roundsQuery = api.rounds.list.useQuery(undefined, { enabled: !!userId });
  const groupsQuery = api.groups.list.useQuery(undefined, { enabled: !!userId });
  const performancesQuery = api.performances.upcoming.useQuery({ limit: 5 }, { enabled: !!userId });

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([songsQuery.refetch(), roundsQuery.refetch(), groupsQuery.refetch(), performancesQuery.refetch()]);
    setRefreshing(false);
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      router.replace('/(auth)/sign-in');
    } catch (err) {
      console.error('Sign out error:', err);
    }
  };

  const stats = [
    { label: 'Songs', value: songsQuery.data?.length ?? 0, color: Colors.blue },
    { label: 'Rounds', value: roundsQuery.data?.length ?? 0, color: Colors.orange },
    { label: 'Groups', value: groupsQuery.data?.length ?? 0, color: Colors.green },
    { label: 'Upcoming', value: performancesQuery.data?.length ?? 0, color: Colors.purple },
  ];

  const isLoading = songsQuery.isLoading || roundsQuery.isLoading;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={Colors.primary} />}
        showsVerticalScrollIndicator={false}
      >
      <View style={styles.header}>
        <Text style={styles.title}>Band Manager</Text>
        <Text style={styles.subtitle}>Organize your songs, create setlists, and manage performances</Text>
      </View>

      <View style={styles.statsGrid}>
        {stats.map((stat) => (
          <View key={stat.label} style={styles.statCard}>
            {isLoading ? (
              <ActivityIndicator color={stat.color} />
            ) : (
              <Text style={[styles.statValue, { color: stat.color }]}>{stat.value}</Text>
            )}
            <Text style={styles.statLabel}>{stat.label}</Text>
          </View>
        ))}
      </View>

      <Text style={styles.sectionTitle}>Quick Actions</Text>
      <View style={styles.actionsContainer}>
        {quickActions.map((action) => (
          <TouchableOpacity
            key={action.title}
            onPress={() => router.push(`/(app)/${action.href}` as any)}
            style={styles.actionCard}
            activeOpacity={0.7}
          >
            <View style={[styles.actionIcon, { backgroundColor: action.bgColor }]}>
              <Ionicons name={action.icon} size={24} color={action.color} />
            </View>
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>{action.title}</Text>
              <Text style={styles.actionDescription} numberOfLines={2}>{action.description}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={Colors.mutedForeground} />
          </TouchableOpacity>
        ))}
      </View>

      {performancesQuery.data && performancesQuery.data.length > 0 && (
        <View style={styles.upcomingSection}>
          <Text style={styles.sectionTitle}>Upcoming Performances</Text>
          {performancesQuery.data.slice(0, 3).map((perf) => (
            <TouchableOpacity key={perf.id} style={styles.performanceCard} onPress={() => router.push(`/(app)/calendar`)} activeOpacity={0.7}>
              <View style={styles.performanceIcon}>
                <Ionicons name="calendar" size={20} color={Colors.purple} />
              </View>
              <View style={styles.performanceContent}>
                <Text style={styles.performanceTitle}>{perf.name}</Text>
                <Text style={styles.performanceDate}>
                  {new Date(perf.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </Text>
              </View>
              <View style={styles.groupBadge}>
                <Text style={styles.groupBadgeText}>{perf.group.name}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}

      <TouchableOpacity onPress={handleSignOut} style={styles.signOutButton} activeOpacity={0.7}>
        <Text style={styles.signOutText}>Sign Out</Text>
      </TouchableOpacity>
    </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scrollView: { flex: 1 },
  content: { padding: Spacing.lg },
  header: { marginBottom: Spacing.xl },
  title: { fontSize: 28, fontWeight: '800', color: Colors.foreground, marginBottom: Spacing.sm },
  subtitle: { fontSize: FontSizes.lg, color: Colors.mutedForeground, lineHeight: 24 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.md, marginBottom: Spacing.xl },
  statCard: { flex: 1, minWidth: '45%', backgroundColor: Colors.card, borderRadius: BorderRadius.lg, padding: Spacing.lg, borderWidth: 1, borderColor: Colors.border },
  statValue: { fontSize: 28, fontWeight: '700' },
  statLabel: { fontSize: FontSizes.sm, color: Colors.mutedForeground, marginTop: 4 },
  sectionTitle: { fontSize: FontSizes.xl, fontWeight: '700', color: Colors.foreground, marginBottom: Spacing.md },
  actionsContainer: { gap: Spacing.md, marginBottom: Spacing.xl },
  actionCard: { backgroundColor: Colors.card, borderRadius: BorderRadius.lg, padding: Spacing.lg, borderWidth: 1, borderColor: Colors.border, flexDirection: 'row', alignItems: 'center' },
  actionIcon: { width: 48, height: 48, borderRadius: BorderRadius.md, alignItems: 'center', justifyContent: 'center', marginRight: Spacing.lg },
  actionContent: { flex: 1 },
  actionTitle: { fontSize: FontSizes.lg, fontWeight: '600', color: Colors.foreground },
  actionDescription: { fontSize: FontSizes.sm, color: Colors.mutedForeground, marginTop: 2 },
  upcomingSection: { marginBottom: Spacing.xl },
  performanceCard: { backgroundColor: Colors.card, borderRadius: BorderRadius.lg, padding: Spacing.lg, borderWidth: 1, borderColor: Colors.border, marginBottom: Spacing.md, flexDirection: 'row', alignItems: 'center' },
  performanceIcon: { width: 40, height: 40, borderRadius: BorderRadius.md, backgroundColor: `${Colors.purple}15`, alignItems: 'center', justifyContent: 'center', marginRight: Spacing.md },
  performanceContent: { flex: 1 },
  performanceTitle: { fontSize: FontSizes.lg, fontWeight: '600', color: Colors.foreground },
  performanceDate: { fontSize: FontSizes.sm, color: Colors.mutedForeground, marginTop: 2 },
  groupBadge: { backgroundColor: `${Colors.blue}15`, paddingHorizontal: 10, paddingVertical: 4, borderRadius: BorderRadius.full },
  groupBadgeText: { fontSize: FontSizes.xs, fontWeight: '600', color: Colors.blue },
  signOutButton: { backgroundColor: `${Colors.red}15`, borderRadius: BorderRadius.lg, padding: Spacing.lg, alignItems: 'center', marginBottom: 32 },
  signOutText: { color: Colors.red, fontWeight: '600', fontSize: FontSizes.lg },
});
