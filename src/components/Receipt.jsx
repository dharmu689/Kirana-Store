import React, { forwardRef } from 'react';

const Receipt = forwardRef(({ cartItems, totalAmount, paymentMethod, receiptNumber, customerName, customerMobile, dateOverride }, ref) => {
    const receiptDate = dateOverride ? new Date(dateOverride) : new Date();
    const formattedDate = receiptDate.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
    });
    const formattedTime = receiptDate.toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit'
    });

    return (
        <div style={{ display: 'none' }}>
            <div
                ref={ref}
                style={{
                    padding: '40px 50px',
                    width: '800px', // Exact match to pdf windowWidth to prevent cut-off
                    minHeight: '1123px', // Standard A4 length
                    backgroundColor: 'white',
                    color: '#1f2937', // text-gray-800
                    fontFamily: '"Inter", "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
                    fontSize: '15px',
                    lineHeight: '1.6',
                    boxSizing: 'border-box'
                }}
            >
                {/* Header Section */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid #e5e7eb', paddingBottom: '25px', marginBottom: '30px' }}>
                    <div>
                        <h1 style={{ margin: '0 0 5px 0', fontSize: '32px', fontWeight: '900', color: '#4f46e5', letterSpacing: '-0.5px' }}>KiranaSmart</h1>
                        <p style={{ margin: '0', fontSize: '14px', color: '#6b7280' }}>Your Trusted Neighborhood Store</p>
                        <p style={{ margin: '5px 0 0 0', fontSize: '14px', color: '#9ca3af' }}>123 Market Street, Cityville, State 12345</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <h2 style={{ margin: '0 0 10px 0', fontSize: '28px', fontWeight: '300', color: '#374151', textTransform: 'uppercase', letterSpacing: '2px' }}>INVOICE</h2>
                        <p style={{ margin: '0', fontSize: '14px', fontWeight: '600' }}>Receipt No: <span style={{ color: '#4b5563', fontWeight: '400' }}>{receiptNumber || 'N/A'}</span></p>
                        <p style={{ margin: '5px 0 0 0', fontSize: '14px', fontWeight: '600' }}>Date: <span style={{ color: '#4b5563', fontWeight: '400' }}>{formattedDate} {formattedTime}</span></p>
                    </div>
                </div>

                {/* Customer Details Block */}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '40px' }}>
                    <div style={{ backgroundColor: '#f9fafb', padding: '15px 20px', borderRadius: '8px', minWidth: '250px' }}>
                        <h3 style={{ margin: '0 0 10px 0', fontSize: '13px', textTransform: 'uppercase', color: '#6b7280', letterSpacing: '1px', fontWeight: '700' }}>Billed To:</h3>
                        {customerName ? (
                            <p style={{ margin: '0 0 5px 0', fontSize: '16px', fontWeight: '600', color: '#111827' }}>{customerName}</p>
                        ) : (
                            <p style={{ margin: '0 0 5px 0', fontSize: '16px', fontWeight: '500', color: '#9ca3af', fontStyle: 'italic' }}>Walk-in Customer</p>
                        )}
                        {customerMobile && <p style={{ margin: '0', fontSize: '14px', color: '#4b5563' }}>+91 {customerMobile}</p>}
                    </div>
                    <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
                        <p style={{ margin: '0', fontSize: '14px', fontWeight: '600', color: '#374151' }}>Payment Method:</p>
                        <p style={{ margin: '5px 0 0 0', fontSize: '16px', color: '#4f46e5', fontWeight: '700' }}>{paymentMethod}</p>
                    </div>
                </div>

                {/* Items Table */}
                <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '30px' }}>
                    <thead>
                        <tr style={{ backgroundColor: '#f3f4f6', borderBottom: '2px solid #d1d5db' }}>
                            <th style={{ padding: '12px 15px', textAlign: 'left', fontWeight: '700', color: '#374151', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px', width: '50%' }}>Description</th>
                            <th style={{ padding: '12px 15px', textAlign: 'center', fontWeight: '700', color: '#374151', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Qty</th>
                            <th style={{ padding: '12px 15px', textAlign: 'right', fontWeight: '700', color: '#374151', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Unit Price</th>
                            <th style={{ padding: '12px 15px', textAlign: 'right', fontWeight: '700', color: '#374151', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        {cartItems.map((item, index) => {
                            const price = item.product.sellingPrice || item.product.price;
                            const total = price * item.quantitySold;
                            return (
                                <tr key={index} style={{ borderBottom: '1px solid #e5e7eb' }}>
                                    <td style={{ padding: '15px', fontWeight: '500', color: '#111827' }}>
                                        {item.product.name}
                                        {item.product.productId && <div style={{ fontSize: '11px', color: '#9ca3af', marginTop: '4px' }}>SKU: {item.product.productId}</div>}
                                    </td>
                                    <td style={{ padding: '15px', textAlign: 'center', color: '#4b5563' }}>{item.quantitySold}</td>
                                    <td style={{ padding: '15px', textAlign: 'right', color: '#4b5563' }}>₹{price.toFixed(2)}</td>
                                    <td style={{ padding: '15px', textAlign: 'right', fontWeight: '600', color: '#111827' }}>₹{total.toFixed(2)}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>

                {/* Totals Section */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '60px' }}>
                    <div style={{ width: '300px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 15px', color: '#4b5563' }}>
                            <span>Subtotal</span>
                            <span>₹{parseFloat(totalAmount).toFixed(2)}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 15px', color: '#4b5563', borderBottom: '1px solid #e5e7eb' }}>
                            <span>Tax (0.00%)</span>
                            <span>₹0.00</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '15px', backgroundColor: '#f9fafb', borderRadius: '8px', marginTop: '10px' }}>
                            <span style={{ fontSize: '18px', fontWeight: '700', color: '#111827' }}>Total Due</span>
                            <span style={{ fontSize: '18px', fontWeight: '900', color: '#4f46e5' }}>₹{parseFloat(totalAmount).toFixed(2)}</span>
                        </div>
                    </div>
                </div>

                {/* Footer Section */}
                <div style={{ textAlign: 'center', color: '#6b7280', fontSize: '13px', marginTop: 'auto', paddingTop: '40px', borderTop: '1px solid #e5e7eb' }}>
                    <p style={{ margin: '0 0 5px 0', fontWeight: '600', color: '#374151', fontSize: '15px' }}>Thank you for your business!</p>
                    <p style={{ margin: '0 0 5px 0' }}>If you have any questions about this invoice, please contact support@kiranasmart.com</p>
                    <p style={{ margin: '0', fontStyle: 'italic' }}>Visit again! Returns accepted within 7 days with original receipt.</p>
                </div>
            </div>
        </div>
    );
});

export default Receipt;
