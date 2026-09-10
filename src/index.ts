import { SatuSehatClient, type SatuSehatClientConfig } from "./core/client.js";
import { SatuSehatApiError } from "./core/http.js";
import * as coding from "./fhir/coding/index.js";
import * as auth from "./common/auth.js";
import * as organization from "./common/organization.js";
import * as search from "./common/search.js";
import * as regions from "./master-data/regions.js";
import * as sarana from "./master-data/sarana.js";
import * as kfaPrice from "./kfa/price.js";
import * as kfaProducts from "./kfa/products.js";
import * as kfaAlkes from "./kfa/alkes.js";
import * as kyc from "./kyc/index.js";
import * as rme from "./rme/index.js";
import * as rjBundle from "./rawat-jalan/bundle.js";
import * as gigiBundle from "./gigi/bundle.js";
import * as webhook from "./klaim-swasta/webhook.js";

// FHIR resources (generated)
import * as fhirAccount from "./fhir/account.js";
import * as fhirAllergyIntolerance from "./fhir/allergyintolerance.js";
import * as fhirAppointment from "./fhir/appointment.js";
import * as fhirAppointmentResponse from "./fhir/appointmentresponse.js";
import * as fhirCarePlan from "./fhir/careplan.js";
import * as fhirChargeItem from "./fhir/chargeitem.js";
import * as fhirClaim from "./fhir/claim.js";
import * as fhirClaimResponse from "./fhir/claimresponse.js";
import * as fhirClinicalImpression from "./fhir/clinicalimpression.js";
import * as fhirComposition from "./fhir/composition.js";
import * as fhirCondition from "./fhir/condition.js";
import * as fhirCoverage from "./fhir/coverage.js";
import * as fhirCoverageEligibilityRequest from "./fhir/coverageeligibilityrequest.js";
import * as fhirCoverageEligibilityResponse from "./fhir/coverageeligibilityresponse.js";
import * as fhirDiagnosticReport from "./fhir/diagnosticreport.js";
import * as fhirEncounter from "./fhir/encounter.js";
import * as fhirEpisodeOfCare from "./fhir/episodeofcare.js";
import * as fhirFamilyMemberHistory from "./fhir/familymemberhistory.js";
import * as fhirHealthcareService from "./fhir/healthcareservice.js";
import * as fhirImagingStudy from "./fhir/imagingstudy.js";
import * as fhirImmunization from "./fhir/immunization.js";
import * as fhirInvoice from "./fhir/invoice.js";
import * as fhirLocation from "./fhir/location.js";
import * as fhirMedication from "./fhir/medication.js";
import * as fhirMedicationDispense from "./fhir/medicationdispense.js";
import * as fhirMedicationRequest from "./fhir/medicationrequest.js";
import * as fhirObservationTtv from "./fhir/observation-ttv.js";
import * as fhirOrganization from "./fhir/organization.js";
import * as fhirPatient from "./fhir/patient.js";
import * as fhirPaymentNotice from "./fhir/paymentnotice.js";
import * as fhirPaymentReconciliation from "./fhir/paymentreconciliation.js";
import * as fhirPractitioner from "./fhir/practitioner.js";
import * as fhirPractitionerRole from "./fhir/practitionerrole.js";
import * as fhirProcedure from "./fhir/procedure.js";
import * as fhirQuestionnaireResponse from "./fhir/questionnaireresponse.js";
import * as fhirRelatedPerson from "./fhir/relatedperson.js";
import * as fhirServiceRequest from "./fhir/servicerequest.js";
import * as fhirSlot from "./fhir/slot.js";
import * as fhirSpecimen from "./fhir/specimen.js";

