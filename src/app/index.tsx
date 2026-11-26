import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type Message = { id: string; role: 'assistant' | 'user'; text: string };

const QUICK_PROMPTS = [
  { icon: '✧', title: 'Объяснить сложное', prompt: 'Объясни мне сложную тему простыми словами' },
  { icon: '⌘', title: 'Придумать идею', prompt: 'Помоги придумать интересную идею для проекта' },
  { icon: '✎', title: 'Написать текст', prompt: 'Помоги написать красивый и понятный текст' },
  { icon: '◇', title: 'Составить план', prompt: 'Помоги составить план действий' },
];

export default function HomeScreen() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [mode, setMode] = useState<'balanced' | 'deep'>('balanced');
  const [historyReady, setHistoryReady] = useState(false);
  const pulse = useRef(new Animated.Value(0)).current;
  const breathe = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (Platform.OS !== 'web') {
      setHistoryReady(true);
      return;
    }
    try {
      const saved = window.localStorage.getItem('offlineai.chat.v1');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) setMessages(parsed);
      }
    } catch {
      // Ignore unavailable or malformed local history.
    } finally {
      setHistoryReady(true);
    }
  }, []);

  useEffect(() => {
    if (Platform.OS !== 'web' || !historyReady) return;
    try {
      window.localStorage.setItem('offlineai.chat.v1', JSON.stringify(messages));
    } catch {
      // The app remains usable if browser storage is unavailable.
    }
  }, [messages, historyReady]);

  useEffect(() => {
    const native = Platform.OS !== 'web';
    const pulseLoop = Animated.loop(Animated.sequence([
      Animated.timing(pulse, { toValue: 1, duration: 2400, useNativeDriver: native }),
      Animated.timing(pulse, { toValue: 0, duration: 2400, useNativeDriver: native }),
    ]));
    const breatheLoop = Animated.loop(Animated.sequence([
      Animated.timing(breathe, { toValue: 1, duration: 3200, useNativeDriver: native }),
      Animated.timing(breathe, { toValue: 0, duration: 3200, useNativeDriver: native }),
    ]));
    pulseLoop.start();
    breatheLoop.start();
    return () => { pulseLoop.stop(); breatheLoop.stop(); };
  }, [pulse, breathe]);

  const orbScale = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.96, 1.045] });
  const haloOpacity = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.22, 0.55] });
  const coreScale = breathe.interpolate({ inputRange: [0, 1], outputRange: [0.94, 1.06] });

  const sendMessage = () => {
    const text = input.trim();
    if (!text) return;
    const now = Date.now().toString();
    setMessages(current => [
      ...current,
      { id: now, role: 'user', text },
      {
        id: now + '-notice',
        role: 'assistant',
        text: 'Сообщение принято. Сейчас интерфейс работает без подключённой языковой модели. Следующий этап — встроить локальную нейросеть, чтобы ответы создавались прямо на iPhone, без интернета.',
      },
    ]);
    setInput('');
  };

  const choosePrompt = (prompt: string) => setInput(prompt);

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.screen}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.topGlow} />
        <View style={styles.header}>
          <View style={styles.brandMark}><Text style={styles.brandGlyph}>✳</Text></View>
          <View style={styles.brandCopy}>
            <Text style={styles.brandName}>OFFLINE<Text style={styles.brandAccent}> AI</Text></Text>
            <Text style={styles.brandCaption}>PERSONAL INTELLIGENCE</Text>
          </View>
          <Pressable onPress={() => setSettingsOpen(true)} style={({ pressed }) => [styles.iconButton, pressed && styles.pressed]}>
            <Text style={styles.iconButtonText}>☷</Text>
          </Pressable>
        </View>

        <View style={styles.statusRow}>
          <View style={styles.statusPill}>
            <View style={styles.statusDot} />
            <Text style={styles.statusLabel}>ЛОКАЛЬНЫЙ РЕЖИМ</Text>
          </View>
          <Text style={styles.statusDetail}>МОДЕЛЬ НЕ ПОДКЛЮЧЕНА</Text>
        </View>

        <ScrollView
          style={styles.conversation}
          contentContainerStyle={styles.conversationContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {messages.length === 0 ? (
            <View style={styles.welcome}>
              <View style={styles.orbStage}>
                <Animated.View style={[styles.orbHalo, { opacity: haloOpacity, transform: [{ scale: orbScale }] }]} />
                <Animated.View style={[styles.orbOuter, { transform: [{ scale: orbScale }] }]}>
                  <View style={styles.orbRing}>
                    <Animated.View style={[styles.orbCore, { transform: [{ scale: coreScale }] }]}>
                      <Text style={styles.orbSpark}>✳</Text>
                    </Animated.View>
                  </View>
                </Animated.View>
                <View style={styles.orbOrbitOne} />
                <View style={styles.orbOrbitTwo} />
              </View>
              <Text style={styles.eyebrow}>ТВОЁ ЛИЧНОЕ ПРОСТРАНСТВО</Text>
              <Text style={styles.heroTitle}>Мысли свободно.</Text>
              <Text style={styles.heroTitleAccent}>Создавай без границ.</Text>
              <Text style={styles.heroDescription}>
                Личный ИИ, который будет работать прямо на твоём устройстве. Твои данные останутся у тебя.
              </Text>

              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>ЧТО МОЖНО БУДЕТ ДЕЛАТЬ</Text>
                <Text style={styles.sectionCount}>04</Text>
              </View>
              <View style={styles.promptGrid}>
                {QUICK_PROMPTS.map((item, index) => (
                  <Pressable
                    key={item.title}
                    onPress={() => choosePrompt(item.prompt)}
                    style={({ pressed }) => [styles.promptCard, pressed && styles.cardPressed, index % 2 === 1 && styles.promptCardAlt]}
                  >
                    <View style={styles.promptIcon}><Text style={styles.promptGlyph}>{item.icon}</Text></View>
                    <Text style={styles.promptTitle}>{item.title}</Text>
                    <Text style={styles.promptArrow}>↗</Text>
                  </Pressable>
                ))}
              </View>
              <View style={styles.privacyNote}>
                <Text style={styles.privacyIcon}>◈</Text>
                <View style={styles.privacyCopy}>
                  <Text style={styles.privacyTitle}>Приватность — основа</Text>
                  <Text style={styles.privacyText}>Цель проекта — обработка запросов и хранение истории локально, без отправки личных данных в облако.</Text>
                </View>
              </View>
            </View>
          ) : (
            <View style={styles.messages}>
              <Text style={styles.chatDate}>{Platform.OS === 'web' ? 'ИСТОРИЯ СОХРАНЯЕТСЯ ЛОКАЛЬНО' : 'ДИАЛОГ ЭТОГО СЕАНСА'}</Text>
              {messages.map(message => (
                <View key={message.id} style={[styles.messageRow, message.role === 'user' ? styles.userRow : styles.assistantRow]}>
                  {message.role === 'assistant' && <View style={styles.miniMark}><Text style={styles.miniMarkText}>✳</Text></View>}
                  <View style={[styles.messageBubble, message.role === 'user' ? styles.userBubble : styles.assistantBubble]}>
                    {message.role === 'assistant' && <Text style={styles.messageLabel}>OFFLINE AI · СТАТУС</Text>}
                    <Text style={styles.messageText}>{message.text}</Text>
                  </View>
                </View>
              ))}
            </View>
          )}
        </ScrollView>

        <View style={styles.composerArea}>
          <View style={styles.modeRow}>
            <Text style={styles.modeCaption}>РЕЖИМ РАБОТЫ</Text>
            <View style={styles.modeSwitch}>
              <Pressable onPress={() => setMode('balanced')} style={[styles.modeOption, mode === 'balanced' && styles.modeOptionActive]}>
                <Text style={[styles.modeText, mode === 'balanced' && styles.modeTextActive]}>Стандарт</Text>
              </Pressable>
              <Pressable onPress={() => setMode('deep')} style={[styles.modeOption, mode === 'deep' && styles.modeOptionActive]}>
                <Text style={[styles.modeText, mode === 'deep' && styles.modeTextActive]}>Размышление</Text>
              </Pressable>
            </View>
          </View>
          <View style={styles.composer}>
            <TextInput
              value={input}
              onChangeText={setInput}
              placeholder="Спроси о чём угодно..."
              placeholderTextColor="#77758B"
              style={styles.input}
              multiline
              maxLength={4000}
              returnKeyType="send"
              onSubmitEditing={sendMessage}
              blurOnSubmit
            />
            <Pressable
              style={({ pressed }) => [styles.voiceButton, pressed && styles.pressed]}
              onPress={() => setSettingsOpen(true)}
              accessibilityLabel="Голосовой режим — скоро"
            >
              <Text style={styles.voiceGlyph}>⌁</Text>
            </Pressable>
            <Pressable
              style={({ pressed }) => [styles.sendButton, !input.trim() && styles.sendButtonIdle, pressed && styles.pressed]}
              onPress={sendMessage}
              accessibilityLabel="Отправить сообщение"
            >
              <Text style={styles.sendGlyph}>↑</Text>
            </Pressable>
          </View>
          <Text style={styles.disclaimer}>СООБЩЕНИЯ ПОКА НЕ ОБРАБАТЫВАЮТСЯ НЕЙРОСЕТЬЮ</Text>
        </View>
      </KeyboardAvoidingView>

      <Modal visible={settingsOpen} transparent animationType="fade" onRequestClose={() => setSettingsOpen(false)}>
        <Pressable style={styles.modalBackdrop} onPress={() => setSettingsOpen(false)}>
          <Pressable style={styles.settingsSheet} onPress={() => {}}>
            <View style={styles.sheetHandle} />
            <View style={styles.sheetHeader}>
              <View>
                <Text style={styles.sheetEyebrow}>OFFLINE AI</Text>
                <Text style={styles.sheetTitle}>Состояние системы</Text>
              </View>
              <Pressable onPress={() => setSettingsOpen(false)} style={styles.closeButton}><Text style={styles.closeText}>×</Text></Pressable>
            </View>
            <View style={styles.settingItem}>
              <View style={styles.settingIcon}><Text style={styles.settingIconText}>◉</Text></View>
              <View style={styles.settingCopy}>
                <Text style={styles.settingName}>Подключение к интернету</Text>
                <Text style={styles.settingValue}>Не требуется для интерфейса</Text>
              </View>
              <View style={styles.settingBadge}><Text style={styles.settingBadgeText}>OFF</Text></View>
            </View>
            <View style={styles.settingItem}>
              <View style={styles.settingIcon}><Text style={styles.settingIconText}>✳</Text></View>
              <View style={styles.settingCopy}>
                <Text style={styles.settingName}>Локальная нейросеть</Text>
                <Text style={styles.settingValue}>Ещё не установлена</Text>
              </View>
              <View style={[styles.settingBadge, styles.badgePending]}><Text style={[styles.settingBadgeText, styles.pendingText]}>SOON</Text></View>
            </View>
            <View style={styles.settingItem}>
              <View style={styles.settingIcon}><Text style={styles.settingIconText}>▤</Text></View>
              <View style={styles.settingCopy}>
                <Text style={styles.settingName}>Память и история</Text>
                <Text style={styles.settingValue}>Сохранение подключим отдельно</Text>
              </View>
              <View style={[styles.settingBadge, styles.badgePending]}><Text style={[styles.settingBadgeText, styles.pendingText]}>SOON</Text></View>
            </View>
            <View style={styles.settingItem}>
              <View style={styles.settingIcon}><Text style={styles.settingIconText}>⌁</Text></View>
              <View style={styles.settingCopy}>
                <Text style={styles.settingName}>Голосовой режим</Text>
                <Text style={styles.settingValue}>Микрофон и озвучка ещё не подключены</Text>
              </View>
              <View style={[styles.settingBadge, styles.badgePending]}><Text style={[styles.settingBadgeText, styles.pendingText]}>SOON</Text></View>
            </View>
            {Platform.OS === 'web' && (
              <Pressable onPress={() => { setMessages([]); setSettingsOpen(false); }} style={styles.clearHistoryButton}>
                <Text style={styles.clearHistoryText}>Очистить локальную историю</Text>
              </Pressable>
            )}
            <Text style={styles.sheetFootnote}>Мы не показываем фиктивный статус готовности: функции появятся после подключения и проверки на iPhone.</Text>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#080811' },
  screen: { flex: 1, width: '100%', maxWidth: 780, alignSelf: 'center', paddingHorizontal: 22 },
  topGlow: { position: 'absolute', top: -170, alignSelf: 'center', width: 440, height: 360, borderRadius: 220, backgroundColor: '#30245E', opacity: 0.22 },
  header: { flexDirection: 'row', alignItems: 'center', paddingTop: 10, paddingBottom: 16 },
  brandMark: { width: 42, height: 42, borderRadius: 15, backgroundColor: '#211B3A', borderWidth: 1, borderColor: '#6653A8', alignItems: 'center', justifyContent: 'center' },
  brandGlyph: { color: '#D7C8FF', fontSize: 25 },
  brandCopy: { flex: 1, marginLeft: 12 },
  brandName: { color: '#F7F4FF', fontSize: 17, fontWeight: '800', letterSpacing: 2.1 },
  brandAccent: { color: '#B7A2FF' },
  brandCaption: { color: '#77748D', fontSize: 8, letterSpacing: 2.2, marginTop: 4 },
  iconButton: { width: 42, height: 42, borderRadius: 14, backgroundColor: '#171624', borderWidth: 1, borderColor: '#2A273B', alignItems: 'center', justifyContent: 'center' },
  iconButtonText: { color: '#C9BFFF', fontSize: 24 },
  statusRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 3 },
  statusPill: { flexDirection: 'row', alignItems: 'center', gap: 7, paddingHorizontal: 11, paddingVertical: 7, borderRadius: 20, backgroundColor: '#171B20', borderWidth: 1, borderColor: '#29352F' },
  statusDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#A6D8B4' },
  statusLabel: { color: '#B8D9C2', fontSize: 8, fontWeight: '700', letterSpacing: 1.2 },
  statusDetail: { color: '#77748D', fontSize: 8, letterSpacing: 1 },
  conversation: { flex: 1 },
  conversationContent: { flexGrow: 1, paddingBottom: 16 },
  welcome: { alignItems: 'center', paddingTop: 5 },
  orbStage: { width: 210, height: 198, alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  orbHalo: { position: 'absolute', width: 172, height: 172, borderRadius: 86, backgroundColor: '#7761D9' },
  orbOuter: { width: 148, height: 148, borderRadius: 74, backgroundColor: '#151326', borderWidth: 1, borderColor: '#55468C', alignItems: 'center', justifyContent: 'center', shadowColor: '#8A70FF', shadowOpacity: 0.35, shadowRadius: 28, shadowOffset: { width: 0, height: 0 }, elevation: 12 },
  orbRing: { width: 120, height: 120, borderRadius: 60, backgroundColor: '#29204C', borderWidth: 1, borderColor: '#7D69C5', alignItems: 'center', justifyContent: 'center' },
  orbCore: { width: 82, height: 82, borderRadius: 41, backgroundColor: '#8C72E8', alignItems: 'center', justifyContent: 'center', shadowColor: '#B9A5FF', shadowOpacity: 0.65, shadowRadius: 22, shadowOffset: { width: 0, height: 0 }, elevation: 10 },
  orbSpark: { color: '#FFFFFF', fontSize: 42, textShadowColor: '#E6DFFF', textShadowRadius: 12 },
  orbOrbitOne: { position: 'absolute', width: 190, height: 70, borderRadius: 95, borderWidth: 1, borderColor: 'rgba(174,153,255,0.24)', transform: [{ rotate: '-24deg' }] },
  orbOrbitTwo: { position: 'absolute', width: 190, height: 70, borderRadius: 95, borderWidth: 1, borderColor: 'rgba(174,153,255,0.16)', transform: [{ rotate: '54deg' }] },
  eyebrow: { color: '#A99BCF', fontSize: 8, letterSpacing: 2.7, fontWeight: '700', marginTop: 2 },
  heroTitle: { color: '#F5F1FF', fontSize: 27, lineHeight: 32, fontWeight: '700', letterSpacing: -0.8, marginTop: 7 },
  heroTitleAccent: { color: '#B5A0FF', fontSize: 27, lineHeight: 32, fontWeight: '700', letterSpacing: -0.8 },
  heroDescription: { color: '#9894AA', fontSize: 12, lineHeight: 19, textAlign: 'center', maxWidth: 330, marginTop: 10, marginBottom: 22 },
  sectionHeader: { width: '100%', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
  sectionTitle: { color: '#8F8AA5', fontSize: 9, letterSpacing: 1.8, fontWeight: '700' },
  sectionCount: { color: '#665D83', fontSize: 9, letterSpacing: 1.5 },
  promptGrid: { width: '100%', flexDirection: 'row', flexWrap: 'wrap', gap: 9 },
  promptCard: { width: '48.5%', minHeight: 92, borderRadius: 17, padding: 13, backgroundColor: '#151421', borderWidth: 1, borderColor: '#2D293F', position: 'relative' },
  promptCardAlt: { backgroundColor: '#171522' },
  cardPressed: { opacity: 0.72, transform: [{ scale: 0.985 }] },
  promptIcon: { width: 29, height: 29, borderRadius: 10, backgroundColor: '#29213F', alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  promptGlyph: { color: '#C1ADFF', fontSize: 17 },
  promptTitle: { color: '#E9E4F5', fontSize: 11, fontWeight: '600' },
  promptArrow: { position: 'absolute', top: 13, right: 13, color: '#81759F', fontSize: 15 },
  privacyNote: { width: '100%', flexDirection: 'row', alignItems: 'flex-start', backgroundColor: '#11151A', borderWidth: 1, borderColor: '#242F31', borderRadius: 15, padding: 13, marginTop: 14, marginBottom: 8 },
  privacyIcon: { color: '#A5D5B7', fontSize: 20, marginRight: 11 },
  privacyCopy: { flex: 1 },
  privacyTitle: { color: '#C5DCCB', fontSize: 11, fontWeight: '700', marginBottom: 4 },
  privacyText: { color: '#858F8C', fontSize: 10, lineHeight: 15 },
  messages: { paddingTop: 22, gap: 14 },
  chatDate: { color: '#77738C', fontSize: 8, letterSpacing: 1.6, textAlign: 'center', marginBottom: 10 },
  messageRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 8 },
  userRow: { justifyContent: 'flex-end' },
  assistantRow: { justifyContent: 'flex-start' },
  miniMark: { width: 27, height: 27, borderRadius: 10, backgroundColor: '#282044', alignItems: 'center', justifyContent: 'center', marginBottom: 3 },
  miniMarkText: { color: '#D0C2FF', fontSize: 16 },
  messageBubble: { maxWidth: '86%', paddingHorizontal: 14, paddingVertical: 12, borderRadius: 17 },
  userBubble: { backgroundColor: '#55458D', borderBottomRightRadius: 5 },
  assistantBubble: { backgroundColor: '#171522', borderWidth: 1, borderColor: '#302B43', borderBottomLeftRadius: 5 },
  messageLabel: { color: '#B7A4F5', fontSize: 8, fontWeight: '700', letterSpacing: 1.2, marginBottom: 6 },
  messageText: { color: '#F0ECF8', fontSize: 12, lineHeight: 19 },
  composerArea: { paddingTop: 8, paddingBottom: Platform.OS === 'web' ? 18 : 8 },
  modeRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 9 },
  modeCaption: { color: '#77738D', fontSize: 8, letterSpacing: 1.3 },
  modeSwitch: { flexDirection: 'row', padding: 3, backgroundColor: '#141320', borderRadius: 12, borderWidth: 1, borderColor: '#29263A' },
  modeOption: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 9 },
  modeOptionActive: { backgroundColor: '#342A54' },
  modeText: { color: '#77738D', fontSize: 9 },
  modeTextActive: { color: '#D7C9FF', fontWeight: '700' },
  composer: { flexDirection: 'row', alignItems: 'flex-end', gap: 8, backgroundColor: '#171522', borderWidth: 1, borderColor: '#3A334E', borderRadius: 20, padding: 7 },
  input: { flex: 1, minHeight: 42, maxHeight: 110, color: '#F6F2FF', fontSize: 13, paddingHorizontal: 10, paddingTop: 12, paddingBottom: 9, outlineStyle: 'none' as any },
  voiceButton: { width: 39, height: 39, borderRadius: 13, backgroundColor: '#28243A', alignItems: 'center', justifyContent: 'center' },
  voiceGlyph: { color: '#C5B7F5', fontSize: 23 },
  sendButton: { width: 39, height: 39, borderRadius: 13, backgroundColor: '#A18AF2', alignItems: 'center', justifyContent: 'center' },
  sendButtonIdle: { backgroundColor: '#574C78' },
  sendGlyph: { color: '#FFFFFF', fontSize: 24, fontWeight: '600', marginTop: -3 },
  pressed: { opacity: 0.72 },
  disclaimer: { color: '#666177', fontSize: 7, letterSpacing: 1.2, textAlign: 'center', marginTop: 9 },
  modalBackdrop: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(3,3,10,0.72)' },
  settingsSheet: { backgroundColor: '#151421', borderTopLeftRadius: 26, borderTopRightRadius: 26, borderWidth: 1, borderColor: '#37304B', paddingHorizontal: 22, paddingTop: 12, paddingBottom: 35 },
  sheetHandle: { width: 38, height: 4, borderRadius: 2, backgroundColor: '#514A64', alignSelf: 'center', marginBottom: 22 },
  sheetHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 },
  sheetEyebrow: { color: '#A896E8', fontSize: 8, letterSpacing: 2, marginBottom: 5 },
  sheetTitle: { color: '#F4F0FC', fontSize: 21, fontWeight: '700' },
  closeButton: { width: 32, height: 32, borderRadius: 11, backgroundColor: '#29263A', alignItems: 'center', justifyContent: 'center' },
  closeText: { color: '#D9D1E9', fontSize: 22, lineHeight: 25 },
  settingItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 13, borderBottomWidth: 1, borderBottomColor: '#2A2738' },
  settingIcon: { width: 37, height: 37, borderRadius: 12, backgroundColor: '#29243F', alignItems: 'center', justifyContent: 'center', marginRight: 11 },
  settingIconText: { color: '#C4B2FF', fontSize: 18 },
  settingCopy: { flex: 1 },
  settingName: { color: '#EAE5F4', fontSize: 11, fontWeight: '600', marginBottom: 4 },
  settingValue: { color: '#8D889E', fontSize: 9 },
  settingBadge: { paddingHorizontal: 8, paddingVertical: 5, borderRadius: 8, backgroundColor: '#1D352B' },
  settingBadgeText: { color: '#9BD0AC', fontSize: 8, fontWeight: '800', letterSpacing: 1 },
  badgePending: { backgroundColor: '#302A42' },
  pendingText: { color: '#B7A6E9' },
  clearHistoryButton: { alignSelf: 'flex-start', paddingVertical: 12, marginTop: 8 },
  clearHistoryText: { color: '#D69A9A', fontSize: 10, fontWeight: '600' },
  sheetFootnote: { color: '#777287', fontSize: 9, lineHeight: 15, marginTop: 8 },
});
