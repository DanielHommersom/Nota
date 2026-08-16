import { cssInterop } from "nativewind";
import {
  ActivityIndicator,
  Banner,
  Button,
  Card,
  Chip,
  Dialog,
  FAB,
  IconButton,
  List,
  Menu,
  Snackbar,
  Surface,
  Text as PaperText,
  TextInput,
} from "react-native-paper";

/**
 * NativeWind only auto-instruments React Native's own core components
 * (View, Text, Pressable, ...) — it has no idea `className` exists on a
 * third-party component like React Native Paper's <Card> or <Button>.
 * Every screen and feature component in this app was written against
 * `className` for spacing/layout (e.g. `<Card className="mt-6 w-full">`),
 * and the Paper conversion is required to preserve those call sites
 * unchanged. `cssInterop` (from NativeWind) remaps `className` -> `style`
 * on the exact component reference passed in, so registering it once here
 * — for every Paper component used anywhere in the app — lets `className`
 * keep working uniformly, on both core RN components and Paper ones.
 *
 * Imported once for its side effect in app/_layout.tsx, before anything
 * renders.
 */
cssInterop(Card, { className: "style" });
cssInterop(Card.Content, { className: "style" });
cssInterop(Card.Actions, { className: "style" });
cssInterop(Button, { className: "style" });
cssInterop(TextInput, { className: "style" });
cssInterop(Dialog, { className: "style" });
cssInterop(Dialog.Content, { className: "style" });
cssInterop(Dialog.Actions, { className: "style" });
cssInterop(Dialog.Title, { className: "style" });
cssInterop(Banner, { className: "style" });
cssInterop(Chip, { className: "style" });
cssInterop(IconButton, { className: "style" });
cssInterop(FAB, { className: "style" });
cssInterop(List.Item, { className: "style" });
cssInterop(List.Icon, { className: "style" });
cssInterop(Menu, { className: "style" });
cssInterop(Snackbar, { className: "style" });
cssInterop(Surface, { className: "style" });
cssInterop(PaperText, { className: "style" });
cssInterop(ActivityIndicator, { className: "style" });