// Rawat Jalan workflow (generated + hand-written bundle)
import * as rjAnamnesis from "./rawat-jalan/anamnesis.js";
import * as rjCaraKeluar from "./rawat-jalan/cara-keluar-dari-rumah-sakit.js";
import * as rjDiagnosis from "./rawat-jalan/diagnosis.js";
import * as rjHasilPemeriksaanFisik from "./rawat-jalan/hasil-pemeriksaan-fisik.js";
import * as rjInstruksiMedik from "./rawat-jalan/instruksi-medik-dan-keperawatan-pasien.js";
import * as rjKondisiKeluar from "./rawat-jalan/kondisi-saat-meninggalkan-fasyankes.js";
import * as rjPemeriksaanFungsional from "./rawat-jalan/pemeriksaan-fungsional.js";
import * as rjPemeriksaanPenunjang from "./rawat-jalan/pemeriksaan-penunjang.js";
import * as rjPendaftaran from "./rawat-jalan/pendaftaran-kunjungan-rawat-jalan.js";
import * as rjPenilaianRisiko from "./rawat-jalan/penilaian-risiko.js";
import * as rjPrognosis from "./rawat-jalan/prognosis.js";
import * as rjRasionalKlinis from "./rawat-jalan/rasional-klinis.js";
import * as rjRencanaRawatPasien from "./rawat-jalan/rencana-rawat-pasien.js";
import * as rjRencanaTindakLanjut from "./rawat-jalan/rencana-tindak-lanjut-dan-instruksi-tindak-lanjut.js";
import * as rjResumeMedis from "./rawat-jalan/resume-medis.js";
import * as rjRiwayatPenyakit from "./rawat-jalan/riwayat-perjalanan-penyakit.js";
import * as rjTatalaksana from "./rawat-jalan/tatalaksana.js";
import * as rjTindakanProsedur from "./rawat-jalan/tindakan-prosedur-medis.js";
import * as rjTujuanPerawatan from "./rawat-jalan/tujuan-perawatan.js";
import * as rjVariasiRtl from "./rawat-jalan/variasi-rtl-dan-cara-keluar.js";

// Gigi workflow (generated + hand-written bundle re-export)
import * as gigiAnamnesis from "./gigi/anamnesis.js";
import * as gigiCaraKeluar from "./gigi/cara-keluar-dari-rumah-sakit.js";
import * as gigiDiagnosis from "./gigi/diagnosis.js";
import * as gigiOdontogram from "./gigi/formulir-pemeriksaan-odontogram.js";
import * as gigiKondisiKeluar from "./gigi/kondisi-saat-meninggalkan-rs.js";
import * as gigiPemeriksaanFisik from "./gigi/pemeriksaan-fisik.js";
import * as gigiPemeriksaanPenunjang from "./gigi/pemeriksaan-penunjang.js";
import * as gigiPendaftaran from "./gigi/pendaftaran-kunjungan-rawat-jalan-gigi.js";
import * as gigiRencanaTindakLanjut from "./gigi/rencana-tindak-lanjut.js";
import * as gigiTatalaksana from "./gigi/tatalaksana.js";
import * as gigiTindakan from "./gigi/tindakan.js";

// Klaim modules (generated)
import * as klaimSwastaPrimary from "./klaim-swasta/primary-payor.js";
import * as klaimSwastaSecondary from "./klaim-swasta/secondary-payor.js";
import * as klaimSwastaTpa from "./klaim-swasta/tpa.js";
import * as klaimSwastaOop from "./klaim-swasta/oop.js";
import * as klaimSwastaKomunikasi from "./klaim-swasta/komunikasi.js";
import * as klaimBpjsVariabel from "./klaim-bpjs/variabel.js";
import * as klaimBpjsContoh from "./klaim-bpjs/contoh-klaim.js";

/**
 * Standalone namespaces, exported for direct (tree-shaking-friendly) use:
 *   `await search.searchPatient(client, { identifier: nikIdentifier(nik) })`
 */
