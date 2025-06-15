import { Hit } from '@/types/types';
import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Dimensions,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
} from 'react-native';

interface ReusableModalProps {
  visible: boolean;
  onClose: () => void;
  modalWidth?: number | string;
  modalHeight?: number | string;
  closeOnTouchOutside?: boolean;
  hitData: Hit
}

const { height: screenHeight } = Dimensions.get('window');

const CustomModal: React.FC<ReusableModalProps> = ({
  visible,
  onClose,
  modalWidth = '80%',
  modalHeight = '30%',
  closeOnTouchOutside = true,
  hitData
}) => {
  const translateY = useRef(new Animated.Value(screenHeight)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: screenHeight,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, translateY, opacity]);

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent={true}
    >
      <TouchableWithoutFeedback
        onPress={closeOnTouchOutside ? onClose : undefined}
      >
        <Animated.View style={[styles.backdrop, { opacity }]} />
      </TouchableWithoutFeedback>

      <Animated.View
        style={[
          styles.modalContainer,
          {
            width: modalWidth,
            height: modalHeight,
            transform: [{ translateY }],
          },
        ]}
      >
        <Text style={[styles.modalTitle,{marginBottom:5}]}>Outage Information : </Text>
        <View style={{gap:5}}>
        <View style={styles.textModalContainer}>
          <Text style={styles.textTitle} >Size : </Text>
          <Text>{hitData?._source.customerCount} customer affected</Text>
        </View>
        <View style={styles.textModalContainer}>
          <Text style={styles.textTitle}>Caused by : </Text>
          <Text>{hitData?._source.reason} customer affected</Text>
        </View>
        <View style={styles.textModalContainer}>
          <Text style={styles.textTitle}>Status : </Text>
          <Text>{hitData?._source.status} customer affected</Text>
        </View>
        <View style={styles.textModalContainer}>
          <Text style={styles.textTitle}>
            Always assume that a downed power line is energized and move away to safety
            If this is a life-threatening situation call{' '}
            <Text style={[styles.textTitle,{color:"blue"}]}>911</Text>
          </Text>
        </View>
        </View>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    ...Platform.select({
      android: { elevation: 10 },
      ios: { zIndex: 10 },
    }),
  },
  textTitle:{
    fontWeight:"bold"
  },
  modalTitle:{
    fontWeight:"bold"
  },
  textModalContainer:{
    flexDirection:"row",
    flexWrap:"wrap"
  },
  modalContainer: {
    position: 'absolute',
    alignSelf: 'center',
    bottom: '50%', // We’ll shift it upward via transform
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    // Shadow for iOS
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    // Elevation for Android
    elevation: 20,
  },
});

export default CustomModal;