import type { Invoice } from "@/features/invoices/types";
import type { CompanyProfile } from "@/features/company/types";
import type { Branding } from "@/features/branding/types";
import { calculateInvoiceTotals, calculateItemTotal, KOR_DISCLAIMER_NL } from "@/lib/vat";
import { formatEuroCents } from "@/lib/currency";

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function formatInvoiceDate(iso: string | null): string {
  const date = iso ? new Date(iso) : new Date();
  return new Intl.DateTimeFormat("nl-NL", { day: "numeric", month: "long", year: "numeric" }).format(date);
}

/**
 * Builds the HTML handed to `expo-print` (see lib/pdf.ts) — this is the
 * closest the frontend gets to the real server-side `@react-pdf/renderer`
 * document described in CHECKLIST.md (T-something, "server-side PDF
 * generation"). It's a genuine, freestanding invoice layout so "PDF
 * bekijken/downloaden" (FRONTEND-CHECKLIST.md item 27) is a real,
 * demonstrable feature today, not a stub — the actual compliance-grade
 * template (exact legal line items, company's own send infra) is still
 * backend scope.
 */
export function buildInvoiceHtml(invoice: Invoice, company: CompanyProfile | null, branding: Branding): string {
  const totals = calculateInvoiceTotals(invoice.items);
  const vatBreakdown = Object.entries(totals.vatByRate) as [string, number][];
  const accent = branding.accentColor || "#2563eb";
  const fontStack =
    branding.font === "klassiek"
      ? "'Georgia', 'Times New Roman', serif"
      : "-apple-system, 'Helvetica Neue', Arial, sans-serif";

  const address = company?.address;
  const addressLine = address ? `${address.street} ${address.houseNumber}` : "";
  const cityLine = address ? `${address.postcode} ${address.city}` : "";

  const rows = invoice.items
    .map((item) => {
      const itemTotal = calculateItemTotal(item);
      return `
        <tr>
          <td class="desc">${escapeHtml(item.description)}</td>
          <td class="num">${item.quantity}</td>
          <td class="num">${formatEuroCents(item.unitPriceCents)}</td>
          <td class="num">${item.vatRate}%</td>
          <td class="num total">${formatEuroCents(itemTotal.totalCents)}</td>
        </tr>`;
    })
    .join("");

  const vatRows = company?.korExempt
    ? ""
    : vatBreakdown
        .map(([rate, cents]) => `<div class="totals-row"><span>BTW (${rate}%)</span><span>${formatEuroCents(cents)}</span></div>`)
        .join("");

  const korNotice = company?.korExempt
    ? `<p class="kor-disclaimer">${escapeHtml(KOR_DISCLAIMER_NL)}</p>`
    : "";

  return `<!doctype html>
<html lang="nl">
  <head>
    <meta charset="utf-8" />
    <style>
      @page { margin: 40px; }
      * { box-sizing: border-box; }
      body {
        font-family: ${fontStack};
        color: #1a1a1a;
        margin: 0;
        padding: 0;
        ${branding.letterheadUri ? `background-image: url('${branding.letterheadUri}'); background-size: cover; background-position: top center;` : ""}
      }
      .page { padding: 48px; }
      .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 40px; }
      .logo { max-height: 64px; max-width: 220px; object-fit: contain; margin-bottom: 12px; }
      .company-name { font-size: 18px; font-weight: 700; color: ${accent}; }
      .company-meta { font-size: 12px; color: #6b6b70; line-height: 1.6; margin-top: 4px; }
      .invoice-title { text-align: right; }
      .invoice-title h1 { font-size: 26px; letter-spacing: 2px; color: #1a1a1a; margin: 0 0 6px; text-transform: uppercase; }
      .invoice-title .number { font-size: 14px; color: #6b6b70; }
      .parties { display: flex; justify-content: space-between; margin-bottom: 36px; }
      .parties .label { font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; color: #6b6b70; margin-bottom: 6px; }
      .parties .name { font-size: 15px; font-weight: 600; }
      .parties .meta { font-size: 12px; color: #6b6b70; margin-top: 2px; line-height: 1.6; }
      table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
      thead th { text-align: left; font-size: 11px; text-transform: uppercase; letter-spacing: 0.4px; color: #6b6b70; border-bottom: 2px solid #1a1a1a; padding-bottom: 8px; }
      thead th.num { text-align: right; }
      td { padding: 12px 0; border-bottom: 1px solid #e5e5e7; font-size: 14px; }
      td.num { text-align: right; }
      td.desc { max-width: 260px; }
      td.total { font-weight: 600; }
      .totals { margin-left: auto; width: 280px; }
      .totals-row { display: flex; justify-content: space-between; font-size: 13px; color: #6b6b70; padding: 4px 0; }
      .totals-row.grand { font-size: 17px; font-weight: 700; color: #1a1a1a; border-top: 2px solid #1a1a1a; margin-top: 8px; padding-top: 10px; }
      .kor-disclaimer { margin-top: 28px; font-size: 11px; color: #6b6b70; line-height: 1.6; font-style: italic; }
      .footer { margin-top: 56px; padding-top: 16px; border-top: 1px solid #e5e5e7; font-size: 11px; color: #6b6b70; text-align: center; }
    </style>
  </head>
  <body>
    <div class="page">
      <div class="header">
        <div>
          ${branding.logoUri ? `<img class="logo" src="${branding.logoUri}" />` : ""}
          <div class="company-name">${escapeHtml(company?.name ?? "Jouw bedrijf")}</div>
          <div class="company-meta">
            ${escapeHtml(addressLine)}${addressLine ? "<br/>" : ""}
            ${escapeHtml(cityLine)}${cityLine ? "<br/>" : ""}
            ${company?.kvkNummer ? `KVK ${escapeHtml(company.kvkNummer)}<br/>` : ""}
            ${company?.btwNummer && !company.korExempt ? `BTW ${escapeHtml(company.btwNummer)}` : ""}
          </div>
        </div>
        <div class="invoice-title">
          <h1>Factuur</h1>
          <div class="number">${invoice.invoiceNumber ? `Nr. ${escapeHtml(invoice.invoiceNumber)}` : "Concept"}</div>
          <div class="number">${formatInvoiceDate(invoice.sentAt)}</div>
        </div>
      </div>

      <div class="parties">
        <div>
          <div class="label">Factuur aan</div>
          <div class="name">${escapeHtml(invoice.customer.name)}</div>
          <div class="meta">
            ${invoice.customer.address ? `${escapeHtml(invoice.customer.address)}<br/>` : ""}
            ${invoice.customer.postcode || invoice.customer.city ? `${escapeHtml(invoice.customer.postcode ?? "")} ${escapeHtml(invoice.customer.city ?? "")}<br/>` : ""}
            ${invoice.customer.btwNummer ? `BTW ${escapeHtml(invoice.customer.btwNummer)}` : ""}
          </div>
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th>Omschrijving</th>
            <th class="num">Aantal</th>
            <th class="num">Prijs</th>
            <th class="num">BTW</th>
            <th class="num">Totaal</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>

      <div class="totals">
        <div class="totals-row"><span>Subtotaal</span><span>${formatEuroCents(totals.subtotalCents)}</span></div>
        ${vatRows}
        <div class="totals-row grand"><span>Totaal</span><span>${formatEuroCents(totals.totalCents)}</span></div>
      </div>

      ${korNotice}

      <div class="footer">${escapeHtml(company?.name ?? "Nota")} · Gegenereerd met Nota</div>
    </div>
  </body>
</html>`;
}
