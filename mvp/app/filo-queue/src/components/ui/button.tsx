import * as React from "react";
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from "react-native";
import { palette } from "../../theme/colors";

type ButtonVariant =
  | "default"
  | "destructive"
  | "outline"
  | "secondary"
  | "ghost"
  | "link"
  | "dark"
  | "success";

type ButtonSize = "default" | "sm" | "lg" | "icon";

export interface ButtonProps
  extends Omit<React.ComponentProps<typeof TouchableOpacity>, "style"> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  style?: ViewStyle | ViewStyle[];
  textStyle?: TextStyle | TextStyle[];
  children?: React.ReactNode;
}

const base = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  text: {
    fontSize: 14,
    fontWeight: "600",
  },
  disabled: {
    opacity: 0.5,
  },
});

const sizeStyles: Record<ButtonSize, ViewStyle> = {
  default: { minHeight: 48 },
  sm: {
    minHeight: 40,
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  lg: {
    minHeight: 56,
    borderRadius: 16,
    paddingHorizontal: 32,
    paddingVertical: 14,
  },
  icon: { width: 48, height: 48, paddingHorizontal: 0, paddingVertical: 0 },
};

const variantContainer: Record<ButtonVariant, ViewStyle> = {
  default: { backgroundColor: palette.primary },
  destructive: { backgroundColor: palette.destructive },
  outline: {
    backgroundColor: "transparent",
    borderWidth: 2,
    borderColor: palette.outlineBorder,
  },
  secondary: { backgroundColor: palette.secondary },
  ghost: { backgroundColor: palette.ghostBg },
  link: { backgroundColor: "transparent" },
  dark: { backgroundColor: palette.dark },
  success: { backgroundColor: palette.success },
};

const variantText: Record<ButtonVariant, TextStyle> = {
  default: { color: palette.primaryText },
  destructive: { color: palette.destructiveText },
  outline: { color: palette.outlineBorder },
  secondary: { color: palette.secondaryText },
  ghost: { color: palette.ghostText },
  link: { color: palette.linkText, textDecorationLine: "underline" },
  dark: { color: palette.darkText },
  success: { color: palette.successText },
};

const Button = React.forwardRef<
  React.ElementRef<typeof TouchableOpacity>,
  ButtonProps
>(
  (
    {
      variant = "default",
      size = "default",
      style,
      textStyle,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const containerStyles = [
      base.container,
      sizeStyles[size],
      variantContainer[variant],
      disabled ? base.disabled : undefined,
      style as ViewStyle,
    ].filter(Boolean);

    const textStyles = [
      base.text,
      variantText[variant],
      textStyle as TextStyle,
    ].filter(Boolean);

    return (
      <TouchableOpacity
        ref={ref}
        activeOpacity={0.8}
        disabled={disabled}
        style={containerStyles}
        {...props}
      >
        {typeof children === "string" ? (
          <Text style={textStyles}>{children}</Text>
        ) : (
          children
        )}
      </TouchableOpacity>
    );
  }
);

Button.displayName = "Button";

export { Button };
