import React, { forwardRef } from 'react';

const Receipt = forwardRef(({ cartItems, totalAmount, paymentMethod }, ref) => {
    const today = new Date();
    const formattedDate = today.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
    });
    const formattedTime = today.toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit'
    });

    return (
        <div style={{ display: 'none' }}>
            <div
                ref={ref}
                style={{
                    padding: '30px',
                    width: '350px',
                    backgroundColor: 'white',
                    color: 'black',
                    fontFamily: 'monospace',
                    fontSize: '14px',
                    lineHeight: '1.5'
                }}
            >
                {/* Header */}
                <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                    <h2 style={{ margin: '0 0 5px 0', fontSize: '20px', fontWeight: 'bold' }}>KiranaSmart Store</h2>
                    <p style={{ margin: '0', fontSize: '12px' }}>Your trusted neighborhood store</p>
                    <p style={{ margin: '0', fontSize: '12px' }}>Date: {formattedDate} {formattedTime}</p>
                </div>

                <div style={{ borderBottom: '1px dashed #ccc', marginBottom: '15px' }}></div>

                {/* Items */}
                <table style={{ width: '100%', marginBottom: '15px', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ borderBottom: '1px dashed #ccc', textAlign: 'left' }}>
                            <th style={{ paddingBottom: '5px', fontWeight: 'bold' }}>Item</th>
                            <th style={{ paddingBottom: '5px', fontWeight: 'bold', textAlign: 'center' }}>Qty</th>
                            <th style={{ paddingBottom: '5px', fontWeight: 'bold', textAlign: 'right' }}>Price</th>
                            <th style={{ paddingBottom: '5px', fontWeight: 'bold', textAlign: 'right' }}>Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        {cartItems.map((item, index) => {
                            const price = item.product.sellingPrice || item.product.price;
                            const total = price * item.quantitySold;
                            return (
                                <tr key={index} style={{ verticalAlign: 'top' }}>
                                    <td style={{ paddingTop: '8px' }}>{item.product.name}</td>
                                    <td style={{ paddingTop: '8px', textAlign: 'center' }}>{item.quantitySold}</td>
                                    <td style={{ paddingTop: '8px', textAlign: 'right' }}>₹{price}</td>
                                    <td style={{ paddingTop: '8px', textAlign: 'right' }}>₹{total}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>

                {/* Footer Totals */}
                <div style={{ borderTop: '1px dashed #ccc', paddingTop: '15px', marginTop: '5px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '16px' }}>
                        <span>Total Amount:</span>
                        <span>₹{parseFloat(totalAmount).toFixed(2)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px' }}>
                        <span>Payment Method:</span>
                        <span>{paymentMethod}</span>
                    </div>
                </div>

                <div style={{ borderTop: '1px dashed #ccc', marginTop: '20px', paddingTop: '15px', textAlign: 'center' }}>
                    <p style={{ margin: '0', fontSize: '12px', fontWeight: 'bold' }}>Thank you for shopping with us!</p>
                    <p style={{ margin: '0', fontSize: '12px' }}>Please visit again.</p>
                </div>
            </div>
        </div>
    );
});

export default Receipt;
