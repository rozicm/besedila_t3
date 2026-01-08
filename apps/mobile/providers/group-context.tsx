import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { api } from "../lib/trpc";
import * as SecureStore from "expo-secure-store";

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

const STORAGE_KEY = "selectedGroupId";

export function GroupProvider({ children }: { children: ReactNode }) {
  const [selectedGroupId, setSelectedGroupIdState] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  const { data: groups, isLoading: isQueryLoading } = api.groups.list.useQuery(undefined, {
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Load from SecureStore on mount
  useEffect(() => {
    const loadStoredGroupId = async () => {
      try {
        const stored = await SecureStore.getItemAsync(STORAGE_KEY);
        if (stored) {
          setSelectedGroupIdState(stored);
        }
      } catch (error) {
        console.error("Error loading stored group ID:", error);
      } finally {
        setIsInitialized(true);
      }
    };
    loadStoredGroupId();
  }, []);

  // Auto-select first group if none selected and groups are loaded
  useEffect(() => {
    const autoSelectGroup = async () => {
      if (!isQueryLoading && groups && groups.length > 0 && isInitialized) {
        // Check if stored ID still exists in groups
        if (selectedGroupId) {
          const storedGroupExists = groups.some(g => g.id === selectedGroupId);
          if (!storedGroupExists) {
            // Selected group no longer exists, select first available
            setSelectedGroupIdState(groups[0].id);
            await SecureStore.setItemAsync(STORAGE_KEY, groups[0].id);
          }
        } else {
          // No group selected, select first one
          setSelectedGroupIdState(groups[0].id);
          await SecureStore.setItemAsync(STORAGE_KEY, groups[0].id);
        }
      }
    };
    autoSelectGroup();
  }, [groups, isQueryLoading, isInitialized, selectedGroupId]);

  const setSelectedGroupId = async (id: string | null) => {
    setSelectedGroupIdState(id);
    try {
      if (id) {
        await SecureStore.setItemAsync(STORAGE_KEY, id);
      } else {
        await SecureStore.deleteItemAsync(STORAGE_KEY);
      }
    } catch (error) {
      console.error("Error saving group ID:", error);
    }
  };

  const simpleGroups = groups?.map(g => ({
    id: g.id,
    name: g.name,
    description: g.description,
  })) || [];

  const isLoading = isQueryLoading || !isInitialized;

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

