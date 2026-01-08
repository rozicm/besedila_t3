import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StatusBar, ActivityIndicator, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../../lib/trpc';
import { Colors, BorderRadius, Spacing, FontSizes } from '../../constants/theme';
import { useGroup } from '../../providers/group-context';

function normalizeHarmonica(value: string | undefined | null): string {
  if (!value) return '';
  return value.replace(/_/g, '-').split('-').map((part: string) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase()).join('-');
}

export default function PerformanceScreen() {
  const [selectedRounds, setSelectedRounds] = useState<number[]>([]);
  const [performanceStarted, setPerformanceStarted] = useState(false);
  const [currentSongIndex, setCurrentSongIndex] = useState(0);
  const [showLyrics, setShowLyrics] = useState(true);
  const [fontSize, setFontSize] = useState(18);

  const { selectedGroupId, isLoading: isGroupLoading } = useGroup();
  const { data: rounds, isLoading: roundsLoading } = api.rounds.list.useQuery(
    { groupId: selectedGroupId! },
    { enabled: !!selectedGroupId }
  );
  const { data: performanceData, isLoading: performanceLoading } = api.performance.getPerformanceData.useQuery({ roundIds: selectedRounds }, { enabled: selectedRounds.length > 0 && performanceStarted });

  const toggleRound = (roundId: number) => setSelectedRounds((prev) => prev.includes(roundId) ? prev.filter((id) => id !== roundId) : [...prev, roundId]);
  const handleStart = () => { if (selectedRounds.length > 0) { setPerformanceStarted(true); setCurrentSongIndex(0); setShowLyrics(true); } };
  const handleStop = () => { setPerformanceStarted(false); setSelectedRounds([]); setCurrentSongIndex(0); };
  const handleNext = () => { if (performanceData && currentSongIndex < performanceData.songs.length - 1) setCurrentSongIndex(currentSongIndex + 1); };
  const handlePrevious = () => { if (currentSongIndex > 0) setCurrentSongIndex(currentSongIndex - 1); };

  if (performanceStarted && performanceData && performanceData.songs.length > 0) {
    const currentSong = performanceData.songs[currentSongIndex];
    const nextSong = performanceData.songs[currentSongIndex + 1];
    const previousSong = performanceData.songs[currentSongIndex - 1];

    return (
      <SafeAreaView style={styles.performanceContainer} edges={['top']}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.performanceHeader}>
          <TouchableOpacity onPress={handleStop}><Text style={styles.exitButton}>Exit</Text></TouchableOpacity>
          <Text style={styles.songCounter}>{currentSongIndex + 1} / {performanceData.songs.length}</Text>
          <View style={styles.fontControls}>
            <TouchableOpacity onPress={() => setFontSize((prev) => Math.max(prev - 2, 14))} style={styles.fontButton}><Text style={styles.fontButtonText}>A-</Text></TouchableOpacity>
            <TouchableOpacity onPress={() => setFontSize((prev) => Math.min(prev + 2, 28))} style={styles.fontButton}><Text style={styles.fontButtonText}>A+</Text></TouchableOpacity>
          </View>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.songPills} contentContainerStyle={{ paddingHorizontal: 12, gap: 8 }}>
          {performanceData.songs.map((song, index) => (
            <TouchableOpacity key={`${song.id}-${index}`} onPress={() => setCurrentSongIndex(index)} style={[styles.songPill, index === currentSongIndex && styles.songPillActive]}>
              <Text style={[styles.songPillText, index === currentSongIndex && styles.songPillTextActive]} numberOfLines={1}>{index + 1}. {song.title.substring(0, 12)}{song.title.length > 12 ? '...' : ''}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20 }} showsVerticalScrollIndicator={false}>
          <View style={styles.songInfo}>
            <Text style={styles.currentSongTitle}>{currentSong.title}</Text>
            <Text style={styles.roundName}>{currentSong.roundName}</Text>
            {(currentSong.key || currentSong.harmonica || currentSong.bas_bariton) && (
              <View style={styles.badgesRow}>
                {currentSong.key && <View style={styles.keyBadge}><Text style={styles.keyBadgeText}>Key: {currentSong.key}</Text></View>}
                {currentSong.harmonica && <View style={styles.harmonicaBadge}><Text style={styles.harmonicaBadgeText}>{normalizeHarmonica(currentSong.harmonica)}</Text></View>}
                {currentSong.bas_bariton && <View style={styles.greenBadge}><Text style={styles.greenBadgeText}>{currentSong.bas_bariton}</Text></View>}
              </View>
            )}
          </View>

          <TouchableOpacity onPress={() => setShowLyrics(!showLyrics)} style={styles.toggleLyricsButton}>
            <Text style={styles.toggleLyricsText}>{showLyrics ? '👁️ Hide Lyrics' : '👁️ Show Lyrics'}</Text>
          </TouchableOpacity>

          {showLyrics && (
            <View style={styles.lyricsContainer}>
              <Text style={[styles.lyrics, { fontSize, lineHeight: fontSize * 1.6 }]}>{currentSong.lyrics}</Text>
            </View>
          )}

          <View style={styles.navPreviews}>
            {previousSong && (
              <TouchableOpacity onPress={handlePrevious} style={styles.navPreview}>
                <Ionicons name="arrow-back" size={20} color={Colors.mutedForeground} style={{ marginRight: 12 }} />
                <View style={{ flex: 1 }}><Text style={styles.navPreviewLabel}>Previous</Text><Text style={styles.navPreviewTitle}>{previousSong.title}</Text></View>
              </TouchableOpacity>
            )}
            {nextSong && (
              <TouchableOpacity onPress={handleNext} style={styles.navPreview}>
                <View style={{ flex: 1 }}><Text style={styles.navPreviewLabel}>Next</Text><Text style={styles.navPreviewTitle}>{nextSong.title}</Text></View>
                <Ionicons name="arrow-forward" size={20} color={Colors.mutedForeground} style={{ marginLeft: 12 }} />
              </TouchableOpacity>
            )}
          </View>
        </ScrollView>

        <View style={styles.performanceFooter}>
          <TouchableOpacity onPress={handlePrevious} disabled={currentSongIndex === 0} style={[styles.navButton, currentSongIndex === 0 && { opacity: 0.5 }]}><Text style={styles.navButtonText}>← Previous</Text></TouchableOpacity>
          <TouchableOpacity onPress={handleNext} disabled={currentSongIndex === performanceData.songs.length - 1} style={[styles.navButtonPrimary, currentSongIndex === performanceData.songs.length - 1 && { opacity: 0.5 }]}><Text style={styles.navButtonPrimaryText}>Next →</Text></TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (isGroupLoading || roundsLoading) return <SafeAreaView style={styles.loadingContainer} edges={['top']}><ActivityIndicator size="large" color={Colors.primary} /><Text style={styles.loadingText}>Loading rounds...</Text></SafeAreaView>;

  if (!selectedGroupId) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.emptyState}>
          <Ionicons name="people" size={64} color={Colors.border} />
          <Text style={styles.emptyTitle}>No group selected</Text>
          <Text style={styles.emptyDescription}>Please create or join a group to start a performance</Text>
        </View>
      </SafeAreaView>
    );
  }

  const totalSongs = rounds?.filter((r) => selectedRounds.includes(r.id)).reduce((sum, r) => sum + r.roundItems.length, 0) ?? 0;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={{ padding: Spacing.lg }} showsVerticalScrollIndicator={false}>
        <View style={styles.header}><Text style={styles.title}>Performance Mode</Text><Text style={styles.subtitle}>Select the rounds you want to perform and start the session with fullscreen lyrics</Text></View>

        {rounds && rounds.length > 0 ? (
          <>
            {selectedRounds.length > 0 && (
              <View style={styles.statsCard}>
                <View><Text style={styles.statsLabel}>Selected Rounds</Text><Text style={[styles.statsValue, { color: Colors.primary }]}>{selectedRounds.length}</Text></View>
                <View><Text style={styles.statsLabel}>Total Songs</Text><Text style={[styles.statsValue, { color: Colors.green }]}>{totalSongs}</Text></View>
              </View>
            )}
            <Text style={styles.sectionTitle}>Available Rounds</Text>
            {rounds.map((round) => (
              <TouchableOpacity key={round.id} onPress={() => toggleRound(round.id)} style={styles.roundCard} activeOpacity={0.7}>
                <View style={styles.roundSelectRow}>
                  <View style={[styles.checkbox, selectedRounds.includes(round.id) && styles.checkboxChecked]}>{selectedRounds.includes(round.id) && <Ionicons name="checkmark" size={18} color="#FFFFFF" />}</View>
                  <View style={{ flex: 1 }}><Text style={styles.roundTitle}>{round.name}</Text>{round.description && <Text style={styles.roundDescription}>{round.description}</Text>}<Text style={styles.songCount}>{round.roundItems.length} song{round.roundItems.length !== 1 ? 's' : ''}</Text></View>
                </View>
                {round.roundItems.length > 0 && selectedRounds.includes(round.id) && (
                  <View style={styles.roundPreview}>
                    {round.roundItems.slice(0, 3).map((item, index) => <Text key={item.id} style={styles.previewSong}>{index + 1}. {item.song.title}</Text>)}
                    {round.roundItems.length > 3 && <Text style={styles.moreSongs}>+{round.roundItems.length - 3} more</Text>}
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </>
        ) : (
          <View style={styles.emptyState}><Ionicons name="play-circle" size={64} color={Colors.border} /><Text style={styles.emptyTitle}>No rounds available</Text><Text style={styles.emptyDescription}>Create some rounds with songs first to start a performance</Text></View>
        )}
      </ScrollView>

      {selectedRounds.length > 0 && (
        <View style={styles.startButtonContainer}>
          <TouchableOpacity onPress={handleStart} disabled={performanceLoading} style={styles.startButton}>
            {performanceLoading ? <ActivityIndicator color="#FFFFFF" /> : <><Ionicons name="play" size={20} color="#FFFFFF" style={{ marginRight: 8 }} /><Text style={styles.startButtonText}>Start Performance ({totalSongs} songs)</Text></>}
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  loadingContainer: { flex: 1, backgroundColor: Colors.background, alignItems: 'center', justifyContent: 'center' },
  loadingText: { color: Colors.mutedForeground, marginTop: 12 },
  header: { marginBottom: Spacing.xl },
  title: { fontSize: 24, fontWeight: '800', color: Colors.foreground, marginBottom: 8 },
  subtitle: { fontSize: FontSizes.lg, color: Colors.mutedForeground, lineHeight: 24 },
  statsCard: { backgroundColor: Colors.card, borderRadius: BorderRadius.lg, padding: Spacing.lg, borderWidth: 1, borderColor: Colors.border, marginBottom: Spacing.lg, flexDirection: 'row', justifyContent: 'space-between' },
  statsLabel: { fontSize: FontSizes.sm, color: Colors.mutedForeground },
  statsValue: { fontSize: 24, fontWeight: '700' },
  sectionTitle: { fontSize: FontSizes.lg, fontWeight: '600', color: Colors.foreground, marginBottom: 12 },
  roundCard: { backgroundColor: Colors.card, borderRadius: BorderRadius.lg, padding: Spacing.lg, borderWidth: 1, borderColor: Colors.border, marginBottom: 12 },
  roundSelectRow: { flexDirection: 'row', alignItems: 'center' },
  checkbox: { width: 28, height: 28, borderRadius: BorderRadius.md, borderWidth: 2, borderColor: Colors.border, alignItems: 'center', justifyContent: 'center', marginRight: 14 },
  checkboxChecked: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  roundTitle: { fontSize: FontSizes.lg, fontWeight: '600', color: Colors.foreground },
  roundDescription: { fontSize: FontSizes.sm, color: Colors.mutedForeground, marginTop: 2 },
  songCount: { fontSize: FontSizes.sm, color: Colors.mutedForeground, marginTop: 4 },
  roundPreview: { marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: Colors.border },
  previewSong: { fontSize: FontSizes.sm, color: Colors.mutedForeground, marginBottom: 4 },
  moreSongs: { fontSize: FontSizes.xs, color: Colors.mutedForeground },
  emptyState: { alignItems: 'center', justifyContent: 'center', padding: 32 },
  emptyTitle: { fontSize: FontSizes.xl, fontWeight: '600', color: Colors.foreground, marginTop: Spacing.lg, textAlign: 'center' },
  emptyDescription: { fontSize: FontSizes.sm, color: Colors.mutedForeground, marginTop: 8, textAlign: 'center' },
  startButtonContainer: { padding: Spacing.lg, paddingBottom: 32, borderTopWidth: 1, borderTopColor: Colors.border, backgroundColor: Colors.card },
  startButton: { backgroundColor: Colors.primary, borderRadius: BorderRadius.lg, paddingVertical: 16, alignItems: 'center', flexDirection: 'row', justifyContent: 'center' },
  startButtonText: { fontSize: FontSizes.lg, fontWeight: '600', color: '#FFFFFF' },
  performanceContainer: { flex: 1, backgroundColor: Colors.background },
  performanceHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.lg, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: Colors.border, backgroundColor: Colors.card },
  exitButton: { fontSize: FontSizes.lg, fontWeight: '600', color: Colors.red },
  songCounter: { fontSize: FontSizes.lg, fontWeight: '700', color: Colors.foreground },
  fontControls: { flexDirection: 'row', gap: 8 },
  fontButton: { width: 32, height: 32, borderRadius: 6, backgroundColor: Colors.secondary, alignItems: 'center', justifyContent: 'center' },
  fontButtonText: { fontSize: FontSizes.sm, color: Colors.foreground },
  songPills: { maxHeight: 48, backgroundColor: Colors.card, borderBottomWidth: 1, borderBottomColor: Colors.border },
  songPill: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: BorderRadius.full, backgroundColor: Colors.secondary },
  songPillActive: { backgroundColor: Colors.primary },
  songPillText: { fontSize: FontSizes.xs, fontWeight: '600', color: Colors.foreground },
  songPillTextActive: { color: '#FFFFFF' },
  songInfo: { marginBottom: 20 },
  currentSongTitle: { fontSize: 24, fontWeight: '800', color: Colors.foreground, textAlign: 'center', marginBottom: 8 },
  roundName: { fontSize: FontSizes.lg, color: Colors.primary, textAlign: 'center', marginBottom: 12 },
  badgesRow: { flexDirection: 'row', justifyContent: 'center', flexWrap: 'wrap', gap: 8 },
  keyBadge: { backgroundColor: `${Colors.blue}15`, paddingHorizontal: 12, paddingVertical: 6, borderRadius: BorderRadius.full },
  keyBadgeText: { fontSize: FontSizes.xs, fontWeight: '500', color: Colors.blue },
  harmonicaBadge: { backgroundColor: `${Colors.orange}15`, paddingHorizontal: 12, paddingVertical: 6, borderRadius: BorderRadius.full },
  harmonicaBadgeText: { fontSize: FontSizes.xs, fontWeight: '500', color: Colors.orange },
  greenBadge: { backgroundColor: `${Colors.green}15`, paddingHorizontal: 12, paddingVertical: 6, borderRadius: BorderRadius.full },
  greenBadgeText: { fontSize: FontSizes.xs, fontWeight: '500', color: Colors.green },
  toggleLyricsButton: { alignSelf: 'center', paddingHorizontal: 20, paddingVertical: 10, backgroundColor: Colors.secondary, borderRadius: BorderRadius.full, marginBottom: 16 },
  toggleLyricsText: { color: Colors.foreground, fontWeight: '600' },
  lyricsContainer: { backgroundColor: Colors.secondary, borderRadius: BorderRadius.xl, padding: 20, borderWidth: 1, borderColor: Colors.border },
  lyrics: { color: Colors.foreground, textAlign: 'center', fontFamily: 'SpaceMono' },
  navPreviews: { marginTop: 24, gap: 12 },
  navPreview: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.secondary, padding: 12, borderRadius: BorderRadius.lg },
  navPreviewLabel: { fontSize: FontSizes.xs, color: Colors.mutedForeground },
  navPreviewTitle: { fontSize: FontSizes.sm, fontWeight: '600', color: Colors.foreground },
  performanceFooter: { flexDirection: 'row', paddingHorizontal: Spacing.lg, paddingVertical: 12, borderTopWidth: 1, borderTopColor: Colors.border, backgroundColor: Colors.card, gap: 12 },
  navButton: { flex: 1, borderWidth: 1, borderColor: Colors.border, borderRadius: BorderRadius.lg, paddingVertical: 12, alignItems: 'center' },
  navButtonText: { fontSize: FontSizes.lg, fontWeight: '600', color: Colors.foreground },
  navButtonPrimary: { flex: 1, backgroundColor: Colors.primary, borderRadius: BorderRadius.lg, paddingVertical: 12, alignItems: 'center' },
  navButtonPrimaryText: { fontSize: FontSizes.lg, fontWeight: '600', color: '#FFFFFF' },
});
