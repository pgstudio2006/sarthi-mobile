import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Pressable,
  TextInput,
  StyleSheet,
  ActivityIndicator,
  Keyboard,
} from 'react-native';
import { colors } from '../theme/colors';
import { useTranslation } from '../i18n';
import Frame80Svg from '../assets/screen7/frame80.svg';
import PrimaryButton from '../components/PrimaryButton';
import ConsentBottomSheet from '../components/ConsentBottomSheet';
import ChoiceGrid from '../components/ChoiceGrid';
import ScreenLayout from '../components/ScreenLayout';
import { useResponsive } from '../utils/responsive';
import { useAuth } from '../context/AuthContext';
import { createCaregiverProfile, searchLocations, LocationSuggestion } from '../api/client';
import LocationOnIcon from '../assets/screen8/locationOn.svg';
import CheckIcon from '../assets/screen8/check.svg';
import Ellipse3Icon from '../assets/screen8/ellipse3.svg';

const ROLES = ['Mother', 'Father', 'Therapist', 'Teacher', 'Doctor', 'Others'];

const toCamelKey = (value: string) =>
  value
    .split(' ')
    .map((w, i) => (i === 0 ? w.toLowerCase() : w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()))
    .join('')
    .replace(/[^a-zA-Z0-9]/g, '');

const INDIAN_CITIES_FALLBACK = [
  'Bangalore', 'Bengaluru', 'Mumbai', 'Delhi', 'New Delhi', 'Hyderabad', 'Chennai', 'Kolkata',
  'Pune', 'Ahmedabad', 'Jaipur', 'Lucknow', 'Kanpur', 'Nagpur', 'Indore', 'Thane',
  'Bhopal', 'Visakhapatnam', 'Vadodara', 'Ludhiana', 'Rajkot', 'Agra', 'Allahabad',
  'Prayagraj', 'Amritsar', 'Aurangabad', 'Bareilly', 'Belgaum', 'Belagavi', 'Bhilai',
  'Bhiwandi', 'Bokaro', 'Chandigarh', 'Coimbatore', 'Cuttack', 'Dehradun', 'Dhanbad',
  'Durgapur', 'Erode', 'Faridabad', 'Ghaziabad', 'Gorakhpur', 'Guntur', 'Guwahati',
  'Gwalior', 'Hubli', 'Hubballi', 'Jabalpur', 'Jalandhar', 'Jammu', 'Jamnagar',
  'Jamshedpur', 'Jhansi', 'Jodhpur', 'Kakinada', 'Kochi', 'Kolhapur', 'Kollam', 'Kota',
  'Kozhikode', 'Kurnool', 'Latur', 'Madurai', 'Malegaon', 'Mangalore', 'Mangaluru',
  'Mathura', 'Meerut', 'Mysore', 'Mysuru', 'Nashik', 'Navi Mumbai', 'Nellore', 'Noida',
  'Patna', 'Pimpri-Chinchwad', 'Pondicherry', 'Puducherry', 'Raipur', 'Rajahmundry',
  'Ranchi', 'Rourkela', 'Saharanpur', 'Salem', 'Sangli', 'Satara', 'Shimla', 'Siliguri',
  'Solapur', 'Srinagar', 'Surat', 'Thiruvananthapuram', 'Thrissur', 'Tiruchirappalli',
  'Tirunelveli', 'Tirupati', 'Udaipur', 'Ujjain', 'Vellore', 'Warangal',
  'Aligarh', 'Alwar', 'Ambala', 'Amravati', 'Anand', 'Anantapur', 'Arrah',
  'Bihar Sharif', 'Bilaspur', 'Bulandshahr', 'Chittoor', 'Davanagere', 'Dhule',
  'Dimapur', 'Dibrugarh', 'Eluru', 'Gandhinagar', 'Gangtok', 'Gaya', 'Gurgaon',
  'Gurugram', 'Hapur', 'Haridwar', 'Hisar', 'Hosur', 'Imphal', 'Itanagar',
  'Jalgaon', 'Jalna', 'Jeypore', 'Jorhat', 'Kadapa', 'Karnal', 'Karimnagar',
  'Khammam', 'Khandwa', 'Khanna', 'Kishanganj', 'Kottayam', 'Kulti', 'Kumbakonam',
  'Leh', 'Loni', 'Mahbubnagar', 'Maheshtala', 'Muzaffarnagar', 'Muzaffarpur',
  'Nagercoil', 'Naihati', 'Nanded', 'Navsari', 'Ongole', 'Palakkad', 'Panaji',
  'Panipat', 'Parbhani', 'Pathankot', 'Patiala', 'Proddatur', 'Purnia', 'Raichur',
  'Rampur', 'Sagar', 'Sambalpur', 'Sikar', 'Sri Ganganagar', 'Sultanpur',
  'Tadepalligudem', 'Tadipatri', 'Tenali', 'Thanjavur', 'Thoothukudi', 'Tiruppur',
  'Tumkur', 'Unnao', 'Vapi', 'Vasco da Gama', 'Vijayawada', 'Viluppuram', 'Virar',
  'Vizianagaram', 'Yamunanagar', 'Zirakpur', 'Agartala', 'Aizawl', 'Kohima',
  'Shillong', 'Dispur',
];

