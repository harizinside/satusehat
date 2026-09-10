# Master Data dan KFA

Semua di bawah ini **confirmed jalan** ke sandbox staging, kecuali yang ditandai dead di bagian bawah.

## Master Wilayah

```ts
await client.regions.getProvinces({ codes: "11,12" });
await client.regions.getCities({ provinceCodes: "11" });
await client.regions.getDistricts({ cityCodes: "1103" });
await client.regions.getSubDistricts({ districtCodes: "110301" });

// V2 — cursor-paginated
await client.regions.getProvincesV2({ currentPage: 1 });
await client.regions.getCitiesV2({ currentPage: 1, provinceCodes: "11" });
```

## Master Sarana Index

```ts
await client.sarana.getMasterSarana({ page: 1, limit: 10 });
```

## KFA (Katalog Farmasi Alkes)

```ts
await client.kfaPrice.getPriceJkn({ page: 1, limit: 10, kfaCode: "92000372" });
await client.kfaProducts.getProductDetailV2({ identifier: "kfa", code: "93000108" });
await client.kfaProducts.getAllProductsV2({ page: 1, size: 10, productType: "farmasi" });
await client.kfaAlkes.getAlkesTemplates({ page: 1, size: 10 });
await client.kfaAlkes.getAlkesProducts({ page: 1, size: 10 });
```

## ⚠️ Endpoint yang udah mati (jangan dipake)

`kfaProducts.getAtcMetadata`, `getProductsByAtc`, `getTagMetadata`, `getProductsByTag` — semuanya `404 Not Found` beneran di server, dan dokumentasi resmi KFA saat ini **nggak nyebut endpoint ini sama sekali lagi**. Data ATC sekarang cuma muncul sebagai field di response `getProductDetailV2`/`getAllProductsV2`, bukan endpoint terpisah.

Fungsi-fungsi ini masih ada di SDK (ditandai `@deprecated` di kode) buat dokumentasi historis, tapi jangan dipake buat kode baru — pake `getAllProductsV2` sebagai gantinya.