export {
  auth,
  coding,
  organization,
  search,
  regions,
  sarana,
  kfaPrice,
  kfaProducts,
  kfaAlkes,
  kyc,
  rme,
  rjBundle,
  gigiBundle,
  webhook,
  fhirAccount,
  fhirAllergyIntolerance,
  fhirAppointment,
  fhirAppointmentResponse,
  fhirCarePlan,
  fhirChargeItem,
  fhirClaim,
  fhirClaimResponse,
  fhirClinicalImpression,
  fhirComposition,
  fhirCondition,
  fhirCoverage,
  fhirCoverageEligibilityRequest,
  fhirCoverageEligibilityResponse,
  fhirDiagnosticReport,
  fhirEncounter,
  fhirEpisodeOfCare,
  fhirFamilyMemberHistory,
  fhirHealthcareService,
  fhirImagingStudy,
  fhirImmunization,
  fhirInvoice,
  fhirLocation,
  fhirMedication,
  fhirMedicationDispense,
  fhirMedicationRequest,
  fhirObservationTtv,
  fhirOrganization,
  fhirPatient,
  fhirPaymentNotice,
  fhirPaymentReconciliation,
  fhirPractitioner,
  fhirPractitionerRole,
  fhirProcedure,
  fhirQuestionnaireResponse,
  fhirRelatedPerson,
  fhirServiceRequest,
  fhirSlot,
  fhirSpecimen,
  rjAnamnesis,
  rjCaraKeluar,
  rjDiagnosis,
  rjHasilPemeriksaanFisik,
  rjInstruksiMedik,
  rjKondisiKeluar,
  rjPemeriksaanFungsional,
  rjPemeriksaanPenunjang,
  rjPendaftaran,
  rjPenilaianRisiko,
  rjPrognosis,
  rjRasionalKlinis,
  rjRencanaRawatPasien,
  rjRencanaTindakLanjut,
  rjResumeMedis,
  rjRiwayatPenyakit,
  rjTatalaksana,
  rjTindakanProsedur,
  rjTujuanPerawatan,
  rjVariasiRtl,
  gigiAnamnesis,
  gigiCaraKeluar,
  gigiDiagnosis,
  gigiOdontogram,
  gigiKondisiKeluar,
  gigiPemeriksaanFisik,
  gigiPemeriksaanPenunjang,
  gigiPendaftaran,
  gigiRencanaTindakLanjut,
  gigiTatalaksana,
  gigiTindakan,
  klaimSwastaPrimary,
  klaimSwastaSecondary,
  klaimSwastaTpa,
  klaimSwastaOop,
  klaimSwastaKomunikasi,
  klaimBpjsVariabel,
  klaimBpjsContoh,
};

export { nikIdentifier } from "./common/search.js";
export type { AccessTokenResult, CredentialsOverride } from "./common/auth.js";
export type { OrganizationInput, LocationInput } from "./common/organization.js";
export type { PersonSearchParams } from "./common/search.js";
export type { RmeLinkInput } from "./rme/index.js";
export type {
  BundleEntryInput,
  BundleRequestMethod,
  FhirTransactionBundle,
  TransactionBundleOptions,
} from "./rawat-jalan/bundle.js";
export type {
  SatuSehatWebhookPayload,
  WebhookMethod,
} from "./klaim-swasta/webhook.js";
export { SatuSehatClient, SatuSehatApiError };
export type { SatuSehatClientConfig, SatuSehatEnvironment } from "./core/client.js";
export type { FhirBundle, FhirPatchOperation, FhirResource } from "./fhir/types.js";
export type { Coding } from "./fhir/types.js";

/**
 * Maps `fn(client, ...args)` to `fn(...args)` so module namespaces can hang
 * off a client instance: `satusehat.search.searchPatient(params)`.
 */
export type Bound<T> = {
  [K in keyof T]: T[K] extends (client: SatuSehatClient, ...args: infer A) => infer R
    ? (...args: A) => R
    : T[K];
};

function bindModule<T extends object>(client: SatuSehatClient, mod: T): Bound<T> {
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(mod)) {
    out[key] =
      typeof value === "function"
        ? (...args: unknown[]) =>
            (value as (c: SatuSehatClient, ...a: unknown[]) => unknown)(client, ...args)
        : value;
  }
  return out as Bound<T>;
}

