import 'package:flutter/material.dart';

@immutable
class AppPalette extends ThemeExtension<AppPalette> {
  const AppPalette({
    required this.backgroundTop,
    required this.backgroundMiddle,
    required this.backgroundBottom,
    required this.surface,
    required this.surfaceMuted,
    required this.surfaceSheet,
    required this.border,
    required this.shadow,
    required this.textPrimary,
    required this.textSecondary,
    required this.brand,
    required this.accent,
    required this.accentSoft,
    required this.accentStrong,
    required this.accentForeground,
    required this.warning,
    required this.handle,
    required this.badge,
    required this.keypadButton,
    required this.keypadButtonPressed,
    required this.keypadAccent,
    required this.keypadAccentPressed,
    required this.keypadShadow,
  });

  final Color backgroundTop;
  final Color backgroundMiddle;
  final Color backgroundBottom;
  final Color surface;
  final Color surfaceMuted;
  final Color surfaceSheet;
  final Color border;
  final Color shadow;
  final Color textPrimary;
  final Color textSecondary;
  final Color brand;
  final Color accent;
  final Color accentSoft;
  final Color accentStrong;
  final Color accentForeground;
  final Color warning;
  final Color handle;
  final Color badge;
  final Color keypadButton;
  final Color keypadButtonPressed;
  final Color keypadAccent;
  final Color keypadAccentPressed;
  final Color keypadShadow;

  static const AppPalette light = AppPalette(
    backgroundTop: Color(0xFFFFFCF8),
    backgroundMiddle: Color(0xFFFFF4F5),
    backgroundBottom: Color(0xFFF6F2F8),
    surface: Color(0xFFFFFEFD),
    surfaceMuted: Color(0xFFF8F0F2),
    surfaceSheet: Color(0xFFFFFBFC),
    border: Color(0xFFE9DADF),
    shadow: Color(0x18C95D67),
    textPrimary: Color(0xFF243041),
    textSecondary: Color(0xFF737B88),
    brand: Color(0xFF2A77C8),
    accent: Color(0xFFFF4D57),
    accentSoft: Color(0xFFFFECEE),
    accentStrong: Color(0xFFFF2F38),
    accentForeground: Colors.white,
    warning: Color(0xFFFFC857),
    handle: Color(0xFFFFCFD5),
    badge: Color(0xFF243041),
    keypadButton: Colors.white,
    keypadButtonPressed: Color(0xFFFFE6E8),
    keypadAccent: Color(0xFFFFECEE),
    keypadAccentPressed: Color(0xFFFFD5D9),
    keypadShadow: Color(0x24FF7A84),
  );

  static const AppPalette dark = AppPalette(
    backgroundTop: Color(0xFF232A37),
    backgroundMiddle: Color(0xFF171C28),
    backgroundBottom: Color(0xFF0E1118),
    surface: Color(0xFF1B2230),
    surfaceMuted: Color(0xFF141A25),
    surfaceSheet: Color(0xFF161C28),
    border: Color(0xFF2B3547),
    shadow: Color(0x36000000),
    textPrimary: Color(0xFFF3F6FC),
    textSecondary: Color(0xFFA6B0C1),
    brand: Color(0xFF6EB5FF),
    accent: Color(0xFFFF5C64),
    accentSoft: Color(0xFF342129),
    accentStrong: Color(0xFFFF737A),
    accentForeground: Colors.white,
    warning: Color(0xFFFFC95E),
    handle: Color(0x33FFFFFF),
    badge: Color(0xFFF3F6FC),
    keypadButton: Color(0xFF252D3B),
    keypadButtonPressed: Color(0xFF30394A),
    keypadAccent: Color(0xFF342129),
    keypadAccentPressed: Color(0xFF433039),
    keypadShadow: Color(0x1F000000),
  );