const GAP_CARD_TO_FORM = 24;
const GAP_FORM_FIELDS = 24;

const ROLE_CONFIG: Record<string, {
  secondaryLabelKey?: string;
  secondaryOptions: string[];
  finalLabelKey: string;
  finalPlaceholder: string;
}> = {
  Therapist: {
    secondaryLabelKey: 'speciality',
    secondaryOptions: ['Behaviour Therapy', 'Occupational Therapy', 'Speech Therapy'],
    finalLabelKey: 'therapyCentre',
    finalPlaceholder: '',
  },
  Teacher: {
    secondaryLabelKey: 'role',
    secondaryOptions: ['Special Educator', 'Shadow Teacher'],
    finalLabelKey: 'schoolOrInstituteName',
    finalPlaceholder: '',
  },
  Doctor: {
    secondaryLabelKey: 'role',
    secondaryOptions: ['General Pediatric', 'Developmental Pediatrician', 'Pediatric Neurologist', 'Child Psychiatrist', 'Other'],
    finalLabelKey: 'hospitalOrClinicName',
    finalPlaceholder: '',
  },
  Others: {
    secondaryOptions: [],
    finalLabelKey: 'yourRelationship',
    finalPlaceholder: '',
  },
};

export default function CreateCaregiverProfileScreen({
  navigation,
}: {
  navigation: any;
}) {
  const { t } = useTranslation();
  const { width, padding, scaleSize, scaleFont } = useResponsive();
  const { signIn, user, token } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [city, setCity] = useState('');
  const [locationSuggestions, setLocationSuggestions] = useState<LocationSuggestion[]>([]);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationSelected, setLocationSelected] = useState(false);
  const [role, setRole] = useState<string | null>(null);
  const [secondaryChoice, setSecondaryChoice] = useState<string | null>(null);
  const [finalValue, setFinalValue] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [emailTouched, setEmailTouched] = useState(false);
  const [caregiverConsent, setCaregiverConsent] = useState(false);
  const [consentSheetVisible, setConsentSheetVisible] = useState(false);

  useEffect(() => {
    const query = city.trim();
    if (query.length < 3 || locationSelected) {
      setLocationSuggestions([]);
      return;
    }

    let active = true;
    const timer = setTimeout(async () => {
      setLocationLoading(true);
      const result = await searchLocations(query);
      if (!active) return;

      if (result.success && result.data.locations.length > 0) {
        setLocationSuggestions(result.data.locations);
      } else {
        // Fallback: filter local city list when API fails or returns empty
        const fallback = INDIAN_CITIES_FALLBACK
          .filter((c) => c.toLowerCase().startsWith(query.toLowerCase()))
          .slice(0, 8)
          .map((c) => ({ label: c, city: c, state: '', latitude: '', longitude: '' }));
        setLocationSuggestions(fallback);
      }
      setLocationLoading(false);
    }, 300);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [city, locationSelected]);

  const roleConfig = role ? ROLE_CONFIG[role] : undefined;
  const needsRoleDetails = roleConfig !== undefined && role !== 'Mother' && role !== 'Father';
  const emailIsValid = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim());

  const isValid =
    name.trim().length > 0 &&
    emailIsValid &&
    role !== null &&
    city.trim().length > 0 &&
    caregiverConsent &&
    (!needsRoleDetails ||
      (roleConfig.secondaryOptions.length === 0 || secondaryChoice !== null) &&
      finalValue.length > 0);

  const handleRoleSelect = (selectedRole: string | null) => {
    setRole(selectedRole);
    setSecondaryChoice(null);
    setFinalValue('');
    setError('');
  };

  const handleContinue = async () => {
    setEmailTouched(true);
    if (!isValid || submitting) return;
    setSubmitting(true);
    setError('');
    const input: any = { name, role: role || '', email, location: city, consentGiven: true };
    if (role === 'Therapist' || role === 'Teacher' || role === 'Doctor') {
      input.speciality = secondaryChoice || '';
      input.institution = finalValue;
    } else if (role === 'Others') {
      input.relation = finalValue;
    } else {
      input.relation = role || '';
    }
    const result = await createCaregiverProfile(input);
    setSubmitting(false);
    if (result.success) {
      if (user && token) {
        signIn(token, { ...user, caregiverProfile: result.data.profile });
      }
      navigation.navigate('CreateProfile');
    } else {
      setError(result.error || t('failedSaveProfile'));
    }
  };

  const header = (
    <Frame80Svg width={width} height={scaleSize(56)} />
  );

  const footer = (
    <View style={[styles.footer, { marginTop: scaleSize(24) }]}>
      <View style={styles.buttonWrapper}>
        <PrimaryButton
          label={submitting ? '' : t('continue')}
          onPress={handleContinue}
          disabled={!isValid || submitting}
        />
        {submitting && (
          <View style={styles.loader}>
            <ActivityIndicator color={colors.white} />
          </View>
        )}
      </View>
    </View>
  );

  return (
    <ScreenLayout header={header} footer={footer}>
      <View
        style={[
          styles.welcomeCard,
          {
            marginTop: scaleSize(24),
            marginLeft: -padding,
            width: width - padding,
            borderRadius: scaleSize(16),
          },
        ]}
      >
        <View
          style={[
            styles.welcomeAccent,
            {
              width: scaleSize(12),
              backgroundColor: '#5963E1',
            },
          ]}
        />
        <View
          style={[
            styles.welcomeInner,
            {
              padding: scaleSize(16),
              gap: scaleSize(12),
            },
          ]}
        >
          <View style={styles.avatar}>
            <Ellipse3Icon width={scaleSize(48)} height={scaleSize(48)} />
            <View style={styles.checkOverlay}>
              <CheckIcon width={scaleSize(24)} height={scaleSize(24)} />
            </View>
          </View>
          <Text
            style={[
              styles.welcomeTitle,
              { fontSize: scaleFont(18), lineHeight: scaleFont(24) },
            ]}
          >
            {t('youreInProfile')}
          </Text>
        </View>
      </View>

      <View
        style={[
          styles.form,
          {
            marginTop: scaleSize(GAP_CARD_TO_FORM),
            gap: scaleSize(GAP_FORM_FIELDS),
          },
        ]}
      >
        <View style={styles.field}>
          <Text style={[styles.label, { fontSize: scaleFont(12) }]}>
            {t('yourFullName')}
          </Text>
          <View
            style={[
              styles.inputShell,
              {
                borderRadius: scaleSize(16),
                paddingHorizontal: scaleSize(16),
                paddingVertical: scaleSize(12),
              },
            ]}
          >
            <TextInput
              value={name}
              onChangeText={(txt) => { setName(txt); setError(''); }}
              style={[styles.inputText, { fontSize: scaleFont(16) }]}
              selectionColor={colors.primaryBlue}
            />
          </View>
        </View>

        <View style={styles.field}>
          <Text style={[styles.label, { fontSize: scaleFont(12) }]}>
            {t('email')}
          </Text>
          <View
            style={[
              styles.inputShell,
              emailTouched && email.length > 0 && !emailIsValid && styles.inputShellError,
              {
                borderRadius: scaleSize(16),
                paddingHorizontal: scaleSize(16),
                paddingVertical: scaleSize(12),
              },
            ]}
          >
            <TextInput
              value={email}
              onChangeText={(txt) => { setEmail(txt); setError(''); setEmailTouched(true); }}
              onBlur={() => setEmailTouched(true)}
              style={[styles.inputText, { fontSize: scaleFont(16) }]}
              selectionColor={colors.primaryBlue}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              textContentType="emailAddress"
            />
          </View>
          {emailTouched && email.length > 0 && !emailIsValid ? (
            <Text style={[styles.fieldErrorText, { fontSize: scaleFont(12) }]}>{t('invalidEmail')}</Text>
          ) : null}
        </View>

        <View style={styles.field}>
          <Text style={[styles.label, { fontSize: scaleFont(12) }]}>
            {t('city')}
          </Text>
          <View
            style={[
              styles.inputShell,
              styles.cityShell,
              {
                borderRadius: scaleSize(14),
                paddingHorizontal: scaleSize(16),
                paddingVertical: scaleSize(12),
              },
            ]}
          >
            <TextInput
              value={city}
              onChangeText={(txt) => { setCity(txt); setLocationSelected(false); setError(''); }}
              placeholder={t('startTypingCity')}
              placeholderTextColor="#A6A6B8"
              style={[styles.inputText, { fontSize: scaleFont(16) }]}
              selectionColor={colors.primaryBlue}
            />
            <LocationOnIcon width={scaleSize(24)} height={scaleSize(24)} />
          </View>
          {(locationLoading || locationSuggestions.length > 0) && !locationSelected ? (
            <View style={styles.locationDropdown}>
              {locationLoading ? <ActivityIndicator color={colors.primaryBlue} /> : null}
              {locationSuggestions.map((suggestion) => (
                <Pressable
                  key={`${suggestion.label}-${suggestion.latitude}-${suggestion.longitude}`}
                  onPress={() => {
                    setCity(suggestion.label);
                    setLocationSelected(true);
                    setLocationSuggestions([]);
                    setError('');
                  }}
                  style={styles.locationSuggestion}
                >
                  <LocationOnIcon width={scaleSize(18)} height={scaleSize(18)} />
                  <Text style={[styles.locationSuggestionText, { fontSize: scaleFont(14) }]}>{suggestion.label}</Text>
                </Pressable>
              ))}
            </View>
          ) : null}
        </View>

        <View style={styles.field}>
          <Text style={[styles.label, { fontSize: scaleFont(12) }]}>
            {t('relationshipWithChild')}
          </Text>
          <ChoiceGrid
            options={ROLES}
            selected={role}
            onSelect={handleRoleSelect}
            columns={2}
            getLabel={(r) => t(toCamelKey(r))}
          />
        </View>

        {needsRoleDetails ? (
          <>
            {roleConfig.secondaryOptions.length > 0 ? (
              <View style={styles.field}>
                <Text style={[styles.label, { fontSize: scaleFont(12) }]}>
                  {roleConfig.secondaryLabelKey ? t(roleConfig.secondaryLabelKey) : ''}
                </Text>
                <ChoiceGrid
                  options={roleConfig.secondaryOptions}
                  selected={secondaryChoice}
                  onSelect={(sel) => { setSecondaryChoice(sel); setError(''); }}
                  columns={2}
                  getLabel={(o) => t(toCamelKey(o))}
                />
              </View>
            ) : null}

            <View style={styles.field}>
              <Text style={[styles.label, { fontSize: scaleFont(12) }]}>
                {t(roleConfig.finalLabelKey)}
              </Text>
              <View
                style={[
                  styles.inputShell,
                  {
                    borderRadius: scaleSize(16),
                    paddingHorizontal: scaleSize(16),
                    paddingVertical: scaleSize(12),
                  },
                ]}
              >
                <TextInput
                  value={finalValue}
                  onChangeText={(txt) => { setFinalValue(txt); setError(''); }}
                  placeholder={roleConfig.finalPlaceholder}
                  placeholderTextColor="#A6A6B8"
                  style={[styles.inputText, { fontSize: scaleFont(16) }]}
                  selectionColor={colors.primaryBlue}
                  autoCapitalize="words"
                />
              </View>
            </View>
          </>
        ) : null}
      </View>

      <View style={[styles.consentSection, { marginTop: scaleSize(18) }]}>
        <Pressable onPress={() => { Keyboard.dismiss(); caregiverConsent ? setCaregiverConsent(false) : setConsentSheetVisible(true); }} style={styles.consentRow} accessibilityRole="checkbox" accessibilityState={{ checked: caregiverConsent }}>
          <View style={[styles.checkbox, { width: scaleSize(22), height: scaleSize(22), borderRadius: scaleSize(6) }, caregiverConsent && styles.checkboxChecked]}>
            {caregiverConsent ? <Text style={[styles.checkboxMark, { fontSize: scaleFont(15) }]}>✓</Text> : null}
          </View>
          <Text style={[styles.consentText, { fontSize: scaleFont(12), lineHeight: scaleFont(18) }]}>{t('consentCheckboxCaregiver')}</Text>
        </Pressable>
        <Pressable onPress={() => { Keyboard.dismiss(); setConsentSheetVisible(true); }} style={styles.detailsLink}>
          <Text style={[styles.detailsLinkText, { fontSize: scaleFont(12) }]}>{t('readConsentDetails')}</Text>
        </Pressable>
      </View>

      {error ? (
        <Text style={[styles.errorText, { fontSize: scaleFont(14), marginTop: scaleSize(12) }]}>
          {error}
        </Text>
      ) : null}

      <ConsentBottomSheet
        visible={consentSheetVisible}
        title={t('caregiverConsent')}
        body={t('caregiverConsentBody')}
        points={[t('caregiverConsentPoint1'), t('caregiverConsentPoint2')]}
        links={[{ label: t('privacyPolicy'), url: 'https://saarathi.care/privacy' }, { label: t('termsOfUse'), url: 'https://saarathi.care/terms' }]}
        confirmLabel={t('understood')}
        onClose={() => setConsentSheetVisible(false)}
        onConfirm={() => { Keyboard.dismiss(); setCaregiverConsent(true); setConsentSheetVisible(false); }}
      />
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  welcomeCard: {
    flexDirection: 'row',
    alignItems: 'stretch',
    backgroundColor: colors.selectedBackground,
    width: '100%',
  },
  welcomeAccent: {
    alignSelf: 'stretch',
  },
  welcomeInner: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkOverlay: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  welcomeTitle: {
    fontFamily: 'Inter_700Bold',
    color: colors.mainBlack,
    textAlign: 'left',
    flex: 1,
  },
  form: {
    width: '100%',
  },
  field: {
    width: '100%',
    gap: 12,
  },
  footer: {
    width: '100%',
  },
  label: {
    fontFamily: 'Inter_700Bold',
    color: colors.grey,
    textTransform: 'uppercase',
    textAlign: 'left',
  },
  inputShell: {
    width: '100%',
    borderWidth: 2,
    borderColor: colors.primaryBlue,
    backgroundColor: colors.white,
    flexDirection: 'row',
    alignItems: 'center',
  },
  cityShell: {
    justifyContent: 'space-between',
  },
  locationDropdown: {
    borderWidth: 1,
    borderColor: '#D9DDF5',
    borderRadius: 14,
    backgroundColor: colors.white,
    overflow: 'hidden',
    paddingVertical: 4,
  },
  locationSuggestion: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  locationSuggestionText: {
    flex: 1,
    fontFamily: 'Inter_500Medium',
    color: colors.mainBlack,
  },
  inputText: {
    flex: 1,
    fontFamily: 'Inter_600SemiBold',
    color: colors.mainBlack,
    padding: 0,
  },
  inputShellError: {
    borderColor: colors.errorRed,
  },
  fieldErrorText: {
    fontFamily: 'Inter_500Medium',
    color: colors.errorRed,
    marginTop: -6,
  },
  consentSection: {
    width: '100%',
    gap: 8,
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
