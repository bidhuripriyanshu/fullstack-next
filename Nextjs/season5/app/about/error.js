"use client";

import { useRouter } from "next/navigation"; import { startTransition } from "react";

export default function Error({ error, reset }) {
  const router = useRouter();
  return (
    <div>
      <p>Something went wrong in  client side</p>
      <button
        onClick={() => {
            reset();
        }}
      >
        Try Again
      </button>
    </div>
  );
}