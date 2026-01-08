import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert, ActivityIndicator, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BottomSheet } from '../../components/ui/BottomSheet';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../../lib/trpc';
import { Colors, BorderRadius, Spacing, FontSizes } from '../../constants/theme';

interface GroupMember { id: string; role: 'OWNER' | 'ADMIN' | 'MEMBER'; user: { id: string; name: string | null; email: string | null; image: string | null }; }
interface Group { id: string; name: string; description?: string | null; members: GroupMember[]; _count: { members: number; performances: number; songs: number }; }

export default function GroupsScreen() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [viewingGroup, setViewingGroup] = useState<Group | null>(null);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupDescription, setNewGroupDescription] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'MEMBER' | 'ADMIN'>('MEMBER');

  const utils = api.useContext();
  const { data: groups, isLoading } = api.groups.list.useQuery();
  const { data: invitations, isLoading: isLoadingInvitations } = api.groups.myInvitations.useQuery();

  const createGroupMutation = api.groups.create.useMutation({ onSuccess: () => { utils.groups.list.invalidate(); setIsCreateModalOpen(false); setNewGroupName(''); setNewGroupDescription(''); }, onError: (err) => Alert.alert('Error', err.message) });
  const inviteMutation = api.groups.invite.useMutation({ onSuccess: () => { utils.groups.invitations.invalidate(); setIsInviteModalOpen(false); setInviteEmail(''); setInviteRole('MEMBER'); Alert.alert('Success', 'Invitation sent!'); }, onError: (err) => Alert.alert('Error', err.message) });
  const acceptInvitationMutation = api.groups.acceptInvitation.useMutation({ onSuccess: () => { utils.groups.list.invalidate(); utils.groups.myInvitations.invalidate(); }, onError: (err) => Alert.alert('Error', err.message) });
  const declineInvitationMutation = api.groups.declineInvitation.useMutation({ onSuccess: () => utils.groups.myInvitations.invalidate(), onError: (err) => Alert.alert('Error', err.message) });
  const leaveGroupMutation = api.groups.leave.useMutation({ onSuccess: () => { utils.groups.list.invalidate(); setViewingGroup(null); }, onError: (err) => Alert.alert('Error', err.message) });

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'OWNER': return { bg: `${Colors.yellow}15`, color: Colors.yellow, label: 'Owner' };
      case 'ADMIN': return { bg: `${Colors.blue}15`, color: Colors.blue, label: 'Admin' };
      default: return { bg: Colors.secondary, color: Colors.secondaryForeground, label: 'Member' };
    }
  };

  if (isLoading) return <SafeAreaView style={styles.loadingContainer} edges={['top']}><ActivityIndicator size="large" color={Colors.primary} /><Text style={styles.loadingText}>Loading groups...</Text></SafeAreaView>;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={{ padding: Spacing.lg }} showsVerticalScrollIndicator={false}>
        {!isLoadingInvitations && invitations && invitations.length > 0 && (
          <View style={{ marginBottom: 24 }}>
            <Text style={styles.sectionTitle}>Invitations</Text>
            {invitations.map((invitation) => {
              const badge = getRoleBadge(invitation.role);
              return (
                <View key={invitation.id} style={styles.invitationCard}>
                  <View style={styles.invitationHeader}>
                    <View style={styles.mailIcon}><Ionicons name="mail" size={22} color={Colors.blue} /></View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.invitationGroupName}>{invitation.group.name}</Text>
                      {invitation.group.description && <Text style={styles.invitationDescription} numberOfLines={1}>{invitation.group.description}</Text>}
                      <View style={[styles.roleBadge, { backgroundColor: badge.bg }]}><Text style={[styles.roleBadgeText, { color: badge.color }]}>{badge.label}</Text></View>
                    </View>
                  </View>
                  <View style={styles.invitationActions}>
                    <TouchableOpacity onPress={() => declineInvitationMutation.mutate({ invitationId: invitation.id })} style={styles.secondaryButtonSmall}><Text style={styles.secondaryButtonSmallText}>Decline</Text></TouchableOpacity>
                    <TouchableOpacity onPress={() => acceptInvitationMutation.mutate({ invitationId: invitation.id })} style={styles.primaryButtonSmall}><Text style={styles.primaryButtonSmallText}>Accept</Text></TouchableOpacity>
                  </View>
                </View>
              );
            })}
          </View>
        )}

        <Text style={styles.sectionTitle}>My Groups</Text>
        {groups && groups.length > 0 ? (
          groups.map((group) => {
            const currentUserMember = group.members[0];
            const badge = currentUserMember ? getRoleBadge(currentUserMember.role) : null;
            return (
              <TouchableOpacity key={group.id} onPress={() => setViewingGroup(group)} style={styles.groupCard} activeOpacity={0.7}>
                <View style={styles.groupIcon}><Ionicons name="people" size={24} color={Colors.green} /></View>
                <View style={{ flex: 1 }}>
                  <View style={styles.groupTitleRow}>
                    <Text style={styles.groupTitle}>{group.name}</Text>
                    {badge && (currentUserMember?.role === 'OWNER' || currentUserMember?.role === 'ADMIN') && <View style={[styles.roleBadge, { backgroundColor: badge.bg }]}><Text style={[styles.roleBadgeText, { color: badge.color }]}>{badge.label}</Text></View>}
                  </View>
                  {group.description && <Text style={styles.groupDescription} numberOfLines={2}>{group.description}</Text>}
                  <View style={styles.groupStats}>
                    <View style={styles.groupStat}><Ionicons name="people-outline" size={14} color={Colors.mutedForeground} /><Text style={styles.groupStatText}>{group._count.members}</Text></View>
                    <View style={styles.groupStat}><Ionicons name="musical-notes-outline" size={14} color={Colors.mutedForeground} /><Text style={styles.groupStatText}>{group._count.songs}</Text></View>
                    <View style={styles.groupStat}><Ionicons name="calendar-outline" size={14} color={Colors.mutedForeground} /><Text style={styles.groupStatText}>{group._count.performances}</Text></View>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={20} color={Colors.mutedForeground} />
              </TouchableOpacity>
            );
          })
        ) : (
          <View style={styles.emptyState}><Ionicons name="people" size={64} color={Colors.border} /><Text style={styles.emptyTitle}>No groups yet</Text><Text style={styles.emptyDescription}>Create your first group to start collaborating</Text><TouchableOpacity onPress={() => setIsCreateModalOpen(true)} style={styles.primaryButton}><Text style={styles.primaryButtonText}>Create Group</Text></TouchableOpacity></View>
        )}
      </ScrollView>

      <TouchableOpacity onPress={() => setIsCreateModalOpen(true)} style={styles.fab}><Ionicons name="add" size={28} color="#FFFFFF" /></TouchableOpacity>

      {/* Create Group Modal */}
      <BottomSheet visible={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)}>
        <View>
            <View style={styles.modalHeader}><Text style={styles.modalTitle}>Create Group</Text><TouchableOpacity onPress={() => setIsCreateModalOpen(false)}><Ionicons name="close" size={24} color={Colors.mutedForeground} /></TouchableOpacity></View>
            <View style={styles.modalBody}>
              <View style={styles.formGroup}><Text style={styles.label}>Group Name *</Text><TextInput value={newGroupName} onChangeText={setNewGroupName} placeholder="e.g., Folk Band Slovenia" placeholderTextColor={Colors.mutedForeground} style={styles.textInput} /></View>
              <View style={styles.formGroup}><Text style={styles.label}>Description</Text><TextInput value={newGroupDescription} onChangeText={setNewGroupDescription} placeholder="Brief description..." placeholderTextColor={Colors.mutedForeground} multiline numberOfLines={3} style={styles.textInput} /></View>
            </View>
            <View style={styles.modalFooter}>
              <TouchableOpacity onPress={() => setIsCreateModalOpen(false)} style={styles.secondaryButton}><Text style={styles.secondaryButtonText}>Cancel</Text></TouchableOpacity>
              <TouchableOpacity onPress={() => newGroupName.trim() && createGroupMutation.mutate({ name: newGroupName, description: newGroupDescription || undefined })} disabled={!newGroupName.trim()} style={[styles.primaryButton, !newGroupName.trim() && { opacity: 0.5 }]}>
                {createGroupMutation.isLoading ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.primaryButtonText}>Create</Text>}
              </TouchableOpacity>
            </View>
        </View>
      </BottomSheet>

      {/* View Group Modal */}
      <BottomSheet visible={!!viewingGroup} onClose={() => setViewingGroup(null)}>
        <View>
            <View style={styles.modalHeader}><Text style={styles.modalTitle}>{viewingGroup?.name}</Text><TouchableOpacity onPress={() => setViewingGroup(null)}><Ionicons name="close" size={24} color={Colors.mutedForeground} /></TouchableOpacity></View>
            {viewingGroup && (
              <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
                {viewingGroup.description && <Text style={styles.groupDescription}>{viewingGroup.description}</Text>}
                <View style={styles.statsRow}>
                  <View style={styles.statBox}><Text style={[styles.statValue, { color: Colors.blue }]}>{viewingGroup._count.members}</Text><Text style={styles.statLabel}>Members</Text></View>
                  <View style={styles.statBox}><Text style={[styles.statValue, { color: Colors.green }]}>{viewingGroup._count.songs}</Text><Text style={styles.statLabel}>Songs</Text></View>
                  <View style={styles.statBox}><Text style={[styles.statValue, { color: Colors.purple }]}>{viewingGroup._count.performances}</Text><Text style={styles.statLabel}>Shows</Text></View>
                </View>
                <Text style={styles.membersSectionTitle}>Members</Text>
                {viewingGroup.members.map((member) => {
                  const badge = getRoleBadge(member.role);
                  return (
                    <View key={member.id} style={styles.memberItem}>
                      <View style={styles.memberAvatar}><Text style={styles.memberAvatarText}>{member.user.name?.charAt(0)?.toUpperCase() ?? '?'}</Text></View>
                      <View style={{ flex: 1 }}><Text style={styles.memberName}>{member.user.name ?? 'Unknown'}</Text><Text style={styles.memberEmail}>{member.user.email}</Text></View>
                      <View style={[styles.roleBadge, { backgroundColor: badge.bg }]}><Text style={[styles.roleBadgeText, { color: badge.color }]}>{badge.label}</Text></View>
                    </View>
                  );
                })}
                <View style={styles.groupActions}>
                  {(viewingGroup.members[0]?.role === 'OWNER' || viewingGroup.members[0]?.role === 'ADMIN') && (
                    <TouchableOpacity onPress={() => { setSelectedGroupId(viewingGroup.id); setViewingGroup(null); setIsInviteModalOpen(true); }} style={styles.outlineButton}><Ionicons name="mail-outline" size={18} color={Colors.foreground} /><Text style={styles.outlineButtonText}>Invite Member</Text></TouchableOpacity>
                  )}
                  {viewingGroup.members[0]?.role !== 'OWNER' && (
                    <TouchableOpacity onPress={() => Alert.alert('Leave Group', `Leave "${viewingGroup.name}"?`, [{ text: 'Cancel', style: 'cancel' }, { text: 'Leave', style: 'destructive', onPress: () => leaveGroupMutation.mutate({ groupId: viewingGroup.id }) }])} style={styles.dangerButton}><Ionicons name="log-out-outline" size={18} color={Colors.red} /><Text style={styles.dangerButtonText}>Leave Group</Text></TouchableOpacity>
                  )}
                </View>
              </ScrollView>
            )}
            <View style={styles.modalFooter}><TouchableOpacity onPress={() => setViewingGroup(null)} style={styles.primaryButton}><Text style={styles.primaryButtonText}>Close</Text></TouchableOpacity></View>
        </View>
      </BottomSheet>

      {/* Invite Modal */}
      <BottomSheet visible={isInviteModalOpen} onClose={() => setIsInviteModalOpen(false)}>
        <View>
            <View style={styles.modalHeader}><Text style={styles.modalTitle}>Invite Member</Text><TouchableOpacity onPress={() => setIsInviteModalOpen(false)}><Ionicons name="close" size={24} color={Colors.mutedForeground} /></TouchableOpacity></View>
            <View style={styles.modalBody}>
              <View style={styles.formGroup}><Text style={styles.label}>Email *</Text><TextInput value={inviteEmail} onChangeText={setInviteEmail} placeholder="member@email.com" placeholderTextColor={Colors.mutedForeground} keyboardType="email-address" autoCapitalize="none" style={styles.textInput} /></View>
              <View style={styles.formGroup}><Text style={styles.label}>Role</Text><View style={styles.roleSelector}>
                <TouchableOpacity onPress={() => setInviteRole('MEMBER')} style={[styles.roleOption, inviteRole === 'MEMBER' && styles.roleOptionActive]}><Text style={[styles.roleOptionText, inviteRole === 'MEMBER' && { color: Colors.primary }]}>Member</Text></TouchableOpacity>
                <TouchableOpacity onPress={() => setInviteRole('ADMIN')} style={[styles.roleOption, inviteRole === 'ADMIN' && styles.roleOptionActive]}><Text style={[styles.roleOptionText, inviteRole === 'ADMIN' && { color: Colors.primary }]}>Admin</Text></TouchableOpacity>
              </View></View>
            </View>
            <View style={styles.modalFooter}>
              <TouchableOpacity onPress={() => setIsInviteModalOpen(false)} style={styles.secondaryButton}><Text style={styles.secondaryButtonText}>Cancel</Text></TouchableOpacity>
              <TouchableOpacity onPress={() => selectedGroupId && inviteEmail.trim() && inviteMutation.mutate({ groupId: selectedGroupId, email: inviteEmail, role: inviteRole })} disabled={!inviteEmail.trim()} style={[styles.primaryButton, !inviteEmail.trim() && { opacity: 0.5 }]}>
                {inviteMutation.isLoading ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.primaryButtonText}>Send Invite</Text>}
              </TouchableOpacity>
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
  sectionTitle: { fontSize: FontSizes.xl, fontWeight: '700', color: Colors.foreground, marginBottom: 12 },
  invitationCard: { backgroundColor: Colors.card, borderRadius: BorderRadius.lg, padding: Spacing.lg, borderWidth: 1, borderColor: Colors.border, marginBottom: 12 },
  invitationHeader: { flexDirection: 'row', alignItems: 'center' },
  mailIcon: { width: 44, height: 44, borderRadius: BorderRadius.lg, backgroundColor: `${Colors.blue}15`, alignItems: 'center', justifyContent: 'center', marginRight: 14 },
  invitationGroupName: { fontSize: FontSizes.lg, fontWeight: '600', color: Colors.foreground },
  invitationDescription: { fontSize: FontSizes.sm, color: Colors.mutedForeground, marginTop: 2 },
  invitationActions: { flexDirection: 'row', gap: 10, marginTop: 14, paddingTop: 14, borderTopWidth: 1, borderTopColor: Colors.border },
  groupCard: { backgroundColor: Colors.card, borderRadius: BorderRadius.lg, padding: Spacing.lg, borderWidth: 1, borderColor: Colors.border, marginBottom: 12, flexDirection: 'row', alignItems: 'center' },
  groupIcon: { width: 48, height: 48, borderRadius: BorderRadius.lg, backgroundColor: `${Colors.green}15`, alignItems: 'center', justifyContent: 'center', marginRight: 14 },
  groupTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  groupTitle: { fontSize: FontSizes.lg, fontWeight: '700', color: Colors.foreground },
  groupDescription: { fontSize: FontSizes.sm, color: Colors.mutedForeground, marginTop: 4 },
  groupStats: { flexDirection: 'row', gap: 16, marginTop: 10 },
  groupStat: { flexDirection: 'row', alignItems: 'center' },
  groupStatText: { fontSize: FontSizes.xs, color: Colors.mutedForeground, marginLeft: 4 },
  roleBadge: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 2, borderRadius: BorderRadius.full, marginTop: 4 },
  roleBadgeText: { fontSize: FontSizes.xs, fontWeight: '500' },
  emptyState: { alignItems: 'center', justifyContent: 'center', padding: 32 },
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
  textInput: { backgroundColor: Colors.secondary, borderWidth: 1, borderColor: Colors.border, borderRadius: BorderRadius.lg, paddingHorizontal: Spacing.lg, paddingVertical: 12, fontSize: FontSizes.lg, color: Colors.foreground },
  statsRow: { flexDirection: 'row', gap: 12, marginVertical: 20 },
  statBox: { flex: 1, backgroundColor: Colors.secondary, borderRadius: BorderRadius.lg, padding: 14, alignItems: 'center' },
  statValue: { fontSize: FontSizes.xxl, fontWeight: '700' },
  statLabel: { fontSize: FontSizes.xs, color: Colors.mutedForeground },
  membersSectionTitle: { fontSize: FontSizes.lg, fontWeight: '600', color: Colors.foreground, marginBottom: 12 },
  memberItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.secondary, borderRadius: BorderRadius.lg, padding: 12, marginBottom: 8 },
  memberAvatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.border, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  memberAvatarText: { fontSize: FontSizes.lg },
  memberName: { fontSize: FontSizes.sm, fontWeight: '500', color: Colors.foreground },
  memberEmail: { fontSize: FontSizes.xs, color: Colors.mutedForeground },
  groupActions: { gap: 10, marginTop: 16, marginBottom: 24 },
  outlineButton: { borderWidth: 1, borderColor: Colors.border, borderRadius: BorderRadius.lg, paddingVertical: 12, alignItems: 'center', flexDirection: 'row', justifyContent: 'center' },
  outlineButtonText: { fontSize: FontSizes.lg, fontWeight: '600', color: Colors.foreground, marginLeft: 8 },
  dangerButton: { backgroundColor: `${Colors.red}15`, borderRadius: BorderRadius.lg, paddingVertical: 12, alignItems: 'center', flexDirection: 'row', justifyContent: 'center' },
  dangerButtonText: { fontSize: FontSizes.lg, fontWeight: '600', color: Colors.red, marginLeft: 8 },
  roleSelector: { flexDirection: 'row', gap: 12 },
  roleOption: { flex: 1, paddingVertical: 12, borderRadius: BorderRadius.lg, alignItems: 'center', borderWidth: 1, borderColor: Colors.border },
  roleOptionActive: { backgroundColor: `${Colors.primary}15`, borderColor: Colors.primary },
  roleOptionText: { fontWeight: '600', color: Colors.foreground },
  primaryButton: { flex: 1, backgroundColor: Colors.primary, borderRadius: BorderRadius.lg, paddingVertical: 14, alignItems: 'center' },
  primaryButtonText: { fontSize: FontSizes.lg, fontWeight: '600', color: '#FFFFFF' },
  secondaryButton: { flex: 1, borderWidth: 1, borderColor: Colors.border, borderRadius: BorderRadius.lg, paddingVertical: 14, alignItems: 'center' },
  secondaryButtonText: { fontSize: FontSizes.lg, fontWeight: '600', color: Colors.foreground },
  primaryButtonSmall: { flex: 1, backgroundColor: Colors.primary, borderRadius: BorderRadius.lg, paddingVertical: 10, alignItems: 'center' },
  primaryButtonSmallText: { fontSize: FontSizes.sm, fontWeight: '600', color: '#FFFFFF' },
  secondaryButtonSmall: { flex: 1, borderWidth: 1, borderColor: Colors.border, borderRadius: BorderRadius.lg, paddingVertical: 10, alignItems: 'center' },
  secondaryButtonSmallText: { fontSize: FontSizes.sm, fontWeight: '600', color: Colors.foreground },
});
