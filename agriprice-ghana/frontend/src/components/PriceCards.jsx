export default function PriceCards({ prices }) {
  if (!prices.length) {
    return <div className="card">No prices found for the current filters.</div>;
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {prices.map((item) => (
        <article key={item._id} className="card space-y-2">
          <p className="title-display text-2xl font-semibold">{item.crop}</p>
          <p className="text-sm text-slate-600">
            {item.region} - {item.market}
          </p>
          <p className="text-3xl font-bold text-emerald-700">GHS {item.price.toLocaleString()}</p>
          <p className="text-xs text-slate-500">Per {item.unit}</p>
          <p className="text-xs text-slate-500">Updated: {new Date(item.createdAt).toLocaleString()}</p>
        </article>
      ))}
    </div>
  );
}
