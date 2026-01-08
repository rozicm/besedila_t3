"use client";

import { useState } from "react";
import { api } from "~/utils/api";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Modal } from "~/components/ui/modal";
import { Textarea } from "~/components/ui/textarea";
import { Plus, Users, Music, Calendar, Mail, Check, X, Trash2, UserPlus, Settings, LogOut } from "lucide-react";

export default function GroupsPage() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupDescription, setNewGroupDescription] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"MEMBER" | "ADMIN">("MEMBER");

  const utils = api.useContext();
  const { data: groups, isLoading } = api.groups.list.useQuery();
  const { data: invitations, isLoading: isLoadingInvitations } = api.groups.myInvitations.useQuery();

  const createGroupMutation = api.groups.create.useMutation({
    onSuccess: () => {
      utils.groups.list.invalidate();
      setIsCreateModalOpen(false);
      setNewGroupName("");
      setNewGroupDescription("");
    },
  });

  const inviteMutation = api.groups.invite.useMutation({
    onSuccess: () => {
      utils.groups.invitations.invalidate();
      setIsInviteModalOpen(false);
      setInviteEmail("");
      setInviteRole("MEMBER");
    },
  });

  const acceptInvitationMutation = api.groups.acceptInvitation.useMutation({
    onSuccess: () => {
      utils.groups.list.invalidate();
      utils.groups.myInvitations.invalidate();
    },
  });

  const declineInvitationMutation = api.groups.declineInvitation.useMutation({
    onSuccess: () => {
      utils.groups.myInvitations.invalidate();
    },
  });

  const leaveGroupMutation = api.groups.leave.useMutation({
    onSuccess: () => {
      utils.groups.list.invalidate();
    },
  });

  const handleCreateGroup = () => {
    if (!newGroupName.trim()) return;
    createGroupMutation.mutate({
      name: newGroupName,
      description: newGroupDescription || undefined,
    });
  };

  const handleInvite = () => {
    if (!selectedGroupId || !inviteEmail.trim()) return;
    inviteMutation.mutate({
      groupId: selectedGroupId,
      email: inviteEmail,
      role: inviteRole,
    });
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Nalaganje...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Moje skupine</h1>
          <p className="text-muted-foreground mt-1">
            Upravljajte svoje ansambele in skupine
          </p>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Nova skupina
        </Button>
      </div>

      {/* Pending Invitations */}
      {!isLoadingInvitations && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Vabila</h2>
          {invitations && invitations.length > 0 ? (
            <div className="space-y-3">
              {invitations.map((invitation) => (
                <Card key={invitation.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Mail className="h-5 w-5 text-blue-500" />
                      <div>
                        <p className="font-medium">{invitation.group.name}</p>
                        {invitation.group.description && (
                          <p className="text-sm text-muted-foreground">
                            {invitation.group.description}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground mt-1">
                          Vloga: {invitation.role === "ADMIN" ? "Administrator" : "Član"}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => acceptInvitationMutation.mutate({ invitationId: invitation.id })}
                        disabled={acceptInvitationMutation.isLoading}
                      >
                        <Check className="mr-1 h-4 w-4" />
                        Sprejmi
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => declineInvitationMutation.mutate({ invitationId: invitation.id })}
                        disabled={declineInvitationMutation.isLoading}
                      >
                        <X className="mr-1 h-4 w-4" />
                        Zavrni
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Nimate nobenih vabil.</p>
          )}
        </div>
      )}

      {/* Groups Grid */}
      {groups && groups.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {groups.map((group) => {
            const userMember = group.members.find(
              (m) => m.userId === group.members[0]?.userId
            );
            const isOwner = userMember?.role === "OWNER";
            const isAdmin = userMember?.role === "ADMIN";

            return (
              <Card key={group.id} className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold mb-1">{group.name}</h3>
                    {group.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {group.description}
                      </p>
                    )}
                  </div>
                  {isOwner && (
                    <span className="text-xs bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 px-2 py-1 rounded">
                      Lastnik
                    </span>
                  )}
                  {isAdmin && !isOwner && (
                    <span className="text-xs bg-blue-500/10 text-blue-600 dark:text-blue-400 px-2 py-1 rounded">
                      Admin
                    </span>
                  )}
                </div>

                <div className="space-y-2 mb-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    <span>{group._count.members} članov</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Music className="h-4 w-4" />
                    <span>{group._count.songs} pesmi</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>{group._count.performances} nastopov</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => (window.location.href = `/groups/${group.id}`)}
                  >
                    <Settings className="mr-1 h-4 w-4" />
                    Odpri
                  </Button>
                  {(isOwner || isAdmin) && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedGroupId(group.id);
                        setIsInviteModalOpen(true);
                      }}
                    >
                      <UserPlus className="h-4 w-4" />
                    </Button>
                  )}
                  {!isOwner && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        if (confirm("Ali ste prepričani, da želite zapustiti to skupino?")) {
                          leaveGroupMutation.mutate({ groupId: group.id });
                        }
                      }}
                    >
                      <LogOut className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12">
          <Users className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground mb-4">
            Nimate še nobene skupine. Ustvarite prvo!
          </p>
        </div>
      )}

      {/* Create Group Modal */}
      <Modal
        open={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Ustvari novo skupino"
      >
        <div className="space-y-4">
          <div>
            <Label htmlFor="groupName">Ime skupine</Label>
            <Input
              id="groupName"
              value={newGroupName}
              onChange={(e) => setNewGroupName(e.target.value)}
              placeholder="Npr. Ansambel Veseli Svatje"
            />
          </div>
          <div>
            <Label htmlFor="groupDescription">Opis (opcijsko)</Label>
            <Textarea
              id="groupDescription"
              value={newGroupDescription}
              onChange={(e) => setNewGroupDescription(e.target.value)}
              placeholder="Kratek opis skupine..."
              rows={3}
            />
          </div>
          <div className="flex gap-2 justify-end">
            <Button
              variant="outline"
              onClick={() => setIsCreateModalOpen(false)}
            >
              Prekliči
            </Button>
            <Button
              onClick={handleCreateGroup}
              disabled={!newGroupName.trim() || createGroupMutation.isLoading}
            >
              Ustvari
            </Button>
          </div>
        </div>
      </Modal>

      {/* Invite Modal */}
      <Modal
        open={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        title="Povabi člana"
      >
        <div className="space-y-4">
          <div>
            <Label htmlFor="inviteEmail">Email</Label>
            <Input
              id="inviteEmail"
              type="email"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              placeholder="ime.priimek@email.com"
            />
          </div>
          <div>
            <Label htmlFor="inviteRole">Vloga</Label>
            <select
              id="inviteRole"
              className="w-full rounded-md border border-input bg-background px-3 py-2"
              value={inviteRole}
              onChange={(e) => setInviteRole(e.target.value as "MEMBER" | "ADMIN")}
            >
              <option value="MEMBER">Član</option>
              <option value="ADMIN">Administrator</option>
            </select>
          </div>
          <div className="flex gap-2 justify-end">
            <Button
              variant="outline"
              onClick={() => setIsInviteModalOpen(false)}
            >
              Prekliči
            </Button>
            <Button
              onClick={handleInvite}
              disabled={!inviteEmail.trim() || inviteMutation.isLoading}
            >
              Pošlji vabilo
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

