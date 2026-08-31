import React from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/colors';
import { useResponsive } from '../utils/responsive';
import DeleteIcon from '../assets/figma/screen25/screen45-delete.svg';

type Props = {
  visible: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  title?: string;
  body?: string;
  confirmLabel?: string;
};

export default function DeleteAccountSheet({ visible, onCancel, onConfirm, title = 'Delete your account?', body = 'This permanently removes your account, child profiles, screening responses, reports, and saved history. This action cannot be undone.', confirmLabel = 'Yes, delete account' }: Props) {
  const { height, scaleSize, scaleFont } = useResponsive();
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onCancel}>
      <View style={styles.root}>
        <Pressable style={styles.backdrop} onPress={onCancel} />
        <View style={[styles.sheet, { maxHeight: height * 0.72, borderTopLeftRadius: scaleSize(24), borderTopRightRadius: scaleSize(24), padding: scaleSize(20) }]}>
          <View style={[styles.handle, { width: scaleSize(42), height: scaleSize(4), borderRadius: scaleSize(2) }]} />
          <View style={[styles.trash, { width: scaleSize(48), height: scaleSize(48), borderRadius: scaleSize(24), marginTop: scaleSize(18) }]}>
            <DeleteIcon width={scaleSize(48)} height={scaleSize(48)} />
          </View>
          <Text style={[styles.title, { fontSize: scaleFont(18), marginTop: scaleSize(14) }]}>{title}</Text>
          <Text style={[styles.body, { fontSize: scaleFont(13), lineHeight: scaleFont(19), marginTop: scaleSize(10) }]}>{body}</Text>
          <View style={[styles.actions, { gap: scaleSize(12), marginTop: scaleSize(20) }]}>
            <Pressable onPress={onCancel} style={[styles.cancel, { height: scaleSize(50), borderRadius: scaleSize(25) }]}><Text style={[styles.cancelText, { fontSize: scaleFont(14) }]}>Cancel</Text></Pressable>
            <Pressable onPress={onConfirm} style={[styles.delete, { height: scaleSize(50), borderRadius: scaleSize(25) }]}><Text style={[styles.deleteText, { fontSize: scaleFont(14) }]} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.78}>{confirmLabel}</Text></Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, justifyContent: 'flex-end' },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(18,18,24,0.52)' },
  sheet: { backgroundColor: colors.white, alignItems: 'center' },
  handle: { backgroundColor: '#D9DCE5' },
  trash: { backgroundColor: '#FFF1EF', justifyContent: 'center', alignItems: 'center' },
  title: { fontFamily: 'Inter_800ExtraBold', color: colors.mainBlack, textAlign: 'center' },
  body: { fontFamily: 'Inter_400Regular', color: colors.grey, textAlign: 'center', maxWidth: 340 },
  actions: { flexDirection: 'row', width: '100%' },
  cancel: { flex: 1, borderWidth: 1, borderColor: '#D9DCE5', justifyContent: 'center', alignItems: 'center' },
  cancelText: { fontFamily: 'Inter_700Bold', color: '#6B7180' },
  delete: { flex: 1, backgroundColor: '#C33C32', justifyContent: 'center', alignItems: 'center' },
  deleteText: { fontFamily: 'Inter_700Bold', color: colors.white },
});
