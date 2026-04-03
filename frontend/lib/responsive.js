import { Dimensions, Platform, useWindowDimensions } from "react-native";

const { width: initialWidth } = Dimensions.get("window");

const buildResponsive = (width) => {
  const isAndroid = Platform.OS === "android";
  const isMobile = width < 768;
  const isTablet = width >= 768 && width < 1024;
  const isLarge = width >= 1024;
  // Treat anything under 400dp as a compact phone (common Android budget phones)
  const isCompactPhone = width < 400;
  const isAndroidPhone = isAndroid && width < 600;

  // Padding applied around screen content
  const screenPadding = isLarge ? 32 : isTablet ? 24 : isCompactPhone ? 12 : 16;
  const gap = isLarge ? 20 : isTablet ? 18 : isCompactPhone ? 10 : 14;

  // Available width INSIDE the padding — used so content never overflows
  const innerWidth = width - screenPadding * 2;

  return {
    width,
    innerWidth,
    isAndroid,
    isMobile,
    isTablet,
    isLarge,
    isCompactPhone,
    isAndroidPhone,
    screenPadding,
    gap,
    // numColumns: always 1 on phone, 2 on tablet, 3 on large screen
    numColumns: isLarge ? 3 : isTablet ? 2 : 1,
    // cardWidth — use innerWidth for phones so FlatList items fit precisely
    cardWidth: isLarge ? "31.5%" : isTablet ? "48%" : "100%",
    // contentWidth — the max width a centred content block should reach
    contentWidth: isLarge ? 1200 : isTablet ? 900 : innerWidth,
    // Font sizes — comfortable on every Android dp density
    titleSize: isLarge ? 34 : isTablet ? 28 : isCompactPhone ? 20 : 22,
    subtitleSize: isLarge ? 22 : isTablet ? 20 : isCompactPhone ? 15 : 17,
    bodySize: isLarge ? 17 : isTablet ? 16 : isCompactPhone ? 13 : 14,
    smallSize: isLarge ? 15 : isTablet ? 14 : isCompactPhone ? 11 : 12,
    // Button / touch-target heights — minimum 44dp (accessibility guideline)
    buttonHeight: isLarge ? 56 : isTablet ? 52 : isCompactPhone ? 44 : 48,
    // Icon sizes
    iconSize: isLarge ? 28 : isTablet ? 24 : isCompactPhone ? 20 : 22,
  };
};

export const isMobile = initialWidth < 768;
export const isTablet = initialWidth >= 768 && initialWidth < 1024;
export const isLarge = initialWidth >= 1024;

export const getResponsive = buildResponsive;

export const useResponsive = () => {
  const { width } = useWindowDimensions();
  return buildResponsive(width);
};
