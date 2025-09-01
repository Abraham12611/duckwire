export default function BiasBar({ left=33, center=34, right=33 }) {
  const total = Math.max(1, left + center + right);
  const l = Math.round((left / total) * 100);
  const c = Math.round((center / total) * 100);
  const r = Math.round((right / total) * 100);
  return (
    <div className="w-full">
      <div className="flex h-2 w-full overflow-hidden rounded-full">
        <div className="bg-bias-left-500" style={{ width: `${l}%` }} />
        <div className="bg-bias-center-400" style={{ width: `${c}%` }} />
        <div className="bg-bias-right-500" style={{ width: `${r}%` }} />
      </div>
      <div className="mt-1 text-xs text-gray-600">L {l}% · C {c}% · R {r}%</div>
    </div>
  );
}
