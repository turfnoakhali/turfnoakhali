"use client";
import { useEffect, useState } from "react";
import Loading from "../shared/Loading";

export default function BookingByDate() {
  const [bookings, setBookings] = useState([]);
  const getTodayDate = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };

  const [selectedDate, setSelectedDate] = useState(getTodayDate());
  const [selectedArena, setSelectedArena] = useState("Turf Noakhali");
  const [loading, setLoading] = useState(true);

  // System's actual time slots from ManageSlotPrice.jsx
  const daySlots = [
    "05:00am to 06:00am",
    "06:00am to 07:00am",
    "07:00am to 08:00am",
    "08:00am to 09:00am",
    "09:00am to 10:00am",
    "10:00am to 11:00am",
    "11:00am to 12:00pm",
    "12:00pm to 01:00pm",
    "01:00pm to 02:00pm",
    "02:00pm to 03:00pm",
    "03:00pm to 04:00pm",
    "04:00pm to 05:00pm",
    "05:00pm to 06:00pm"
  ];
  const nightSlots = [
    "06:00pm to 07:00pm",
    "07:00pm to 08:00pm",
    "08:00pm to 09:00pm",
    "09:00pm to 10:00pm",
    "10:00pm to 11:00pm",
    "11:00pm to 12:00am",
    "12:00am to 01:00am",
    "01:00am to 02:00am",
    "02:00am to 03:00am",
    "03:00am to 04:00am",
    "04:00am to 05:00am"
  ];

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/bookings?t=" + Date.now());
      if (!res.ok) throw new Error("Failed to fetch bookings");
      const data = await res.json();
      setBookings(data);
    } catch (err) {
      console.error("BookingByDate error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const filteredBookings = bookings.filter((b) => {
    if (!b.bookingDate) return false;
    if (b.status === "cancelled") return false; // Hide cancelled bookings
    const dateObj = new Date(b.bookingDate);
    const bd = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, "0")}-${String(dateObj.getDate()).padStart(2, "0")}`;
    return bd === selectedDate && b.arenaName === selectedArena;
  });

  const getBookingForSlot = (slot) => {
    // Find booking that matches the slot (case-insensitive and trimmed)
    return filteredBookings.find((b) =>
      b.timeSlot?.toLowerCase().trim() === slot.toLowerCase().trim()
    );
  };

  const dailyTotal = filteredBookings.reduce((sum, b) => {
    return sum + (Number(b.paidAmount) || 0);
  }, 0);

  const getReceiverDisplay = (b) => {
    if (!b) return "";
    const role = b.bookingByRole || b.user?.role || "REGULAR_CUSTOMER";
    if (role === "REGULAR_CUSTOMER" || role === "GUEST" || role === "USER") {
      return b.transactionId || "";
    } else if (role === "SPECIAL_CUSTOMER") {
      return b.advanceReceiverName || b.user?.name || b.bookingForName || "";
    } else if (["SUPER_ADMIN", "GENERAL_ADMIN", "MANAGER"].includes(role)) {
      return b.advanceReceiverName || b.user?.name || "";
    }
    return b.advanceReceiverName || "";
  };

  const getSlotCategory = (slot) => {
    if (!slot) return "day";
    const s = slot.toLowerCase().trim();
    // Late nite slot: 11:00pm - 06:00am
    if (
      s.includes("11:00pm") ||
      s.includes("12:00am") ||
      s.includes("01:00am") ||
      s.includes("02:00am") ||
      s.includes("03:00am") ||
      s.includes("04:00am") ||
      s.includes("05:00am")
    ) {
      return "late";
    }
    // Night slot: 6:00pm - 11:00pm
    if (
      s.includes("06:00pm") ||
      s.includes("07:00pm") ||
      s.includes("08:00pm") ||
      s.includes("09:00pm") ||
      s.includes("10:00pm")
    ) {
      return "night";
    }
    // Day slot: 06:00am - 06:00pm
    return "day";
  };

  const ranges = [
    { start: 1, end: 4 },
    { start: 5, end: 8 },
    { start: 9, end: 12 },
    { start: 13, end: 16 },
    { start: 17, end: 20 },
    { start: 21, end: 24 },
    { start: 25, end: 28 },
    { start: 29, end: 31 },
  ];

  const getMonthlyStats = () => {
    const selectedDateObj = new Date(selectedDate);
    const month = selectedDateObj.getMonth();
    const year = selectedDateObj.getFullYear();

    const monthlyBookings = bookings.filter(b => {
      if (!b.bookingDate || b.status === 'cancelled') return false;
      const d = new Date(b.bookingDate);
      return d.getMonth() === month && d.getFullYear() === year && b.arenaName === selectedArena;
    });

    return ranges.map(range => {
      const rangeBookings = monthlyBookings.filter(b => {
        const d = new Date(b.bookingDate).getDate();
        return d >= range.start && d <= range.end;
      });

      let amount = 0;
      let dayCount = 0;
      let nightCount = 0;
      let lateCount = 0;

      rangeBookings.forEach(b => {
        amount += (Number(b.paidAmount) || 0);
        const cat = getSlotCategory(b.timeSlot || "");
        if (cat === 'day') dayCount++;
        else if (cat === 'night') nightCount++;
        else if (cat === 'late') lateCount++;
      });

      const sum = dayCount + nightCount + lateCount;
      const avg = sum > 0 ? Math.round(amount / sum) : 0;

      return {
        label: `${range.start}-${range.end}`,
        amount,
        dayCount,
        nightCount,
        lateCount,
        sum,
        avg
      };
    });
  };

  const monthlyStats = getMonthlyStats();
  const totalAmount = monthlyStats.reduce((acc, s) => acc + s.amount, 0);
  const totalDay = monthlyStats.reduce((acc, s) => acc + s.dayCount, 0);
  const totalNight = monthlyStats.reduce((acc, s) => acc + s.nightCount, 0);
  const totalLate = monthlyStats.reduce((acc, s) => acc + s.lateCount, 0);
  const totalSum = monthlyStats.reduce((acc, s) => acc + s.sum, 0);
  const overallAvg = totalSum > 0 ? Math.round(totalAmount / totalSum) : 0;

  if (loading) return <Loading />;

  return (
    <div className="booking-by-date">
      <div className="dashboard__filter-wrap">
        <div className="dashboard__filter">
          <label>Filter by date:</label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
        </div>
        <div className="dashboard__filter">
          <label>Filter by arena:</label>
          <select
            value={selectedArena}
            onChange={(e) => setSelectedArena(e.target.value)}
          >
            <option value="Turf Noakhali">Turf Noakhali</option>
            <option value="Turf Noakhali">Turf Noakhali</option>
            <option value="Time Up">Time Up</option>
          </select>
        </div>
        <div className="dashboard__filter">
          <button
            className="secondary-button"
            onClick={() => {
              setSelectedDate(getTodayDate());
              setSelectedArena("Turf Noakhali");
            }}
            style={{ marginRight: '10px', backgroundColor: '#6c757d', color: '#fff', border: 'none', padding: '8px 15px', borderRadius: '4px', cursor: 'pointer' }}
          >
            Clear Filters
          </button>
          <button className="tertiary-button" onClick={fetchBookings}>Refresh Data</button>
        </div>
      </div>

      <div className="excel-container">
        <div className="excel-header">
          <div className="excel-title">
            {new Date(selectedDate).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: '2-digit' })} - {new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long' })} {selectedArena}
          </div>
        </div>
        <div className="excel-table-wrapper">
          <table className="excel-table">
            <thead>
              <tr>
                <th>Day</th>
                <th>Name</th>
                <th>Contact</th>
                <th>Advance</th>
                <th>Receiver / TRx ID</th>
                <th>Total Receive</th>
                <th>(Due) Receiver</th>
                <th>Comment</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {daySlots.map((slot, index) => {
                const b = getBookingForSlot(slot);
                return (
                  <tr key={`day-${index}`}>
                    <td className="slot-col">{slot}</td>
                    <td>{b?.bookingForName || ""}</td>
                    <td>{b?.bookingForPhone || ""}</td>
                    <td>
                      {b?.advanceAmount > 0 ? b.advanceAmount : ""}
                    </td>
                    <td>{getReceiverDisplay(b)}</td>
                    <td>{b?.paidAmount || ""}</td>
                    <td>{b?.dueReceiverName || ""}</td>
                    <td className="comment-cell">{b?.notes || ""}</td>
                    <td className={`check-col ${b?.customerStatus === 'Call Received' ? 'status-received' :
                      b?.customerStatus === 'Call Not Received' ? 'status-not-received' :
                        b?.customerStatus === 'Phone Off' ? 'status-phone-off' : ''
                      }`}>
                      {b?.customerStatus && b?.customerStatus !== 'selected status' ? b.customerStatus : ''}
                    </td>
                  </tr>
                );
              })}
              <tr className="night-row">
                <td colSpan="9">Night</td>
              </tr>
              {nightSlots.map((slot, index) => {
                const b = getBookingForSlot(slot);
                return (
                  <tr key={`night-${index}`}>
                    <td className="slot-col">{slot}</td>
                    <td>{b?.bookingForName || ""}</td>
                    <td>{b?.bookingForPhone || ""}</td>
                    <td>
                      {b?.advanceAmount > 0 ? b.advanceAmount : ""}
                    </td>
                    <td>{getReceiverDisplay(b)}</td>
                    <td>{b?.paidAmount || ""}</td>
                    <td>{b?.dueReceiverName || ""}</td>
                    <td className="comment-cell">{b?.notes || ""}</td>
                    <td className={`check-col ${b?.customerStatus === 'Call Received' ? 'status-received' :
                      b?.customerStatus === 'Call Not Received' ? 'status-not-received' :
                        b?.customerStatus === 'Phone Off' ? 'status-phone-off' : ''
                      }`}>
                      {b?.customerStatus && b?.customerStatus !== 'selected status' ? b.customerStatus : ''}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="total-row">
                <td colSpan="5" style={{ textAlign: 'right', fontWeight: 'bold', border: 'none' }}>Daily Total:</td>
                <td style={{ fontWeight: 'bold', border: 'none' }}>৳{dailyTotal}</td>
                <td colSpan="3" style={{ border: 'none' }}></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      <div className="summary-section">
        <div className="summary-title">
          Monthly Summary: {new Date(selectedDate).toLocaleString('default', { month: 'long', year: 'numeric' })} ({selectedArena})
        </div>
        <div className="excel-table-wrapper">
          <table className="excel-table summary-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Amount</th>
                <th>Day slot</th>
                <th>Night slot (6-11 pm)</th>
                <th>late night (11-6am)</th>
                <th>→ Sum</th>
                <th>Average price</th>
              </tr>
            </thead>
            <tbody>
              {monthlyStats.map((stat, i) => (
                <tr key={i}>
                  <td className="range-label">{stat.label}</td>
                  <td>{stat.amount || ""}</td>
                  <td>{stat.dayCount || ""}</td>
                  <td>{stat.nightCount || ""}</td>
                  <td>{stat.lateCount || ""}</td>
                  <td className="sum-col">{stat.sum || ""}</td>
                  <td>{stat.sum > 0 ? stat.avg : ""}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="grand-total-row">
                <td>Total</td>
                <td>{totalAmount}</td>
                <td>{totalDay}</td>
                <td>{totalNight}</td>
                <td>{totalLate}</td>
                <td className="total-sum-col">{totalSum}</td>
                <td>{totalSum > 0 ? overallAvg : ""}</td>
              </tr>
              <tr className="slots-total-row">
                <td colSpan="2" style={{ textAlign: "right", fontWeight: "bold" }}>Total (Day, Night, Late):</td>
                <td colSpan="3" style={{ fontSize: "22px", fontWeight: "900", color: "#000", backgroundColor: "#f0f0f0" }}>{totalSum}</td>
                <td colSpan="2"></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      <style jsx>{`
        .booking-by-date {
          background: #fff;
          padding: 20px;
          border-radius: 8px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.05);
          margin-bottom: 30px;
        }
        .excel-container {
          margin-top: 20px;
          border: 1px solid #1c4b33;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 4px 15px rgba(0,0,0,0.08);
        }
        .excel-header {
          background: linear-gradient(135deg, #092619 0%, #061e14 100%);
          padding: 14px;
          text-align: center;
          border-bottom: 2px solid #10b981;
        }
        .excel-title {
          color: #ffffff;
          font-size: 20px;
          font-weight: 800;
          letter-spacing: 0.5px;
        }
        .excel-table-wrapper {
          overflow-x: auto;
        }
        .excel-table {
          width: 100%;
          border-collapse: collapse;
          font-family: 'Segoe UI', Arial, sans-serif;
          font-size: 13px;
        }
        .excel-table th, .excel-table td {
          border: 1px solid #d4dfd9;
          padding: 8px 10px;
          text-align: center;
          height: 35px;
          min-width: 120px;
        }
        .excel-table th {
          background-color: #0b3120;
          font-weight: 700;
          color: #a4c2b2;
          text-transform: uppercase;
          font-size: 11px;
          letter-spacing: 0.5px;
        }
        .slot-col {
          font-weight: bold;
          background-color: #f2f7f4;
          color: #092015;
          width: 110px !important;
          min-width: 110px !important;
        }
        .night-row td {
          background: linear-gradient(90deg, #10b981 0%, #059669 100%);
          font-weight: 800;
          text-align: center;
          padding: 8px;
          color: #ffffff;
          font-size: 16px;
          text-transform: uppercase;
          letter-spacing: 1px;
          border-color: #059669;
        }
        .check-col {
          min-width: 100px;
          text-align: center;
        }
        .check-col.status-received {
          background-color: #10b981;
          color: #fff;
          font-weight: bold;
        }
        .check-col.status-not-received {
          background-color: #ef4444;
          color: #fff;
          font-weight: bold;
        }
        .check-col.status-phone-off {
          background-color: #6b7280;
          color: #fff;
          font-weight: bold;
        }
        .total-row td {
          padding: 16px 15px;
          font-size: 16px;
          background-color: #f8faf9;
          border-top: 2px solid #092619 !important;
        }
        .comment-cell {
          font-style: italic;
          color: #555;
          min-width: 150px;
        }
        tr:nth-child(even):not(.night-row) {
          background-color: #fdfdfd;
        }
        tr:hover:not(.night-row):not(.total-row):not(.grand-total-row):not(.slots-total-row) {
          background-color: #eef7f2;
        }

        /* Summary Table Styles */
        .summary-section {
          margin-top: 40px;
          border: 1px solid #1c4b33;
          border-radius: 8px;
          padding: 15px;
          background: #fafafa;
        }
        .summary-title {
          font-size: 18px;
          font-weight: bold;
          color: #0b3120;
          margin-bottom: 15px;
          text-transform: uppercase;
          border-left: 5px solid #10b981;
          padding-left: 10px;
        }
        .summary-table th {
          background-color: #e8f0ec;
          color: #0b3120;
        }
        .range-label {
          background-color: #f9f9f9;
          font-weight: bold;
        }
        .sum-col {
          background-color: #fff;
        }
        .grand-total-row td {
          font-weight: bold;
          background-color: #eee;
          font-size: 15px;
        }
        .total-sum-col {
          font-weight: bold;
          font-size: 16px;
        }
        .slots-total-row td {
          border-top: 2px solid #333 !important;
        }
      `}</style>
    </div>
  );
}
