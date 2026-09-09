"use client";
import { ChevronUp } from "lucide-react";
import { scrollToId } from "../utils/scroll";

export default function ScrollTop({ show }) {
  if (!show) return null;
  return (
    <button onClick={() => scrollToId("home")} className="fixed bottom-6 right-6 z-50 grid place-items-center w-11 h-11 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg hover:opacity-90 transition">
      <ChevronUp size={20} />
    </button>
  );
}