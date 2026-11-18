// Consumer-side check: old tsc must accept the d.ts that TS 7 emitted (npm run check:ts-compat).
import * as sdk from "@harizinside/satusehat";
import * as icd10 from "@harizinside/satusehat/icd10";
import * as icd9cm from "@harizinside/satusehat/icd9cm";
export { sdk, icd10, icd9cm };
