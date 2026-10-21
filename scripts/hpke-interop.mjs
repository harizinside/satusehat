#!/usr/bin/env node
/**
 * HPKE interop check: SDK `openHpkeMessage`/`sealHpkeMessage` vs the SATUSEHAT
 * portal's own sample (`Javascript/hpkeutils/crypto.js`, built on hpke-js).
 * Every KEM × KDF × AEAD, Auth and AuthPSK, both directions.
 *
 * The sample is downloaded from the portal into Javascript/ (gitignored);
 * without it this script skips.
 *
 * Usage:
 *   (cd Javascript && npm install) && npm run build && node scripts/hpke-interop.mjs
 */
import { existsSync } from "node:fs";

const refUrl = new URL("../Javascript/hpkeutils/crypto.js", import.meta.url);
if (!existsSync(refUrl)) {
  console.log("skip: Javascript/ not found — download the portal's JavaScript sample code into Javascript/ (gitignored)");
  process.exit(0);
}
const ref = await import(refUrl);
const sdk = await import(new URL("../dist/index.js", import.meta.url));
const KEMS=['KEM_X25519_HKDF_SHA256','KEM_X448_HKDF_SHA512','KEM_P256_HKDF_SHA256','KEM_P384_HKDF_SHA384','KEM_P521_HKDF_SHA512'];
const KDFS=['HKDF_SHA256','HKDF_SHA384','HKDF_SHA512'];
const AEADS=['AEAD_AESGCM128','AEAD_AESGCM256','AEAD_CHACHA20POLY1305'];
const te=new TextEncoder(), PT='{"hello":"dunia"}', AAD='aad-x', PSK='p'.repeat(40), PID='pid';
let ok=0, bad=0;
for (const kem of KEMS) for (const kdf of KDFS) for (const aead of AEADS) {
  const suite={kem,kdf,aead};
  for (const psk of [null, PSK]) {
    const tag=`${kem}/${kdf}/${aead}/${psk?'psk':'auth'}`;
    try {
      const r=await ref.GenerateHPKEKeyPair(kem,kdf,aead), s=await ref.GenerateHPKEKeyPair(kem,kdf,aead);
      const opts={aad:AAD, ...(psk?{psk:{key:psk,id:PID}}:{})};
      // ref seal -> sdk open
      const c1 = psk ? await ref.sealMessageAuthPSKMode(r.pubB64,s.privB64,kem,kdf,aead,te.encode(PT),te.encode(AAD),psk,PID)
                     : await ref.sealMessageAuthMode(r.pubB64,s.privB64,kem,kdf,aead,te.encode(PT),te.encode(AAD));
      const p1 = sdk.openHpkeMessage(c1,r.privB64,s.pubB64,suite,opts).toString();
      // sdk seal -> ref open
      const c2 = sdk.sealHpkeMessage(PT,r.pubB64,s.privB64,suite,opts);
      const p2 = new TextDecoder().decode(psk ? await ref.openMessageAuthPSKMode(r.privB64,s.pubB64,kem,kdf,aead,c2,te.encode(AAD),psk,PID)
                     : await ref.openMessageAuthMode(r.privB64,s.pubB64,kem,kdf,aead,c2,te.encode(AAD)));
      if (p1===PT && p2===PT) ok++; else { bad++; console.log('MISMATCH',tag); }
    } catch(e){ bad++; console.log('FAIL',tag,e.message); }
  }
}
// empty AAD interop
{ const kem=KEMS[0],kdf=KDFS[0],aead=AEADS[0]; const r=await ref.GenerateHPKEKeyPair(kem,kdf,aead), s=await ref.GenerateHPKEKeyPair(kem,kdf,aead);
  const c=await ref.sealMessageAuthMode(r.pubB64,s.privB64,kem,kdf,aead,te.encode(PT),new Uint8Array());
  console.log('empty-aad', sdk.openHpkeMessage(c,r.privB64,s.pubB64,{kem,kdf,aead}).toString()===PT); }
console.log(`ok=${ok} bad=${bad}`);
process.exit(bad === 0 ? 0 : 1);
