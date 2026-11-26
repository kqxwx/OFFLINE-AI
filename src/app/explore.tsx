import { Link } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const tools = [
  { icon: '✧', title: 'Умный чат', detail: 'Диалог с локальной языковой моделью', state: 'В РАЗРАБОТКЕ' },
  { icon: '⌘', title: 'Письмо и идеи', detail: 'Тексты, сценарии, мозговой штурм', state: 'В ПЛАНАХ' },
  { icon: '▤', title: 'Документы', detail: 'Краткое содержание и разбор файлов', state: 'В ПЛАНАХ' },
  { icon: '◉', title: 'Голосовой режим', detail: 'Распознавание речи и озвучка ответов', state: 'В ПЛАНАХ' },
  { icon: '◇', title: 'Личная память', detail: 'Заметки и контекст, хранящиеся на устройстве', state: 'В ПЛАНАХ' },
  { icon: '⌁', title: 'Офлайн-инструменты', detail: 'Перевод, объяснения, планы и заметки', state: 'В ПЛАНАХ' },
];

export default function ExploreScreen() {
  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.eyebrow}>ТВОЯ ПЕРСОНАЛЬНАЯ AI-СТУДИЯ</Text>
          <Text style={styles.title}>Возможности</Text>
          <Text style={styles.subtitle}>Один помощник для идей, знаний и повседневных задач. Всё задумано для работы непосредственно на iPhone.</Text>
        </View>

        <View style={styles.featureHero}>
          <View style={styles.heroIcon}><Text style={styles.heroGlyph}>✳</Text></View>
          <View style={styles.heroCopy}>
            <Text style={styles.heroKicker}>ГЛАВНАЯ ЦЕЛЬ</Text>
            <Text style={styles.heroTitle}>ИИ без облака</Text>
            <Text style={styles.heroText}>Локальная модель, приватная память и голосовой интерфейс — без обязательной подписки.</Text>
          </View>
          <View style={styles.heroOrb} />
        </View>

        <View style={styles.sectionHeading}>
          <Text style={styles.sectionTitle}>ИНСТРУМЕНТЫ</Text>
          <Text style={styles.sectionMeta}>06 МОДУЛЕЙ</Text>
        </View>

        <View style={styles.toolList}>
          {tools.map((tool, index) => (
            <View key={tool.title} style={styles.toolCard}>
              <View style={styles.toolIcon}><Text style={styles.toolGlyph}>{tool.icon}</Text></View>
              <View style={styles.toolCopy}>
                <Text style={styles.toolTitle}>{tool.title}</Text>
                <Text style={styles.toolDetail}>{tool.detail}</Text>
                <Text style={styles.toolState}>{tool.state}</Text>
              </View>
              <Text style={styles.toolIndex}>0{index + 1}</Text>
            </View>
          ))}
        </View>

        <View style={styles.privacyCard}>
          <Text style={styles.privacyEyebrow}>ПРИНЦИП ПРОЕКТА</Text>
          <Text style={styles.privacyTitle}>Твои данные — у тебя.</Text>
          <Text style={styles.privacyText}>Перед запуском каждой функции проверим, что она действительно работает локально. Не будем выдавать облачную обработку за офлайн.</Text>
        </View>

        <Link href="/" asChild>
          <Pressable style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}>
            <Text style={styles.backButtonText}>← Вернуться к чату</Text>
          </Pressable>
        </Link>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#101114' },
  content: { width: '100%', maxWidth: 780, alignSelf: 'center', paddingHorizontal: 22, paddingTop: 26, paddingBottom: 28 },
  header: { marginBottom: 22 },
  eyebrow: { color: '#D7F36A', fontSize: 8, letterSpacing: 2.4, fontWeight: '700', marginBottom: 9 },
  title: { color: '#F5F1FF', fontSize: 31, lineHeight: 37, fontWeight: '800', letterSpacing: -0.8 },
  subtitle: { color: '#9691A8', fontSize: 12, lineHeight: 19, marginTop: 8, maxWidth: 460 },
  featureHero: { minHeight: 145, backgroundColor: '#1A1C20', borderRadius: 21, borderWidth: 1, borderColor: '#35383F', padding: 17, flexDirection: 'row', alignItems: 'center', overflow: 'hidden', marginBottom: 27 },
  heroIcon: { width: 48, height: 48, borderRadius: 16, backgroundColor: '#303329', borderWidth: 1, borderColor: '#45483B', alignItems: 'center', justifyContent: 'center', marginRight: 14 },
  heroGlyph: { color: '#D7F36A', fontSize: 28 },
  heroCopy: { flex: 1, zIndex: 1 },
  heroKicker: { color: '#D7F36A', fontSize: 8, letterSpacing: 1.8, fontWeight: '700' },
  heroTitle: { color: '#F0F1EC', fontSize: 19, fontWeight: '700', marginTop: 4 },
  heroText: { color: '#A1A4AA', fontSize: 10, lineHeight: 15, marginTop: 5, maxWidth: 330 },
  heroOrb: { position: 'absolute', width: 150, height: 150, borderRadius: 75, right: -55, top: -55, backgroundColor: '#D7F36A', opacity: 0.22 },
  sectionHeading: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 11 },
  sectionTitle: { color: '#777B83', fontSize: 9, letterSpacing: 1.8, fontWeight: '700' },
  sectionMeta: { color: '#666A72', fontSize: 8, letterSpacing: 1.4 },
  toolList: { gap: 9 },
  toolCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#191B1F', borderWidth: 1, borderColor: '#303239', borderRadius: 16, padding: 13 },
  toolIcon: { width: 40, height: 40, borderRadius: 13, backgroundColor: '#303329', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  toolGlyph: { color: '#D7F36A', fontSize: 21 },
  toolCopy: { flex: 1 },
  toolTitle: { color: '#E1E2DC', fontSize: 12, fontWeight: '700' },
  toolDetail: { color: '#999DA5', fontSize: 9, marginTop: 4 },
  toolState: { color: '#D7F36A', fontSize: 7, fontWeight: '700', letterSpacing: 1.1, marginTop: 7 },
  toolIndex: { color: '#777B83', fontSize: 9, letterSpacing: 1 },
  privacyCard: { marginTop: 18, padding: 16, borderRadius: 17, backgroundColor: '#11191A', borderWidth: 1, borderColor: '#293938' },
  privacyEyebrow: { color: '#8EB59D', fontSize: 8, letterSpacing: 1.8, fontWeight: '700' },
  privacyTitle: { color: '#DCEBE0', fontSize: 16, fontWeight: '700', marginTop: 7 },
  privacyText: { color: '#91A199', fontSize: 10, lineHeight: 16, marginTop: 6 },
  backButton: { alignSelf: 'flex-start', marginTop: 20, paddingHorizontal: 16, paddingVertical: 12, borderRadius: 13, backgroundColor: '#303329', borderWidth: 1, borderColor: '#45483B' },
  backButtonText: { color: '#D7F36A', fontSize: 11, fontWeight: '700' },
  pressed: { opacity: 0.72 },
});