/** FHIR resource namespaces attached by `createSatuSehatClient`. */
export type FhirNamespaces = {
  account: Bound<typeof fhirAccount>;
  allergyIntolerance: Bound<typeof fhirAllergyIntolerance>;
  appointment: Bound<typeof fhirAppointment>;
  appointmentResponse: Bound<typeof fhirAppointmentResponse>;
  carePlan: Bound<typeof fhirCarePlan>;
  chargeItem: Bound<typeof fhirChargeItem>;
  claim: Bound<typeof fhirClaim>;
  claimResponse: Bound<typeof fhirClaimResponse>;
  clinicalImpression: Bound<typeof fhirClinicalImpression>;
  composition: Bound<typeof fhirComposition>;
  condition: Bound<typeof fhirCondition>;
  coverage: Bound<typeof fhirCoverage>;
  coverageEligibilityRequest: Bound<typeof fhirCoverageEligibilityRequest>;
  coverageEligibilityResponse: Bound<typeof fhirCoverageEligibilityResponse>;
  diagnosticReport: Bound<typeof fhirDiagnosticReport>;
  encounter: Bound<typeof fhirEncounter>;
  episodeOfCare: Bound<typeof fhirEpisodeOfCare>;
  familyMemberHistory: Bound<typeof fhirFamilyMemberHistory>;
  healthcareService: Bound<typeof fhirHealthcareService>;
  imagingStudy: Bound<typeof fhirImagingStudy>;
  immunization: Bound<typeof fhirImmunization>;
  invoice: Bound<typeof fhirInvoice>;
  location: Bound<typeof fhirLocation>;
  medication: Bound<typeof fhirMedication>;
  medicationDispense: Bound<typeof fhirMedicationDispense>;
  medicationRequest: Bound<typeof fhirMedicationRequest>;
  observationTtv: Bound<typeof fhirObservationTtv>;
  organization: Bound<typeof fhirOrganization>;
  patient: Bound<typeof fhirPatient>;
  paymentNotice: Bound<typeof fhirPaymentNotice>;
  paymentReconciliation: Bound<typeof fhirPaymentReconciliation>;
  practitioner: Bound<typeof fhirPractitioner>;
  practitionerRole: Bound<typeof fhirPractitionerRole>;
  procedure: Bound<typeof fhirProcedure>;
  questionnaireResponse: Bound<typeof fhirQuestionnaireResponse>;
  relatedPerson: Bound<typeof fhirRelatedPerson>;
  serviceRequest: Bound<typeof fhirServiceRequest>;
  slot: Bound<typeof fhirSlot>;
  specimen: Bound<typeof fhirSpecimen>;
};

/** Rawat Jalan outpatient workflow namespaces. */
export type RawatJalanNamespaces = {
  anamnesis: Bound<typeof rjAnamnesis>;
  caraKeluar: Bound<typeof rjCaraKeluar>;
  diagnosis: Bound<typeof rjDiagnosis>;
  hasilPemeriksaanFisik: Bound<typeof rjHasilPemeriksaanFisik>;
  instruksiMedik: Bound<typeof rjInstruksiMedik>;
  kondisiKeluar: Bound<typeof rjKondisiKeluar>;
  pemeriksaanFungsional: Bound<typeof rjPemeriksaanFungsional>;
  pemeriksaanPenunjang: Bound<typeof rjPemeriksaanPenunjang>;
  pendaftaran: Bound<typeof rjPendaftaran>;
  penilaianRisiko: Bound<typeof rjPenilaianRisiko>;
  prognosis: Bound<typeof rjPrognosis>;
  rasionalKlinis: Bound<typeof rjRasionalKlinis>;
  rencanaRawatPasien: Bound<typeof rjRencanaRawatPasien>;
  rencanaTindakLanjut: Bound<typeof rjRencanaTindakLanjut>;
  resumeMedis: Bound<typeof rjResumeMedis>;
  riwayatPenyakit: Bound<typeof rjRiwayatPenyakit>;
  tatalaksana: Bound<typeof rjTatalaksana>;
  tindakanProsedur: Bound<typeof rjTindakanProsedur>;
  tujuanPerawatan: Bound<typeof rjTujuanPerawatan>;
  variasiRtl: Bound<typeof rjVariasiRtl>;
  bundle: Bound<typeof rjBundle>;
};

/** Dental (Gigi) outpatient workflow namespaces. */
export type GigiNamespaces = {
  anamnesis: Bound<typeof gigiAnamnesis>;
  caraKeluar: Bound<typeof gigiCaraKeluar>;
  diagnosis: Bound<typeof gigiDiagnosis>;
  odontogram: Bound<typeof gigiOdontogram>;
  kondisiKeluar: Bound<typeof gigiKondisiKeluar>;
  pemeriksaanFisik: Bound<typeof gigiPemeriksaanFisik>;
  pemeriksaanPenunjang: Bound<typeof gigiPemeriksaanPenunjang>;
  pendaftaran: Bound<typeof gigiPendaftaran>;
  rencanaTindakLanjut: Bound<typeof gigiRencanaTindakLanjut>;
  tatalaksana: Bound<typeof gigiTatalaksana>;
  tindakan: Bound<typeof gigiTindakan>;
  bundle: Bound<typeof gigiBundle>;
};

