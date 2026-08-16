import { useState } from "react";
import { Alert, Image, Pressable, ScrollView, Text, View } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Image as ImageIcon, Trash2 } from "lucide-react-native";
import { Card, CardRow } from "@/components/ui/Card";
import { AsyncActionButton } from "@/components/ui/AsyncActionButton";
import { useBranding } from "@/features/branding/BrandingContext";
import { ACCENT_COLOR_PRESETS, FONT_OPTIONS, fontFamilyFor } from "@/features/branding/presets";

/**
 * Branding wasn't part of the original walking-skeleton MVP (not in
 * FRONTEND-CHECKLIST.md at all) but is explicit product scope now: logo,
 * lettertype, kleuren, eigen briefpapier — all four feed straight into the
 * generated PDF (lib/invoiceHtml.ts), so this isn't cosmetic-only, it
 * changes what customers actually receive.
 */
export default function BrandingScreen() {
  const { branding, updateBranding } = useBranding();
  const [saved, setSaved] = useState(false);

  async function pickImage(kind: "logo" | "letterhead") {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Toegang nodig", "Geef Nota toegang tot je foto's om een afbeelding te kiezen.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: kind === "logo" ? [3, 1] : [3, 4],
      quality: 0.8,
    });
    if (result.canceled || !result.assets[0]) return;
    const uri = result.assets[0].uri;
    updateBranding(kind === "logo" ? { logoUri: uri } : { letterheadUri: uri });
    setSaved(false);
  }

  return (
    <View className="flex-1 bg-bg">
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <Text className="mb-1 text-[15px] leading-5 text-muted">
          Zo ziet je logo, lettertype en kleur eruit op elke factuur die je verstuurt.
        </Text>

        <Text className="mb-2 ml-1 mt-5 text-[12px] font-semibold uppercase tracking-wide text-muted">Logo</Text>
        <Card className="p-4">
          <View className="flex-row items-center gap-4">
            <View className="h-16 w-28 items-center justify-center rounded-control border border-dashed border-border bg-bg">
              {branding.logoUri ? (
                <Image source={{ uri: branding.logoUri }} className="h-full w-full rounded-control" resizeMode="contain" />
              ) : (
                <ImageIcon color="#b8b8bc" size={22} />
              )}
            </View>
            <View className="flex-1 gap-2">
              <Pressable
                onPress={() => pickImage("logo")}
                accessibilityRole="button"
                accessibilityLabel="Logo kiezen"
                className="h-11 items-center justify-center rounded-control bg-accent-soft"
              >
                <Text className="text-[14px] font-semibold text-accent">
                  {branding.logoUri ? "Ander logo kiezen" : "Logo kiezen"}
                </Text>
              </Pressable>
              {branding.logoUri ? (
                <Pressable
                  onPress={() => {
                    updateBranding({ logoUri: null });
                    setSaved(false);
                  }}
                  accessibilityRole="button"
                  accessibilityLabel="Logo verwijderen"
                  className="h-9 flex-row items-center justify-center gap-1.5"
                >
                  <Trash2 color="#b45309" size={14} />
                  <Text className="text-[13px] font-medium text-warn">Verwijderen</Text>
                </Pressable>
              ) : null}
            </View>
          </View>
        </Card>

        <Text className="mb-2 ml-1 mt-5 text-[12px] font-semibold uppercase tracking-wide text-muted">
          Lettertype
        </Text>
        <Card>
          {FONT_OPTIONS.map((option, index) => {
            const selected = branding.font === option.value;
            return (
              <CardRow key={option.value} isLast={index === FONT_OPTIONS.length - 1}>
                <Pressable
                  onPress={() => {
                    updateBranding({ font: option.value });
                    setSaved(false);
                  }}
                  accessibilityRole="radio"
                  accessibilityState={{ selected }}
                  accessibilityLabel={option.label}
                  className="min-h-11 flex-1 flex-row items-center justify-between"
                >
                  <View className="flex-row items-center gap-3">
                    <Text style={{ fontFamily: fontFamilyFor(option.value), fontSize: 20 }} className="text-ink">
                      {option.sample}
                    </Text>
                    <Text className="text-[15px] text-ink">{option.label}</Text>
                  </View>
                  <View
                    className={`h-5 w-5 items-center justify-center rounded-full border-2 ${
                      selected ? "border-accent bg-accent" : "border-border"
                    }`}
                  >
                    {selected ? <View className="h-2 w-2 rounded-full bg-white" /> : null}
                  </View>
                </Pressable>
              </CardRow>
            );
          })}
        </Card>

        <Text className="mb-2 ml-1 mt-5 text-[12px] font-semibold uppercase tracking-wide text-muted">
          Merkkleur
        </Text>
        <Card className="p-4">
          <View className="flex-row flex-wrap gap-3">
            {ACCENT_COLOR_PRESETS.map((preset) => {
              const selected = branding.accentColor === preset.value;
              return (
                <Pressable
                  key={preset.value}
                  onPress={() => {
                    updateBranding({ accentColor: preset.value });
                    setSaved(false);
                  }}
                  accessibilityRole="radio"
                  accessibilityState={{ selected }}
                  accessibilityLabel={preset.label}
                  className="items-center gap-1.5"
                >
                  <View
                    className={`h-11 w-11 items-center justify-center rounded-full ${selected ? "border-2 border-ink" : ""}`}
                    style={{ backgroundColor: preset.value }}
                  >
                    {selected ? <View className="h-3.5 w-3.5 rounded-full bg-white" /> : null}
                  </View>
                  <Text className="text-[11px] text-muted">{preset.label}</Text>
                </Pressable>
              );
            })}
          </View>
        </Card>

        <Text className="mb-2 ml-1 mt-5 text-[12px] font-semibold uppercase tracking-wide text-muted">
          Eigen briefpapier
        </Text>
        <Text className="mb-2 ml-1 text-[12px] leading-4 text-muted">
          Optioneel: een achtergrondafbeelding (bijv. je briefpapierontwerp) die achter de factuurkop wordt geplaatst.
        </Text>
        <Card className="p-4">
          <View className="flex-row items-center gap-4">
            <View className="h-20 w-16 items-center justify-center overflow-hidden rounded-control border border-dashed border-border bg-bg">
              {branding.letterheadUri ? (
                <Image source={{ uri: branding.letterheadUri }} className="h-full w-full" resizeMode="cover" />
              ) : (
                <ImageIcon color="#b8b8bc" size={20} />
              )}
            </View>
            <View className="flex-1 gap-2">
              <Pressable
                onPress={() => pickImage("letterhead")}
                accessibilityRole="button"
                accessibilityLabel="Briefpapier kiezen"
                className="h-11 items-center justify-center rounded-control bg-accent-soft"
              >
                <Text className="text-[14px] font-semibold text-accent">
                  {branding.letterheadUri ? "Andere afbeelding kiezen" : "Afbeelding kiezen"}
                </Text>
              </Pressable>
              {branding.letterheadUri ? (
                <Pressable
                  onPress={() => {
                    updateBranding({ letterheadUri: null });
                    setSaved(false);
                  }}
                  accessibilityRole="button"
                  accessibilityLabel="Briefpapier verwijderen"
                  className="h-9 flex-row items-center justify-center gap-1.5"
                >
                  <Trash2 color="#b45309" size={14} />
                  <Text className="text-[13px] font-medium text-warn">Verwijderen</Text>
                </Pressable>
              ) : null}
            </View>
          </View>
        </Card>
      </ScrollView>

      <View className="px-4 pb-6 pt-2">
        <AsyncActionButton
          state={saved ? "success" : "idle"}
          label="Klaar"
          successLabel="Opgeslagen"
          accessibilityLabel="Branding opslaan"
          onPress={() => setSaved(true)}
        />
      </View>
    </View>
  );
}
