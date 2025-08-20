"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Star, Calendar, ShoppingBag, Wallet, MessageSquare } from "lucide-react";

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
          <ShoppingBag className="text-orange-500 mb-1" />
          <span className="font-bold text-lg">5</span>
          <span className="text-sm text-gray-500">Today’s Orders</span>
        </Card>
        <Card className="p-4 flex flex-col items-center justify-center">
          <Star className="text-yellow-500 mb-1" />
          <span className="font-bold text-lg">4.8</span>
          <span className="text-sm text-gray-500">Rating</span>
        </Card>
        <Card className="p-4 flex flex-col items-center justify-center">
          <Wallet className="text-green-500 mb-1" />
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
                  <Button size="sm" variant="outline">Decline</Button>
                  <Button size="sm">Accept</Button>
                </div>
              </div>
              <div className="p-3 border rounded-lg flex justify-between items-center">
                <div>
                  <p className="font-medium">Veg Thali × 1</p>
                  <p className="text-sm text-gray-500">Sneha | 2:00 PM</p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline">Decline</Button>
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
          <Calendar size={16} /> Availability
        </Button>
        <Button variant="outline" className="flex items-center gap-2">
          <MessageSquare size={16} /> Chats
        </Button>
      </div>
    </div>
  );
}
