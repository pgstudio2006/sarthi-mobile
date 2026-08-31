import React from 'react';
import { Linking, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/colors';
import { useResponsive } from '../utils/responsive';

type ConsentBottomSheetProps = {
  visible: boolean;
  title: string;
  body: string;
  points?: string[];
  links?: { label: string; url: string }[];
  confirmLabel: string;
  onClose: () => void;
  onConfirm?: () => void;
};

export default function ConsentBottomSheet({
  visible,
  title,
  body,
  points = [],
  links = [],
  confirmLabel,
  onClose,
  onConfirm = onClose,
}: ConsentBottomSheetProps) {
  const { height, scaleSize, scaleFont } = useResponsive();

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.root}>
        <Pressable style={styles.backdrop} onPress={onClose} />
        <View style={[styles.sheet, { maxHeight: height * 0.86, borderTopLeftRadius: scaleSize(24), borderTopRightRadius: scaleSize(24) }]}>
          <View style={[styles.handle, { width: scaleSize(42), height: scaleSize(4), borderRadius: scaleSize(2) }]} />
          <View style={[styles.header, { paddingHorizontal: scaleSize(24) }]}>
            <Text style={[styles.title, { fontSize: scaleFont(20) }]}>{title}</Text>
            <Pressable onPress={onClose} hitSlop={scaleSize(10)} style={styles.closeButton}>
              <Text style={[styles.closeText, { fontSize: scaleFont(20) }]}>×</Text>
            </Pressable>
          </View>
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: scaleSize(24), paddingTop: scaleSize(8), paddingBottom: scaleSize(28) }}>
            <Text style={[styles.body, { fontSize: scaleFont(14), lineHeight: scaleFont(21) }]}>{body}</Text>
            {points.map((point, index) => (
              <View key={index} style={[styles.pointRow, { marginTop: scaleSize(14), gap: scaleSize(10) }]}>
                <View style={[styles.point, { width: scaleSize(7), height: scaleSize(7), borderRadius: scaleSize(4), marginTop: scaleSize(7) }]} />
                <Text style={[styles.pointText, { fontSize: scaleFont(14), lineHeight: scaleFont(20) }]}>{point}</Text>
              </View>
            ))}
            {links.length > 0 ? (
              <View style={[styles.links, { marginTop: scaleSize(20), gap: scaleSize(10) }]}>
                {links.map((link) => (
                  <Pressable key={link.url} onPress={() => Linking.openURL(link.url)} style={styles.linkRow}>
                    <Text style={[styles.linkText, { fontSize: scaleFont(13) }]}>{link.label}</Text>
                    <Text style={[styles.linkArrow, { fontSize: scaleFont(16) }]}>›</Text>
                  </Pressable>
                ))}
              </View>
            ) : null}
            <Pressable onPress={onConfirm} style={[styles.confirmButton, { height: scaleSize(52), borderRadius: scaleSize(26), marginTop: scaleSize(24) }]}>
              <Text style={[styles.confirmText, { fontSize: scaleFont(15) }]}>{confirmLabel}</Text>
            </Pressable>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, justifyContent: 'flex-end' },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(18,18,24,0.52)' },
  sheet: { backgroundColor: colors.white, overflow: 'hidden' },
  handle: { alignSelf: 'center', backgroundColor: '#D9DCE5', marginTop: 10, marginBottom: 16 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  title: { flex: 1, fontFamily: 'Inter_800ExtraBold', color: colors.mainBlack },
  closeButton: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#F4F5F8', justifyContent: 'center', alignItems: 'center' },
  closeText: { color: colors.mainBlack, lineHeight: 22 },
  body: { fontFamily: 'Inter_400Regular', color: colors.grey },
  pointRow: { flexDirection: 'row', alignItems: 'flex-start' },
  point: { backgroundColor: colors.primaryBlue },
  pointText: { flex: 1, fontFamily: 'Inter_500Medium', color: colors.mainBlack },
  links: { borderTopWidth: 1, borderTopColor: '#E8EAF0', paddingTop: 14 },
  linkRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 4 },
  linkText: { fontFamily: 'Inter_700Bold', color: colors.primaryBlue },
  linkArrow: { color: colors.primaryBlue, fontFamily: 'Inter_700Bold' },
  confirmButton: { backgroundColor: colors.primaryBlue, alignItems: 'center', justifyContent: 'center' },
  confirmText: { fontFamily: 'Inter_700Bold', color: colors.white },
});
