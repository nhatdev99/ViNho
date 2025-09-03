import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  Switch, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Alert 
} from 'react-native';
import { useTheme, type ColorPalette } from '../theme';
import { useAppDispatch, useAppSelector } from '../store';
import { updateSettings } from '../store/settingsSlice';

interface SettingsScreenProps {}

const SettingsScreen: React.FC<SettingsScreenProps> = () => {
  const { 
    theme, 
    colorScheme, 
    toggleColorScheme, 
    colorPalette, 
    setColorPalette 
  } = useTheme();
  
  const dispatch = useAppDispatch();
  const { settings } = useAppSelector((state) => state.settings);
  const [localSettings, setLocalSettings] = useState(settings);

  // Các màu sắc có sẵn để chọn
  const availablePalettes = [
    { id: 'blue', name: 'Xanh dương' },
    { id: 'green', name: 'Xanh lá' },
    { id: 'purple', name: 'Tím' },
    { id: 'orange', name: 'Cam' },
    { id: 'red', name: 'Đỏ' },
    { id: 'yellow', name: 'Vàng' },
    { id: 'gray', name: 'Xám' },
    { id: 'black', name: 'Đen' },
    { id: 'white', name: 'Trắng' },
  ];

  // Các loại tiền tệ
  const currencies = [
    { code: 'VND', name: 'Việt Nam Đồng' },
    { code: 'USD', name: 'US Dollar' },
    { code: 'EUR', name: 'Euro' },
  ];

  // Cập nhật cài đặt khi có thay đổi
  useEffect(() => {
    dispatch(updateSettings(localSettings));
  }, [localSettings, dispatch]);

  const toggleSwitch = (setting: keyof typeof localSettings) => {
    setLocalSettings((prev: any) => ({
      ...prev,
      [setting]: !prev[setting],
    }));
  };

  const changeTheme = (newTheme: 'light' | 'dark') => {
    if (newTheme !== colorScheme) {
      toggleColorScheme();
    }
    setLocalSettings((prev: any) => ({
      ...prev,
      theme: newTheme,
    }));
  };

  const changeCurrency = (newCurrency: string) => {
    setLocalSettings((prev: any) => ({
      ...prev,
      currency: newCurrency,
    }));
  };

  const handleExportData = () => {
    // TODO: Thêm chức năng xuất dữ liệu
    Alert.alert('Thông báo', 'Tính năng đang được phát triển');
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={styles.contentContainer}
    >
      {/* Phần cài đặt */}
      <View style={[styles.section, { backgroundColor: theme.colors.card }]}>
        <Text style={[styles.settingSectionTitle, { color: theme.colors.text }]}>
          Cài đặt
        </Text>
      </View>
      {/* Phần giao diện */}
      <View style={[styles.section, { backgroundColor: theme.colors.card }]}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          Giao diện
        </Text>

        {/* Chọn chế độ màu */}
        <View style={styles.settingItem}>
          <View>
            <Text style={[styles.settingLabel, { color: theme.colors.text }]}>
              Chế độ tối
            </Text>
            <Text style={[styles.settingDescription, { color: theme.colors.textSecondary }]}>
              {colorScheme === 'dark' 
              ? 'Đang bật chế độ tối' 
              : 'Đang tắt chế độ tối'}
            </Text>
          </View>
          <Switch
            value={colorScheme === 'dark'}
            onValueChange={() => toggleColorScheme()}
            trackColor={{ false: '#767577', true: theme.colors.primary }}
            thumbColor={colorScheme === 'dark' ? '#f5dd4b' : '#f4f3f4'}
          />
        </View>

        {/* Chọn bảng màu */}
        <View style={styles.settingSection}>
          <Text style={[styles.settingLabel, { color: theme.colors.text }]}>
            Chọn bảng màu
          </Text>
          <View style={styles.paletteContainer}>
            {availablePalettes.map((palette) => (
              <TouchableOpacity
                key={palette.id}
                style={[
                  styles.paletteButton,
                  {
                    borderColor: colorPalette === palette.id 
                      ? theme.colors.primary 
                      : theme.colors.border,
                    backgroundColor: colorPalette === palette.id 
                      ? `${theme.colors.primary}20` 
                      : 'transparent',
                  },
                ]}
                onPress={() => setColorPalette(palette.id as ColorPalette)}
              >
                <View
                  style={[
                    styles.paletteColor,
                    { backgroundColor: colorPalette === palette.id ? theme.colors.primary : theme.colors.background },
                  ]}
                />
                <Text
                  style={[
                    styles.paletteText,
                    {
                      color: colorPalette === palette.id
                        ? theme.colors.primary
                        : theme.colors.text,
                    },
                  ]}
                >
                  {palette.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>

      {/* Phần đơn vị tiền tệ */}
      <View style={[styles.section, { backgroundColor: theme.colors.card }]}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          Đơn vị tiền tệ
        </Text>
        
        <View style={styles.currencyContainer}>
          {currencies.map((currency) => (
            <TouchableOpacity
              key={currency.code}
              style={[
                styles.currencyButton,
                {
                  backgroundColor: localSettings.currency === currency.code
                    ? theme.colors.primary
                    : 'transparent',
                  borderColor: localSettings.currency === currency.code
                    ? theme.colors.primary
                    : theme.colors.border,
                },
              ]}
              onPress={() => changeCurrency(currency.code)}
            >
              <Text
                style={[
                  styles.currencyText,
                  {
                    color: localSettings.currency === currency.code
                      ? theme.colors.card
                      : theme.colors.text,
                  },
                ]}
              >
                {currency.code}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Phần dữ liệu */}
      <View style={[styles.section, { backgroundColor: theme.colors.card }]}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          Dữ liệu
        </Text>
        
        <TouchableOpacity 
          style={[styles.dataItem, ]}
          onPress={handleExportData}
        >
          <Text style={
            [
              styles.dataLabel, 
              {backgroundColor: theme.colors.card, 
                borderColor: theme.colors.primary, 
                color: theme.colors.primary }
            ]
          }>
            Xuất dữ liệu
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50
  },
  contentContainer: {
    padding: 16,
  },
  section: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  settingSectionTitle: {
    fontSize: 25,
    fontWeight: '800',
  },
  settingSection: {
    marginTop: 16,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  dataItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',

  },
  dataLabel: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 15,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  settingDescription: {
    fontSize: 12,
    opacity: 0.7,
    marginTop: 4,
  },
  paletteContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  paletteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 8,
    margin: 4,
    borderWidth: 1,
  },
  paletteColor: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 8,
  },
  paletteText: {
    fontSize: 14,
    fontWeight: '500',
  },
  currencyContainer: {
    flexDirection: 'row',
    marginTop: 8,
  },
  currencyButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
  },
  currencyText: {
    fontSize: 14,
    fontWeight: '500',
  },
});

export default SettingsScreen;
