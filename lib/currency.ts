import { createServerSupabaseClient } from "@/lib/supabase";
import { formatCurrency } from "@/lib/utils";

const FX_API = "https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/usd.json";
const GEO_API = "https://get.geojs.io/v1/ip/country.json";
const FX_FALLBACK = "https://api.exchangerate.host/latest?base=USD";

// VI: Ánh xạ quốc gia -> tiền tệ mặc định để hiển thị giá bản địa.
// EN: Country to default currency mapping for localized plan pricing.
const COUNTRY_TO_CURRENCY: Record<string, string> = {
  VN: "VND",
  US: "USD",
  GB: "GBP",
  DE: "EUR",
  FR: "EUR",
  IT: "EUR",
  ES: "EUR",
  JP: "JPY",
  KR: "KRW",
  SG: "SGD",
  CA: "CAD",
  AU: "AUD",
  IN: "INR"
};

type FxResponse = {
  date: string;
  usd: Record<string, number>;
};

type GeoResponse = {
  country?: string;
  country_code?: string;
};

async function fetchGeoCountryCode(): Promise<string> {
  try {
    const response = await fetch(GEO_API, { next: { revalidate: 3600 } });
    if (!response.ok) return "US";
    const data = (await response.json()) as GeoResponse;
    return data.country_code ?? data.country ?? "US";
  } catch {
    return "US";
  }
}

function regionMultiplier(countryCode: string) {
  const lowCost = new Set(["VN", "IN", "PH", "ID"]);
  const highCost = new Set(["US", "GB", "DE", "FR", "JP"]);
  if (lowCost.has(countryCode)) return 0.9;
  if (highCost.has(countryCode)) return 1.08;
  return 1;
}

async function fetchRateFromApi(currencyCode: string): Promise<number> {
  const fxRes = await fetch(FX_API, { next: { revalidate: 3600 } });
  if (fxRes.ok) {
    const fxData = (await fxRes.json()) as FxResponse;
    const code = currencyCode.toLowerCase();
    const rate = fxData.usd?.[code];
    if (rate && Number.isFinite(rate)) return rate;
  }

  const fallbackRes = await fetch(FX_FALLBACK, { next: { revalidate: 3600 } });
  if (!fallbackRes.ok) throw new Error("Currency fallback API failed");
  const fallbackData = (await fallbackRes.json()) as { rates: Record<string, number> };
  const fallbackRate = fallbackData.rates?.[currencyCode.toUpperCase()];
  if (!fallbackRate) throw new Error(`Currency ${currencyCode} is unavailable`);
  return fallbackRate;
}

export async function getRateWithCache(currencyCode: string, cookieStore: Parameters<typeof createServerSupabaseClient>[0]) {
  const normalizedCode = currencyCode.toUpperCase();
  const supabase = createServerSupabaseClient(cookieStore);
  const { data: row } = await supabase
    .from("currency_rates")
    .select("currency_code,rate_to_usd,last_updated")
    .eq("currency_code", normalizedCode)
    .maybeSingle();

  const now = Date.now();
  if (row?.last_updated) {
    const updatedAt = new Date(row.last_updated).getTime();
    if (now - updatedAt < 24 * 60 * 60 * 1000) {
      return Number(row.rate_to_usd);
    }
  }

  const liveRate = await fetchRateFromApi(normalizedCode);
  await supabase.from("currency_rates").upsert(
    {
      currency_code: normalizedCode,
      rate_to_usd: liveRate,
      last_updated: new Date().toISOString()
    },
    { onConflict: "currency_code" }
  );

  return liveRate;
}

export async function getLocalizedPrice(
  baseUsdPrice: number,
  cookieStore: Parameters<typeof createServerSupabaseClient>[0]
) {
  const country = await fetchGeoCountryCode();
  const currency = COUNTRY_TO_CURRENCY[country] ?? "USD";
  const rate = await getRateWithCache(currency, cookieStore);
  const adjustedUsd = baseUsdPrice * regionMultiplier(country);
  const converted = adjustedUsd * rate;

  return {
    country,
    currency,
    rate,
    baseUsdPrice,
    adjustedUsd,
    converted,
    formatted: formatCurrency(converted, currency)
  };
}
