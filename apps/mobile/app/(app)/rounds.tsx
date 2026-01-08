import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert, FlatList, ActivityIndicator, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BottomSheet } from '../../components/ui/BottomSheet';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../../lib/trpc';
import { Colors, BorderRadius, Spacing, FontSizes } from '../../constants/theme';
import { useGroup } from '../../providers/group-context';

interface Song { id: number; title: string; key?: string | null; harmonica?: string | null; }
interface RoundItem { id: number; position: number; song: Song; }
interface Round { id: number; name: string; description?: string | null; roundItems: RoundItem[]; }

export default function RoundsScreen() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRound, setEditingRound] = useState<Round | null>(null);
  const [viewingRound, setViewingRound] = useState<Round | null>(null);
  const [selectedSongs, setSelectedSongs] = useState<number[]>([]);
  const [songSearch, setSongSearch] = useState('');
  const [formData, setFormData] = useState({ name: '', description: '' });

  const { selectedGroupId, isLoading: isGroupLoading } = useGroup();
  const utils = api.useContext();
  const { data: rounds, isLoading: roundsLoading } = api.rounds.list.useQuery(
    { groupId: selectedGroupId! },
    { enabled: !!selectedGroupId }
  );
  const { data: allSongs, isLoading: songsLoading } = api.songs.list.useQuery(
    { groupId: selectedGroupId! },
    { enabled: !!selectedGroupId }
  );

  const createMutation = api.rounds.create.useMutation({ onSuccess: () => { setIsModalOpen(false); resetForm(); utils.rounds.list.invalidate(); }, onError: (err) => Alert.alert('Error', err.message) });
  const updateMutation = api.rounds.update.useMutation({ onSuccess: () => utils.rounds.list.invalidate(), onError: (err) => Alert.alert('Error', err.message) });
  const reorderMutation = api.rounds.reorderSongs.useMutation({ onSuccess: () => utils.rounds.list.invalidate() });
  const deleteMutation = api.rounds.delete.useMutation({ onSuccess: () => utils.rounds.list.invalidate(), onError: (err) => Alert.alert('Error', err.message) });
  const removeSongMutation = api.rounds.removeSong.useMutation({ onSuccess: () => utils.rounds.list.invalidate() });

  const resetForm = () => { setFormData({ name: '', description: '' }); setSelectedSongs([]); setEditingRound(null); setSongSearch(''); };
  const handleEdit = (round: Round) => { setEditingRound(round); setFormData({ name: round.name, description: round.description ?? '' }); setSelectedSongs(round.roundItems.map((item) => item.song.id)); setIsModalOpen(true); };
  const handleDelete = (round: Round) => {
    if (!selectedGroupId) return;
    Alert.alert('Delete Round', `Are you sure you want to delete "${round.name}"?`, [{ text: 'Cancel', style: 'cancel' }, { text: 'Delete', style: 'destructive', onPress: () => deleteMutation.mutate({ id: round.id, groupId: selectedGroupId }) }]);
  };

  const handleSave = async () => {
    if (!selectedGroupId) return;
    if (!formData.name.trim()) { Alert.alert('Error', 'Please enter a round name'); return; }
    if (editingRound) {
      await updateMutation.mutateAsync({ id: editingRound.id, name: formData.name, description: formData.description || undefined, groupId: selectedGroupId });
      await reorderMutation.mutateAsync({ roundId: editingRound.id, songIds: selectedSongs, groupId: selectedGroupId });
      setIsModalOpen(false); resetForm();
    } else {
      if (selectedSongs.length === 0) { Alert.alert('Error', 'Please select at least one song'); return; }
      createMutation.mutate({ name: formData.name, description: formData.description || undefined, songIds: selectedSongs, groupId: selectedGroupId });
    }
  };

  const toggleSong = (songId: number) => setSelectedSongs((prev) => prev.includes(songId) ? prev.filter((id) => id !== songId) : [...prev, songId]);
  const moveSongUp = (roundId: number, songId: number) => {
    if (!selectedGroupId) return;
    const round = rounds?.find((r) => r.id === roundId); if (!round) return; const currentIndex = round.roundItems.findIndex((item) => item.song.id === songId); if (currentIndex <= 0) return; const newOrder = [...round.roundItems]; [newOrder[currentIndex - 1], newOrder[currentIndex]] = [newOrder[currentIndex], newOrder[currentIndex - 1]]; reorderMutation.mutate({ roundId, songIds: newOrder.map((item) => item.song.id), groupId: selectedGroupId });
  };
  const moveSongDown = (roundId: number, songId: number) => {
    if (!selectedGroupId) return;
    const round = rounds?.find((r) => r.id === roundId); if (!round) return; const currentIndex = round.roundItems.findIndex((item) => item.song.id === songId); if (currentIndex >= round.roundItems.length - 1) return; const newOrder = [...round.roundItems]; [newOrder[currentIndex], newOrder[currentIndex + 1]] = [newOrder[currentIndex + 1], newOrder[currentIndex]]; reorderMutation.mutate({ roundId, songIds: newOrder.map((item) => item.song.id), groupId: selectedGroupId });
  };

  const filteredSongs = allSongs?.filter((song) => song.title.toLowerCase().includes(songSearch.toLowerCase()));

  if (isGroupLoading) return <SafeAreaView style={styles.loadingContainer} edges={['top']}><ActivityIndicator size="large" color={Colors.primary} /><Text style={styles.loadingText}>Loading...</Text></SafeAreaView>;

  if (!selectedGroupId) {
    return (
      <SafeAreaView style={styles.emptyState} edges={['top']}>
        <Ionicons name="list" size={64} color={Colors.border} />
        <Text style={styles.emptyTitle}>No group selected</Text>
        <Text style={styles.emptyDescription}>Please create or join a group to manage rounds</Text>
      </SafeAreaView>
    );
  }

  if (roundsLoading || songsLoading) return <SafeAreaView style={styles.loadingContainer} edges={['top']}><ActivityIndicator size="large" color={Colors.primary} /><Text style={styles.loadingText}>Loading rounds...</Text></SafeAreaView>;

  const renderRoundItem = ({ item: round }: { item: Round }) => (
    <View style={styles.roundCard}>
      <View style={styles.roundHeader}>
        <View style={{ flex: 1 }}>
          <Text style={styles.roundTitle}>{round.name}</Text>
          {round.description && <Text style={styles.roundDescription}>{round.description}</Text>}
          <Text style={styles.songCount}>{round.roundItems.length} song{round.roundItems.length !== 1 ? 's' : ''}</Text>
        </View>
        <View style={styles.roundActions}>
          <TouchableOpacity onPress={() => setViewingRound(round)} style={styles.iconButton}><Ionicons name="eye-outline" size={20} color={Colors.mutedForeground} /></TouchableOpacity>
          <TouchableOpacity onPress={() => handleEdit(round)} style={styles.iconButton}><Ionicons name="pencil" size={18} color={Colors.mutedForeground} /></TouchableOpacity>
          <TouchableOpacity onPress={() => handleDelete(round)} style={styles.iconButton}><Ionicons name="trash-outline" size={18} color={Colors.red} /></TouchableOpacity>
        </View>
      </View>
      {round.roundItems.length > 0 && (
        <View style={styles.songPreview}>
          {round.roundItems.slice(0, 3).map((item, index) => (
            <View key={item.id} style={styles.songPreviewItem}>
              <Text style={styles.songPreviewNumber}>{index + 1}.</Text>
              <Text style={styles.songPreviewTitle} numberOfLines={1}>{item.song.title}</Text>
              {item.song.key && <View style={styles.keyBadge}><Text style={styles.keyBadgeText}>{item.song.key}</Text></View>}
            </View>
          ))}
          {round.roundItems.length > 3 && <Text style={styles.moreSongs}>+{round.roundItems.length - 3} more songs</Text>}
        </View>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {rounds && rounds.length > 0 ? (
        <FlatList data={rounds} renderItem={renderRoundItem} keyExtractor={(item) => item.id.toString()} contentContainerStyle={{ padding: Spacing.lg }} showsVerticalScrollIndicator={false} />
      ) : (
        <View style={styles.emptyState}><Ionicons name="list" size={64} color={Colors.border} /><Text style={styles.emptyTitle}>No rounds yet</Text><Text style={styles.emptyDescription}>Create setlists to organize your songs for performances</Text><TouchableOpacity onPress={() => setIsModalOpen(true)} style={styles.primaryButton}><Text style={styles.primaryButtonText}>Create Round</Text></TouchableOpacity></View>
      )}

      <TouchableOpacity onPress={() => setIsModalOpen(true)} style={styles.fab}><Ionicons name="add" size={28} color="#FFFFFF" /></TouchableOpacity>

      {/* Create/Edit Modal */}
      <BottomSheet visible={isModalOpen} onClose={() => { setIsModalOpen(false); resetForm(); }}>
        <View>
            <View style={styles.modalHeader}><Text style={styles.modalTitle}>{editingRound ? 'Edit Round' : 'Create Round'}</Text><TouchableOpacity onPress={() => { setIsModalOpen(false); resetForm(); }}><Ionicons name="close" size={24} color={Colors.mutedForeground} /></TouchableOpacity></View>
            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              <View style={styles.formGroup}><Text style={styles.label}>Round Name *</Text><TextInput value={formData.name} onChangeText={(text) => setFormData({ ...formData, name: text })} placeholder="e.g., First Round, Slow Songs" placeholderTextColor={Colors.mutedForeground} style={styles.textInput} /></View>
              <View style={styles.formGroup}><Text style={styles.label}>Description</Text><TextInput value={formData.description} onChangeText={(text) => setFormData({ ...formData, description: text })} placeholder="Optional description..." placeholderTextColor={Colors.mutedForeground} multiline numberOfLines={2} style={styles.textInput} /></View>
              <View style={styles.formGroup}>
                <Text style={styles.label}>Select Songs ({selectedSongs.length} selected)</Text>
                <View style={styles.searchBox}><Ionicons name="search" size={18} color={Colors.mutedForeground} style={{ marginRight: 8 }} /><TextInput value={songSearch} onChangeText={setSongSearch} placeholder="Search songs..." placeholderTextColor={Colors.mutedForeground} style={styles.searchInput} /></View>
                <View style={styles.songList}>
                  <ScrollView showsVerticalScrollIndicator={false} nestedScrollEnabled>
                    {filteredSongs && filteredSongs.length > 0 ? filteredSongs.map((song) => (
                      <TouchableOpacity key={song.id} onPress={() => toggleSong(song.id)} style={[styles.songSelectItem, selectedSongs.includes(song.id) && styles.songSelectItemActive]}>
                        <View style={[styles.checkbox, selectedSongs.includes(song.id) && styles.checkboxChecked]}>{selectedSongs.includes(song.id) && <Ionicons name="checkmark" size={16} color="#FFFFFF" />}</View>
                        <View style={{ flex: 1 }}><Text style={styles.songSelectTitle} numberOfLines={1}>{song.title}</Text>{song.key && <Text style={styles.songSelectKey}>Key: {song.key}</Text>}</View>
                      </TouchableOpacity>
                    )) : <Text style={styles.noSongs}>No songs found</Text>}
                  </ScrollView>
                </View>
              </View>
            </ScrollView>
            <View style={styles.modalFooter}>
              <TouchableOpacity onPress={() => { setIsModalOpen(false); resetForm(); }} style={styles.secondaryButton}><Text style={styles.secondaryButtonText}>Cancel</Text></TouchableOpacity>
              <TouchableOpacity onPress={handleSave} disabled={!formData.name.trim() || (!editingRound && selectedSongs.length === 0)} style={[styles.primaryButton, (!formData.name.trim() || (!editingRound && selectedSongs.length === 0)) && { opacity: 0.5 }]}>
                {createMutation.isLoading || updateMutation.isLoading ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.primaryButtonText}>{editingRound ? 'Update' : 'Create'}</Text>}
              </TouchableOpacity>
            </View>
        </View>
      </BottomSheet>

      {/* View Round Modal */}
      <BottomSheet visible={!!viewingRound} onClose={() => setViewingRound(null)}>
        <View>
            <View style={styles.modalHeader}><Text style={styles.modalTitle}>{viewingRound?.name}</Text><TouchableOpacity onPress={() => setViewingRound(null)}><Ionicons name="close" size={24} color={Colors.mutedForeground} /></TouchableOpacity></View>
            {viewingRound && (
              <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
                {viewingRound.description && <Text style={styles.roundDescription}>{viewingRound.description}</Text>}
                <Text style={styles.sectionLabel}>Songs ({viewingRound.roundItems.length})</Text>
                {viewingRound.roundItems.map((item, index) => (
                  <View key={item.id} style={styles.viewSongItem}>
                    <Text style={styles.viewSongNumber}>{index + 1}.</Text>
                    <View style={{ flex: 1 }}><Text style={styles.viewSongTitle}>{item.song.title}</Text>{item.song.key && <Text style={styles.viewSongKey}>Key: {item.song.key}</Text>}</View>
                    <View style={styles.reorderButtons}>
                      <TouchableOpacity onPress={() => moveSongUp(viewingRound.id, item.song.id)} disabled={index === 0} style={[styles.reorderButton, index === 0 && { opacity: 0.3 }]}><Ionicons name="chevron-up" size={18} color={Colors.mutedForeground} /></TouchableOpacity>
                      <TouchableOpacity onPress={() => moveSongDown(viewingRound.id, item.song.id)} disabled={index === viewingRound.roundItems.length - 1} style={[styles.reorderButton, index === viewingRound.roundItems.length - 1 && { opacity: 0.3 }]}><Ionicons name="chevron-down" size={18} color={Colors.mutedForeground} /></TouchableOpacity>
                      <TouchableOpacity onPress={() => selectedGroupId && removeSongMutation.mutate({ roundId: viewingRound.id, songId: item.song.id, groupId: selectedGroupId })} style={styles.reorderButton}><Ionicons name="trash-outline" size={16} color={Colors.red} /></TouchableOpacity>
                    </View>
                  </View>
                ))}
              </ScrollView>
            )}
            <View style={styles.modalFooter}><TouchableOpacity onPress={() => setViewingRound(null)} style={styles.primaryButton}><Text style={styles.primaryButtonText}>Close</Text></TouchableOpacity></View>
        </View>
      </BottomSheet>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  loadingContainer: { flex: 1, backgroundColor: Colors.background, alignItems: 'center', justifyContent: 'center' },
  loadingText: { color: Colors.mutedForeground, marginTop: 12 },
  roundCard: { backgroundColor: Colors.card, borderRadius: BorderRadius.lg, padding: Spacing.lg, borderWidth: 1, borderColor: Colors.border, marginBottom: Spacing.lg },
  roundHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  roundTitle: { fontSize: FontSizes.xl, fontWeight: '700', color: Colors.foreground },
  roundDescription: { fontSize: FontSizes.sm, color: Colors.mutedForeground, marginTop: 4 },
  songCount: { fontSize: FontSizes.sm, color: Colors.mutedForeground, marginTop: 4 },
  roundActions: { flexDirection: 'row', gap: 4 },
  iconButton: { padding: 8 },
  songPreview: { gap: 8 },
  songPreviewItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.secondary, borderRadius: BorderRadius.md, paddingHorizontal: 12, paddingVertical: 8 },
  songPreviewNumber: { color: Colors.mutedForeground, width: 24, fontSize: FontSizes.sm },
  songPreviewTitle: { flex: 1, color: Colors.foreground, fontSize: FontSizes.sm },
  keyBadge: { backgroundColor: `${Colors.blue}15`, paddingHorizontal: 8, paddingVertical: 2, borderRadius: BorderRadius.full },
  keyBadgeText: { fontSize: FontSizes.xs, color: Colors.blue },
  moreSongs: { fontSize: FontSizes.xs, color: Colors.mutedForeground, marginLeft: 24 },
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  emptyTitle: { fontSize: FontSizes.xl, fontWeight: '600', color: Colors.foreground, marginTop: Spacing.lg, textAlign: 'center' },
  emptyDescription: { fontSize: FontSizes.sm, color: Colors.mutedForeground, marginTop: 8, textAlign: 'center' },
  fab: { position: 'absolute', bottom: 24, right: 24, width: 56, height: 56, borderRadius: 28, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 8 },
  modalOverlay: { flex: 1, backgroundColor: Colors.overlay, justifyContent: 'flex-end' },
  modalContent: { backgroundColor: Colors.card, borderTopLeftRadius: BorderRadius.xxl, borderTopRightRadius: BorderRadius.xxl, maxHeight: '90%' },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: Spacing.xl, borderBottomWidth: 1, borderBottomColor: Colors.border },
  modalTitle: { fontSize: FontSizes.xxl, fontWeight: '700', color: Colors.foreground },
  modalBody: { padding: Spacing.xl },
  modalFooter: { flexDirection: 'row', gap: 12, padding: Spacing.xl, borderTopWidth: 1, borderTopColor: Colors.border },
  formGroup: { marginBottom: Spacing.lg },
  label: { fontSize: FontSizes.sm, fontWeight: '500', color: Colors.foreground, marginBottom: 6 },
  sectionLabel: { fontSize: FontSizes.lg, fontWeight: '600', color: Colors.foreground, marginBottom: 12 },
  textInput: { backgroundColor: Colors.secondary, borderWidth: 1, borderColor: Colors.border, borderRadius: BorderRadius.lg, paddingHorizontal: Spacing.lg, paddingVertical: 12, fontSize: FontSizes.lg, color: Colors.foreground },
  searchBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.secondary, borderWidth: 1, borderColor: Colors.border, borderRadius: BorderRadius.lg, paddingHorizontal: Spacing.lg, paddingVertical: 12, marginBottom: 12 },
  searchInput: { flex: 1, fontSize: FontSizes.lg, color: Colors.foreground },
  songList: { backgroundColor: Colors.secondary, borderRadius: BorderRadius.lg, padding: 8, maxHeight: 300 },
  songSelectItem: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: BorderRadius.md, marginBottom: 4 },
  songSelectItemActive: { backgroundColor: `${Colors.primary}15` },
  checkbox: { width: 24, height: 24, borderRadius: 6, borderWidth: 2, borderColor: Colors.border, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  checkboxChecked: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  songSelectTitle: { fontSize: FontSizes.sm, color: Colors.foreground },
  songSelectKey: { fontSize: FontSizes.xs, color: Colors.mutedForeground, marginTop: 2 },
  noSongs: { textAlign: 'center', color: Colors.mutedForeground, paddingVertical: 16 },
  viewSongItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.secondary, borderRadius: BorderRadius.lg, padding: 12, marginBottom: 8 },
  viewSongNumber: { width: 28, fontSize: FontSizes.sm, fontWeight: '600', color: Colors.mutedForeground },
  viewSongTitle: { fontSize: FontSizes.sm, fontWeight: '500', color: Colors.foreground },
  viewSongKey: { fontSize: FontSizes.xs, color: Colors.mutedForeground, marginTop: 2 },
  reorderButtons: { flexDirection: 'row', gap: 4 },
  reorderButton: { padding: 6 },
  primaryButton: { flex: 1, backgroundColor: Colors.primary, borderRadius: BorderRadius.lg, paddingVertical: 14, alignItems: 'center' },
  primaryButtonText: { fontSize: FontSizes.lg, fontWeight: '600', color: '#FFFFFF' },
  secondaryButton: { flex: 1, borderWidth: 1, borderColor: Colors.border, borderRadius: BorderRadius.lg, paddingVertical: 14, alignItems: 'center' },
  secondaryButtonText: { fontSize: FontSizes.lg, fontWeight: '600', color: Colors.foreground },
});
