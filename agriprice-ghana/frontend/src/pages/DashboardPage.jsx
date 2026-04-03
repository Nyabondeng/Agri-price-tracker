import { useMemo, useState } from "react";

import PriceCards from "../components/PriceCards";
import PriceTrendChart from "../components/PriceTrendChart";
import { usePrices } from "../hooks/usePrices";

const crops = ["", "Maize", "Rice", "Cassava", "Yam", "Tomatoes", "Cocoa"];
const regions = ["", "Accra", "Kumasi", "Tamale", "Sunyani", "Takoradi", "Ho"];

export default function DashboardPage() {
  const [crop, setCrop] = useState("");
  const [region, setRegion] = useState("");
  const [language, setLanguage] = useState("en");

  const filters = useMemo(() => ({ crop, region }), [crop, region]);
  const { prices, history, prediction, loading } = usePrices(filters);

  const copy = {
    en: {
      title: "This is a Real-time Commodity Dashboard",
      subtitle:
        "Find our prices for maize, rice, cassava, yam, tomatoes, and cocoa across major Ghanaian regions.",
      crop: "Crop",
      region: "Region",
      allCrops: "All crops",
      allRegions: "All regions",
      loading: "Loading prices..."
    },
    tw: {
      title: "Nnoko Nde Boapene",
      subtitle: "Hwɛ aburo, emo, bankye, bayere, ntomat, ne koko bo a aba foforo wɔ Ghana mantam mu.",
      crop: "Nnoko",
      region: "Mantam",
      allCrops: "Nnoko nyinaa",
      allRegions: "Mantam nyinaa",
      loading: "Yerefa bo no..."
    }
  }[language];

  return (
    <div className="space-y-4">
      <section className="card space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="title-display text-3xl">{copy.title}</h1>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
          >
            <option value="en">English</option>
            <option value="tw">Twi</option>
          </select>
        </div>
        <p className="max-w-3xl text-slate-700">{copy.subtitle}</p>
        <div className="grid gap-3 md:grid-cols-2">
          <label className="space-y-2 text-sm font-medium">
            {copy.crop}
            <select value={crop} onChange={(e) => setCrop(e.target.value)} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2">
              {crops.map((item) => (
                <option key={item || "all"} value={item}>
                  {item || copy.allCrops}
                </option>
              ))}
            </select>
          </label>
          <label className="space-y-2 text-sm font-medium">
            {copy.region}
            <select value={region} onChange={(e) => setRegion(e.target.value)} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2">
              {regions.map((item) => (
                <option key={item || "all"} value={item}>
                  {item || copy.allRegions}
                </option>
              ))}
            </select>
          </label>
        </div>
      </section>

      {loading ? <div className="card">{copy.loading}</div> : <PriceCards prices={prices} />}
      {prediction && (
        <section className="card">
          <h2 className="title-display text-2xl">Next Price Estimate</h2>
          <p className="mt-2 text-slate-700">
            {prediction.crop} in {prediction.region}: estimated next price is
            <span className="ml-2 text-2xl font-bold text-orange-700">GHS {prediction.predictedPrice}</span>
          </p>
          <p className="mt-1 text-xs text-slate-500">Based on {prediction.basedOnRecords} recent records.</p>
        </section>
      )}
      <PriceTrendChart history={history} />
    </div>
  );
}
