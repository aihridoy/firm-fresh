import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Order } from "@/lib/api/endpoints/orders";

export function generateInvoicePdf(order: Order, customerName: string) {
  const doc = new jsPDF();

  doc.setFontSize(20);
  doc.setTextColor(22, 163, 74);
  doc.text("FarmFresh", 14, 20);

  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text("Local Farmer Booking Platform", 14, 26);

  doc.setFontSize(14);
  doc.setTextColor(0);
  doc.text("Invoice", 14, 40);

  doc.setFontSize(10);
  doc.text(`Order Number: ${order.orderNumber}`, 14, 48);
  doc.text(`Order Date: ${new Date(order.createdAt).toLocaleDateString()}`, 14, 54);
  doc.text(`Status: ${order.status}`, 14, 60);

  doc.text(`Billed To: ${customerName}`, 120, 48);
  doc.text(`Delivery Address: ${order.deliveryAddress}`, 120, 54, { maxWidth: 75 });
  doc.text(`Payment Method: ${order.paymentMethod}`, 120, 66);

  autoTable(doc, {
    startY: 76,
    head: [["Item", "Qty", "Unit Price", "Amount"]],
    body: order.items.map((item) => [
      item.productName,
      `${item.quantity} ${item.unit}`,
      `Tk ${item.price}`,
      `Tk ${(item.price * item.quantity).toFixed(2)}`,
    ]),
    headStyles: { fillColor: [22, 163, 74] },
  });

  const finalY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10;

  doc.text(`Subtotal: Tk ${order.subtotal.toFixed(2)}`, 150, finalY, { align: "right" });
  doc.text(`Delivery Fee: Tk ${order.deliveryFee.toFixed(2)}`, 150, finalY + 6, { align: "right" });
  doc.text(`Service Fee: Tk ${order.serviceFee.toFixed(2)}`, 150, finalY + 12, { align: "right" });
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text(`Total: Tk ${order.totalAmount.toFixed(2)}`, 150, finalY + 20, { align: "right" });

  doc.save(`invoice-${order.orderNumber}.pdf`);
}
