export type CompanyAddress = {
  street: string;
  houseNumber: string;
  postcode: string;
  city: string;
};

export type CompanyProfile = {
  name: string;
  kvkNummer: string;
  btwNummer: string;
  /** VAT-exempt under the kleineondernemersregeling — see KOR_DISCLAIMER_NL in lib/vat.ts. */
  korExempt: boolean;
  address: CompanyAddress;
  logoUrl: string | null;
};
