import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '../theme';

type MessageProps = {
  text: string;
  isUser?: boolean;
  style?: ViewStyle;
};

const Message: React.FC<MessageProps> = ({ text, isUser = false, style }) => {
  const { theme } = useTheme();
  
  return (
    <View 
      style={[
        styles.container,
        {
          alignSelf: isUser ? 'flex-end' : 'flex-start',
          backgroundColor: isUser ? theme.colors.primary : theme.colors.card,
        },
        style
      ]}
    >
      <Text 
        style={[
          styles.text, 
          { 
            color: isUser ? '#fff' : theme.colors.text 
          }
        ]}
      >
        {text}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    maxWidth: '80%',
    borderRadius: 16,
    padding: 12,
    marginVertical: 4,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  text: {
    fontSize: 16,
    lineHeight: 22,
  },
});

export default Message;
