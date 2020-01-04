import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';

import { Palette } from '../utils/theme';

interface IProps {
  scrollable?: boolean;
  children: JSX.Element[] | JSX.Element;
}

const Screen = ({ scrollable, children }: IProps) => {
  if (scrollable) {
    return (
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        bounces={false}
        style={styles.container}>
        {children}
      </ScrollView>
    );
  }

  return <View style={styles.container}>{children}</View>;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 16,
    color: Palette.gray.v900,
    backgroundColor: Palette.gray.v300,
  },
});

export default Screen;
