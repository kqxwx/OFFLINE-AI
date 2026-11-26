
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type Message = {
  id: string;
  role: 'ai' | 'user';
  text: string;
};

export default function HomeScreen() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);

  const sendMessage = () => {
    const text = input.trim();
    if (!text) return;

    setMessages(current => [
      ...current,
      { id: Date.now().toString(), role: 'user', text },
      {
        id: `${Date.now()}-ai`,
        role: 'ai',
        text: 'Я получил твоё сообщение. Сейчас мы создаём мой интерфейс. Следующим этапом подключим настоящую локальную нейросеть.',
      },
    ]);

    setInput('');
  };

  const quickMessage = (text: string) => {
    setInput(text);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* HEADER */}
        <View style={styles.header}>
          <View style={styles.logo}>
            <Text style={styles.logoText}>✦</Text>
          </View>

          <View style={styles.headerText}>
            <Text style={styles.title}>OFFLINE AI</Text>
            <Text style={styles.subtitle}>Твой личный искусственный интеллект</Text>
          </View>

          <Pressable
            style={styles.settings}
            onPress={() => Alert.alert('Настройки', 'Настройки добавим на следующем этапе.')}
          >
            <Text style={styles.settingsText}>⚙</Text>
          </Pressable>
        </View>

        {/* STATUS */}
        <View style={styles.status}>
          <View style={styles.statusDot} />
          <Text style={styles.statusText}>ИНТЕРФЕЙС ГОТОВ · ИИ В РАЗРАБОТКЕ</Text>
        </View>

        {/* AI ORB */}
        <View style={styles.hero}>
          <View style={styles.orbOuter}>
            <View style={styles.orbMiddle}>
              <View style={styles.orbInner}>
                <Text style={styles.orbSymbol}>✦</Text>
              </View>
            </View>
          </View>

          <Text style={styles.heroTitle}>Чем могу помочь?</Text>
          <Text style={styles.heroSubtitle}>
            Твой интеллект. Твои данные. Твоё устройство.
          </Text>
        </View>

        {/* CHAT */}
        <ScrollView
          style={styles.chat}
          contentContainerStyle={styles.chatContent}
          keyboardShouldPersistTaps="handled"
        >
          {messages.length === 0 ? (
            <View style={styles.suggestions}>
              <Text style={styles.sectionTitle}>ПОПРОБУЙ СПРОСИТЬ</Text>

              <Pressable
                style={styles.suggestion}
                onPress={() => quickMessage('Расскажи, что ты умеешь')}
              >
                <Text style={styles.suggestionIcon}>✧</Text>
                <Text style={styles.suggestionText}>Что ты умеешь?</Text>
                <Text style={styles.arrow}>›</Text>
              </Pressable>

              <Pressable
                style={styles.suggestion}
                onPress={() => quickMessage('Объясни искусственный интеллект простыми словами')}
              >
                <Text style={styles.suggestionIcon}>◈</Text>
                <Text style={styles.suggestionText}>Объясни сложную тему</Text>
                <Text style={styles.arrow}>›</Text>
              </Pressable>

              <Pressable
                style={styles.suggestion}
                onPress={() => quickMessage('Помоги придумать новый проект')}
              >
                <Text style={styles.suggestionIcon}>⌘</Text>
                <Text style={styles.suggestionText}>Помоги с идеей</Text>
                <Text style={styles.arrow}>›</Text>
              </Pressable>
            </View>
          ) : (
            messages.map(message => (
              <View
                key={message.id}
                style={[
                  styles.message,
                  message.role === 'user'
                    ? styles.userMessage
                    : styles.aiMessage,
                ]}
              >
                {message.role === 'ai' && (
                  <Text style={styles.aiLabel}>OFFLINE AI</Text>
                )}
                <Text style={styles.messageText}>{message.text}</Text>
              </View>
            ))
          )}
        </ScrollView>

        {/* INPUT */}
        <View style={styles.inputArea}>
          <View style={styles.inputBox}>
            <TextInput
              style={styles.input}
              value={input}
              onChangeText={setInput}
              placeholder="Напиши сообщение..."
              placeholderTextColor="#77788A"
              multiline
              maxLength={4000}
            />

            <Pressable
              style={styles.micButton}
              onPress={() =>
                Alert.alert(
                  'Голосовой режим',
                  'Скоро подключим распознавание речи и голосовые ответы без интернета.'
                )
              }
            >
              <Text style={styles.micText}>🎙</Text>
            </Pressable>

            <Pressable style={styles.sendButton} onPress={sendMessage}>
              <Text style={styles.sendText}>↑</Text>
            </Pressable>
          </View>

          <Text style={styles.footer}>
            Локальная нейросеть будет подключена следующим этапом
          </Text>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#090A12',
  },
  container: {
    flex: 1,
    paddingHorizontal: 18,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 10,
    paddingBottom: 14,
  },
  logo: {
    width: 43,
    height: 43,
    borderRadius: 15,
    backgroundColor: '#29234D',
    borderWidth: 1,
    borderColor: '#7566D9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    color: '#D0C8FF',
    fontSize: 27,
  },
  headerText: {
    flex: 1,
    marginLeft: 12,
  },
  title: {
    color: '#F5F3FF',
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 2,
  },
  subtitle: {
    color: '#9292A8',
    fontSize: 10,
    marginTop: 4,
  },
  settings: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: '#191A29',
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingsText: {
    color: '#C6C2E9',
    fontSize: 22,
  },
  status: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: '#171827',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#E8B45D',
  },
  statusText: {
    color: '#B7B5CA',
    fontSize: 9,
    letterSpacing: 1,
  },
  hero: {
    alignItems: 'center',
    paddingTop: 24,
    paddingBottom: 20,
  },
  orbOuter: {
    width: 154,
    height: 154,
    borderRadius: 77,
    backgroundColor: '#171735',
    borderWidth: 1,
    borderColor: '#5549A0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  orbMiddle: {
    width: 125,
    height: 125,
    borderRadius: 63,
    backgroundColor: '#302766',
    alignItems: 'center',
    justifyContent: 'center',
  },
  orbInner: {
    width: 91,
    height: 91,
    borderRadius: 46,
    backgroundColor: '#7060C9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  orbSymbol: {
    color: '#FFFFFF',
    fontSize: 48,
  },
  heroTitle: {
    color: '#F6F4FF',
    fontSize: 23,
    fontWeight: '700',
    marginTop: 19,
  },
  heroSubtitle: {
    color: '#9292A8',
    fontSize: 11,
    marginTop: 7,
    textAlign: 'center',
  },
  chat: {
    flex: 1,
  },
  chatContent: {
    paddingVertical: 8,
    gap: 12,
  },
  suggestions: {
    gap: 10,
  },
  sectionTitle: {
    color: '#85849D',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  suggestion: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#171827',
    borderColor: '#292A40',
    borderWidth: 1,
    borderRadius: 15,
    padding: 15,
  },
  suggestionIcon: {
    color: '#A99AFF',
    fontSize: 20,
    marginRight: 12,
  },
  suggestionText: {
    color: '#E4E2F1',
    fontSize: 13,
    flex: 1,
  },
  arrow: {
    color: '#8986A8',
    fontSize: 23,
  },
  message: {
    maxWidth: '88%',
    padding: 14,
    borderRadius: 17,
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#5145A8',
    borderBottomRightRadius: 5,
  },
  aiMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#191A2A',
    borderWidth: 1,
    borderColor: '#303148',
    borderBottomLeftRadius: 5,
  },
  aiLabel: {
    color: '#A99AFF',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 7,
  },
  messageText: {
    color: '#F3F2FA',
    fontSize: 14,
    lineHeight: 21,
  },
  inputArea: {
    paddingTop: 10,
    paddingBottom: 7,
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#191A29',
    borderWidth: 1,
    borderColor: '#36364F',
    borderRadius: 22,
    padding: 7,
    gap: 7,
  },
  input: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 14,
    paddingHorizontal: 9,
    paddingVertical: 9,
    maxHeight: 100,
  },
  micButton: {
    width: 39,
    height: 39,
    borderRadius: 14,
    backgroundColor: '#292A40',
    alignItems: 'center',
    justifyContent: 'center',
  },
  micText: {
    fontSize: 17,
  },
  sendButton: {
    width: 39,
    height: 39,
    borderRadius: 14,
    backgroundColor: '#7566D9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendText: {
    color: '#FFFFFF',
    fontSize: 25,
    fontWeight: '600',
    marginTop: -3,
  },
  footer: {
    color: '#77788A',
    fontSize: 9,
    textAlign: 'center',
    marginTop: 9,
  },
});
