"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { api } from "~/utils/api";

interface GroupContextType {
  selectedGroupId: string | null;
  setSelectedGroupId: (id: string | null) => void;
  isLoading: boolean;
  groups: Array<{
    id: string;
    name: string;
    description: string | null;
  }>;
}

const GroupContext = createContext<GroupContextType | undefined>(undefined);

export function GroupProvider({ children }: { children: ReactNode }) {
  const [selectedGroupId, setSelectedGroupIdState] = useState<string | null>(null);

  const { data: groups, isLoading } = api.groups.list.useQuery(undefined, {
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem("selectedGroupId");
    if (stored) {
      setSelectedGroupIdState(stored);
    }
  }, []);

  // Auto-select first group if none selected and groups are loaded
  useEffect(() => {
    if (!isLoading && groups && groups.length > 0 && !selectedGroupId) {
      // Check if stored ID still exists in groups
      const stored = localStorage.getItem("selectedGroupId");
      const storedGroupExists = stored && groups.some(g => g.id === stored);
      
      if (storedGroupExists) {
        setSelectedGroupIdState(stored);
      } else {
        setSelectedGroupIdState(groups[0].id);
        localStorage.setItem("selectedGroupId", groups[0].id);
      }
    }
  }, [groups, isLoading, selectedGroupId]);

  const setSelectedGroupId = (id: string | null) => {
    setSelectedGroupIdState(id);
    if (id) {
      localStorage.setItem("selectedGroupId", id);
    } else {
      localStorage.removeItem("selectedGroupId");
    }
  };

  const simpleGroups = groups?.map(g => ({
    id: g.id,
    name: g.name,
    description: g.description,
  })) || [];

  return (
    <GroupContext.Provider
      value={{
        selectedGroupId,
        setSelectedGroupId,
        isLoading,
        groups: simpleGroups,
      }}
    >
      {children}
    </GroupContext.Provider>
  );
}

export function useGroup() {
  const context = useContext(GroupContext);
  if (context === undefined) {
    throw new Error("useGroup must be used within a GroupProvider");
  }
  return context;
}

// Component to select the current group
export function GroupSelector() {
  const { selectedGroupId, setSelectedGroupId, groups, isLoading } = useGroup();

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground">
        Loading groups...
      </div>
    );
  }

  if (groups.length === 0) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground">
        No groups available
      </div>
    );
  }

  return (
    <select
      value={selectedGroupId || ""}
      onChange={(e) => setSelectedGroupId(e.target.value || null)}
      className="rounded-md border border-input bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
    >
      {groups.map((group) => (
        <option key={group.id} value={group.id}>
          {group.name}
        </option>
      ))}
    </select>
  );
}

