import { useState, useRef } from "react";
import ProfileCreation from "./ProfileCreation";

type Msg = { type: "success" | "error" | "info"; text: string } | null;

export default function LoginPage() {
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState<string[]>(["", "", "", "", "", ""]);
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);

  const [aadhaar, setAadhaar] = useState<string[]>(["", "", ""]); // 3 groups x 4
  const [aadhaarOtpSent, setAadhaarOtpSent] = useState(false);
  const [aadhaarOtp, setAadhaarOtp] = useState<string[]>(["", "", "", "", "", ""]);
  const [aadhaarVerified, setAadhaarVerified] = useState(false);

  const [message, setMessage] = useState<Msg>(null);

  // Refs for focus management
  const otpRefs = useRef<Array<HTMLInputElement | null>>([]);
  const aadhaarRefs = useRef<Array<HTMLInputElement | null>>([]);
  const aadhaarOtpRefs = useRef<Array<HTMLInputElement | null>>([]);

  const onlyDigits = (s: string) => s.replace(/\D/g, "");

  const focusAt = (refs: Array<HTMLInputElement | null>, i: number) => {
    const el = refs[i];
    if (el) {
      el.focus();
      el.select?.();
    }
  };

  // -------- Phone OTP: per-digit --------
  const handleOtpChange = (idx: number, raw: string) => {
    const v = onlyDigits(raw).slice(0, 1);
    const next = [...otp];
    next[idx] = v;
    setOtp(next);
    if (v && idx < otpRefs.current.length - 1) {
      focusAt(otpRefs.current, idx + 1);
    }
  };

  const handleOtpKeyDown = (idx: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    const key = e.key;
    if (key === "Backspace" && !otp[idx] && idx > 0) {
      e.preventDefault();
      const next = [...otp];
      next[idx - 1] = "";
      setOtp(next);
      focusAt(otpRefs.current, idx - 1);
    } else if (key === "ArrowLeft" && idx > 0) {
      focusAt(otpRefs.current, idx - 1);
    } else if (key === "ArrowRight" && idx < otpRefs.current.length - 1) {
      focusAt(otpRefs.current, idx + 1);
    }
  };

  const handleOtpPaste = (idx: number, e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const digits = onlyDigits(e.clipboardData.getData("text")).slice(0, otp.length - idx);
    if (!digits) return;
    const next = [...otp];
    for (let i = 0; i < digits.length; i++) next[idx + i] = digits[i];
    setOtp(next);
    const last = Math.min(idx + digits.length, otpRefs.current.length - 1);
    focusAt(otpRefs.current, last);
  };

  // -------- Aadhaar number: 3 groups x 4 --------
  const handleAadhaarChange = (idx: number, raw: string) => {
    const v = onlyDigits(raw).slice(0, 4);
    const next = [...aadhaar];
    next[idx] = v;
    setAadhaar(next);
    if (v.length === 4 && idx < aadhaarRefs.current.length - 1) {
      focusAt(aadhaarRefs.current, idx + 1);
    }
  };

  const handleAadhaarKeyDown = (idx: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    const key = e.key;
    if (key === "Backspace" && !aadhaar[idx] && idx > 0) {
      e.preventDefault();
      const next = [...aadhaar];
      next[idx - 1] = "";
      setAadhaar(next);
      focusAt(aadhaarRefs.current, idx - 1);
    } else if (key === "ArrowLeft" && idx > 0) {
      focusAt(aadhaarRefs.current, idx - 1);
    } else if (key === "ArrowRight" && idx < aadhaarRefs.current.length - 1) {
      focusAt(aadhaarRefs.current, idx + 1);
    }
  };

  const handleAadhaarPaste = (idx: number, e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const digits = onlyDigits(e.clipboardData.getData("text")).slice(0, 12 - idx * 4);
    if (!digits) return;
    const groups = [...aadhaar];
    let k = 0;
    for (let g = idx; g < 3; g++) {
      const space = 4;
      const take = Math.min(space, digits.length - k);
      groups[g] = digits.slice(k, k + take);
      k += take;
      if (k >= digits.length) break;
    }
    setAadhaar(groups);
    const targetGroup =
      groups[idx].length < 4 ? idx : groups[idx + 1]?.length < 4 ? idx + 1 : Math.min(2, idx + 2);
    focusAt(aadhaarRefs.current, targetGroup);
  };

  // -------- Aadhaar OTP: per-digit --------
  const handleAadhaarOtpChange = (idx: number, raw: string) => {
    const v = onlyDigits(raw).slice(0, 1);
    const next = [...aadhaarOtp];
    next[idx] = v;
    setAadhaarOtp(next);
    if (v && idx < aadhaarOtpRefs.current.length - 1) {
      focusAt(aadhaarOtpRefs.current, idx + 1);
    }
  };

  const handleAadhaarOtpKeyDown = (idx: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    const key = e.key;
    if (key === "Backspace" && !aadhaarOtp[idx] && idx > 0) {
      e.preventDefault();
      const next = [...aadhaarOtp];
      next[idx - 1] = "";
      setAadhaarOtp(next);
      focusAt(aadhaarOtpRefs.current, idx - 1);
    } else if (key === "ArrowLeft" && idx > 0) {
      focusAt(aadhaarOtpRefs.current, idx - 1);
    } else if (key === "ArrowRight" && idx < aadhaarOtpRefs.current.length - 1) {
      focusAt(aadhaarOtpRefs.current, idx + 1);
    }
  };

  const handleAadhaarOtpPaste = (idx: number, e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const digits = onlyDigits(e.clipboardData.getData("text")).slice(0, aadhaarOtp.length - idx);
    if (!digits) return;
    const next = [...aadhaarOtp];
    for (let i = 0; i < digits.length; i++) next[idx + i] = digits[i];
    setAadhaarOtp(next);
    const last = Math.min(idx + digits.length, aadhaarOtpRefs.current.length - 1);
    focusAt(aadhaarOtpRefs.current, last);
  };

  // -------- existing handlers (unchanged) --------
  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone) return;
    setMessage({ type: "info", text: `OTP sent to ${phone}` });
    setOtpSent(true);
    // focus first OTP cell
    setTimeout(() => focusAt(otpRefs.current, 0), 0);
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
    setTimeout(() => focusAt(aadhaarOtpRefs.current, 0), 0);
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
                    onChange={(e) => setPhone(onlyDigits(e.target.value).slice(0, 10))}
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
                      ref={(el) => { otpRefs.current[index] = el; }}
                      type="tel"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(index, e)}
                      onPaste={(e) => handleOtpPaste(index, e)}
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

          {/* Aadhaar number */}
          {otpVerified && !aadhaarOtpSent && (
            <form onSubmit={handleSendAadhaarOtp} className="mt-2 space-y-5">
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-white/80">Enter Aadhaar Number</span>
                <div className="flex items-center justify-between gap-2 sm:gap-3">
                  {aadhaar.map((group, index) => (
                    <div key={index} className="flex items-center gap-2 sm:gap-3 w-full">
                      <input
                        ref={(el) => { aadhaarRefs.current[index] = el; }}
                        type="tel"
                        inputMode="numeric"
                        maxLength={4}
                        value={group}
                        onChange={(e) => handleAadhaarChange(index, e.target.value)}
                        onKeyDown={(e) => handleAadhaarKeyDown(index, e)}
                        onPaste={(e) => handleAadhaarPaste(index, e)}
                        onFocus={(e) => e.currentTarget.select()}
                        placeholder={index === 0 ? "1234" : index === 1 ? "5678" : "9012"}
                        className="h-12 rounded-xl bg-white/90 ring-1 ring-black/5 px-3 text-lg font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-fuchsia-400 w-full tracking-widest text-center"
                      />
                      {index < 2 && <span className="text-white text-xl font-bold select-none">-</span>}
                    </div>
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
                      ref={(el) => { aadhaarOtpRefs.current[index] = el; }}
                      type="tel"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleAadhaarOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleAadhaarOtpKeyDown(index, e)}
                      onPaste={(e) => handleAadhaarOtpPaste(index, e)}
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
