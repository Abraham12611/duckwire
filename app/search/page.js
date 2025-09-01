export default function SearchPage({ searchParams }) {
  const q = searchParams?.q ?? "";
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Search</h1>
      <p className="text-sm text-gray-600">Results for: <span className="font-medium">{q || "(empty)"}</span></p>
      <ul className="space-y-2">
        {[1,2,3].map((i) => (
          <li key={i} className="border rounded p-3 bg-white">Sample result #{i} for "{q}"</li>
        ))}
      </ul>
    </div>
  );
}
