export default function BlindspotPage() {
  return (
    <div className="space-y-3">
      <h1 className="text-xl font-semibold">Blindspot Feed</h1>
      {[1,2,3,4].map((i)=>(
        <article key={i} className="border rounded p-3 bg-white">Blindspot story #{i}</article>
      ))}
    </div>
  );
}
