export default function SubscribePage() {
  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <h1 className="text-2xl font-bold">Subscribe to DuckWire</h1>
      <p className="text-gray-700">Unlock ownership, factuality and bias insights, plus premium features.</p>
      <div className="grid md:grid-cols-2 gap-4">
        <div className="border rounded p-4 bg-white">
          <h2 className="font-semibold mb-2">Free</h2>
          <ul className="text-sm text-gray-600 list-disc list-inside">
            <li>Daily reading limit</li>
            <li>Basic search</li>
          </ul>
        </div>
        <div className="border rounded p-4 bg-white">
          <h2 className="font-semibold mb-2">Vantage</h2>
          <ul className="text-sm text-gray-600 list-disc list-inside">
            <li>Unlimited reading</li>
            <li>Factuality & Ownership</li>
            <li>Advanced search + alerts</li>
          </ul>
          <button className="mt-3 w-full bg-black text-white rounded py-2">Upgrade</button>
        </div>
      </div>
    </div>
  );
}
