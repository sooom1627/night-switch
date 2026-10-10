import { View, type ViewProps } from "react-native";

import { useTheme } from "@/shared/hooks/use-theme";
import type { ThemeColor } from "@/shared/theme/theme";

export type ThemedViewProps = ViewProps & {
  type?: ThemeColor;
};

export function ThemedView({ style, type, ...otherProps }: ThemedViewProps) {
  const theme = useTheme();

  return (
    <View
      style={[{ backgroundColor: theme[type ?? "background"] }, style]}
      {...otherProps}
    />
  );
}
