import React, { useState } from 'react';
import {
  Text,
  View,
  StyleSheet,
  useWindowDimensions,
  TextInput,
  Pressable,
  ActivityIndicator,
  Keyboard,
} from 'react-native';
import { colors } from '../theme/colors';
import { useTranslation } from '../i18n';
import Frame80Svg from '../assets/screen7/frame80.svg';
import ChoiceGrid from '../components/ChoiceGrid';
import PrimaryButton from '../components/PrimaryButton';
import ConsentBottomSheet from '../components/ConsentBottomSheet';
import PrivacyInfoCard from '../components/PrivacyInfoCard';
import ChevronLeftIcon from '../components/ChevronLeftIcon';
import ScreenLayout from '../components/ScreenLayout';
import { useAuth } from '../context/AuthContext';
import { createChildProfile } from '../api/client';
import DatePickerModal from '../components/DatePickerModal';
import {
  toISODate,
  formatISODateDisplay,
  parseISODate,
  parseDateInput,
  calculateAgeLabel,
  calculateAgeInMonths,
} from '../utils/date';
import LockPersonIcon from '../assets/screen15/lockPerson.svg';
import CalendarMonthIcon from '../assets/screen15/calendarMonth.svg';

const FIGMA_WIDTH = 390;
const GENDERS = ['Male', 'Female', 'Prefer not to say'];
const BIRTH_CONTEXT = ['Normal Birth', 'Premature < 37 weeks'];

