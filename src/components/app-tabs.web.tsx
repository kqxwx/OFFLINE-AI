import {
  Tabs,
  TabList,
  TabTrigger,
  TabSlot,
  TabTriggerSlotProps,
  TabListProps,
} from 'expo-router/ui';
import { Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';

export default function AppTabs() {
  return (
    <Tabs>
      <TabSlot style={{ height: '100%' }} />
      <TabList asChild>
        <CustomTabList>
          <TabTrigger name="home" href="/" asChild>
            <TabButton>Чат</TabButton>
          </TabTrigger>
          <TabTrigger name="explore" href="/explore" asChild>
            <TabButton>Возможности</TabButton>
          </TabTrigger>
        </CustomTabList>
      </TabList>
    </Tabs>
  );
}

export function TabButton({ children, isFocused, ...props }: TabTriggerSlotProps) {
  return (
    <Pressable {...props} style={({ pressed }) => [styles.tabButton, isFocused && styles.tabButtonActive, pressed && styles.pressed]}>
      <Text style={[styles.tabText, isFocused && styles.tabTextActive]}>{children}</Text>
    </Pressable>
  );
}

export function CustomTabList(props: TabListProps) {
  const { width } = useWindowDimensions();
  return (
    <View {...props} style={[styles.tabListContainer, width >= 900 && styles.desktopHidden]}>
      <View style={styles.innerContainer}>
        <View style={styles.brandMark}><Text style={styles.brandGlyph}>✳</Text></View>
        <Text style={styles.brandText}>OFFLINE AI</Text>
        <View style={styles.tabs}>{props.children}</View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  desktopHidden: { display: 'none' },
  tabListContainer: {
    position: 'absolute',
    bottom: 12,
    left: 0,
    right: 0,
    width: '100%',
    paddingHorizontal: 16,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  innerContainer: {
    width: '100%',
    maxWidth: 460,
    minHeight: 62,
    paddingHorizontal: 13,
    paddingVertical: 8,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    backgroundColor: 'rgba(24,22,37,0.96)',
    borderWidth: 1,
    borderColor: '#39334D',
    shadowColor: '#000000',
    shadowOpacity: 0.28,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 12,
  },
  brandMark: { width: 31, height: 31, borderRadius: 11, backgroundColor: '#3A2D5D', alignItems: 'center', justifyContent: 'center' },
  brandGlyph: { color: '#D9CBFF', fontSize: 18 },
  brandText: { color: '#E9E3F6', fontSize: 9, fontWeight: '800', letterSpacing: 1.1, marginRight: 'auto' },
  tabs: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  tabButton: { paddingHorizontal: 13, paddingVertical: 10, borderRadius: 13, backgroundColor: 'transparent' },
  tabButtonActive: { backgroundColor: '#3A2D5D' },
  tabText: { color: '#918BA3', fontSize: 10, fontWeight: '600' },
  tabTextActive: { color: '#E0D4FF' },
  pressed: { opacity: 0.7 },
});
