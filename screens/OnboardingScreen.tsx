import React, { useRef, useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors } from '../theme/colors';
import { useTranslation } from '../i18n';
import TopHeader from '../components/TopHeader';
import HeroIllustration from '../components/HeroIllustration';
import PaginationIndicator from '../components/PaginationIndicator';
import PrimaryButton from '../components/PrimaryButton';
import PrivacyInfoCard from '../components/PrivacyInfoCard';
import LockIcon from '../assets/screen5/lock.svg';

const FIGMA_WIDTH = 390;

type Page = {
  hero: any;
  titleKey: string;
  bodyKey: string;
  showPrivacy: boolean;
  privacySection?: boolean;
};

const PAGES: Page[] = [
  {
    hero: require('../assets/screen3/hero.png'),
    titleKey: 'freeAutismScreening',
    bodyKey: 'freeAutismScreeningBody',
    showPrivacy: false,
  },
  {
    hero: require('../assets/screen4/hero.png'),
    titleKey: 'simpleResults',
    bodyKey: 'simpleResultsBody',
    showPrivacy: false,
  },
  {
    hero: require('../assets/screen5/hero.png'),
    titleKey: 'knowNextSteps',
    bodyKey: 'knowNextStepsBody',
    showPrivacy: false,
    privacySection: true,
  },
];

export default function OnboardingScreen({ navigation }: { navigation: any }) {
  const { t } = useTranslation();
  const { width } = useWindowDimensions();
  const scale = width / FIGMA_WIDTH;
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef<FlatList<Page>>(null);

  const finishOnboarding = useCallback(async () => {
    try {
      await AsyncStorage.setItem('onboardingCompleted', 'true');
    } catch (e) {}
    navigation.replace('Home');
  }, [navigation]);

  const handleNext = useCallback(() => {
    if (activeIndex < PAGES.length - 1) {
      const nextIndex = activeIndex + 1;
      setActiveIndex(nextIndex);
      flatListRef.current?.scrollToIndex({ index: nextIndex, animated: true });
    } else {
      finishOnboarding();
    }
  }, [activeIndex, finishOnboarding]);

  const handleMomentumScrollEnd = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const index = Math.round(event.nativeEvent.contentOffset.x / width);
      const clamped = Math.min(Math.max(index, 0), PAGES.length - 1);
      setActiveIndex(clamped);
    },
    [width]
  );

  const renderItem = ({ item }: { item: Page }) => (
    <ScrollView
      style={{ width, height: '100%' }}
      contentContainerStyle={{
        flexGrow: 1,
        paddingHorizontal: 24 * scale,
        paddingTop: 24 * scale,
        paddingBottom: 24 * scale,
      }}
      showsVerticalScrollIndicator={false}
      nestedScrollEnabled
    >
      <HeroIllustration source={item.hero} />

      <Text style={[styles.heading, { fontSize: 26 * scale, lineHeight: 34 * scale }]}>
        {t(item.titleKey)}
      </Text>

      <Text style={[styles.body, { fontSize: 14 * scale, lineHeight: 20 * scale, marginTop: 12 * scale }]}>
        {t(item.bodyKey)}
      </Text>

      {item.showPrivacy && (
        <View style={[styles.privacyWrapper, { marginTop: 12 * scale }]}>
          <PrivacyInfoCard
            icon={<LockIcon width={16 * scale} height={16 * scale} />}
            message={t('neverShareInfo')}
            backgroundColor={colors.privacyGreenLight}
          />
        </View>
      )}

      {item.privacySection && (
        <View style={[styles.privacySection, { marginTop: 12 * scale, padding: 12 * scale, borderRadius: 14 * scale, backgroundColor: colors.privacyGreenLight }]}>
          <View style={styles.privacySectionHeader}>
            <LockIcon width={16 * scale} height={16 * scale} />
            <Text style={[styles.privacySectionTitle, { fontSize: 14 * scale, marginLeft: 8 * scale }]}>{t('privacyMatters')}</Text>
          </View>
          <View style={{ marginTop: 8 * scale, gap: 7 * scale }}>
            {[
              t('privacyDPDPA'),
              t('privacyNotResearch'),
              t('privacySafeAndSecure'),
            ].map((point, index) => (
              <View key={index} style={styles.privacyRow}>
                <View style={[styles.privacyDot, { width: 5 * scale, height: 5 * scale, borderRadius: 3 * scale, marginTop: 5 * scale }]} />
                <Text style={[styles.privacyPoint, { fontSize: 13 * scale, lineHeight: 18 * scale, marginLeft: 8 * scale }]}>{point}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

    </ScrollView>
  );

  return (
    <SafeAreaView style={styles.container}>
      <TopHeader onSkip={finishOnboarding} showSkip={activeIndex < PAGES.length - 1} />

      <FlatList
        ref={flatListRef}
        data={PAGES}
        keyExtractor={(_, index) => String(index)}
        renderItem={renderItem}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleMomentumScrollEnd}
        getItemLayout={(_, index) => ({
          length: width,
          offset: width * index,
          index,
        })}
        scrollEnabled
        style={{ flex: 1 }}
      />

      <View style={[styles.paginationWrapper, { marginVertical: 8 * scale }]}>
        <PaginationIndicator total={PAGES.length} active={activeIndex} />
      </View>

      <View style={[styles.buttonWrapper, { paddingHorizontal: 20 * scale, paddingBottom: 24 * scale }]}>
        <PrimaryButton
          label={activeIndex === PAGES.length - 1 ? t('letsBegin') : t('next')}
          onPress={handleNext}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  heading: {
    fontFamily: 'Inter_800ExtraBold',
    color: colors.mainBlack,
    textAlign: 'left',
  },
  body: {
    fontFamily: 'Inter_400Regular',
    color: colors.grey,
    textAlign: 'left',
  },
  privacyWrapper: {
    width: '100%',
  },
  privacySection: {
    width: '100%',
  },
  privacySectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  privacySectionTitle: {
    fontFamily: 'Inter_700Bold',
    color: colors.privacyGreen,
  },
  privacyRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  privacyDot: {
    backgroundColor: colors.privacyGreen,
  },
  privacyPoint: {
    flex: 1,
    fontFamily: 'Inter_500Medium',
    color: colors.mainBlack,
  },
  paginationWrapper: {
    alignItems: 'center',
  },
  buttonWrapper: {
    width: '100%',
    backgroundColor: colors.white,
  },
});
