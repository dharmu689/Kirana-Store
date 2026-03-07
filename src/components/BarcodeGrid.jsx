import React, { useEffect } from 'react';
import JsBarcode from 'jsbarcode';

// Component that renders invisibly on screen and only formats correctly for print
const BarcodeGrid = ({ products, printTrigger, onPrintComplete }) => {

    useEffect(() => {
        if (!products || products.length === 0) return;

        products.forEach(product => {
            if (product.barcode || product.productId) {
                try {
                    JsBarcode(`#bulk-barcode-${product._id}`, product.barcode || product.productId, {
                        format: "CODE128",
                        width: 1.2, // Small enough to fit 50mm width
                        height: 30, // Small enough to fit 25mm height
                        displayValue: true,
                        fontSize: 10,
                        margin: 2
                    });
                } catch (e) {
                    console.error("Failed to render barcode", e);
                }
            }
        });

        if (printTrigger) {
            // Slight delay to ensure SVGs are fully rendered before triggering print
            setTimeout(() => {
                window.print();
                if (onPrintComplete) onPrintComplete();
            }, 500);
        }
    }, [products, printTrigger, onPrintComplete]);

    if (!products || products.length === 0) return null;

    return (
        <div className="hidden print:block print:w-[210mm] print:m-0 print:p-0">
            {/* 
              A4 is 210x297mm.
              We want labels to be 50mm x 25mm.
              3 columns of 50mm = 150mm width, leaving nice margins.
              Using CSS grid for optimal positioning.
            */}
            <style>
                {`
                @media print {
                    @page { margin: 10mm; size: A4 portrait; }
                    body * { visibility: hidden; }
                    #print-barcode-grid, #print-barcode-grid * { visibility: visible; }
                    #print-barcode-grid {
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 100%;
                        display: grid !important;
                        grid-template-columns: repeat(3, 50mm);
                        gap: 5mm 10mm; /* 5mm row gap, 10mm column gap */
                        justify-content: center;
                    }
                    .barcode-label {
                        width: 50mm;
                        height: 25mm;
                        display: flex;
                        flex-direction: column;
                        justify-content: center;
                        align-items: center;
                        overflow: hidden;
                        text-align: center;
                    }
                    .barcode-label span {
                        font-size: 8px;
                        font-family: sans-serif;
                        margin-bottom: 2px;
                        white-space: nowrap;
                        overflow: hidden;
                        text-overflow: ellipsis;
                        max-width: 48mm;
                        font-weight: bold;
                    }
                }
                `}
            </style>

            <div id="print-barcode-grid">
                {products.map(product => (
                    <div key={`print-${product._id}`} className="barcode-label">
                        <span>{product.name}</span>
                        <svg id={`bulk-barcode-${product._id}`} style={{ maxWidth: '100%', maxHeight: '70%' }}></svg>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default BarcodeGrid;