/** Private insurance claim namespaces. */
export type KlaimSwastaNamespaces = {
  primaryPayor: Bound<typeof klaimSwastaPrimary>;
  secondaryPayor: Bound<typeof klaimSwastaSecondary>;
  tpa: Bound<typeof klaimSwastaTpa>;
  oop: Bound<typeof klaimSwastaOop>;
  komunikasi: Bound<typeof klaimSwastaKomunikasi>;
  webhook: Bound<typeof webhook>;
};

/** BPJS-Kesehatan claim namespaces. */
export type KlaimBpjsNamespaces = {
  variabel: Bound<typeof klaimBpjsVariabel>;
  contohKlaim: Bound<typeof klaimBpjsContoh>;
};

/** All namespaces attached to a client by `createSatuSehatClient`. */
export type SatuSehatNamespaces = {
  auth: Bound<typeof auth>;
  organization: Bound<typeof organization>;
  search: Bound<typeof search>;
  regions: Bound<typeof regions>;
  sarana: Bound<typeof sarana>;
  kfaPrice: Bound<typeof kfaPrice>;
  kfaProducts: Bound<typeof kfaProducts>;
  kfaAlkes: Bound<typeof kfaAlkes>;
  kyc: Bound<typeof kyc>;
  rme: Bound<typeof rme>;
  fhir: FhirNamespaces;
  rawatJalan: RawatJalanNamespaces;
  gigi: GigiNamespaces;
  klaimSwasta: KlaimSwastaNamespaces;
  klaimBpjs: KlaimBpjsNamespaces;
};

export interface SatuSehatClientWithModules extends SatuSehatClient, SatuSehatNamespaces {}

/**
 * Recommended entry point: a SatuSehatClient with every namespace attached
 * and pre-bound (the `client` argument is supplied for you):
 *
 * ```ts
 * const satusehat = createSatuSehatClient({ token, environment: "staging" });
 * const token = await satusehat.auth.getAccessToken({ clientId, clientSecret });
 * satusehat.setToken(token.accessToken);
 * const patients = await satusehat.search.searchPatient({ name: "Budi" });
 * const bundle = await satusehat.rawatJalan.bundle.submitVisitBundle(entries);
 * ```
 */
