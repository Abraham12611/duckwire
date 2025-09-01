export default function MyPage() {
  return (
    <div className="space-y-3">
      <h1 className="text-xl font-semibold">For You</h1>
      <p className="text-gray-600">Personalized feed placeholder. Connect your wallet to personalize.</p>
      {[1,2,3].map((i)=>(
        <article key={i} className="border rounded p-3 bg-white">Recommended story #{i}</article>
      ))}
    </div>
  );
}
