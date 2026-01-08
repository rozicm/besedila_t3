"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "~/utils/api";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Modal } from "~/components/ui/modal";
import { Textarea } from "~/components/ui/textarea";
import {
  ArrowLeft,
  Users,
  Music,
  Calendar,
  Settings,
  Trash2,
  UserPlus,
  Crown,
  Shield,
  User,
  X,
} from "lucide-react";

export default function GroupDetailPage() {
  const params = useParams();
  const router = useRouter();
  const groupId = params.id as string;

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");

  const utils = api.useContext();
  const { data: group, isLoading } = api.groups.get.useQuery({ id: groupId });
  const { data: invitations } = api.groups.invitations.useQuery({ groupId });

  const updateGroupMutation = api.groups.update.useMutation({
    onSuccess: () => {
      utils.groups.get.invalidate({ id: groupId });
      utils.groups.list.invalidate();
      setIsEditModalOpen(false);
    },
  });

  const deleteGroupMutation = api.groups.delete.useMutation({
    onSuccess: () => {
      router.push("/groups");
    },
  });

  const removeMemberMutation = api.groups.removeMember.useMutation({
    onSuccess: () => {
      utils.groups.get.invalidate({ id: groupId });
    },
  });

  const updateMemberRoleMutation = api.groups.updateMemberRole.useMutation({
    onSuccess: () => {
      utils.groups.get.invalidate({ id: groupId });
    },
  });

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Nalaganje...</div>
      </div>
    );
  }

  if (!group) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Skupina ni bila najdena.</div>
      </div>
    );
  }

  const currentUserMember = group.members.find((m) => m.user);
  const isOwner = currentUserMember?.role === "OWNER";
  const isAdmin = currentUserMember?.role === "ADMIN" || isOwner;

  const handleEdit = () => {
    setEditName(group.name);
    setEditDescription(group.description || "");
    setIsEditModalOpen(true);
  };

  const handleUpdate = () => {
    updateGroupMutation.mutate({
      id: groupId,
      name: editName,
      description: editDescription || undefined,
    });
  };

  const handleDelete = () => {
    if (
      confirm(
        "Ali ste prepričani, da želite izbrisati to skupino? Ta akcija je nepovratna."
      )
    ) {
      deleteGroupMutation.mutate({ id: groupId });
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "OWNER":
        return <Crown className="h-4 w-4 text-yellow-500" />;
      case "ADMIN":
        return <Shield className="h-4 w-4 text-blue-500" />;
      default:
        return <User className="h-4 w-4 text-gray-500" />;
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case "OWNER":
        return "Lastnik";
      case "ADMIN":
        return "Administrator";
      default:
        return "Član";
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <Button
          variant="ghost"
          onClick={() => router.push("/groups")}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Nazaj na skupine
        </Button>

        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold">{group.name}</h1>
            {group.description && (
              <p className="text-muted-foreground mt-2">{group.description}</p>
            )}
          </div>

          {isAdmin && (
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleEdit}>
                <Settings className="mr-2 h-4 w-4" />
                Uredi
              </Button>
              {isOwner && (
                <Button variant="outline" onClick={handleDelete}>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Izbriši
                </Button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <Users className="h-8 w-8 text-blue-500" />
            <div>
              <p className="text-2xl font-bold">{group._count.members}</p>
              <p className="text-sm text-muted-foreground">Članov</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <Music className="h-8 w-8 text-green-500" />
            <div>
              <p className="text-2xl font-bold">{group._count.songs}</p>
              <p className="text-sm text-muted-foreground">Pesmi</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <Calendar className="h-8 w-8 text-purple-500" />
            <div>
              <p className="text-2xl font-bold">{group._count.performances}</p>
              <p className="text-sm text-muted-foreground">Nastopov</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Members */}
      <Card className="p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Člani</h2>
        <div className="space-y-3">
          {group.members.map((member) => (
            <div
              key={member.id}
              className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
            >
              <div className="flex items-center gap-3">
                {member.user.image && (
                  <div 
                    className="h-10 w-10 rounded-full bg-cover bg-center"
                    style={{ backgroundImage: `url(${member.user.image})` }}
                    aria-label={member.user.name || "User"}
                  />
                )}
                <div>
                  <p className="font-medium">{member.user.name || "Unknown User"}</p>
                  <p className="text-sm text-muted-foreground">{member.user.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-background">
                  {getRoleIcon(member.role)}
                  <span className="text-sm">{getRoleLabel(member.role)}</span>
                </div>
                {isOwner && member.role !== "OWNER" && (
                  <div className="flex gap-1">
                    {member.role === "ADMIN" ? (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          updateMemberRoleMutation.mutate({
                            groupId,
                            memberId: member.id,
                            role: "MEMBER",
                          })
                        }
                      >
                        Odstrani admin
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          updateMemberRoleMutation.mutate({
                            groupId,
                            memberId: member.id,
                            role: "ADMIN",
                          })
                        }
                      >
                        Naredi admin
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        if (
                          confirm(`Ali ste prepričani, da želite odstraniti ${member.user.name}?`)
                        ) {
                          removeMemberMutation.mutate({
                            groupId,
                            memberId: member.id,
                          });
                        }
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Pending Invitations */}
      {isAdmin && invitations && invitations.length > 0 && (
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Čakajoča vabila</h2>
          <div className="space-y-3">
            {invitations
              .filter((inv) => inv.status === "PENDING")
              .map((invitation) => (
                <div
                  key={invitation.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                >
                  <div>
                    <p className="font-medium">{invitation.email}</p>
                    <p className="text-sm text-muted-foreground">
                      Vloga: {getRoleLabel(invitation.role)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Veljavno do: {new Date(invitation.expiresAt).toLocaleDateString("sl-SI")}
                    </p>
                  </div>
                  <span className="text-xs px-2 py-1 rounded bg-yellow-500/10 text-yellow-600 dark:text-yellow-400">
                    Čaka
                  </span>
                </div>
              ))}
          </div>
        </Card>
      )}

      {/* Edit Modal */}
      <Modal
        open={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Uredi skupino"
      >
        <div className="space-y-4">
          <div>
            <Label htmlFor="editName">Ime skupine</Label>
            <Input
              id="editName"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="editDescription">Opis</Label>
            <Textarea
              id="editDescription"
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
              rows={3}
            />
          </div>
          <div className="flex gap-2 justify-end">
            <Button
              variant="outline"
              onClick={() => setIsEditModalOpen(false)}
            >
              Prekliči
            </Button>
            <Button
              onClick={handleUpdate}
              disabled={!editName.trim() || updateGroupMutation.isLoading}
            >
              Shrani
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