  @override
  AppPalette copyWith({
    Color? backgroundTop,
    Color? backgroundMiddle,
    Color? backgroundBottom,
    Color? surface,
    Color? surfaceMuted,
    Color? surfaceSheet,
    Color? border,
    Color? shadow,
    Color? textPrimary,
    Color? textSecondary,
    Color? brand,
    Color? accent,
    Color? accentSoft,
    Color? accentStrong,
    Color? accentForeground,
    Color? warning,
    Color? handle,
    Color? badge,
    Color? keypadButton,
    Color? keypadButtonPressed,
    Color? keypadAccent,
    Color? keypadAccentPressed,
    Color? keypadShadow,
  }) {
    return AppPalette(
      backgroundTop: backgroundTop ?? this.backgroundTop,
      backgroundMiddle: backgroundMiddle ?? this.backgroundMiddle,
      backgroundBottom: backgroundBottom ?? this.backgroundBottom,
      surface: surface ?? this.surface,
      surfaceMuted: surfaceMuted ?? this.surfaceMuted,
      surfaceSheet: surfaceSheet ?? this.surfaceSheet,
      border: border ?? this.border,
      shadow: shadow ?? this.shadow,
      textPrimary: textPrimary ?? this.textPrimary,
      textSecondary: textSecondary ?? this.textSecondary,
      brand: brand ?? this.brand,
      accent: accent ?? this.accent,
      accentSoft: accentSoft ?? this.accentSoft,
      accentStrong: accentStrong ?? this.accentStrong,
      accentForeground: accentForeground ?? this.accentForeground,
      warning: warning ?? this.warning,
      handle: handle ?? this.handle,
      badge: badge ?? this.badge,
      keypadButton: keypadButton ?? this.keypadButton,
      keypadButtonPressed: keypadButtonPressed ?? this.keypadButtonPressed,
      keypadAccent: keypadAccent ?? this.keypadAccent,
      keypadAccentPressed: keypadAccentPressed ?? this.keypadAccentPressed,
      keypadShadow: keypadShadow ?? this.keypadShadow,
    );
  }

  @override
  AppPalette lerp(ThemeExtension<AppPalette>? other, double t) {
    if (other is! AppPalette) {
      return this;
    }

    return AppPalette(
      backgroundTop: Color.lerp(backgroundTop, other.backgroundTop, t)!,
      backgroundMiddle: Color.lerp(backgroundMiddle, other.backgroundMiddle, t)!,
      backgroundBottom: Color.lerp(backgroundBottom, other.backgroundBottom, t)!,
      surface: Color.lerp(surface, other.surface, t)!,
      surfaceMuted: Color.lerp(surfaceMuted, other.surfaceMuted, t)!,
      surfaceSheet: Color.lerp(surfaceSheet, other.surfaceSheet, t)!,
      border: Color.lerp(border, other.border, t)!,
      shadow: Color.lerp(shadow, other.shadow, t)!,
      textPrimary: Color.lerp(textPrimary, other.textPrimary, t)!,
      textSecondary: Color.lerp(textSecondary, other.textSecondary, t)!,
      brand: Color.lerp(brand, other.brand, t)!,
      accent: Color.lerp(accent, other.accent, t)!,
      accentSoft: Color.lerp(accentSoft, other.accentSoft, t)!,
      accentStrong: Color.lerp(accentStrong, other.accentStrong, t)!,
      accentForeground: Color.lerp(accentForeground, other.accentForeground, t)!,
      warning: Color.lerp(warning, other.warning, t)!,
      handle: Color.lerp(handle, other.handle, t)!,
      badge: Color.lerp(badge, other.badge, t)!,
      keypadButton: Color.lerp(keypadButton, other.keypadButton, t)!,
      keypadButtonPressed: Color.lerp(
        keypadButtonPressed,
        other.keypadButtonPressed,
        t,
      )!,
      keypadAccent: Color.lerp(keypadAccent, other.keypadAccent, t)!,
      keypadAccentPressed: Color.lerp(
        keypadAccentPressed,
        other.keypadAccentPressed,
        t,
      )!,
      keypadShadow: Color.lerp(keypadShadow, other.keypadShadow, t)!,
    );
  }
}

extension AppPaletteBuildContext on BuildContext {
  AppPalette get appPalette => Theme.of(this).extension<AppPalette>()!;
}