export function createSatuSehatClient(config: SatuSehatClientConfig): SatuSehatClientWithModules {
  const client = new SatuSehatClient(config) as SatuSehatClientWithModules;
  Object.assign(client, {
    auth: bindModule(client, auth),
    organization: bindModule(client, organization),
    search: bindModule(client, search),
    regions: bindModule(client, regions),
    sarana: bindModule(client, sarana),
    kfaPrice: bindModule(client, kfaPrice),
    kfaProducts: bindModule(client, kfaProducts),
    kfaAlkes: bindModule(client, kfaAlkes),
    kyc: bindModule(client, kyc),
    rme: bindModule(client, rme),
    fhir: {
      account: bindModule(client, fhirAccount),
      allergyIntolerance: bindModule(client, fhirAllergyIntolerance),
      appointment: bindModule(client, fhirAppointment),
      appointmentResponse: bindModule(client, fhirAppointmentResponse),
      carePlan: bindModule(client, fhirCarePlan),
      chargeItem: bindModule(client, fhirChargeItem),
      claim: bindModule(client, fhirClaim),
      claimResponse: bindModule(client, fhirClaimResponse),
      clinicalImpression: bindModule(client, fhirClinicalImpression),
      composition: bindModule(client, fhirComposition),
      condition: bindModule(client, fhirCondition),
      coverage: bindModule(client, fhirCoverage),
      coverageEligibilityRequest: bindModule(client, fhirCoverageEligibilityRequest),
      coverageEligibilityResponse: bindModule(client, fhirCoverageEligibilityResponse),
      diagnosticReport: bindModule(client, fhirDiagnosticReport),
      encounter: bindModule(client, fhirEncounter),
      episodeOfCare: bindModule(client, fhirEpisodeOfCare),
      familyMemberHistory: bindModule(client, fhirFamilyMemberHistory),
      healthcareService: bindModule(client, fhirHealthcareService),
      imagingStudy: bindModule(client, fhirImagingStudy),
      immunization: bindModule(client, fhirImmunization),
      invoice: bindModule(client, fhirInvoice),
      location: bindModule(client, fhirLocation),
      medication: bindModule(client, fhirMedication),
      medicationDispense: bindModule(client, fhirMedicationDispense),
      medicationRequest: bindModule(client, fhirMedicationRequest),
      observationTtv: bindModule(client, fhirObservationTtv),
      organization: bindModule(client, fhirOrganization),
      patient: bindModule(client, fhirPatient),
      paymentNotice: bindModule(client, fhirPaymentNotice),
      paymentReconciliation: bindModule(client, fhirPaymentReconciliation),
      practitioner: bindModule(client, fhirPractitioner),
      practitionerRole: bindModule(client, fhirPractitionerRole),
      procedure: bindModule(client, fhirProcedure),
      questionnaireResponse: bindModule(client, fhirQuestionnaireResponse),
      relatedPerson: bindModule(client, fhirRelatedPerson),
      serviceRequest: bindModule(client, fhirServiceRequest),
      slot: bindModule(client, fhirSlot),
      specimen: bindModule(client, fhirSpecimen),
    },
    rawatJalan: {
      anamnesis: bindModule(client, rjAnamnesis),
      caraKeluar: bindModule(client, rjCaraKeluar),
      diagnosis: bindModule(client, rjDiagnosis),
      hasilPemeriksaanFisik: bindModule(client, rjHasilPemeriksaanFisik),
      instruksiMedik: bindModule(client, rjInstruksiMedik),
      kondisiKeluar: bindModule(client, rjKondisiKeluar),
      pemeriksaanFungsional: bindModule(client, rjPemeriksaanFungsional),
      pemeriksaanPenunjang: bindModule(client, rjPemeriksaanPenunjang),
      pendaftaran: bindModule(client, rjPendaftaran),
      penilaianRisiko: bindModule(client, rjPenilaianRisiko),
      prognosis: bindModule(client, rjPrognosis),
      rasionalKlinis: bindModule(client, rjRasionalKlinis),
      rencanaRawatPasien: bindModule(client, rjRencanaRawatPasien),
      rencanaTindakLanjut: bindModule(client, rjRencanaTindakLanjut),
      resumeMedis: bindModule(client, rjResumeMedis),
      riwayatPenyakit: bindModule(client, rjRiwayatPenyakit),
      tatalaksana: bindModule(client, rjTatalaksana),
      tindakanProsedur: bindModule(client, rjTindakanProsedur),
      tujuanPerawatan: bindModule(client, rjTujuanPerawatan),
      variasiRtl: bindModule(client, rjVariasiRtl),
      bundle: bindModule(client, rjBundle),
    },
    gigi: {
      anamnesis: bindModule(client, gigiAnamnesis),
      caraKeluar: bindModule(client, gigiCaraKeluar),
      diagnosis: bindModule(client, gigiDiagnosis),
      odontogram: bindModule(client, gigiOdontogram),
      kondisiKeluar: bindModule(client, gigiKondisiKeluar),
      pemeriksaanFisik: bindModule(client, gigiPemeriksaanFisik),
      pemeriksaanPenunjang: bindModule(client, gigiPemeriksaanPenunjang),
      pendaftaran: bindModule(client, gigiPendaftaran),
      rencanaTindakLanjut: bindModule(client, gigiRencanaTindakLanjut),
      tatalaksana: bindModule(client, gigiTatalaksana),
      tindakan: bindModule(client, gigiTindakan),
      bundle: bindModule(client, gigiBundle),
    },
    klaimSwasta: {
      primaryPayor: bindModule(client, klaimSwastaPrimary),
      secondaryPayor: bindModule(client, klaimSwastaSecondary),
      tpa: bindModule(client, klaimSwastaTpa),
      oop: bindModule(client, klaimSwastaOop),
      komunikasi: bindModule(client, klaimSwastaKomunikasi),
      webhook: bindModule(client, webhook),
    },
    klaimBpjs: {
      variabel: bindModule(client, klaimBpjsVariabel),
      contohKlaim: bindModule(client, klaimBpjsContoh),
    },
  });
  return client;
}

export { getAccessToken, authenticate } from "./common/auth.js";
