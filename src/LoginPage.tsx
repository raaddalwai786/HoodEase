import { useState } from "react";
import React from "react";
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

  // handlers (simplified, with inline messages instead of alerts)
  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone) return;
    setMessage({ type: "info", text: `OTP sent to ${phone}` });
    setOtpSent(true);
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
                      type="tel"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => {
                        const next = [...otp];
                        next[index] = e.target.value;
                        setOtp(next);
                      }}
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
  <React.Fragment key={index}>
    <input
      type="tel"
      inputMode="numeric"
      maxLength={4}
      value={group}
      onChange={(e) => {
        const next = [...aadhaar];
        next[index] = e.target.value;
        setAadhaar(next);
      }}
      placeholder={index === 0 ? "1234" : index === 1 ? "5678" : "9012"}
      className="h-12 rounded-xl bg-white/90 ring-1 ring-black/5 px-3 text-lg font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-fuchsia-400 w-full tracking-widest text-center"
    />
    {index < 2 && <span className="text-white text-xl font-bold">-</span>}
  </React.Fragment>
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
                      type="tel"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => {
                        const next = [...aadhaarOtp];
                        next[index] = e.target.value;
                        setAadhaarOtp(next);
                      }}
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
