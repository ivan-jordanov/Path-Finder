import React, { useEffect, useRef, useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Keyboard,
  Platform,
  Animated,
} from 'react-native';
import theme from '../constants/theme';

/**
 * Bottom-sheet style modal that prompts the user for a route name before saving.
 *
 * Props:
 *  - visible {boolean}
 *  - onSave   {(title: string) => void}
 *  - onCancel {() => void}
 */
export default function SaveModal({ visible, onSave, onCancel }) {
  const [title, setTitle] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const sheetTranslateY = useRef(new Animated.Value(420)).current;

  useEffect(() => {
    if (!visible) {
      sheetTranslateY.setValue(420);
      return;
    }

    Animated.spring(sheetTranslateY, {
      toValue: 0,
      damping: 20,
      stiffness: 220,
      mass: 1,
      useNativeDriver: true,
    }).start();
  }, [visible, sheetTranslateY]);

  const handleSave = async () => {
    if (isSaving) return;

    Keyboard.dismiss();

    setIsSaving(true);
    const finalTitle = title.trim() || 'Unnamed Route';

    try {
      await Promise.resolve(onSave(finalTitle));
      setTitle('');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (isSaving) return;
    Keyboard.dismiss();
    setTitle('');
    onCancel();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={handleCancel}
    >
      <View style={{ flex: 1 }}>
        <Pressable
          className="absolute inset-0 bg-black/45"
          onPress={handleCancel}
        />

        <KeyboardAvoidingView
          style={{ flex: 1, justifyContent: 'flex-end' }}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 8 : 0}
          pointerEvents="box-none"
        >
          <Animated.View
            className="bg-parchment rounded-tl-3xl rounded-tr-3xl px-6 pt-6"
            style={{
              paddingBottom: Platform.OS === 'ios' ? 40 : 24,
              transform: [{ translateY: sheetTranslateY }],
            }}
          >
        {/* Handle */}
        <View className="w-10 h-1 bg-sand rounded-full self-center mb-5" />

        <Text className="text-lg font-bold text-ink mb-1.5">Save Route</Text>
        <Text className="text-[13px] text-ink-muted mb-4">
          Give your route a name (optional)
        </Text>

        <TextInput
          value={title}
          onChangeText={setTitle}
          editable={!isSaving}
          placeholder="e.g. Morning trail run"
          placeholderTextColor={theme.textMuted}
          blurOnSubmit
          returnKeyType="done"
          onSubmitEditing={handleSave}
          className="border-[1.5px] border-sand rounded-xl px-3.5 py-3 text-[15px] text-ink bg-white mb-5"
        />

        <View className="flex-row gap-3">
          <Pressable
            onPress={handleCancel}
            disabled={isSaving}
            className="flex-1 p-3.5 rounded-xl border-[1.5px] border-sand items-center bg-parchment active:bg-parchment-dark"
          >
            <Text className="text-ink-muted font-semibold text-[15px]">Cancel</Text>
          </Pressable>

          <Pressable
            onPress={handleSave}
            disabled={isSaving}
            className="flex-1 p-3.5 rounded-xl items-center bg-forest active:bg-forest-dark"
          >
            <Text className="text-white font-bold text-[15px]">{isSaving ? 'Saving...' : 'Save'}</Text>
          </Pressable>
        </View>
          </Animated.View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}
