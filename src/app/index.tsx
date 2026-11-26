import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'expo-router';
import {
  KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet,
  Text, TextInput, View, useWindowDimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type Message = { id: string; role: 'assistant' | 'user'; text: string };
type Engine = {
  modelId: string;
  load: (onProgress?: (value: { progress: number; text: string }) => void) => Promise<unknown>;
  reply: (messages: Message[], onToken: (text: string) => void, mode: string) => Promise<string>;
};
declare global { interface Window { offlineAIEngine?: Engine } }

const MODEL_NAME = 'Llama 3.2 · 1B · Q4';
const STARTER_PROMPTS = [
  'Объясни сложную тему простыми словами',
  'Помоги придумать идею для проекта',
  'Составь план на неделю',
  'Напиши и улучши текст'
];

export default function HomeScreen() {
  const { width } = useWindowDimensions();
  const desktop = width >= 900;
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [mode, setMode] = useState<'balanced' | 'deep'>('balanced');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [engineStatus, setEngineStatus] = useState<'checking' | 'unsupported' | 'idle' | 'loading' | 'ready' | 'error'>('checking');
  const [progress, setProgress] = useState(0);
  const [progressText, setProgressText] = useState('Подготовка…');
  const [errorText, setErrorText] = useState('');
  const [busy, setBusy] = useState(false);
  const scrollRef = useRef<ScrollView>(null);
  const engineRef = useRef<Engine | null>(null);

  useEffect(() => {
    if (Platform.OS !== 'web') { setEngineStatus('unsupported'); return; }
    try {
      const saved = window.localStorage.getItem('offlineai.chat.v2');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) setMessages(parsed);
      }
      setEngineStatus(Boolean((navigator as any).gpu) ? 'idle' : 'unsupported');
      if ('serviceWorker' in navigator) {
        const base = window.location.pathname.includes('/OFFLINE-AI') ? '/OFFLINE-AI/' : '/';
        navigator.serviceWorker.register(base + 'sw.js').catch(() => {});
      }
    } catch {
      setEngineStatus('idle');
    }
  }, []);

  useEffect(() => {
    if (Platform.OS !== 'web' || engineStatus === 'checking') return;
    try { window.localStorage.setItem('offlineai.chat.v2', JSON.stringify(messages.slice(-100))); } catch {}
  }, [messages, engineStatus]);

  useEffect(() => {
    scrollRef.current?.scrollToEnd({ animated: false });
  }, [messages]);

  const installModel = async () => {
    if (Platform.OS !== 'web' || busy || engineStatus === 'loading') return;
    setBusy(true);
    setEngineStatus('loading');
    setErrorText('');
    try {
      let engine = window.offlineAIEngine;
      if (!engine) {
        await new Promise<void>((resolve, reject) => {
          const script = document.createElement('script');
          script.type = 'module';
          const base = window.location.pathname.includes('/OFFLINE-AI') ? '/OFFLINE-AI/' : '/';
          script.src = base + 'ai-engine.js';
          script.onload = () => resolve();
          script.onerror = () => reject(new Error('Не удалось загрузить движок ИИ. Проверь подключение к интернету и обнови страницу.'));
          document.head.appendChild(script);
        });
        engine = window.offlineAIEngine;
      }
      if (!engine) throw new Error('Движок ИИ не запустился. Обнови страницу и попробуй ещё раз.');
      engineRef.current = engine;
      await engine.load((report) => {
        setProgress(report.progress);
        setProgressText(report.text);
      });
      setProgress(1);
      setEngineStatus('ready');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Неизвестная ошибка запуска модели.';
      setErrorText(message);
      setEngineStatus('error');
    } finally {
      setBusy(false);
    }
  };

  const sendMessage = async (textValue = input) => {
    const text = textValue.trim();
    if (!text || busy || engineStatus !== 'ready' || !engineRef.current) return;
    const userMessage: Message = { id: Date.now().toString(), role: 'user', text };
    const assistantMessage: Message = { id: Date.now().toString() + '-assistant', role: 'assistant', text: '' };
    const next = [...messages, userMessage, assistantMessage];
    setMessages(next);
    setInput('');
    setBusy(true);
    try {
      await engineRef.current.reply([...messages, userMessage], (partial) => {
        setMessages(current => current.map(item => item.id === assistantMessage.id ? { ...item, text: partial } : item));
      }, mode);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Не удалось получить ответ от модели.';
      setMessages(current => current.map(item => item.id === assistantMessage.id ? { ...item, text: 'Ошибка: ' + message } : item));
    } finally {
      setBusy(false);
    }
  };

  const clearChat = () => {
    setMessages([]);
    if (Platform.OS === 'web') {
      try { window.localStorage.removeItem('offlineai.chat.v2'); } catch {}
    }
    setSettingsOpen(false);
  };

  const statusLabel = engineStatus === 'ready' ? 'МОДЕЛЬ ГОТОВА' :
    engineStatus === 'loading' ? 'ЗАГРУЗКА МОДЕЛИ' :
    engineStatus === 'unsupported' ? 'WEBGPU НЕДОСТУПЕН' :
    engineStatus === 'error' ? 'ОШИБКА ЗАПУСКА' : 'МОДЕЛЬ НЕ ЗАПУЩЕНА';

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.app}>
        {desktop && (
          <View style={styles.sidebar}>
            <View style={styles.logoRow}><View style={styles.logo}><Text style={styles.logoGlyph}>O</Text></View><Text style={styles.logoText}>OFFLINE AI</Text></View>
            <Pressable style={styles.newChat} onPress={clearChat}><Text style={styles.newChatText}>＋  Новый чат</Text></Pressable>
            <Text style={styles.sideLabel}>РАБОЧЕЕ ПРОСТРАНСТВО</Text>
            <View style={styles.sideItemActive}><Text style={styles.sideItemTextActive}>◫  Диалог</Text></View>
            <Link href="/explore" asChild><Pressable style={styles.sideItem}><Text style={styles.sideItemText}>▤  Возможности</Text></Pressable></Link>
            <View style={styles.sideItem}><Text style={styles.sideItemText}>⚙  Настройки</Text></View>
            <View style={styles.sideBottom}>
              <View style={styles.sideStatusDot} />
              <View style={{ flex: 1 }}><Text style={styles.sideStatusTitle}>{engineStatus === 'ready' ? 'Работает локально' : 'Локальный режим'}</Text><Text style={styles.sideStatusSub}>{engineStatus === 'ready' ? 'Данные не отправляются' : 'Модель ещё не запущена'}</Text></View>
            </View>
          </View>
        )}
        <KeyboardAvoidingView style={styles.main} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={styles.topbar}>
            {!desktop && <View style={styles.logo}><Text style={styles.logoGlyph}>O</Text></View>}
            <View style={styles.topTitleWrap}>
              <Text style={styles.topTitle}>OFFLINE AI</Text>
              <Text style={styles.topSub}>ЛИЧНЫЙ ИИ НА ТВОЁМ УСТРОЙСТВЕ</Text>
            </View>
            <View style={[styles.statusPill, engineStatus === 'ready' && styles.statusPillReady]}>
              <View style={[styles.statusDot, engineStatus === 'ready' && styles.statusDotReady]} />
              <Text style={[styles.statusText, engineStatus === 'ready' && styles.statusTextReady]}>{engineStatus === 'ready' ? 'ЛОКАЛЬНО' : 'НЕ ЗАПУЩЕН'}</Text>
            </View>
            <Pressable style={styles.settingsButton} onPress={() => setSettingsOpen(true)}><Text style={styles.settingsGlyph}>⚙</Text></Pressable>
          </View>

          <ScrollView ref={scrollRef} style={styles.chatScroll} contentContainerStyle={styles.chatContent} keyboardShouldPersistTaps="handled">
            {messages.length === 0 ? (
              <View style={[styles.welcome, desktop && styles.welcomeDesktop]}>
                <Text style={styles.kicker}>ТВОЙ ЛИЧНЫЙ ПОМОЩНИК</Text>
                <Text style={styles.heading}>Привет. Чем займёмся?</Text>
                <Text style={styles.description}>Задавай вопросы, разбирайся в сложных темах, пиши тексты и придумывай новое. Всё будет работать прямо на устройстве.</Text>

                <View style={styles.modelCard}>
                  <View style={styles.modelIcon}><Text style={styles.modelIconText}>AI</Text></View>
                  <View style={styles.modelInfo}>
                    <Text style={styles.modelName}>{MODEL_NAME}</Text>
                    <Text style={styles.modelDescription}>Небольшая языковая модель · без оплаты · без API-ключа</Text>
                    <Text style={styles.modelState}>{statusLabel}</Text>
                  </View>
                  {engineStatus === 'ready' ? <View style={styles.readyTag}><Text style={styles.readyTagText}>ГОТОВО</Text></View> : null}
                </View>

                {engineStatus === 'idle' || engineStatus === 'error' ? (
                  <Pressable style={styles.installButton} onPress={installModel}>
                    <Text style={styles.installButtonText}>{engineStatus === 'error' ? 'Повторить запуск модели' : '↓  Установить и запустить ИИ'}</Text>
                  </Pressable>
                ) : null}
                {engineStatus === 'unsupported' ? <Text style={styles.errorText}>В этом браузере не обнаружен WebGPU. На iPhone открой сайт в актуальном Safari. На компьютере — Chrome или Edge с включённым аппаратным ускорением.</Text> : null}
                {engineStatus === 'loading' ? (
                  <View style={styles.progressCard}>
                    <View style={styles.progressHeader}><Text style={styles.progressTitle}>Подготовка нейросети</Text><Text style={styles.progressPercent}>{Math.round(progress * 100)}%</Text></View>
                    <View style={styles.progressTrack}><View style={[styles.progressFill, { width: Math.max(2, progress * 100) + '%' }]} /></View>
                    <Text style={styles.progressText}>{progressText || 'Загрузка файлов модели…'}</Text>
                    <Text style={styles.progressHint}>При первом запуске нужен интернет. Дождись окончания загрузки, не закрывая страницу.</Text>
                  </View>
                ) : null}
                {engineStatus === 'error' && errorText ? <Text style={styles.errorText}>{errorText}</Text> : null}

                <Text style={styles.sectionLabel}>ПОПРОБУЙ СПРОСИТЬ</Text>
                <View style={styles.promptGrid}>
                  {STARTER_PROMPTS.map((prompt, index) => (
                    <Pressable key={prompt} style={styles.promptCard} onPress={() => setInput(prompt)}>
                      <Text style={styles.promptNumber}>0{index + 1}</Text>
                      <Text style={styles.promptText}>{prompt}</Text>
                      <Text style={styles.promptArrow}>↗</Text>
                    </Pressable>
                  ))}
                </View>
              </View>
            ) : (
              <View style={[styles.messageList, desktop && styles.messageListDesktop]}>
                {messages.map(message => (
                  <View key={message.id} style={[styles.messageRow, message.role === 'user' ? styles.userRow : styles.assistantRow]}>
                    {message.role === 'assistant' ? <View style={styles.assistantAvatar}><Text style={styles.avatarText}>O</Text></View> : null}
                    <View style={[styles.bubble, message.role === 'user' ? styles.userBubble : styles.assistantBubble]}>
                      {message.role === 'assistant' ? <Text style={styles.messageLabel}>OFFLINE AI</Text> : null}
                      <Text style={[styles.messageText, !message.text && styles.thinkingText]}>{message.text || 'Думаю…'}</Text>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </ScrollView>

          <View style={[styles.composerArea, desktop && styles.composerDesktop]}>
            <View style={styles.composerTools}>
              <View style={styles.modeSwitch}>
                <Pressable onPress={() => setMode('balanced')} style={[styles.modeButton, mode === 'balanced' && styles.modeButtonActive]}><Text style={[styles.modeText, mode === 'balanced' && styles.modeTextActive]}>Быстро</Text></Pressable>
                <Pressable onPress={() => setMode('deep')} style={[styles.modeButton, mode === 'deep' && styles.modeButtonActive]}><Text style={[styles.modeText, mode === 'deep' && styles.modeTextActive]}>Подробно</Text></Pressable>
              </View>
              <Text style={styles.localNote}>{engineStatus === 'ready' ? '● ЗАПРОСЫ ОБРАБАТЫВАЮТСЯ НА УСТРОЙСТВЕ' : 'СНАЧАЛА ЗАПУСТИ ЛОКАЛЬНУЮ МОДЕЛЬ'}</Text>
            </View>
            <View style={styles.composer}>
              <TextInput value={input} onChangeText={setInput} placeholder="Напиши сообщение…" placeholderTextColor="#777B88" style={styles.input} multiline maxLength={4000} editable={engineStatus === 'ready' && !busy} />
              <Pressable style={[styles.sendButton, (!input.trim() || busy || engineStatus !== 'ready') && styles.sendDisabled]} onPress={() => sendMessage()} disabled={!input.trim() || busy || engineStatus !== 'ready'}>
                <Text style={styles.sendGlyph}>{busy ? '…' : '↑'}</Text>
              </Pressable>
            </View>
            <Text style={styles.footerNote}>Локальная модель · Без подписки · Сообщения остаются на устройстве</Text>
          </View>
        </KeyboardAvoidingView>
      </View>

      <Modal visible={settingsOpen} transparent animationType="fade" onRequestClose={() => setSettingsOpen(false)}>
        <Pressable style={styles.modalBackdrop} onPress={() => setSettingsOpen(false)}>
          <Pressable style={styles.settingsSheet} onPress={() => {}}>
            <View style={styles.sheetTop}><Text style={styles.sheetTitle}>Настройки</Text><Pressable onPress={() => setSettingsOpen(false)}><Text style={styles.closeText}>×</Text></Pressable></View>
            <Text style={styles.settingsSection}>ЛОКАЛЬНАЯ НЕЙРОСЕТЬ</Text>
            <Text style={styles.settingName}>{MODEL_NAME}</Text>
            <Text style={styles.settingDetail}>{engineStatus === 'ready' ? 'Модель загружена и готова отвечать.' : 'Для первого запуска скачай модель через интернет. После загрузки ответы генерируются на устройстве.'}</Text>
            {engineStatus !== 'ready' ? <Pressable style={styles.installButton} onPress={() => { setSettingsOpen(false); installModel(); }}><Text style={styles.installButtonText}>Установить / запустить</Text></Pressable> : null}
            <View style={styles.separator} />
            <Pressable onPress={clearChat} style={styles.clearButton}><Text style={styles.clearText}>Очистить историю чата</Text></Pressable>
            <Text style={styles.settingsFootnote}>История хранится в локальном хранилище браузера. Если Safari очистит данные сайта, история может пропасть.</Text>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#101114' },
  app: { flex: 1, flexDirection: 'row', backgroundColor: '#101114' },
  sidebar: { width: 248, backgroundColor: '#151619', borderRightWidth: 1, borderRightColor: '#292B30', padding: 20, paddingTop: 28 },
  logoRow: { flexDirection: 'row', alignItems: 'center', gap: 11, marginBottom: 34 },
  logo: { width: 36, height: 36, borderRadius: 11, backgroundColor: '#D7F36A', alignItems: 'center', justifyContent: 'center' },
  logoGlyph: { color: '#171914', fontSize: 21, fontWeight: '900' },
  logoText: { color: '#F2F2EE', fontSize: 14, fontWeight: '800', letterSpacing: 1.5 },
  newChat: { height: 43, borderRadius: 11, borderWidth: 1, borderColor: '#41434A', justifyContent: 'center', paddingHorizontal: 13, marginBottom: 30 },
  newChatText: { color: '#F0F0EA', fontSize: 12, fontWeight: '600' },
  sideLabel: { color: '#737780', fontSize: 9, letterSpacing: 1.4, marginBottom: 12 },
  sideItemActive: { backgroundColor: '#282A2F', borderRadius: 9, paddingHorizontal: 12, paddingVertical: 12, marginBottom: 5 },
  sideItemTextActive: { color: '#F3F3EE', fontSize: 12, fontWeight: '600' },
  sideItem: { paddingHorizontal: 12, paddingVertical: 12 },
  sideItemText: { color: '#9A9DA5', fontSize: 12 },
  sideBottom: { marginTop: 'auto', borderTopWidth: 1, borderTopColor: '#303238', paddingTop: 17, flexDirection: 'row', alignItems: 'center', gap: 10 },
  sideStatusDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#D7F36A' },
  sideStatusTitle: { color: '#E5E6E0', fontSize: 11, fontWeight: '600' },
  sideStatusSub: { color: '#7E828B', fontSize: 9, marginTop: 4 },
  main: { flex: 1, minWidth: 0 },
  topbar: { height: 68, paddingHorizontal: 24, borderBottomWidth: 1, borderBottomColor: '#292B30', flexDirection: 'row', alignItems: 'center', gap: 12 },
  topTitleWrap: { flex: 1 },
  topTitle: { color: '#F0F1EC', fontSize: 13, fontWeight: '800', letterSpacing: 1.4 },
  topSub: { color: '#747881', fontSize: 8, letterSpacing: 1.1, marginTop: 4 },
  statusPill: { flexDirection: 'row', alignItems: 'center', gap: 7, borderRadius: 20, paddingHorizontal: 11, paddingVertical: 7, backgroundColor: '#25262A' },
  statusPillReady: { backgroundColor: '#252D1C' },
  statusDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#E5B76B' },
  statusDotReady: { backgroundColor: '#D7F36A' },
  statusText: { color: '#C9B17F', fontSize: 8, fontWeight: '700', letterSpacing: 0.7 },
  statusTextReady: { color: '#D7F36A' },
  settingsButton: { width: 34, height: 34, borderRadius: 10, backgroundColor: '#25262A', alignItems: 'center', justifyContent: 'center' },
  settingsGlyph: { color: '#D9DAD4', fontSize: 17 },
  chatScroll: { flex: 1 },
  chatContent: { flexGrow: 1, paddingHorizontal: 22, paddingVertical: 34 },
  welcome: { width: '100%', maxWidth: 620, alignSelf: 'center', paddingTop: 12 },
  welcomeDesktop: { paddingTop: 54 },
  kicker: { color: '#D7F36A', fontSize: 9, fontWeight: '800', letterSpacing: 2 },
  heading: { color: '#F2F2EE', fontSize: 34, lineHeight: 42, fontWeight: '700', letterSpacing: -1.1, marginTop: 13 },
  description: { color: '#A1A4AA', fontSize: 14, lineHeight: 23, maxWidth: 510, marginTop: 10, marginBottom: 28 },
  modelCard: { width: '100%', flexDirection: 'row', alignItems: 'center', backgroundColor: '#1A1C20', borderWidth: 1, borderColor: '#35383F', borderRadius: 14, padding: 15, gap: 13 },
  modelIcon: { width: 43, height: 43, borderRadius: 12, backgroundColor: '#D7F36A', alignItems: 'center', justifyContent: 'center' },
  modelIconText: { color: '#1B1D15', fontSize: 15, fontWeight: '900' },
  modelInfo: { flex: 1 },
  modelName: { color: '#F0F1EA', fontSize: 13, fontWeight: '700' },
  modelDescription: { color: '#999DA5', fontSize: 10, marginTop: 4 },
  modelState: { color: '#D7F36A', fontSize: 8, fontWeight: '700', letterSpacing: 0.8, marginTop: 7 },
  readyTag: { backgroundColor: '#303A20', borderRadius: 7, paddingHorizontal: 9, paddingVertical: 6 },
  readyTagText: { color: '#D7F36A', fontSize: 8, fontWeight: '800' },
  installButton: { marginTop: 13, height: 47, borderRadius: 11, backgroundColor: '#D7F36A', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 20 },
  installButtonText: { color: '#1B1D15', fontSize: 12, fontWeight: '800' },
  progressCard: { marginTop: 13, padding: 15, borderRadius: 12, backgroundColor: '#1A1C20', borderWidth: 1, borderColor: '#35383F' },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  progressTitle: { color: '#F0F1EA', fontSize: 12, fontWeight: '700' },
  progressPercent: { color: '#D7F36A', fontSize: 12, fontWeight: '800' },
  progressTrack: { height: 6, borderRadius: 4, backgroundColor: '#34363C', overflow: 'hidden' },
  progressFill: { height: 6, borderRadius: 4, backgroundColor: '#D7F36A' },
  progressText: { color: '#D0D1CB', fontSize: 10, marginTop: 10 },
  progressHint: { color: '#888C94', fontSize: 9, lineHeight: 14, marginTop: 6 },
  errorText: { color: '#E6A3A3', fontSize: 10, lineHeight: 16, marginTop: 10 },
  sectionLabel: { color: '#777B83', fontSize: 9, letterSpacing: 1.5, fontWeight: '700', marginTop: 30, marginBottom: 11 },
  promptGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 9 },
  promptCard: { width: '48%', minHeight: 88, borderRadius: 12, backgroundColor: '#191B1F', borderWidth: 1, borderColor: '#303239', padding: 13 },
  promptNumber: { color: '#D7F36A', fontSize: 9, fontWeight: '800' },
  promptText: { color: '#E1E2DC', fontSize: 11, lineHeight: 16, marginTop: 9, paddingRight: 15 },
  promptArrow: { color: '#777B83', position: 'absolute', right: 12, top: 11, fontSize: 14 },
  messageList: { width: '100%', maxWidth: 760, alignSelf: 'center', gap: 20, paddingTop: 12, paddingBottom: 30 },
  messageListDesktop: { maxWidth: 820, paddingTop: 22 },
  messageRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  userRow: { justifyContent: 'flex-end' },
  assistantRow: { justifyContent: 'flex-start' },
  assistantAvatar: { width: 28, height: 28, borderRadius: 9, backgroundColor: '#D7F36A', alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#171914', fontWeight: '900', fontSize: 16 },
  bubble: { maxWidth: '88%', borderRadius: 15, paddingHorizontal: 15, paddingVertical: 12 },
  userBubble: { backgroundColor: '#303329', borderBottomRightRadius: 4 },
  assistantBubble: { backgroundColor: '#1A1C20', borderWidth: 1, borderColor: '#303239', borderBottomLeftRadius: 4 },
  messageLabel: { color: '#D7F36A', fontSize: 8, fontWeight: '800', letterSpacing: 1, marginBottom: 7 },
  messageText: { color: '#E8E9E3', fontSize: 13, lineHeight: 21 },
  thinkingText: { color: '#92969E' },
  composerArea: { width: '100%', maxWidth: 760, alignSelf: 'center', paddingHorizontal: 18, paddingTop: 9, paddingBottom: 9 },
  composerDesktop: { maxWidth: 820 },
  composerTools: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 9 },
  modeSwitch: { flexDirection: 'row', backgroundColor: '#1B1D21', borderRadius: 8, padding: 3 },
  modeButton: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 6 },
  modeButtonActive: { backgroundColor: '#36392B' },
  modeText: { color: '#858991', fontSize: 9 },
  modeTextActive: { color: '#D7F36A', fontWeight: '700' },
  localNote: { color: '#7F838A', fontSize: 8, letterSpacing: 0.6 },
  composer: { flexDirection: 'row', alignItems: 'flex-end', gap: 9, backgroundColor: '#1B1D21', borderWidth: 1, borderColor: '#3A3D44', borderRadius: 14, padding: 8 },
  input: { flex: 1, minHeight: 40, maxHeight: 120, color: '#F1F2EC', fontSize: 13, paddingHorizontal: 8, paddingTop: 10, paddingBottom: 8, outlineStyle: 'none' as any },
  sendButton: { width: 38, height: 38, borderRadius: 10, backgroundColor: '#D7F36A', alignItems: 'center', justifyContent: 'center' },
  sendDisabled: { backgroundColor: '#41443A' },
  sendGlyph: { color: '#1B1D15', fontSize: 23, fontWeight: '800', marginTop: -2 },
  footerNote: { color: '#666A72', fontSize: 8, textAlign: 'center', marginTop: 8 },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.65)', justifyContent: 'center', alignItems: 'center', padding: 18 },
  settingsSheet: { width: '100%', maxWidth: 430, borderRadius: 18, backgroundColor: '#1B1D21', borderWidth: 1, borderColor: '#3A3D44', padding: 22 },
  sheetTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22 },
  sheetTitle: { color: '#F1F2EC', fontSize: 20, fontWeight: '700' },
  closeText: { color: '#D0D1CB', fontSize: 26 },
  settingsSection: { color: '#D7F36A', fontSize: 9, fontWeight: '800', letterSpacing: 1.2, marginBottom: 10 },
  settingName: { color: '#F1F2EC', fontSize: 13, fontWeight: '700' },
  settingDetail: { color: '#999DA5', fontSize: 11, lineHeight: 17, marginTop: 7 },
  separator: { height: 1, backgroundColor: '#34363C', marginVertical: 18 },
  clearButton: { paddingVertical: 8 },
  clearText: { color: '#E5A0A0', fontSize: 12, fontWeight: '600' },
  settingsFootnote: { color: '#777B83', fontSize: 9, lineHeight: 14, marginTop: 10 }
});
