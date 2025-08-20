"use client";

import { useState, useRef, Fragment } from "react";
import ProfileCreation from "./ProfileCreation";

export default function LoginPage() {
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);

  const [aadhaar, setAadhaar] = useState(["", "", ""]);
  const [aadhaarOtpSent, setAadhaarOtpSent] = useState(false);
  const [aadhaarOtp, setAadhaarOtp] = useState(["", "", "", "", "", ""]);
  const [aadhaarVerified, setAadhaarVerified] = useState(false);

  // inline message
  const [message, setMessage] = useState<{ type: "success" | "error" | "info"; text: string } | null>(null);

  // ---------- Refs for auto-focus ----------
  const otpRefs = useRef<Array<HTMLInputElement | null>>([]);
  const aadhaarRefs = useRef<Array<HTMLInputElement | null>>([]);
  const aadhaarOtpRefs = useRef<Array<HTMLInputElement | null>>([]);

  // ---------- PHONE OTP (6 boxes) ----------
  const handleOtpChange = (i: number, val: string) => {
    const v = val.replace(/\D/g, "").slice(0, 1);
    const next = [...otp];
    next[i] = v;
    setOtp(next);
    if (v && i < otpRefs.current.length - 1) {
      otpRefs.current[i + 1]?.focus();
    }
  };
  const handleOtpKeyDown = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && otp[i] === "" && i > 0) {
      otpRefs.current[i - 1]?.focus();
    }
    if (e.key === "ArrowLeft" && i > 0) otpRefs.current[i - 1]?.focus();
    if (e.key === "ArrowRight" && i < otpRefs.current.length - 1) otpRefs.current[i + 1]?.focus();
  };
  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const digits = (e.clipboardData.getData("text") || "").replace(/\D/g, "").slice(0, 6).split("");
    if (!digits.length) return;
    const next = [...otp];
    for (let i = 0; i < 6; i++) next[i] = digits[i] || "";
    setOtp(next);
    const focusIndex = Math.min(digits.length, 5);
    otpRefs.current[focusIndex]?.focus();
  };

  // ---------- AADHAAR NUMBER (3 boxes x 4) ----------
  const handleAadhaarChange = (i: number, val: string) => {
    const v = val.replace(/\D/g, "").slice(0, 4);
    const next = [...aadhaar];
    next[i] = v;
    setAadhaar(next);
    if (v.length === 4 && i < aadhaarRefs.current.length - 1) {
      aadhaarRefs.current[i + 1]?.focus();
    }
  };
  const handleAadhaarKeyDown = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && aadhaar[i].length === 0 && i > 0) {
      aadhaarRefs.current[i - 1]?.focus();
    }
    if (e.key === "ArrowLeft" && i > 0) aadhaarRefs.current[i - 1]?.focus();
    if (e.key === "ArrowRight" && i < aadhaarRefs.current.length - 1) aadhaarRefs.current[i + 1]?.focus();
  };
  const handleAadhaarPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const digits = (e.clipboardData.getData("text") || "").replace(/\D/g, "").slice(0, 12);
    if (!digits) return;
    const g1 = digits.slice(0, 4);
    const g2 = digits.slice(4, 8);
    const g3 = digits.slice(8, 12);
    setAadhaar([g1, g2, g3]);
    const focusIndex = digits.length <= 4 ? 0 : digits.length <= 8 ? 1 : 2;
    aadhaarRefs.current[Math.min(focusIndex, 2)]?.focus();
  };

  // ---------- AADHAAR OTP (6 boxes) ----------
  const handleAadhaarOtpChange = (i: number, val: string) => {
    const v = val.replace(/\D/g, "").slice(0, 1);
    const next = [...aadhaarOtp];
    next[i] = v;
    setAadhaarOtp(next);
    if (v && i < aadhaarOtpRefs.current.length - 1) {
      aadhaarOtpRefs.current[i + 1]?.focus();
    }
  };
  const handleAadhaarOtpKeyDown = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && aadhaarOtp[i] === "" && i > 0) {
      aadhaarOtpRefs.current[i - 1]?.focus();
    }
    if (e.key === "ArrowLeft" && i > 0) aadhaarOtpRefs.current[i - 1]?.focus();
    if (e.key === "ArrowRight" && i < aadhaarOtpRefs.current.length - 1) aadhaarOtpRefs.current[i + 1]?.focus();
  };
  const handleAadhaarOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const digits = (e.clipboardData.getData("text") || "").replace(/\D/g, "").slice(0, 6).split("");
    if (!digits.length) return;
    const next = [...aadhaarOtp];
    for (let i = 0; i < 6; i++) next[i] = digits[i] || "";
    setAadhaarOtp(next);
    const focusIndex = Math.min(digits.length, 5);
    aadhaarOtpRefs.current[focusIndex]?.focus();
  };

  // ---------- submit handlers ----------
  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone) return;
    setMessage({ type: "info", text: `OTP sent to ${phone}` });
    setOtpSent(true);
    // focus the first OTP box
    setTimeout(() => otpRefs.current[0]?.focus(), 0);
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    const enteredOtp = otp.join("");
    if (enteredOtp.length === 6) {
      setMessage({ type: "success", text: "Phone OTP verified" });
      setOtpVerified(true);
    } else {
      setMessage({ type: "error", text: "Please enter a valid OTP" });
    }
  };

  const handleSendAadhaarOtp = (e: React.FormEvent) => {
    e.preventDefault();
    const groupsFilled = aadhaar.every((g) => g.length === 4);
    if (!groupsFilled) {
      setMessage({ type: "error", text: "Please enter full 12-digit Aadhaar" });
      return;
    }
    setMessage({ type: "info", text: `Aadhaar OTP sent` });
    setAadhaarOtpSent(true);
    // focus first Aadhaar OTP box
    setTimeout(() => aadhaarOtpRefs.current[0]?.focus(), 0);
  };

  const handleVerifyAadhaarOtp = (e: React.FormEvent) => {
    e.preventDefault();
    const entered = aadhaarOtp.join("");
    if (entered.length === 6) {
      setMessage({ type: "success", text: "Aadhaar OTP verified" });
      setAadhaarVerified(true);
    } else {
      setMessage({ type: "error", text: "Invalid Aadhaar OTP" });
    }
  };

  // If Aadhaar verified, redirect to ProfileCreation
  if (aadhaarVerified) {
    return <ProfileCreation />;
  }

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-gradient-to-br from-fuchsia-500 via-purple-600 to-pink-500">
      <div className="pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full bg-white/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-fuchsia-300/30 blur-3xl" />

      <div className="relative z-10 flex min-h-screen items-center justify-center p-6">
        <div className="w-full max-w-md rounded-3xl border border-white/20 bg-white/10 p-8 shadow-2xl backdrop-blur-xl">
          {message && (
            <div
              className={`mb-4 rounded-xl px-4 py-3 text-sm font-medium ${
                message.type === "success"
                  ? "bg-green-100 text-green-800"
                  : message.type === "error"
                  ? "bg-red-100 text-red-800"
                  : "bg-blue-100 text-blue-800"
              }`}
            >
              {message.text}
            </div>
          )}

          {/* Branding */}
          <div className="mb-8 flex items-center gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-tr from-fuchsia-400 via-purple-500 to-pink-500 text-white shadow-lg">
              <span className="text-xl font-black">HE</span>
            </div>
            <div>
              <h1 className="bg-gradient-to-r from-white to-fuchsia-100 bg-clip-text text-2xl font-extrabold tracking-tight text-transparent">
                HoodEase
              </h1>
            </div>
          </div>

          {/* Phone step */}
          {!otpSent && (
            <form onSubmit={handleSendOtp} className="space-y-5">
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-white/80">Phone number</span>
                <div className="group relative flex items-center rounded-2xl bg-white/90 ring-1 ring-black/5 focus-within:ring-2 focus-within:ring-fuchsia-400">
                  <span className="pl-4 pr-2 text-sm text-gray-600 select-none">+91</span>
                  <input
                    type="tel"
                    inputMode="numeric"
                    autoComplete="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/[^0-9]/g, "").slice(0, 10))}
                    placeholder="98765 43210"
                    className="w-full rounded-2xl bg-transparent px-3 py-3 text-gray-900 placeholder:text-gray-400 focus:outline-none"
                    aria-label="Phone number"
                    required
                  />
                </div>
              </label>
              <button
                type="submit"
                className="w-full rounded-2xl bg-white px-4 py-3 font-semibold text-purple-700 shadow-lg transition-transform hover:scale-[1.01] active:scale-[0.99] hover:bg-fuchsia-50"
              >
                Send OTP
              </button>
            </form>
          )}

          {/* Phone OTP */}
          {otpSent && !otpVerified && (
            <form onSubmit={handleVerifyOtp} className="mt-2 space-y-5">
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-white/80">Enter OTP</span>
                <div className="grid grid-cols-6 gap-2 sm:gap-3">
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      ref={(el) => (otpRefs.current[index] = el)}
                      type="tel"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(index, e)}
                      onPaste={index === 0 ? handleOtpPaste : undefined}
                      onFocus={(e) => e.currentTarget.select()}
                      className="h-12 rounded-xl bg-white/90 ring-1 ring-black/5 text-center text-lg font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-fuchsia-400 w-full"
                    />
                  ))}
                </div>
              </label>
              <button
                type="submit"
                className="w-full rounded-2xl bg-white px-4 py-3 font-semibold text-purple-700 shadow-lg transition-transform hover:scale-[1.01] active:scale-[0.99] hover:bg-fuchsia-50"
              >
                Verify OTP
              </button>
            </form>
          )}

          {/* Aadhaar */}
          {otpVerified && !aadhaarOtpSent && (
            <form onSubmit={handleSendAadhaarOtp} className="mt-2 space-y-5">
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-white/80">Enter Aadhaar Number</span>
                <div className="flex items-center justify-between gap-2 sm:gap-3">
                  {aadhaar.map((group, index) => (
                    <Fragment key={index}>
                      <input
                        ref={(el) => (aadhaarRefs.current[index] = el)}
                        type="tel"
                        inputMode="numeric"
                        maxLength={4}
                        value={group}
                        onChange={(e) => handleAadhaarChange(index, e.target.value)}
                        onKeyDown={(e) => handleAadhaarKeyDown(index, e)}
                        onPaste={index === 0 ? handleAadhaarPaste : undefined}
                        onFocus={(e) => e.currentTarget.select()}
                        placeholder={index === 0 ? "1234" : index === 1 ? "5678" : "9012"}
                        className="h-12 rounded-xl bg-white/90 ring-1 ring-black/5 px-3 text-lg font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-fuchsia-400 w-full tracking-widest text-center"
                      />
                      {index < 2 && <span className="text-white text-xl font-bold">-</span>}
                    </Fragment>
                  ))}
                </div>
              </label>
              <button
                type="submit"
                className="w-full rounded-2xl bg-white px-4 py-3 font-semibold text-purple-700 shadow-lg transition-transform hover:scale-[1.01] active:scale-[0.99] hover:bg-fuchsia-50"
              >
                Send OTP
              </button>
            </form>
          )}

          {/* Aadhaar OTP */}
          {aadhaarOtpSent && !aadhaarVerified && (
            <form onSubmit={handleVerifyAadhaarOtp} className="mt-2 space-y-5">
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-white/80">Enter Aadhaar OTP</span>
                <div className="grid grid-cols-6 gap-2 sm:gap-3">
                  {aadhaarOtp.map((digit, index) => (
                    <input
                      key={index}
                      ref={(el) => (aadhaarOtpRefs.current[index] = el)}
                      type="tel"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleAadhaarOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleAadhaarOtpKeyDown(index, e)}
                      onPaste={index === 0 ? handleAadhaarOtpPaste : undefined}
                      onFocus={(e) => e.currentTarget.select()}
                      className="h-12 rounded-xl bg-white/90 ring-1 ring-black/5 text-center text-lg font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-fuchsia-400 w-full"
                    />
                  ))}
                </div>
              </label>
              <button
                type="submit"
                className="w-full rounded-2xl bg-white px-4 py-3 font-semibold text-purple-700 shadow-lg transition-transform hover:scale-[1.01] active:scale-[0.99] hover:bg-fuchsia-50"
              >
                Verify Aadhaar OTP
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
