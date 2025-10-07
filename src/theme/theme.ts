// src/theme/theme.ts
import type { Theme } from '@react-navigation/native';
import { DefaultTheme as RNLight, DarkTheme as RNDark } from '@react-navigation/native';

const ACCENT_BLUE = '#4F76FF';       // accent blue
const BG_DARK = '#000000';           // app background (dark)
const CARD_DARK = '#0B0B0B';         // surfaces
const TEXT_LIGHT = '#FFFFFF';        // text on dark
const BORDER_DARK = '#1F1F1F';       // separators

const BG_LIGHT = '#0A0A0A';          // keep “light” themed close to dark per preference
const CARD_LIGHT = '#111111';
const TEXT_LIGHT_ON_DARK = '#FFFFFF';
const BORDER_LIGHT = '#222222';

export const AppDarkTheme: Theme = {
  ...RNDark,
  colors: {
    ...RNDark.colors,
    primary: ACCENT_BLUE,
    background: BG_DARK,
    card: CARD_DARK,
    text: TEXT_LIGHT,
    border: BORDER_DARK,
    notification: ACCENT_BLUE,
  },
};

export const AppLightTheme: Theme = {
  ...RNLight,
  colors: {
    ...RNLight.colors,
    primary: ACCENT_BLUE,
    background: BG_LIGHT,
    card: CARD_LIGHT,
    text: TEXT_LIGHT_ON_DARK,
    border: BORDER_LIGHT,
    notification: ACCENT_BLUE,
  },
};