export default function CreateProfileScreen({
  navigation,
  route,
}: {
  navigation: any;
  route?: {
    params?: {
      initialChildName?: string;
      initialDob?: string;
      initialGender?: string;
      initialBirthContext?: string;
      nextRoute?: string;
    };
  };
}) {
  const {
    initialChildName = '',
    initialDob = '',
    initialGender = '',
    initialBirthContext = '',
    nextRoute = 'Home',
  } = route?.params ?? {};

  const { width } = useWindowDimensions();
  const scale = width / FIGMA_WIDTH;
  const { t, code } = useTranslation();
  const { signIn, user, token, setActiveChildId } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const DEFAULT_DOB = new Date('2020-01-01');
  const parsedInitialDob = initialDob ? parseDateInput(initialDob) : undefined;
  const [childName, setChildName] = useState(initialChildName);
  const [dob, setDob] = useState(parsedInitialDob ? toISODate(parsedInitialDob) : toISODate(DEFAULT_DOB));
  const [gender, setGender] = useState<string | null>(initialGender || null);
  const [birthContext, setBirthContext] = useState<string | null>(initialBirthContext || null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [childConsent, setChildConsent] = useState(false);
  const [consentSheetVisible, setConsentSheetVisible] = useState(false);

  const dobDisplay = formatISODateDisplay(dob, code);
  const ageLabel = calculateAgeLabel(dob, code);

  const isValid = childName.trim().length > 0 && dob.length > 0 && gender !== null && birthContext !== null && childConsent;

  const handleContinue = async () => {
    if (!isValid || submitting) return;
    setSubmitting(true);
    setError('');
    const ageInMonths = calculateAgeInMonths(dob);
    const result = await createChildProfile({
      name: childName,
      dateOfBirth: dob,
      gender: gender || '',
      birthContext: birthContext || '',
      ageInMonths,
      consentGiven: true,
    });
    setSubmitting(false);
    if (result.success) {
      if (user && token) {
        await signIn(token, { ...user, children: [...(user.children || []), result.data.child] });
        await setActiveChildId(result.data.child.id);
      }
      navigation.navigate(nextRoute);
    } else {
      setError(result.error || t('failedCreateProfile'));
    }
  };

  const goBack = () => {
    if (navigation.canGoBack?.()) navigation.goBack();
  };

  const header = <Frame80Svg width={width} height={56 * scale} />;

  return (
    <ScreenLayout header={header}>
      <Pressable onPress={goBack} style={styles.backRow} hitSlop={10}>
        <ChevronLeftIcon width={14 * scale} height={14 * scale} />
        <Text style={[styles.backText, { fontSize: 13 * scale }]}>{t('back')}</Text>
      </Pressable>

      <View style={{ marginTop: 24 * scale, gap: 24 * scale }}>
        <Text style={[styles.heading, { fontSize: 26 * scale, lineHeight: 34 * scale }]}>
          {t('letsKnowChild')}
        </Text>

        <PrivacyInfoCard
          icon={<LockPersonIcon width={32 * scale} height={32 * scale} />}
          backgroundColor={colors.selectedBackground}
          title={t('responsesSavedSecurely')}
          subtitle={t('childDataSecure')}
          titleColor={colors.primaryBlue}
          borderRadius={16}
        />
      </View>

      <View style={{ marginTop: 24 * scale, gap: 24 * scale }}>
        <View style={{ gap: 12 * scale }}>
          <Text style={[styles.fieldLabel, { fontSize: 12 * scale }]}>{t('childFullName')}</Text>
          <View style={[styles.inputShell, { borderRadius: 16 * scale, paddingHorizontal: 16 * scale, paddingVertical: 12 * scale }]}>
            <TextInput
              value={childName}
              onChangeText={(txt) => { setChildName(txt); setError(''); }}
              style={[styles.inputText, { fontSize: 16 * scale }]}
              selectionColor={colors.primaryBlue}
            />
          </View>
        </View>

        <View style={{ gap: 12 * scale }}>
          <View style={styles.fieldHeaderRow}>
            <Text style={[styles.fieldLabel, { fontSize: 12 * scale }]}>{t('dateOfBirth')}</Text>
            <View style={[styles.ageBadge, { borderRadius: 8 * scale, paddingHorizontal: 12 * scale, paddingVertical: 9 * scale }]}>
              <Text style={[styles.ageBadgeText, { fontSize: 12 * scale }]}>{ageLabel}</Text>
            </View>
          </View>
          <Pressable onPress={() => setShowDatePicker(true)}>
            <View style={[styles.inputShell, styles.dateInputShell, { borderRadius: 14 * scale, paddingHorizontal: 16 * scale, paddingVertical: 12 * scale }]}>
              <TextInput
                value={dobDisplay}
                editable={false}
                pointerEvents="none"
                style={[styles.inputText, { fontSize: 16 * scale }]}
                selectionColor={colors.primaryBlue}
              />
              <CalendarMonthIcon width={24 * scale} height={24 * scale} />
            </View>
          </Pressable>
        </View>

        <View style={{ gap: 12 * scale }}>
          <Text style={[styles.fieldLabel, { fontSize: 12 * scale }]}>{t('gender')}</Text>
          <ChoiceGrid options={GENDERS} selected={gender} onSelect={(sel) => { setGender(sel); setError(''); }} columns={3} getLabel={(g) => t(g === 'Male' ? 'male' : g === 'Female' ? 'female' : 'preferNotToSay')} />
        </View>

        <View style={{ gap: 12 * scale }}>
          <Text style={[styles.fieldLabel, { fontSize: 12 * scale }]}>{t('birthContext')}</Text>
          <ChoiceGrid options={BIRTH_CONTEXT} selected={birthContext} onSelect={(sel) => { setBirthContext(sel); setError(''); }} columns={2} getLabel={(b) => t(b === 'Normal Birth' ? 'normalBirth' : 'prematureBirth')} />
        </View>
      </View>

      <View style={{ marginTop: 18 * scale, gap: 8 * scale }}>
        <Pressable onPress={() => { Keyboard.dismiss(); childConsent ? setChildConsent(false) : setConsentSheetVisible(true); }} style={styles.consentRow} accessibilityRole="checkbox" accessibilityState={{ checked: childConsent }}>
          <View style={[styles.checkbox, { width: 22 * scale, height: 22 * scale, borderRadius: 6 * scale }, childConsent && styles.checkboxChecked]}>
            {childConsent ? <Text style={[styles.checkboxMark, { fontSize: 15 * scale }]}>✓</Text> : null}
          </View>
          <Text style={[styles.consentText, { fontSize: 12 * scale, lineHeight: 18 * scale }]}>{t('consentCheckboxChild')}</Text>
        </Pressable>
        <Pressable onPress={() => { Keyboard.dismiss(); setConsentSheetVisible(true); }} style={styles.detailsLink}>
          <Text style={[styles.detailsLinkText, { fontSize: 12 * scale }]}>{t('readConsentDetails')}</Text>
        </Pressable>
      </View>

      {error ? (
        <Text style={[styles.errorText, { fontSize: 14 * scale, marginTop: 12 * scale }]}>
          {error}
        </Text>
      ) : null}

      <View style={[styles.buttonWrapper, { marginTop: 32 * scale }]}>
        <PrimaryButton
          label={submitting ? '' : t('createProfileBtn')}
          onPress={handleContinue}
          disabled={!isValid || submitting}
        />
        {submitting && (
          <View style={styles.loader}>
            <ActivityIndicator color={colors.white} />
          </View>
        )}
      </View>

      <ConsentBottomSheet
        visible={consentSheetVisible}
        title={t('childDataConsent')}
        body={t('childDataConsentBody')}
        points={[t('childDataConsentPoint1'), t('childDataConsentPoint2')]}
        links={[{ label: t('privacyPolicy'), url: 'https://saarathi.care/privacy' }, { label: t('termsOfUse'), url: 'https://saarathi.care/terms' }, { label: t('dataPrivacy'), url: 'https://saarathi.care/privacy' }]}
        confirmLabel={t('understood')}
        onClose={() => setConsentSheetVisible(false)}
        onConfirm={() => { Keyboard.dismiss(); setChildConsent(true); setConsentSheetVisible(false); }}
      />

      <DatePickerModal
        visible={showDatePicker}
        initialDate={parseISODate(dob)}
        maxDate={new Date()}
        onSelect={(date: Date) => { setDob(toISODate(date)); setError(''); }}
        onClose={() => setShowDatePicker(false)}
      />
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  backRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    minHeight: 44,
  },
  backText: {
    fontFamily: 'Inter_600SemiBold',
    color: colors.grey,
  },
  heading: {
    fontFamily: 'Inter_800ExtraBold',
    color: colors.mainBlack,
    textAlign: 'left',
  },
  fieldLabel: {
    fontFamily: 'Inter_700Bold',
    color: colors.grey,
    textTransform: 'uppercase',
  },
  fieldHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ageBadge: {
    backgroundColor: colors.selectedBackground,
  },
  ageBadgeText: {
    fontFamily: 'Inter_700Bold',
    color: colors.primaryBlue,
  },
  inputShell: {
    width: '100%',
    borderWidth: 2,
    borderColor: colors.primaryBlue,
    backgroundColor: colors.white,
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateInputShell: {
    justifyContent: 'space-between',
  },
  inputText: {
    flex: 1,
    fontFamily: 'Inter_600SemiBold',
    color: colors.mainBlack,
    padding: 0,
  },
  consentRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  checkbox: {
    borderWidth: 1.5,
    borderColor: '#C7CBD8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: colors.primaryBlue,
    borderColor: colors.primaryBlue,
  },
  checkboxMark: {
    color: colors.white,
    fontFamily: 'Inter_700Bold',
  },
  consentText: {
    flex: 1,
    fontFamily: 'Inter_500Medium',
    color: colors.grey,
  },
  detailsLink: {
    alignSelf: 'flex-start',
    marginLeft: 32,
  },
  detailsLinkText: {
    fontFamily: 'Inter_700Bold',
    color: colors.primaryBlue,
  },
  errorText: {
    fontFamily: 'Inter_500Medium',
    color: colors.errorRed,
    textAlign: 'center',
  },
  buttonWrapper: {
    width: '100%',
    position: 'relative',
  },
  loader: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
