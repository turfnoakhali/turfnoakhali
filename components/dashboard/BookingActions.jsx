"use client";
import toast from "react-hot-toast";
import Swal from "sweetalert2";

const STATUS_ORDER = ["confirmed", "completed", "cancelled"];

export default function BookingActions({ booking, role, refetch }) {

  const canUpdateStatus = ["MANAGER", "GENERAL_ADMIN", "SUPER_ADMIN"].includes(role);
  if (!canUpdateStatus) return null;

  const currentIndex = STATUS_ORDER.indexOf(booking.status);

  const executeStatusUpdate = async (newStatus, note = undefined) => {
    if (newStatus === booking.status) return;

    try {
      const response = await fetch(`/api/bookings/${booking._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          status: newStatus,
          cancelNote: note 
        }),
      });

      if (response.ok) {
        toast.success(`Booking status updated to ${newStatus}`);
        refetch();
      } else {
        toast.error("Failed to update status");
      }
    } catch (error) {
      toast.error("An error occurred while updating status");
    }
  };

  const handleStatusChange = (e) => {
    const newStatus = e.target.value;
    if (newStatus === booking.status) return;

    if (newStatus === "confirmed") {
      Swal.fire({
        title: "Confirm Action",
        text: "Are you sure you want to mark this booking as confirmed?",
        icon: "question",
        showCancelButton: true,
        confirmButtonColor: "#007bff",
        cancelButtonColor: "#6c757d",
        confirmButtonText: "Yes, Confirm",
      }).then((result) => {
        if (result.isConfirmed) {
          executeStatusUpdate(newStatus);
        }
      });
    } else if (newStatus === "completed") {
      Swal.fire({
        title: "Confirm Action",
        text: "Are you sure you want to mark this booking as completed?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#28a745",
        cancelButtonColor: "#6c757d",
        confirmButtonText: "Yes, Complete",
      }).then((result) => {
        if (result.isConfirmed) {
          executeStatusUpdate(newStatus);
        }
      });
    } else if (newStatus === "cancelled") {
      Swal.fire({
        title: "Confirm Cancellation",
        input: "textarea",
        inputLabel: "Cancel Note (Required)",
        inputPlaceholder: "Enter reason for cancellation...",
        inputValidator: (value) => {
          if (!value || !value.trim()) {
            return "Cancel note is required!";
          }
        },
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#6c757d",
        confirmButtonText: "Yes, Cancel Booking",
      }).then((result) => {
        if (result.isConfirmed) {
          executeStatusUpdate(newStatus, result.value);
        }
      });
    }
  };

  return (
    <>
      <select
        value={booking.status}
        onChange={handleStatusChange}
      >
        {STATUS_ORDER.map((status, index) => (
          <option
            key={status}
            value={status}
            disabled={index < currentIndex || (status === "cancelled" && booking.status === "completed")}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </option>
        ))}
      </select>
    </>
  );
}
