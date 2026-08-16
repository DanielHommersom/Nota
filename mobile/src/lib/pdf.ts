import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import { Platform } from "react-native";

/**
 * "Bekijken": hands the HTML straight to the OS print/preview sheet
 * (`Print.printAsync`) — on iOS/Android this opens the native print
 * preview, which itself offers "Save to Files" (i.e. save as a real PDF)
 * and AirPrint/print-service sharing. On web it opens the browser's print
 * dialog. No extra PDF-viewer dependency needed for a real look-at-the-
 * document flow.
 */
export async function viewInvoicePdf(html: string): Promise<void> {
  await Print.printAsync({ html });
}

/**
 * "Downloaden / Delen": actually rasterizes the HTML to a PDF file on disk
 * (`Print.printToFileAsync`), then hands that file to the OS share sheet
 * (`Sharing.shareAsync`) — which is exactly where WhatsApp, Mail, AirDrop,
 * "Save to Files" etc. show up (FRONTEND-CHECKLIST.md item 23: "opnieuw
 * versturen / delen (bv. via WhatsApp/mail-link)"). Returns the file uri so
 * callers can also cache it (e.g. to avoid regenerating on every tap).
 */
export async function shareInvoicePdf(html: string, filename: string): Promise<string> {
  const { uri } = await Print.printToFileAsync({ html, base64: false });

  if (Platform.OS === "web") {
    // The share sheet doesn't exist on web — printAsync's browser print
    // dialog (which includes "Save as PDF") is the web equivalent.
    await Print.printAsync({ html });
    return uri;
  }

  const canShare = await Sharing.isAvailableAsync();
  if (canShare) {
    await Sharing.shareAsync(uri, {
      mimeType: "application/pdf",
      dialogTitle: filename,
      UTI: "com.adobe.pdf",
    });
  }
  return uri;
}
