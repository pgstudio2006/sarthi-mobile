import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  Pressable,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { colors } from '../theme/colors';
import { useResponsive } from '../utils/responsive';
import { useTranslation, useDateLocale } from '../i18n';
import { useAuth } from '../context/AuthContext';
import { ChildProfile } from '../api/client';
import AvatarGirlIcon from '../assets/figma/screen16/image 9 [Vectorized].svg';
import AvatarBoyIcon from '../assets/figma/screen16/image 8 [Vectorized].svg';
import PersonIcon from '../assets/figma/screen27/Frame-7.svg';
import PlusIcon from '../assets/figma/screen25/add_2.svg';
import CloseIcon from '../assets/figma/screen26/Frame-32.svg';
import DeleteAccountSheet from './DeleteAccountSheet';
import { deleteChildProfile } from '../api/client';

type ChildSwitcherSheetProps = {
  visible: boolean;
  onClose: () => void;
  onSelectChild: (child: ChildProfile) => void;
  onAddChild: () => void;
  onEditChild: (child: ChildProfile) => void;
  onDeleteChild?: (child: ChildProfile) => void;
};

export default function ChildSwitcherSheet({
  visible,
  onClose,
  onSelectChild,
  onAddChild,
  onEditChild,
  onDeleteChild,
}: ChildSwitcherSheetProps) {
  const { scaleSize, padding, height } = useResponsive();
  const { t } = useTranslation();
  const dateLocale = useDateLocale();
  const { user, token, activeChildId, setActiveChildId, signIn } = useAuth();
  const children = user?.children || [];
  const caregiver = user?.caregiverProfile;
  const [childToDelete, setChildToDelete] = useState<ChildProfile | null>(null);
  const sheetHeight = Math.min(height * 0.9, scaleSize(320 + (children.length + 1) * 88));

  const formatAge = (ageInMonths?: number) => {
    if (!ageInMonths) return '';
    const years = Math.floor(ageInMonths / 12);
    const months = ageInMonths % 12;
    return `${years} ${dateLocale.years} ${months} ${dateLocale.months}`;
  };

  const handleSelect = (child: ChildProfile) => {
    setActiveChildId(child.id);
    onSelectChild(child);
    onClose();
  };

  const handleDeleteChild = async () => {
    if (!childToDelete || !user || !token) return;
    const result = await deleteChildProfile(childToDelete.id);
    if (!result.success) return;
    const remainingChildren = user.children.filter((child) => child.id !== childToDelete.id);
    await signIn(token, { ...user, children: remainingChildren });
    if (activeChildId === childToDelete.id) await setActiveChildId(remainingChildren[0]?.id || null);
    onDeleteChild?.(childToDelete);
    setChildToDelete(null);
  };

  return (
    <Modal
      transparent
      animationType="slide"
      visible={visible}
      onRequestClose={onClose}
    >
      <Pressable style={styles.backdrop} onPress={onClose} />
      <View style={[styles.sheet, { height: sheetHeight, maxHeight: height * 0.9 }]}>
        <View style={[styles.handle, { width: scaleSize(40), height: scaleSize(4), borderRadius: scaleSize(999) }]} />
        <View style={styles.headerRow}>
          <Text style={[styles.title, { fontSize: scaleSize(18) }]}>{t('addChildren')}</Text>
          <Pressable onPress={onClose} hitSlop={scaleSize(10)}>
            <CloseIcon width={scaleSize(20)} height={scaleSize(20)} />
          </Pressable>
        </View>
        <Text style={[styles.subtitle, { fontSize: scaleSize(13), paddingHorizontal: scaleSize(24), marginBottom: scaleSize(16) }]}>
          {t('addChildrenSubtitle')}
        </Text>

        <View style={[styles.caregiverCard, { marginHorizontal: scaleSize(20), padding: scaleSize(14), borderRadius: scaleSize(18), marginBottom: scaleSize(20) }]}> 
          <View style={[styles.caregiverAvatar, { width: scaleSize(48), height: scaleSize(48), borderRadius: scaleSize(24) }]}> 
            <PersonIcon width={scaleSize(28)} height={scaleSize(28)} />
          </View>
          <View style={styles.caregiverInfo}>
            <Text style={[styles.caregiverName, { fontSize: scaleSize(16) }]}>{caregiver?.name || t('caregiver')}</Text>
            <Text style={[styles.caregiverMeta, { fontSize: scaleSize(11) }]}>{caregiver?.role || t('parent')}{caregiver?.email ? `  •  ${caregiver.email}` : ''}</Text>
          </View>
        </View>

        <ScrollView
          style={{ flex: 1 }}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: scaleSize(24) }}
        >
          <Text style={[styles.sectionLabel, { fontSize: scaleSize(11), marginBottom: scaleSize(10), marginHorizontal: scaleSize(20) }]}>{t('yourChildren')}</Text>

          <View style={{ gap: scaleSize(12), marginHorizontal: scaleSize(20) }}>
            {children.map((child) => {
              const isActive = child.id === activeChildId;
              return (
                <View key={child.id} style={[styles.childCard, { borderColor: isActive ? colors.primaryBlue : '#E2E4E8' }]}>
                  <Pressable
                    style={styles.childMainRow}
                    onPress={() => handleSelect(child)}
                  >
                    <View style={[styles.childAvatar, { width: scaleSize(48), height: scaleSize(48), borderRadius: scaleSize(24) }]}>
                      {child.gender?.toLowerCase() === 'male' ? (
                        <AvatarBoyIcon width={scaleSize(28)} height={scaleSize(28)} />
                      ) : (
                        <AvatarGirlIcon width={scaleSize(28)} height={scaleSize(28)} />
                      )}
                    </View>
                    <View style={styles.childInfo}>
                      <View style={styles.childNameRow}>
                        <Text style={[styles.childName, { fontSize: scaleSize(16) }]}>{child.name}</Text>
                        {isActive && (
                          <View style={[styles.activeBadge, { paddingHorizontal: scaleSize(8), paddingVertical: scaleSize(2), borderRadius: scaleSize(10) }]}>
                            <Text style={[styles.activeText, { fontSize: scaleSize(10) }]}>{t('active')}</Text>
                          </View>
                        )}
                      </View>
                      <Text style={[styles.childAge, { fontSize: scaleSize(12) }]}>{formatAge(child.ageInMonths)}</Text>
                    </View>
                  </Pressable>
                  <View style={styles.childActions}>
                    <Pressable onPress={() => onEditChild(child)} style={styles.editLink} hitSlop={scaleSize(8)}>
                      <Text style={[styles.editLinkText, { fontSize: scaleSize(11) }]} numberOfLines={1}>{t('editDetails')}</Text>
                    </Pressable>
                    <Pressable onPress={() => setChildToDelete(child)} style={styles.deleteLink} hitSlop={scaleSize(6)}>
                      <Text style={[styles.deleteLinkText, { fontSize: scaleSize(11) }]} numberOfLines={1}>Delete</Text>
                    </Pressable>
                  </View>
                </View>
              );
            })}

            <Pressable
              onPress={onAddChild}
              style={[styles.addChildCard, { paddingVertical: scaleSize(14), borderRadius: scaleSize(14) }]}
            >
              <View style={[styles.addChildIcon, { width: scaleSize(40), height: scaleSize(40), borderRadius: scaleSize(20) }]}>
                <PlusIcon width={scaleSize(20)} height={scaleSize(20)} color="#5963E1" />
              </View>
              <Text style={[styles.addChildText, { fontSize: scaleSize(14) }]} numberOfLines={2}>{t('addAnotherChild')}</Text>
            </Pressable>
          </View>
        </ScrollView>
      </View>
      <DeleteAccountSheet
        visible={childToDelete !== null}
        title={childToDelete ? `Delete ${childToDelete.name}'s profile?` : 'Delete child profile?'}
        body="This permanently removes this child profile, screening responses, reports, and history. This action cannot be undone."
        confirmLabel="Yes, delete child"
        onCancel={() => setChildToDelete(null)}
        onConfirm={handleDeleteChild}
      />
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(18, 18, 24, 0.53)',
  },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.white,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: 10,
    paddingBottom: 32,
    maxHeight: '78%',
  },
  handle: {
    backgroundColor: '#E2E4E8',
    alignSelf: 'center',
    marginBottom: 14,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: 'Inter_400Regular',
    color: colors.grey,
  },
  title: {
    fontFamily: 'Inter_800ExtraBold',
    color: colors.mainBlack,
  },
  sectionLabel: {
    fontFamily: 'Inter_700Bold',
    color: colors.grey,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  childCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderWidth: 2,
    borderRadius: 16,
    backgroundColor: colors.white,
    paddingHorizontal: 14,
    paddingVertical: 14,
    gap: 12,
  },
  childMainRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  childAvatar: {
    backgroundColor: '#EEF0FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  childInfo: {
    flex: 1,
    gap: 2,
  },
  childNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  childName: {
    fontFamily: 'Inter_700Bold',
    color: colors.mainBlack,
  },
  activeBadge: {
    backgroundColor: '#E3F5E8',
  },
  activeText: {
    fontFamily: 'Inter_700Bold',
    color: '#228C45',
  },
  childAge: {
    fontFamily: 'Inter_400Regular',
    color: colors.grey,
  },
  caregiverCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F2FF',
    gap: 12,
  },
  caregiverAvatar: {
    backgroundColor: '#E9E8FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  caregiverInfo: { flex: 1, gap: 3 },
  caregiverName: { fontFamily: 'Inter_700Bold', color: colors.mainBlack },
  caregiverMeta: { fontFamily: 'Inter_400Regular', color: colors.grey },
  childActions: {
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: 10,
    marginTop: 4,
  },
  editLink: {
    alignSelf: 'flex-end',
  },
  editLinkText: {
    fontFamily: 'Inter_700Bold',
    color: colors.primaryBlue,
    textDecorationLine: 'underline',
  },
  deleteLink: {
    alignSelf: 'flex-end',
  },
  deleteLinkText: {
    fontFamily: 'Inter_500Medium',
    color: colors.grey,
    textDecorationLine: 'underline',
  },
  addChildCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderWidth: 2,
    borderColor: '#5963E1',
    borderStyle: 'dashed',
    paddingHorizontal: 12,
    gap: 12,
  },
  addChildIcon: {
    backgroundColor: '#EDEFFD',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addChildText: {
    fontFamily: 'Inter_600SemiBold',
    color: '#5963E1',
    flex: 1,
    flexWrap: 'wrap',
  },
});
