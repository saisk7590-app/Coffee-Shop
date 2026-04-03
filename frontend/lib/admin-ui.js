import { ActivityIndicator, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { COLORS, SPACING } from "../constants";
import { useResponsive } from "./responsive";

export function Screen({ title, children }) {
  const responsive = useResponsive();

  return (
    <ScrollView style={{ flex: 1, backgroundColor: COLORS.background }}>
      <View style={{ padding: responsive.screenPadding }}>
        <View style={{ width: responsive.contentWidth }}>
          <Text style={{ fontSize: responsive.titleSize, fontWeight: "bold", color: COLORS.text }}>
            {title}
          </Text>
          <View style={{ marginTop: responsive.gap }}>{children}</View>
        </View>
      </View>
    </ScrollView>
  );
}

export function Card({ children, style }) {
  const responsive = useResponsive();

  return (
    <View
      style={{
        backgroundColor: "#fff",
        borderWidth: 1,
        borderColor: COLORS.border,
        borderRadius: 14,
        padding: responsive.isLarge ? 20 : responsive.isAndroidPhone ? 10 : responsive.isCompactPhone ? 12 : SPACING.md,
        marginBottom: responsive.gap,
        width: "100%",
        ...style,
      }}
    >
      {children}
    </View>
  );
}

export function StatusBadge({ label, tone = "success" }) {
  const responsive = useResponsive();
  const palette =
    tone === "danger"
      ? {
          backgroundColor: "#fdecea",
          borderColor: "#f5b5ad",
          textColor: COLORS.error,
        }
      : {
          backgroundColor: "#e9f8ef",
          borderColor: "#a8dfb8",
          textColor: COLORS.success,
        };

  return (
    <View
      style={{
        alignSelf: "flex-start",
        backgroundColor: palette.backgroundColor,
        borderColor: palette.borderColor,
        borderWidth: 1,
        borderRadius: 999,
        paddingHorizontal: responsive.isLarge ? 12 : 10,
        paddingVertical: responsive.isLarge ? 6 : 5,
        marginTop: 2,
      }}
    >
      <Text style={{ color: palette.textColor, fontWeight: "700", fontSize: responsive.smallSize }}>
        {label}
      </Text>
    </View>
  );
}

export function SectionTitle({ children }) {
  const responsive = useResponsive();

  return (
    <Text
      style={{
        fontSize: responsive.subtitleSize,
        fontWeight: "bold",
        color: COLORS.text,
        marginBottom: SPACING.sm,
      }}
    >
      {children}
    </Text>
  );
}

export function Field({
  placeholder,
  value,
  onChangeText,
  keyboardType,
  multiline,
  style,
}) {
  const responsive = useResponsive();

  return (
    <TextInput
      placeholder={placeholder}
      value={value}
      onChangeText={onChangeText}
      keyboardType={keyboardType}
      multiline={multiline}
      style={{
        borderWidth: 1,
        borderColor: COLORS.border,
        borderRadius: 10,
        paddingHorizontal: SPACING.md,
        paddingVertical: multiline ? SPACING.md : responsive.isLarge ? 16 : responsive.isAndroidPhone ? 10 : 12,
        backgroundColor: COLORS.surface,
        color: COLORS.text,
        marginBottom: SPACING.sm,
        minHeight: multiline ? 92 : undefined,
        textAlignVertical: multiline ? "top" : "center",
        fontSize: responsive.bodySize,
        ...style,
      }}
    />
  );
}

export function Button({
  label,
  onPress,
  variant = "primary",
  disabled = false,
  style,
}) {
  const responsive = useResponsive();
  const backgroundColor =
    variant === "danger"
      ? COLORS.error
      : variant === "secondary"
        ? COLORS.surface
        : COLORS.primary;
  const color = variant === "secondary" ? COLORS.text : "#fff";

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={{
        backgroundColor,
        borderWidth: variant === "secondary" ? 1 : 0,
        borderColor: COLORS.border,
        paddingVertical: responsive.isAndroidPhone ? 8 : responsive.isCompactPhone ? 10 : responsive.buttonHeight / 4,
        paddingHorizontal: SPACING.md,
        borderRadius: 10,
        alignItems: "center",
        justifyContent: "center",
        opacity: disabled ? 0.6 : 1,
        minWidth: responsive.isLarge ? 120 : 96,
        ...style,
      }}
    >
      <Text style={{ color, fontWeight: "700", fontSize: responsive.bodySize }}>{label}</Text>
    </Pressable>
  );
}

export function InlineActions({ children, style }) {
  const responsive = useResponsive();

  return (
    <View
      style={{
        flexDirection: "row",
        flexWrap: "wrap",
        gap: responsive.gap / 1.5,
        marginTop: SPACING.sm,
        ...style,
      }}
    >
      {children}
    </View>
  );
}

export function LoadingState() {
  return (
    <View style={{ paddingVertical: SPACING.xl, alignItems: "center" }}>
      <ActivityIndicator size="large" color={COLORS.primary} />
    </View>
  );
}

export function ErrorText({ children }) {
  const responsive = useResponsive();
  return <Text style={{ color: COLORS.error, marginBottom: SPACING.md, fontSize: responsive.bodySize }}>{children}</Text>;
}

export function EmptyState({ children }) {
  const responsive = useResponsive();
  return <Text style={{ color: COLORS.mutedText, fontSize: responsive.bodySize }}>{children}</Text>;
}

export function MiniChart({ data, valueKey, color }) {
  const responsive = useResponsive();
  const max = Math.max(...data.map((item) => Number(item[valueKey] || 0)), 1);

  return (
    <View style={{ gap: SPACING.sm }}>
      {data.map((item) => {
        const value = Number(item[valueKey] || 0);
        const width = `${Math.max((value / max) * 100, value > 0 ? 8 : 0)}%`;

        return (
          <View key={String(item.date)}>
            <Text style={{ color: COLORS.mutedText, marginBottom: 4, fontSize: responsive.smallSize }}>
              {String(item.date)} - {value}
            </Text>
            <View style={{ height: 10, backgroundColor: COLORS.divider, borderRadius: 999 }}>
              <View style={{ width, height: 10, backgroundColor: color, borderRadius: 999 }} />
            </View>
          </View>
        );
      })}
    </View>
  );
}

export function Grid({ children, style }) {
  const responsive = useResponsive();
  return <View style={{ gap: responsive.gap, ...style }}>{children}</View>;
}
