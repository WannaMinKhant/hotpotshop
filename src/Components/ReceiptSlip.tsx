// Receipt slip printer component
import { useEffect, useRef } from 'react';

export interface ReceiptData {
  orderNumber: string;
  items: { name: string; qty: number; price: number; subtotal: number }[];
  subtotal: number;
  tax: number;
  total: number;
  paymentMethod: string;
  tableNumber?: number;
  orderType: string;
  timestamp: string;
}

interface ReceiptSlipProps {
  receipt: ReceiptData;
  onClose: () => void;
}

const ReceiptSlip = ({ receipt, onClose }: ReceiptSlipProps) => {
  const slipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const printTimer = setTimeout(() => {
      window.print();
    }, 500);
    return () => clearTimeout(printTimer);
  }, []);

  const paymentIcons: Record<string, string> = {
    card: '💳',
    cash: '💵',
    qr: '📱',
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[200] overflow-y-auto p-8">
      <div className="flex flex-col items-center gap-4 w-full max-w-sm mx-auto">
        {/* Receipt Preview — has class "receipt-slip" for print CSS */}
        <div ref={slipRef} className="receipt-slip bg-white text-black w-full p-4 shadow-2xl rounded-lg" style={{ fontFamily: 'monospace', fontSize: '12px' }}>
          {/* Header */}
          <div style={{ textAlign: 'center', borderBottom: '2px dashed #ccc', paddingBottom: '12px', marginBottom: '12px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 'bold', margin: '0 0 4px' }}>🍲 Hotpot Shop</h2>
            <p style={{ color: '#666', margin: '0 0 4px' }}>Restaurant POS</p>
            <p style={{ color: '#999', margin: 0, fontSize: '11px' }}>{receipt.timestamp}</p>
          </div>

          {/* Order Info */}
          <div style={{ borderBottom: '1px dashed #ccc', paddingBottom: '8px', marginBottom: '8px' }}>
            <p style={{ margin: '0 0 4px' }}><strong>Order:</strong> {receipt.orderNumber}</p>
            <p style={{ margin: 0 }}><strong>Type:</strong> {receipt.orderType === 'dine-in' ? `Dine-in • Table ${receipt.tableNumber}` : receipt.orderType}</p>
          </div>

          {/* Items */}
          {receipt.items && receipt.items.length > 0 ? (
            <>
              <table style={{ width: '100%', marginBottom: '8px', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #ccc' }}>
                    <th style={{ textAlign: 'left', padding: '4px 0' }}>Item</th>
                    <th style={{ textAlign: 'center', padding: '4px 0' }}>Qty</th>
                    <th style={{ textAlign: 'right', padding: '4px 0' }}>Amt</th>
                  </tr>
                </thead>
                <tbody>
                  {receipt.items.map((item, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid #eee' }}>
                      <td style={{ padding: '4px 4px 4px 0', maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</td>
                      <td style={{ textAlign: 'center', padding: '4px 0' }}>{item.qty}</td>
                      <td style={{ textAlign: 'right', padding: '4px 0' }}>${item.subtotal.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          ) : (
            <p style={{ color: '#999', textAlign: 'center', padding: '12px 0' }}>No items</p>
          )}

          {/* Totals */}
          <div style={{ borderTop: '1px dashed #ccc', paddingTop: '1px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span>Subtotal</span>
              <span>${receipt.subtotal.toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span>Tax (10%)</span>
              <span>${receipt.tax.toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '16px', borderTop: '1px solid #ccc', paddingTop: '4px' }}>
              <span>TOTAL</span>
              <span>${receipt.total.toFixed(2)}</span>
            </div>
          </div>

          {/* Payment */}
          <div style={{ borderTop: '2px dashed #ccc', paddingTop: '8px', marginTop: '8px', textAlign: 'center' }}>
            <p style={{ color: '#666', margin: '0 0 4px' }}>Paid via {paymentIcons[receipt.paymentMethod] || ''} {receipt.paymentMethod}</p>
            <p style={{ color: '#16a34a', fontWeight: 'bold', fontSize: '14px', margin: 0 }}>✓ Payment Received</p>
          </div>

          {/* Footer */}
          <div style={{ textAlign: 'center', marginTop: '16px', paddingTop: '8px', borderTop: '1px dashed #ccc' }}>
            <p style={{ color: '#999', margin: 0 }}>Thank you for dining with us!</p>
            <p style={{ color: '#999', margin: '4px 0 0' }}>Please come again 🙏</p>
          </div>
        </div>

        {/* Actions (hidden in print) */}
        <div className="flex gap-3 shrink-0">
          <button
            onClick={() => window.print()}
            className="bg-blue-500 hover:bg-blue-400 text-white px-6 py-2 rounded-lg font-bold transition"
          >
            🖨️ Print
          </button>
          <button
            onClick={onClose}
            className="bg-gray-600 hover:bg-gray-500 text-white px-6 py-2 rounded-lg font-bold transition"
          >
            ✓ Done
          </button>
        </div>
      </div>

      {/* Print-only styles */}
      <style>{`
        @media print {
          body * { visibility: hidden !important; }
          .receipt-slip, .receipt-slip * { visibility: visible !important; }
          .receipt-slip {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 80mm !important;
            box-shadow: none !important;
            background: white !important;
          }
          .no-print { display: none !important; }
          @page {
            size: 80mm auto;
            margin: 5mm;
          }
        }
      `}</style>
    </div>
  );
};

export default ReceiptSlip;
