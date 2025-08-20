"use client";

import React, { useState } from "react";

/* ---- Minimal UI primitives (drop-in) ---- */
function Card({ className = "", children }: { className?: string; children: React.ReactNode }) {
  return (
    <div className={`rounded-xl border border-black/5 bg-white shadow-sm ${className}`}>{children}</div>
  );
}
function CardContent({ className = "", children }: { className?: string; children: React.ReactNode }) {
  return <div className={className}>{children}</div>;
}
function Button({
  className = "",
  variant,
  size,
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "default" | "outline"; size?: "sm" | "md" }) {
  const base =
    "inline-flex items-center justify-center rounded-lg font-medium transition active:scale-[0.99] focus:outline-none";
  const sizes = size === "sm" ? "px-3 py-1.5 text-sm" : "px-4 py-2";
  const variants =
    variant === "outline"
      ? "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
      : "bg-orange-500 text-white hover:bg-orange-600";
  return (
    <button className={`${base} ${sizes} ${variants} ${className}`} {...props}>
      {children}
    </button>
  );
}
function Switch({
  defaultChecked,
  onChange,
  className = "",
}: {
  defaultChecked?: boolean;
  onChange?: (checked: boolean) => void;
  className?: string;
}) {
  const [checked, setChecked] = useState(!!defaultChecked);
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={() => {
        setChecked((c) => {
          const next = !c;
          onChange?.(next);
          return next;
        });
      }}
      className={`relative h-6 w-11 rounded-full transition ${
        checked ? "bg-green-500" : "bg-gray-300"
      } ${className}`}
    >
      <span
        className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition ${
          checked ? "left-6" : "left-0.5"
        }`}
      />
    </button>
  );
}
function Tabs({
  defaultValue,
  children,
}: {
  defaultValue: string;
  children: React.ReactNode;
}) {
  const [value, setValue] = useState(defaultValue);
  // @ts-ignore
  const enhanced = React.Children.map(children, (child) =>
    // @ts-ignore
    typeof child?.type === "function" || typeof child?.type === "object"
      ? // @ts-ignore
        React.cloneElement(child, { __tabsValue: value, __setTabsValue: setValue })
      : child
  );
  return <div>{enhanced}</div>;
}
function TabsList({
  className = "",
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return <div className={`inline-flex rounded-lg bg-gray-100 p-1 ${className}`}>{children}</div>;
}
function TabsTrigger({
  value,
  children,
  __tabsValue,
  __setTabsValue,
}: {
  value: string;
  children: React.ReactNode;
  __tabsValue?: string;
  __setTabsValue?: (v: string) => void;
}) {
  const active = __tabsValue === value;
  return (
    <button
      onClick={() => __setTabsValue?.(value)}
      className={`px-3 py-1.5 text-sm rounded-md transition ${
        active ? "bg-white shadow-sm text-gray-900" : "text-gray-600 hover:text-gray-900"
      }`}
    >
      {children}
    </button>
  );
}
function TabsContent({
  value,
  children,
  __tabsValue,
}: {
  value: string;
  children: React.ReactNode;
  __tabsValue?: string;
}) {
  if (__tabsValue !== value) return null;
  return <div>{children}</div>;
}

/* ---- Page ---- */
export default function FoodDashboard() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white p-4 sm:p-8">
      {/* Top Section */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <Card className="p-4 flex flex-col items-center justify-center">
          <span className="text-sm text-gray-500">Accepting Orders</span>
          <Switch className="mt-2" defaultChecked />
        </Card>

        <Card className="p-4 flex flex-col items-center justify-center">
          <span className="mb-1 text-orange-500 text-xl">🛍️</span>
          <span className="font-bold text-lg">5</span>
          <span className="text-sm text-gray-500">Today’s Orders</span>
        </Card>

        <Card className="p-4 flex flex-col items-center justify-center">
          <span className="mb-1 text-yellow-500 text-xl">⭐</span>
          <span className="font-bold text-lg">4.8</span>
          <span className="text-sm text-gray-500">Rating</span>
        </Card>

        <Card className="p-4 flex flex-col items-center justify-center">
          <span className="mb-1 text-green-500 text-xl">💰</span>
          <span className="font-bold text-lg">₹850</span>
          <span className="text-sm text-gray-500">Today’s Earnings</span>
        </Card>
      </div>

      {/* Orders Section */}
      <Tabs defaultValue="orders">
        <TabsList className="mb-4">
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="menu">Menu</TabsTrigger>
          <TabsTrigger value="earnings">Earnings</TabsTrigger>
          <TabsTrigger value="feedback">Feedback</TabsTrigger>
        </TabsList>

        <TabsContent value="orders">
          <Card className="mb-4">
            <CardContent className="p-4 flex flex-col gap-2">
              <h2 className="font-semibold">New Orders</h2>

              <div className="p-3 border rounded-lg flex justify-between items-center">
                <div>
                  <p className="font-medium">Dal Chawal × 2</p>
                  <p className="text-sm text-gray-500">Rohit | 1:30 PM</p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline">
                    Decline
                  </Button>
                  <Button size="sm">Accept</Button>
                </div>
              </div>

              <div className="p-3 border rounded-lg flex justify-between items-center">
                <div>
                  <p className="font-medium">Veg Thali × 1</p>
                  <p className="text-sm text-gray-500">Sneha | 2:00 PM</p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline">
                    Decline
                  </Button>
                  <Button size="sm">Accept</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="menu">
          <Card className="p-4">
            <h2 className="font-semibold mb-2">Today’s Menu</h2>
            <div className="flex justify-between items-center p-2 border rounded mb-2">
              <span>Dal Chawal</span>
              <Switch defaultChecked />
            </div>
            <div className="flex justify-between items-center p-2 border rounded mb-2">
              <span>Roti Sabzi</span>
              <Switch />
            </div>
            <div className="flex justify-between items-center p-2 border rounded mb-2">
              <span>Paneer Curry</span>
              <Switch />
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="earnings">
          <Card className="p-4">
            <h2 className="font-semibold mb-2">Earnings Overview</h2>
            <p className="mb-2">Today: ₹850</p>
            <p className="mb-2">This Week: ₹4,200</p>
            <p className="mb-2">This Month: ₹16,500</p>
          </Card>
        </TabsContent>

        <TabsContent value="feedback">
          <Card className="p-4">
            <h2 className="font-semibold mb-2">Customer Feedback</h2>
            <div className="p-3 border rounded mb-2">
              <p className="italic">“The food tasted like home. Thank you!”</p>
              <p className="text-sm text-gray-500">- Sneha</p>
            </div>
            <div className="p-3 border rounded">
              <p className="italic">“Perfect portion size and neatly packed.”</p>
              <p className="text-sm text-gray-500">- Rohit</p>
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Bottom Utility Section */}
      <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 gap-4">
        <Button variant="outline" className="flex items-center gap-2">
          <span>📅</span> Availability
        </Button>
        <Button variant="outline" className="flex items-center gap-2">
          <span>💬</span> Chats
        </Button>
      </div>
    </div>
  );
}
