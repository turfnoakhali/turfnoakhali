import React from 'react'
import { useState } from 'react';

const ArenaPriceUpdate = () => {

    const [formData, setFormData] = useState({
        "Turf Noakhali": 2500,
        "Time Up": 2000,
    });

    const [showConfirm, setShowConfirm] = useState(false);

    const handleSaveClick = () => {
        setShowConfirm(true);
    };

    const confirmUpdate = async () => {
        await fetch("/api/update-pricing", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(formData),
        });

        setShowConfirm(false);
        alert("Pricing updated successfully!");
    };


    return (
        <>
            <section>
                <input
                    value={formData["Turf Noakhali"]}
                    onChange={(e) =>
                        setFormData({ ...formData, "Turf Noakhali": Number(e.target.value) })
                    }
                />

                <input
                    value={formData["Time Up"]}
                    onChange={(e) =>
                        setFormData({ ...formData, "Time Up": Number(e.target.value) })
                    }
                />

                <button onClick={handleSaveClick}>
                    Update Price
                </button>

                {showConfirm && (
                    <div className="modal">
                        <p>Are you sure you want to update prices?</p>

                        <button onClick={confirmUpdate}>Yes, Update</button>
                        <button onClick={() => setShowConfirm(false)}>Cancel</button>
                    </div>
                )}
            </section>
        </>
    )
}

export default ArenaPriceUpdate