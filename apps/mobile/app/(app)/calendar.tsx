import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BottomSheet } from '../../components/ui/BottomSheet';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../../lib/trpc';
import DateTimePicker from '@react-native-community/datetimepicker';

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

interface Performance {
  id: string;
  name: string;
  date: Date;
  endDate?: Date | null;
  location?: string | null;
  notes?: string | null;
  group: { id: string; name: string };
}

export default function CalendarScreen() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [viewingPerformance, setViewingPerformance] = useState<Performance | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    date: new Date(),
    location: '',
    notes: '',
    groupId: '',
  });

  const utils = api.useContext();

  const { data: performances, isLoading } = api.performances.upcoming.useQuery({ limit: 50 });
  const { data: groups } = api.groups.list.useQuery();

  const createMutation = api.performances.create.useMutation({
    onSuccess: () => {
      utils.performances.upcoming.invalidate();
      setIsCreateModalOpen(false);
      setFormData({ name: '', date: new Date(), location: '', notes: '', groupId: '' });
    },
    onError: (err) => Alert.alert('Error', err.message),
  });

  const deleteMutation = api.performances.delete.useMutation({
    onSuccess: () => {
      utils.performances.upcoming.invalidate();
      setViewingPerformance(null);
    },
    onError: (err) => Alert.alert('Error', err.message),
  });

  // Calendar helpers
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();
    return { daysInMonth, startingDay };
  };

  const { daysInMonth, startingDay } = getDaysInMonth(currentMonth);
  const days = [];
  for (let i = 0; i < startingDay; i++) {
    days.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }

  const isToday = (day: number) => {
    const today = new Date();
    return (
      day === today.getDate() &&
      currentMonth.getMonth() === today.getMonth() &&
      currentMonth.getFullYear() === today.getFullYear()
    );
  };

  const hasPerformance = (day: number) => {
    if (!performances) return false;
    return performances.some((p) => {
      const perfDate = new Date(p.date);
      return (
        perfDate.getDate() === day &&
        perfDate.getMonth() === currentMonth.getMonth() &&
        perfDate.getFullYear() === currentMonth.getFullYear()
      );
    });
  };

  const goToPreviousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleCreate = () => {
    if (!formData.name.trim() || !formData.groupId) {
      Alert.alert('Error', 'Please fill in name and select a group');
      return;
    }
    createMutation.mutate({
      name: formData.name,
      date: formData.date,
      location: formData.location || undefined,
      notes: formData.notes || undefined,
      groupId: formData.groupId,
    });
  };

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-background items-center justify-center" edges={['top']}>
        <ActivityIndicator size="large" color="#FB8500" />
        <Text className="text-muted-foreground mt-3">Loading calendar...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <ScrollView contentContainerStyle={{ padding: 16 }} showsVerticalScrollIndicator={false}>
        {/* Calendar Header */}
        <View className="bg-card rounded-2xl border border-border overflow-hidden mb-5">
          <View className="flex-row items-center justify-between p-4 bg-secondary">
            <TouchableOpacity onPress={goToPreviousMonth} className="p-2">
              <Ionicons name="chevron-back" size={24} color="#0F0F10" />
            </TouchableOpacity>
            <Text className="text-lg font-bold text-foreground">
              {MONTHS[currentMonth.getMonth()]} {currentMonth.getFullYear()}
            </Text>
            <TouchableOpacity onPress={goToNextMonth} className="p-2">
              <Ionicons name="chevron-forward" size={24} color="#0F0F10" />
            </TouchableOpacity>
          </View>

          {/* Weekdays */}
          <View className="flex-row px-2 py-3 border-b border-border">
            {WEEKDAYS.map((day) => (
              <View key={day} className="flex-1 items-center">
                <Text className="text-xs font-semibold text-muted-foreground">{day}</Text>
              </View>
            ))}
          </View>

          {/* Days Grid */}
          <View className="flex-row flex-wrap px-2 py-2">
            {days.map((day, index) => (
              <View key={index} className="w-[14.28%] items-center py-1.5">
                {day !== null ? (
                  <View className="relative">
                    <View
                      className={`w-9 h-9 rounded-full items-center justify-center ${
                        isToday(day) ? 'bg-primary' : ''
                      }`}
                    >
                      <Text
                        className={`text-sm font-medium ${
                          isToday(day) ? 'text-white' : 'text-foreground'
                        }`}
                      >
                        {day}
                      </Text>
                    </View>
                    {hasPerformance(day) && (
                      <View className="absolute bottom-0 left-1/2 -ml-1 w-1.5 h-1.5 rounded-full bg-green" />
                    )}
                  </View>
                ) : (
                  <View className="w-9 h-9" />
                )}
              </View>
            ))}
          </View>
        </View>

        {/* Upcoming Performances */}
        <Text className="text-lg font-bold text-foreground mb-3">Upcoming Performances</Text>

        {performances && performances.length > 0 ? (
          performances.slice(0, 10).map((perf) => (
            <TouchableOpacity
              key={perf.id}
              onPress={() => setViewingPerformance(perf)}
              className="bg-card rounded-xl p-4 border border-border mb-3"
              activeOpacity={0.7}
            >
              <View className="flex-row items-center">
                <View className="w-12 h-12 rounded-xl bg-purple/10 items-center justify-center mr-3.5">
                  <Text className="text-lg font-bold text-purple">
                    {new Date(perf.date).getDate()}
                  </Text>
                  <Text className="text-[10px] text-purple uppercase">
                    {MONTHS[new Date(perf.date).getMonth()].substring(0, 3)}
                  </Text>
                </View>

                <View className="flex-1">
                  <Text className="text-base font-semibold text-foreground">{perf.name}</Text>
                  <Text className="text-sm text-muted-foreground mt-0.5">{formatDate(perf.date)}</Text>
                  {perf.location && (
                    <View className="flex-row items-center mt-1">
                      <Ionicons name="location-outline" size={12} color="#6E6965" />
                      <Text className="text-xs text-muted-foreground ml-1">{perf.location}</Text>
                    </View>
                  )}
                </View>

                <View className="bg-blue/10 px-2.5 py-1 rounded-full">
                  <Text className="text-xs font-semibold text-blue">{perf.group.name}</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))
        ) : (
          <View className="items-center justify-center p-8">
            <Ionicons name="calendar" size={64} color="#E8E5E3" />
            <Text className="text-lg font-semibold text-foreground mt-4 text-center">
              No upcoming performances
            </Text>
            <Text className="text-sm text-muted-foreground mt-2 text-center">
              Schedule your first performance to see it here
            </Text>
            <TouchableOpacity onPress={() => setIsCreateModalOpen(true)} className="bg-primary px-6 py-3 rounded-xl mt-5">
              <Text className="text-white font-semibold">Add Performance</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* FAB */}
      <TouchableOpacity
        onPress={() => setIsCreateModalOpen(true)}
        className="absolute bottom-6 right-6 w-14 h-14 rounded-full bg-primary items-center justify-center"
        style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 8 }}
      >
        <Ionicons name="add" size={28} color="#FFFFFF" />
      </TouchableOpacity>

      {/* Create Modal */}
      <BottomSheet visible={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)}>
        <View>
            <View className="flex-row items-center justify-between p-5 border-b border-border">
              <Text className="text-xl font-bold text-foreground">New Performance</Text>
              <TouchableOpacity onPress={() => setIsCreateModalOpen(false)}>
                <Ionicons name="close" size={24} color="#6E6965" />
              </TouchableOpacity>
            </View>

            <ScrollView className="p-5" showsVerticalScrollIndicator={false}>
              <View className="gap-4 pb-6">
                <View>
                  <Text className="text-sm font-medium text-foreground mb-1.5">Event Name *</Text>
                  <TextInput
                    value={formData.name}
                    onChangeText={(text) => setFormData({ ...formData, name: text })}
                    placeholder="e.g., Festival Gig, Wedding"
                    placeholderTextColor="#6E6965"
                    className="bg-secondary border border-border rounded-xl px-4 py-3 text-base text-foreground"
                  />
                </View>

                <View>
                  <Text className="text-sm font-medium text-foreground mb-1.5">Date & Time *</Text>
                  <TouchableOpacity
                    onPress={() => setShowDatePicker(true)}
                    className="bg-secondary border border-border rounded-xl px-4 py-3 flex-row items-center"
                  >
                    <Ionicons name="calendar-outline" size={18} color="#6E6965" style={{ marginRight: 10 }} />
                    <Text className="text-base text-foreground">{formatDate(formData.date)}</Text>
                  </TouchableOpacity>
                  {showDatePicker && (
                    <DateTimePicker
                      value={formData.date}
                      mode="datetime"
                      display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                      onChange={(event, date) => {
                        setShowDatePicker(Platform.OS === 'ios');
                        if (date) setFormData({ ...formData, date });
                      }}
                    />
                  )}
                </View>

                <View>
                  <Text className="text-sm font-medium text-foreground mb-1.5">Group *</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <View className="flex-row gap-2">
                      {groups?.map((group) => (
                        <TouchableOpacity
                          key={group.id}
                          onPress={() => setFormData({ ...formData, groupId: group.id })}
                          className={`px-4 py-2.5 rounded-xl border ${
                            formData.groupId === group.id ? 'bg-primary/10 border-primary' : 'border-border'
                          }`}
                        >
                          <Text className={`text-sm font-medium ${formData.groupId === group.id ? 'text-primary' : 'text-foreground'}`}>
                            {group.name}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </ScrollView>
                </View>

                <View>
                  <Text className="text-sm font-medium text-foreground mb-1.5">Location</Text>
                  <TextInput
                    value={formData.location}
                    onChangeText={(text) => setFormData({ ...formData, location: text })}
                    placeholder="Venue or address"
                    placeholderTextColor="#6E6965"
                    className="bg-secondary border border-border rounded-xl px-4 py-3 text-base text-foreground"
                  />
                </View>

                <View>
                  <Text className="text-sm font-medium text-foreground mb-1.5">Notes</Text>
                  <TextInput
                    value={formData.notes}
                    onChangeText={(text) => setFormData({ ...formData, notes: text })}
                    placeholder="Additional details..."
                    placeholderTextColor="#6E6965"
                    multiline
                    numberOfLines={3}
                    className="bg-secondary border border-border rounded-xl px-4 py-3 text-base text-foreground"
                  />
                </View>
              </View>
            </ScrollView>

            <View className="flex-row gap-3 p-5 border-t border-border">
              <TouchableOpacity onPress={() => setIsCreateModalOpen(false)} className="flex-1 border border-border rounded-xl py-3.5 items-center">
                <Text className="text-base font-semibold text-foreground">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleCreate}
                disabled={!formData.name.trim() || !formData.groupId}
                className={`flex-1 rounded-xl py-3.5 items-center ${!formData.name.trim() || !formData.groupId ? 'bg-primary/50' : 'bg-primary'}`}
              >
                {createMutation.isLoading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text className="text-base font-semibold text-white">Create</Text>
                )}
              </TouchableOpacity>
            </View>
        </View>
      </BottomSheet>

      {/* View Performance Modal */}
      <BottomSheet visible={!!viewingPerformance} onClose={() => setViewingPerformance(null)}>
        <View>
            <View className="flex-row items-center justify-between p-5 border-b border-border">
              <Text className="text-xl font-bold text-foreground">{viewingPerformance?.name}</Text>
              <TouchableOpacity onPress={() => setViewingPerformance(null)}>
                <Ionicons name="close" size={24} color="#6E6965" />
              </TouchableOpacity>
            </View>

            {viewingPerformance && (
              <View className="p-5">
                <View className="gap-4">
                  <View className="flex-row items-center">
                    <View className="w-10 h-10 rounded-lg bg-purple/10 items-center justify-center mr-3">
                      <Ionicons name="calendar" size={20} color="#8B5CF6" />
                    </View>
                    <View>
                      <Text className="text-xs text-muted-foreground">Date & Time</Text>
                      <Text className="text-base font-medium text-foreground">{formatDate(viewingPerformance.date)}</Text>
                    </View>
                  </View>

                  <View className="flex-row items-center">
                    <View className="w-10 h-10 rounded-lg bg-blue/10 items-center justify-center mr-3">
                      <Ionicons name="people" size={20} color="#3B82F6" />
                    </View>
                    <View>
                      <Text className="text-xs text-muted-foreground">Group</Text>
                      <Text className="text-base font-medium text-foreground">{viewingPerformance.group.name}</Text>
                    </View>
                  </View>

                  {viewingPerformance.location && (
                    <View className="flex-row items-center">
                      <View className="w-10 h-10 rounded-lg bg-green/10 items-center justify-center mr-3">
                        <Ionicons name="location" size={20} color="#10B981" />
                      </View>
                      <View>
                        <Text className="text-xs text-muted-foreground">Location</Text>
                        <Text className="text-base font-medium text-foreground">{viewingPerformance.location}</Text>
                      </View>
                    </View>
                  )}

                  {viewingPerformance.notes && (
                    <View className="bg-secondary rounded-xl p-3">
                      <Text className="text-xs text-muted-foreground mb-1">Notes</Text>
                      <Text className="text-sm text-foreground">{viewingPerformance.notes}</Text>
                    </View>
                  )}
                </View>
              </View>
            )}

            <View className="flex-row gap-3 p-5 border-t border-border">
              <TouchableOpacity
                onPress={() => viewingPerformance && Alert.alert('Delete Performance', 'Are you sure?', [
                  { text: 'Cancel', style: 'cancel' },
                  { text: 'Delete', style: 'destructive', onPress: () => deleteMutation.mutate({ id: viewingPerformance.id }) },
                ])}
                className="flex-1 bg-red/10 rounded-xl py-3.5 items-center"
              >
                <Text className="text-base font-semibold text-red">Delete</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setViewingPerformance(null)} className="flex-1 bg-primary rounded-xl py-3.5 items-center">
                <Text className="text-base font-semibold text-white">Close</Text>
              </TouchableOpacity>
            </View>
        </View>
      </BottomSheet>
    </SafeAreaView>
  );
}
