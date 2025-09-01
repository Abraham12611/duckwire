"use client";
import { useState } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <div className="max-w-md mx-auto border rounded-lg p-6 bg-white">
      <h1 className="text-xl font-semibold mb-4">Login</h1>
      <form className="space-y-3">
        <input value={email} onChange={(e)=>setEmail(e.target.value)} type="email" placeholder="Email" className="w-full border rounded px-3 py-2" />
        <input value={password} onChange={(e)=>setPassword(e.target.value)} type="password" placeholder="Password" className="w-full border rounded px-3 py-2" />
        <button type="submit" className="w-full bg-black text-white rounded py-2">Login</button>
      </form>
      <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
        <button className="border rounded py-2">Google</button>
        <button className="border rounded py-2">Facebook</button>
        <button className="border rounded py-2">Apple</button>
        <button className="border rounded py-2">Institution</button>
      </div>
    </div>
  );
}
