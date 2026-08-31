import React, { useState } from 'react';
import { Alert, Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../theme/colors';
import { useResponsive } from '../utils/responsive';
import { useAuth } from '../context/AuthContext';
import { deleteAccount as deleteAccountApi } from '../api/client';
import DeleteAccountSheet from '../components/DeleteAccountSheet';
import { useTranslation } from '../i18n';

const PRIVACY_URL = 'https://saarathi.care/privacy';
const TERMS_URL = 'https://saarathi.care/terms';

export default function DataPrivacyScreen({ navigation }: { navigation: any }) {
  const { scaleSize, scaleFont, padding } = useResponsive();
  const { signOut } = useAuth();
  const { t } = useTranslation();
  const [deleteVisible, setDeleteVisible] = useState(false);

  const deleteAccount = async () => {
    setDeleteVisible(false);
    const result = await deleteAccountApi();
    if (!result.success) {
      Alert.alert('Unable to delete account', result.error);
      return;
    }
    await signOut();
    navigation.reset({ index: 0, routes: [{ name: 'Splash' }] });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={[styles.header, { paddingHorizontal: padding, paddingVertical: scaleSize(14) }]}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={scaleSize(10)}><Text style={[styles.back, { fontSize: scaleFont(24) }]}>‹</Text></Pressable>
        <Text style={[styles.headerTitle, { fontSize: scaleFont(18), flex: 1, textAlign: 'center' }]}>{t('dataPrivacy')}</Text>
        <View style={{ width: scaleSize(24) }} />
      </View>
      <ScrollView contentContainerStyle={{ padding: padding, paddingBottom: scaleSize(40) }} showsVerticalScrollIndicator={false}>
        <View style={[styles.hero, { padding: scaleSize(18), borderRadius: scaleSize(18) }]}>
          <Text style={[styles.heroTitle, { fontSize: scaleFont(18) }]}>{t('yourDataYourControl')}</Text>
          <Text style={[styles.heroBody, { fontSize: scaleFont(13), lineHeight: scaleFont(19), marginTop: scaleSize(6) }]}>{t('dataPrivacyHeroBody')}</Text>
        </View>
        <Text style={[styles.sectionLabel, { fontSize: scaleFont(11), marginTop: scaleSize(24), marginBottom: scaleSize(8) }]}>{t('legalAndConsent')}</Text>
        <View style={[styles.card, { borderRadius: scaleSize(16) }]}>
          <Pressable style={styles.row} onPress={() => Linking.openURL(PRIVACY_URL)}><Text style={[styles.rowTitle, { fontSize: scaleFont(15) }]}>{t('privacyPolicy')}</Text><Text style={styles.chevron}>›</Text></Pressable>
          <View style={styles.divider} />
          <Pressable style={styles.row} onPress={() => Linking.openURL(TERMS_URL)}><Text style={[styles.rowTitle, { fontSize: scaleFont(15) }]}>{t('termsOfUse')}</Text><Text style={styles.chevron}>›</Text></Pressable>
          <View style={styles.divider} />
          <View style={styles.row}><View style={{ flex: 1 }}><Text style={[styles.rowTitle, { fontSize: scaleFont(15) }]}>{t('yourConsent')}</Text><Text style={[styles.rowSubtitle, { fontSize: scaleFont(12), marginTop: scaleSize(3) }]}>{t('consentActive')}</Text></View><Text style={styles.check}>✓</Text></View>
        </View>
        <Text style={[styles.sectionLabel, { fontSize: scaleFont(11), marginTop: scaleSize(24), marginBottom: scaleSize(8) }]}>{t('yourData')}</Text>
        <View style={[styles.card, { borderRadius: scaleSize(16) }]}>
          <Pressable style={styles.row} onPress={() => Linking.openURL(PRIVACY_URL)}><View style={{ flex: 1 }}><Text style={[styles.rowTitle, { fontSize: scaleFont(15) }]}>{t('dataPrivacy')}</Text><Text style={[styles.rowSubtitle, { fontSize: scaleFont(12), marginTop: scaleSize(3) }]}>{t('dataPrivacySubtitle')}</Text></View><Text style={styles.chevron}>›</Text></Pressable>
          <View style={styles.divider} />
          <Pressable style={styles.deleteRow} onPress={() => setDeleteVisible(true)}><Text style={[styles.deleteTitle, { fontSize: scaleFont(15) }]}>{t('deleteAccount')}</Text><Text style={[styles.deleteSubtitle, { fontSize: scaleFont(12), marginTop: scaleSize(3) }]}>{t('deleteAccountSubtitle')}</Text></Pressable>
        </View>
      </ScrollView>
      <DeleteAccountSheet visible={deleteVisible} onCancel={() => setDeleteVisible(false)} onConfirm={deleteAccount} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.white },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  back: { color: colors.mainBlack, lineHeight: 26 },
  headerTitle: { fontFamily: 'Inter_800ExtraBold', color: colors.mainBlack },
  hero: { backgroundColor: colors.selectedBackground },
  heroTitle: { fontFamily: 'Inter_800ExtraBold', color: colors.mainBlack },
  heroBody: { fontFamily: 'Inter_400Regular', color: colors.grey },
  sectionLabel: { fontFamily: 'Inter_700Bold', color: colors.grey, letterSpacing: 0.7 },
  card: { backgroundColor: colors.white, borderWidth: 1, borderColor: '#E2E4E8', overflow: 'hidden' },
  row: { minHeight: 64, paddingHorizontal: 16, paddingVertical: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  rowTitle: { fontFamily: 'Inter_700Bold', color: colors.mainBlack },
  rowSubtitle: { fontFamily: 'Inter_400Regular', color: colors.grey },
  chevron: { fontSize: 26, color: '#9CA3AF', marginLeft: 12 },
  check: { fontSize: 20, color: '#1A7340' },
  divider: { height: 1, backgroundColor: '#EEF0F4', marginLeft: 16 },
  deleteRow: { minHeight: 64, paddingHorizontal: 16, paddingVertical: 12 },
  deleteTitle: { fontFamily: 'Inter_700Bold', color: '#C33C32' },
  deleteSubtitle: { fontFamily: 'Inter_400Regular', color: colors.grey },
});
