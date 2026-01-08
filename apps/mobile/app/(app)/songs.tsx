import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert, FlatList, KeyboardAvoidingView, Platform, ActivityIndicator, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BottomSheet } from '../../components/ui/BottomSheet';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../../lib/trpc';
import { Colors, BorderRadius, Spacing, FontSizes } from '../../constants/theme';
import { useGroup } from '../../providers/group-context';

function normalizeHarmonica(value: string | undefined | null): string {
  if (!value) return '';
  return value.replace(/_/g, '-').split('-').map((part: string) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase()).join('-');
}

interface Song { id: number; title: string; lyrics: string; genre: string; key?: string | null; notes?: string | null; favorite: boolean; harmonica?: string | null; bas_bariton?: string | null; }

export default function SongsScreen() {
  const [search, setSearch] = useState('');
  const [favoriteFilter, setFavoriteFilter] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSong, setEditingSong] = useState<Song | null>(null);
  const [viewingSong, setViewingSong] = useState<Song | null>(null);
  const [formData, setFormData] = useState({ title: '', lyrics: '', genre: '', key: '', notes: '', favorite: false, harmonica: '', bas_bariton: '' });

  const { selectedGroupId, isLoading: isGroupLoading, groups } = useGroup();
  const utils = api.useContext();
  const { data: songs, isLoading } = api.songs.list.useQuery(
    { groupId: selectedGroupId!, search: search || undefined, favorite: favoriteFilter || undefined },
    { enabled: !!selectedGroupId }
  );

  const createMutation = api.songs.create.useMutation({ onSuccess: () => { setIsModalOpen(false); resetForm(); utils.songs.list.invalidate(); }, onError: (err) => Alert.alert('Error', err.message) });
  const updateMutation = api.songs.update.useMutation({ onSuccess: () => { setIsModalOpen(false); setEditingSong(null); resetForm(); utils.songs.list.invalidate(); }, onError: (err) => Alert.alert('Error', err.message) });
  const deleteMutation = api.songs.delete.useMutation({ onSuccess: () => utils.songs.list.invalidate(), onError: (err) => Alert.alert('Error', err.message) });
  const toggleFavoriteMutation = api.songs.toggleFavorite.useMutation({ onSuccess: () => utils.songs.list.invalidate() });

  const resetForm = () => setFormData({ title: '', lyrics: '', genre: '', key: '', notes: '', favorite: false, harmonica: '', bas_bariton: '' });

  const handleEdit = (song: Song) => { setEditingSong(song); setFormData({ title: song.title, lyrics: song.lyrics, genre: song.genre, key: song.key ?? '', notes: song.notes ?? '', favorite: song.favorite, harmonica: normalizeHarmonica(song.harmonica), bas_bariton: song.bas_bariton ?? '' }); setIsModalOpen(true); };
  const handleDelete = (song: Song) => {
    if (!selectedGroupId) return;
    Alert.alert('Delete Song', `Are you sure you want to delete "${song.title}"?`, [{ text: 'Cancel', style: 'cancel' }, { text: 'Delete', style: 'destructive', onPress: () => deleteMutation.mutate({ id: song.id, groupId: selectedGroupId }) }]);
  };

  const handleSave = () => {
    if (!selectedGroupId) return;
    if (!formData.title.trim() || !formData.lyrics.trim() || !formData.genre.trim()) { Alert.alert('Error', 'Please fill in all required fields'); return; }
    const data = { title: formData.title, lyrics: formData.lyrics, genre: formData.genre, key: formData.key || undefined, notes: formData.notes || undefined, favorite: formData.favorite, harmonica: (formData.harmonica as 'C-F-B' | 'B-Es-As' | 'A-D-G') || undefined, bas_bariton: formData.bas_bariton || undefined, groupId: selectedGroupId };
    if (editingSong) { updateMutation.mutate({ id: editingSong.id, ...data }); } else { createMutation.mutate(data); }
  };

  const renderSongItem = ({ item: song }: { item: Song }) => (
    <TouchableOpacity onPress={() => setViewingSong(song)} style={styles.songCard} activeOpacity={0.7}>
      <View style={styles.songContent}>
        <View style={styles.songTitleRow}>
          {song.favorite && <Ionicons name="star" size={16} color={Colors.yellow} style={{ marginRight: 6 }} />}
          <Text style={styles.songTitle} numberOfLines={1}>{song.title}</Text>
        </View>
        <View style={styles.tagsRow}>
          <View style={styles.genreTag}><Text style={styles.genreTagText}>{song.genre}</Text></View>
          {song.key && <View style={styles.keyTag}><Text style={styles.keyTagText}>Key: {song.key}</Text></View>}
          {song.harmonica && <View style={styles.harmonicaTag}><Text style={styles.harmonicaTagText}>{normalizeHarmonica(song.harmonica)}</Text></View>}
        </View>
      </View>
      <View style={styles.songActions}>
        <TouchableOpacity onPress={() => selectedGroupId && toggleFavoriteMutation.mutate({ id: song.id, groupId: selectedGroupId })} style={styles.iconButton}><Ionicons name={song.favorite ? 'star' : 'star-outline'} size={20} color={song.favorite ? Colors.yellow : Colors.mutedForeground} /></TouchableOpacity>
        <TouchableOpacity onPress={() => handleEdit(song)} style={styles.iconButton}><Ionicons name="pencil" size={18} color={Colors.mutedForeground} /></TouchableOpacity>
        <TouchableOpacity onPress={() => handleDelete(song)} style={styles.iconButton}><Ionicons name="trash-outline" size={18} color={Colors.red} /></TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  if (isGroupLoading) return <SafeAreaView style={styles.loadingContainer} edges={['top']}><ActivityIndicator size="large" color={Colors.primary} /><Text style={styles.loadingText}>Loading...</Text></SafeAreaView>;

  if (!selectedGroupId) {
    return (
      <SafeAreaView style={styles.emptyState} edges={['top']}>
        <Ionicons name="musical-notes" size={64} color={Colors.border} />
        <Text style={styles.emptyTitle}>No group selected</Text>
        <Text style={styles.emptyDescription}>Please create or join a group to manage songs</Text>
      </SafeAreaView>
    );
  }

  if (isLoading) return <SafeAreaView style={styles.loadingContainer} edges={['top']}><ActivityIndicator size="large" color={Colors.primary} /><Text style={styles.loadingText}>Loading songs...</Text></SafeAreaView>;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.searchSection}>
        <View style={styles.searchBox}>
          <Ionicons name="search" size={20} color={Colors.mutedForeground} style={{ marginRight: 10 }} />
          <TextInput value={search} onChangeText={setSearch} placeholder="Search songs..." placeholderTextColor={Colors.mutedForeground} style={styles.searchInput} />
          {search.length > 0 && <TouchableOpacity onPress={() => setSearch('')}><Ionicons name="close-circle" size={20} color={Colors.mutedForeground} /></TouchableOpacity>}
        </View>
        <TouchableOpacity onPress={() => setFavoriteFilter(!favoriteFilter)} style={[styles.filterButton, favoriteFilter && styles.filterButtonActive]}>
          <Ionicons name={favoriteFilter ? 'star' : 'star-outline'} size={16} color={favoriteFilter ? Colors.yellow : Colors.mutedForeground} />
          <Text style={[styles.filterButtonText, favoriteFilter && { color: Colors.yellow }]}>Favorites</Text>
        </TouchableOpacity>
      </View>

      {songs && songs.length > 0 ? (
        <FlatList data={songs} renderItem={renderSongItem} keyExtractor={(item) => item.id.toString()} contentContainerStyle={{ padding: Spacing.lg, paddingTop: Spacing.sm }} showsVerticalScrollIndicator={false} />
      ) : (
        <View style={styles.emptyState}>
          <Ionicons name="musical-notes" size={64} color={Colors.border} />
          <Text style={styles.emptyTitle}>No songs found</Text>
          <Text style={styles.emptyDescription}>{search || favoriteFilter ? 'Try adjusting your filters' : 'Get started by adding your first song'}</Text>
          {!search && !favoriteFilter && <TouchableOpacity onPress={() => setIsModalOpen(true)} style={styles.primaryButton}><Text style={styles.primaryButtonText}>Add Song</Text></TouchableOpacity>}
        </View>
      )}

      <TouchableOpacity onPress={() => setIsModalOpen(true)} style={styles.fab}><Ionicons name="add" size={28} color="#FFFFFF" /></TouchableOpacity>

      {/* Add/Edit Modal */}
      <BottomSheet visible={isModalOpen} onClose={() => { setIsModalOpen(false); setEditingSong(null); resetForm(); }} useKeyboardAvoid>
        <View>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>{editingSong ? 'Edit Song' : 'Add Song'}</Text>
                <TouchableOpacity onPress={() => { setIsModalOpen(false); setEditingSong(null); resetForm(); }}><Ionicons name="close" size={24} color={Colors.mutedForeground} /></TouchableOpacity>
              </View>
              <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
                <View style={styles.formGroup}><Text style={styles.label}>Title *</Text><TextInput value={formData.title} onChangeText={(text) => setFormData({ ...formData, title: text })} placeholder="Song title" placeholderTextColor={Colors.mutedForeground} style={styles.textInput} /></View>
                <View style={styles.formGroup}><Text style={styles.label}>Lyrics *</Text><TextInput value={formData.lyrics} onChangeText={(text) => setFormData({ ...formData, lyrics: text })} placeholder="Enter lyrics..." placeholderTextColor={Colors.mutedForeground} multiline numberOfLines={8} textAlignVertical="top" style={[styles.textInput, styles.textArea]} /></View>
                <View style={styles.formGroup}><Text style={styles.label}>Genre *</Text><TextInput value={formData.genre} onChangeText={(text) => setFormData({ ...formData, genre: text })} placeholder="e.g., Polka, Waltz" placeholderTextColor={Colors.mutedForeground} style={styles.textInput} /></View>
                <View style={styles.formGroup}><Text style={styles.label}>Key</Text><TextInput value={formData.key} onChangeText={(text) => setFormData({ ...formData, key: text })} placeholder="e.g., C, G, Am" placeholderTextColor={Colors.mutedForeground} style={styles.textInput} /></View>
                <TouchableOpacity onPress={() => setFormData({ ...formData, favorite: !formData.favorite })} style={styles.checkboxRow}>
                  <View style={[styles.checkbox, formData.favorite && styles.checkboxChecked]}>{formData.favorite && <Ionicons name="checkmark" size={16} color="#FFFFFF" />}</View>
                  <Text style={styles.checkboxLabel}>Add to favorites</Text>
                </TouchableOpacity>
              </ScrollView>
              <View style={styles.modalFooter}>
                <TouchableOpacity onPress={() => { setIsModalOpen(false); setEditingSong(null); resetForm(); }} style={styles.secondaryButton}><Text style={styles.secondaryButtonText}>Cancel</Text></TouchableOpacity>
                <TouchableOpacity onPress={handleSave} disabled={createMutation.isLoading || updateMutation.isLoading} style={styles.primaryButton}>
                  {createMutation.isLoading || updateMutation.isLoading ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.primaryButtonText}>{editingSong ? 'Update' : 'Create'}</Text>}
                </TouchableOpacity>
              </View>
        </View>
      </BottomSheet>

      {/* View Song Modal */}
      <BottomSheet visible={!!viewingSong} onClose={() => setViewingSong(null)}>
        <View>
            <View style={styles.modalHeader}><Text style={styles.modalTitle} numberOfLines={1}>{viewingSong?.title}</Text><TouchableOpacity onPress={() => setViewingSong(null)}><Ionicons name="close" size={24} color={Colors.mutedForeground} /></TouchableOpacity></View>
            {viewingSong && (
              <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
                <View style={styles.tagsRow}>
                  <View style={styles.genreTag}><Text style={styles.genreTagText}>{viewingSong.genre}</Text></View>
                  {viewingSong.key && <View style={styles.keyTag}><Text style={styles.keyTagText}>Key: {viewingSong.key}</Text></View>}
                  {viewingSong.harmonica && <View style={styles.harmonicaTag}><Text style={styles.harmonicaTagText}>{normalizeHarmonica(viewingSong.harmonica)}</Text></View>}
                  {viewingSong.favorite && <View style={styles.favoriteTag}><Ionicons name="star" size={14} color={Colors.yellow} /><Text style={styles.favoriteTagText}>Favorite</Text></View>}
                </View>
                <View style={styles.lyricsBox}><Text style={styles.lyricsText}>{viewingSong.lyrics}</Text></View>
                {viewingSong.notes && <View style={{ marginBottom: 24 }}><Text style={styles.label}>Notes</Text><Text style={{ fontSize: FontSizes.lg, color: Colors.foreground }}>{viewingSong.notes}</Text></View>}
              </ScrollView>
            )}
            <View style={styles.modalFooter}>
              <TouchableOpacity onPress={() => { if (viewingSong) { setViewingSong(null); handleEdit(viewingSong); } }} style={styles.secondaryButton}><Ionicons name="pencil" size={18} color={Colors.foreground} /><Text style={[styles.secondaryButtonText, { marginLeft: 8 }]}>Edit</Text></TouchableOpacity>
              <TouchableOpacity onPress={() => setViewingSong(null)} style={styles.primaryButton}><Text style={styles.primaryButtonText}>Close</Text></TouchableOpacity>
            </View>
        </View>
      </BottomSheet>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  loadingContainer: { flex: 1, backgroundColor: Colors.background, alignItems: 'center', justifyContent: 'center' },
  loadingText: { color: Colors.mutedForeground, marginTop: 12 },
  searchSection: { padding: Spacing.lg, paddingBottom: Spacing.sm },
  searchBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.card, borderWidth: 1, borderColor: Colors.border, borderRadius: BorderRadius.lg, paddingHorizontal: Spacing.lg, paddingVertical: 12 },
  searchInput: { flex: 1, fontSize: FontSizes.lg, color: Colors.foreground },
  filterButton: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 8, borderRadius: BorderRadius.md, marginTop: 12, backgroundColor: Colors.card, borderWidth: 1, borderColor: Colors.border },
  filterButtonActive: { backgroundColor: `${Colors.yellow}15`, borderColor: Colors.yellow },
  filterButtonText: { marginLeft: 8, fontSize: FontSizes.sm, fontWeight: '500', color: Colors.foreground },
  songCard: { backgroundColor: Colors.card, borderRadius: BorderRadius.lg, padding: Spacing.lg, borderWidth: 1, borderColor: Colors.border, marginBottom: 12, flexDirection: 'row', alignItems: 'flex-start' },
  songContent: { flex: 1 },
  songTitleRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  songTitle: { fontSize: FontSizes.lg, fontWeight: '600', color: Colors.foreground, flex: 1 },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 4 },
  genreTag: { backgroundColor: Colors.secondary, paddingHorizontal: 10, paddingVertical: 4, borderRadius: BorderRadius.full },
  genreTagText: { fontSize: FontSizes.xs, fontWeight: '500', color: Colors.secondaryForeground },
  keyTag: { backgroundColor: `${Colors.blue}15`, paddingHorizontal: 10, paddingVertical: 4, borderRadius: BorderRadius.full },
  keyTagText: { fontSize: FontSizes.xs, fontWeight: '500', color: Colors.blue },
  harmonicaTag: { backgroundColor: `${Colors.orange}15`, paddingHorizontal: 10, paddingVertical: 4, borderRadius: BorderRadius.full },
  harmonicaTagText: { fontSize: FontSizes.xs, fontWeight: '500', color: Colors.orange },
  favoriteTag: { backgroundColor: `${Colors.yellow}15`, paddingHorizontal: 10, paddingVertical: 4, borderRadius: BorderRadius.full, flexDirection: 'row', alignItems: 'center' },
  favoriteTagText: { fontSize: FontSizes.xs, fontWeight: '500', color: Colors.yellow, marginLeft: 4 },
  songActions: { flexDirection: 'row', gap: 4 },
  iconButton: { padding: 8 },
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  emptyTitle: { fontSize: FontSizes.xl, fontWeight: '600', color: Colors.foreground, marginTop: Spacing.lg, textAlign: 'center' },
  emptyDescription: { fontSize: FontSizes.sm, color: Colors.mutedForeground, marginTop: 8, textAlign: 'center' },
  fab: { position: 'absolute', bottom: 24, right: 24, width: 56, height: 56, borderRadius: 28, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 8 },
  modalOverlay: { flex: 1, backgroundColor: Colors.overlay, justifyContent: 'flex-end' },
  modalContent: { backgroundColor: Colors.card, borderTopLeftRadius: BorderRadius.xxl, borderTopRightRadius: BorderRadius.xxl, maxHeight: '90%' },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: Spacing.xl, borderBottomWidth: 1, borderBottomColor: Colors.border },
  modalTitle: { fontSize: FontSizes.xxl, fontWeight: '700', color: Colors.foreground, flex: 1 },
  modalBody: { padding: Spacing.xl },
  modalFooter: { flexDirection: 'row', gap: 12, padding: Spacing.xl, borderTopWidth: 1, borderTopColor: Colors.border },
  formGroup: { marginBottom: Spacing.lg },
  label: { fontSize: FontSizes.sm, fontWeight: '500', color: Colors.foreground, marginBottom: 6 },
  textInput: { backgroundColor: Colors.secondary, borderWidth: 1, borderColor: Colors.border, borderRadius: BorderRadius.lg, paddingHorizontal: Spacing.lg, paddingVertical: 12, fontSize: FontSizes.lg, color: Colors.foreground },
  textArea: { minHeight: 200, textAlignVertical: 'top' },
  checkboxRow: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.lg },
  checkbox: { width: 24, height: 24, borderRadius: 6, borderWidth: 2, borderColor: Colors.border, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  checkboxChecked: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  checkboxLabel: { fontSize: FontSizes.lg, color: Colors.foreground },
  primaryButton: { flex: 1, backgroundColor: Colors.primary, borderRadius: BorderRadius.lg, paddingVertical: 14, alignItems: 'center', flexDirection: 'row', justifyContent: 'center' },
  primaryButtonText: { fontSize: FontSizes.lg, fontWeight: '600', color: '#FFFFFF' },
  secondaryButton: { flex: 1, borderWidth: 1, borderColor: Colors.border, borderRadius: BorderRadius.lg, paddingVertical: 14, alignItems: 'center', flexDirection: 'row', justifyContent: 'center' },
  secondaryButtonText: { fontSize: FontSizes.lg, fontWeight: '600', color: Colors.foreground },
  lyricsBox: { backgroundColor: Colors.secondary, borderRadius: BorderRadius.lg, padding: Spacing.lg, marginVertical: Spacing.lg },
  lyricsText: { fontSize: FontSizes.lg, lineHeight: 28, color: Colors.foreground, fontFamily: 'SpaceMono' },
});
