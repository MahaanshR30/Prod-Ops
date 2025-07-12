import React from 'react';
import { SeatAllocation } from "@/components/SeatAllocation";

const Seats = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Seat Allocation</h1>
          <p className="text-slate-600 mt-1">Manage seating arrangements and workspace allocation</p>
        </div>
        
        <SeatAllocation />
      </div>
    </div>
  );
};

export default Seats;