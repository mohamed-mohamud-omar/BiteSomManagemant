import PDFDocument from 'pdfkit';
import exceljs from 'exceljs';

// --- SALES REPORT GENERATORS ---

export const generateSalesReportPDF = (res, data) => {
  const doc = new PDFDocument({ margin: 50 });
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'attachment; filename=sales_report.pdf');
  doc.pipe(res);

  // Logo & Header
  doc.fillColor('#059669').fontSize(24).text('BiteSom Platform', 50, 50);
  doc.fillColor('#475569').fontSize(12).text('Sales & Revenue Analytics Report', 50, 80);
  doc.fontSize(10).text(`Generated on: ${new Date().toLocaleString()}`, 50, 100);
  doc.moveDown(2);

  // Divider Line
  doc.strokeColor('#e2e8f0').lineWidth(1).moveTo(50, 120).lineTo(550, 120).stroke();

  // Summary Metrics
  doc.moveDown(1.5);
  doc.fillColor('#0f172a').fontSize(16).text('Financial Summary', 50, 140);
  doc.fontSize(12).text(`Total Revenue: $${data.totalRevenue.toFixed(2)}`, 60, 170);
  doc.text(`Total Orders: ${data.totalOrders}`, 60, 190);
  doc.text(`Average Order Value: $${(data.totalOrders > 0 ? data.totalRevenue / data.totalOrders : 0).toFixed(2)}`, 60, 210);

  // Table Headers
  const tableTop = 260;
  doc.fontSize(11).fillColor('#475569');
  doc.text('Order ID', 50, tableTop);
  doc.text('Date', 200, tableTop);
  doc.text('Payment', 350, tableTop);
  doc.text('Amount', 480, tableTop);
  
  doc.strokeColor('#cbd5e1').moveTo(50, tableTop + 15).lineTo(550, tableTop + 15).stroke();

  // Table Content
  let y = tableTop + 25;
  doc.fontSize(9).fillColor('#0f172a');
  
  data.orders.forEach((order) => {
    if (y > 700) {
      doc.addPage();
      y = 50;
    }
    doc.text(order._id.toString().substring(0, 10) + '...', 50, y);
    doc.text(new Date(order.createdAt).toLocaleDateString(), 200, y);
    doc.text(`${order.paymentMethod} (${order.paymentStatus})`, 350, y);
    doc.text(`$${order.total.toFixed(2)}`, 480, y);
    y += 20;
  });

  doc.end();
};

export const generateSalesReportExcel = async (res, data) => {
  const workbook = new exceljs.Workbook();
  const worksheet = workbook.addWorksheet('Sales Report');

  worksheet.columns = [
    { header: 'Order ID', key: 'id', width: 25 },
    { header: 'Customer Name', key: 'customer', width: 20 },
    { header: 'Restaurant', key: 'restaurant', width: 25 },
    { header: 'Date', key: 'date', width: 15 },
    { header: 'Payment Method', key: 'paymentMethod', width: 15 },
    { header: 'Payment Status', key: 'paymentStatus', width: 15 },
    { header: 'Subtotal', key: 'subtotal', width: 12 },
    { header: 'Tax', key: 'tax', width: 10 },
    { header: 'Delivery Fee', key: 'deliveryFee', width: 12 },
    { header: 'Discount', key: 'discount', width: 12 },
    { header: 'Total Revenue', key: 'total', width: 15 },
  ];

  // Apply styled headers
  worksheet.getRow(1).eachCell((cell) => {
    cell.font = { bold: true, color: { argb: 'FFFFFF' } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '059669' } };
  });

  data.orders.forEach((order) => {
    worksheet.addRow({
      id: order._id.toString(),
      customer: order.customer?.fullName || 'N/A',
      restaurant: order.restaurant?.name || 'N/A',
      date: new Date(order.createdAt).toLocaleDateString(),
      paymentMethod: order.paymentMethod,
      paymentStatus: order.paymentStatus,
      subtotal: order.subtotal,
      tax: order.tax,
      deliveryFee: order.deliveryFee,
      discount: order.discount,
      total: order.total
    });
  });

  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', 'attachment; filename=sales_report.xlsx');
  await workbook.xlsx.write(res);
  res.end();
};


// --- CUSTOMER REPORT GENERATORS ---

export const generateCustomersReportPDF = (res, data) => {
  const doc = new PDFDocument({ margin: 50 });
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'attachment; filename=customer_report.pdf');
  doc.pipe(res);

  doc.fillColor('#d97706').fontSize(24).text('BiteSom Platform', 50, 50);
  doc.fillColor('#475569').fontSize(12).text('Customer Database & Registrations Audit', 50, 80);
  doc.fontSize(10).text(`Generated on: ${new Date().toLocaleString()}`, 50, 100);
  doc.strokeColor('#e2e8f0').lineWidth(1).moveTo(50, 120).lineTo(550, 120).stroke();

  doc.moveDown(1.5);
  doc.fillColor('#0f172a').fontSize(16).text(`Total Registered Customers: ${data.totalCustomers}`, 50, 145);

  const tableTop = 200;
  doc.fontSize(11).fillColor('#475569');
  doc.text('Name', 50, tableTop);
  doc.text('Email', 180, tableTop);
  doc.text('Phone', 350, tableTop);
  doc.text('Joined Date', 470, tableTop);
  
  doc.strokeColor('#cbd5e1').moveTo(50, tableTop + 15).lineTo(550, tableTop + 15).stroke();

  let y = tableTop + 25;
  doc.fontSize(9).fillColor('#0f172a');
  
  data.customers.forEach((cust) => {
    if (y > 700) {
      doc.addPage();
      y = 50;
    }
    doc.text(cust.fullName, 50, y);
    doc.text(cust.email, 180, y);
    doc.text(cust.phone, 350, y);
    doc.text(new Date(cust.createdAt).toLocaleDateString(), 470, y);
    y += 20;
  });

  doc.end();
};

export const generateCustomersReportExcel = async (res, data) => {
  const workbook = new exceljs.Workbook();
  const worksheet = workbook.addWorksheet('Customers');

  worksheet.columns = [
    { header: 'User ID', key: 'id', width: 25 },
    { header: 'Full Name', key: 'fullName', width: 25 },
    { header: 'Email Address', key: 'email', width: 30 },
    { header: 'Phone Number', key: 'phone', width: 20 },
    { header: 'Role', key: 'role', width: 15 },
    { header: 'Status', key: 'status', width: 12 },
    { header: 'Joined Date', key: 'joined', width: 18 }
  ];

  worksheet.getRow(1).eachCell((cell) => {
    cell.font = { bold: true, color: { argb: 'FFFFFF' } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'D97706' } };
  });

  data.customers.forEach((cust) => {
    worksheet.addRow({
      id: cust._id.toString(),
      fullName: cust.fullName,
      email: cust.email,
      phone: cust.phone,
      role: cust.role,
      status: cust.isActive ? 'Active' : 'Banned',
      joined: new Date(cust.createdAt).toLocaleDateString()
    });
  });

  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', 'attachment; filename=customers_report.xlsx');
  await workbook.xlsx.write(res);
  res.end();
};


// --- ORDERS REPORT GENERATORS ---

export const generateOrdersReportPDF = (res, data) => {
  const doc = new PDFDocument({ margin: 50 });
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'attachment; filename=orders_report.pdf');
  doc.pipe(res);

  doc.fillColor('#0284c7').fontSize(24).text('BiteSom Platform', 50, 50);
  doc.fillColor('#475569').fontSize(12).text('Operations & Deliveries Report', 50, 80);
  doc.fontSize(10).text(`Generated on: ${new Date().toLocaleString()}`, 50, 100);
  doc.strokeColor('#e2e8f0').lineWidth(1).moveTo(50, 120).lineTo(550, 120).stroke();

  doc.moveDown(1.5);
  doc.fillColor('#0f172a').fontSize(16).text('Deliveries Overview', 50, 140);
  doc.fontSize(12).text(`Total Placed Orders: ${data.totalOrders}`, 60, 170);

  const tableTop = 220;
  doc.fontSize(11).fillColor('#475569');
  doc.text('Order ID', 50, tableTop);
  doc.text('Restaurant', 150, tableTop);
  doc.text('Driver Assigned', 280, tableTop);
  doc.text('Status', 410, tableTop);
  doc.text('Total', 500, tableTop);
  
  doc.strokeColor('#cbd5e1').moveTo(50, tableTop + 15).lineTo(550, tableTop + 15).stroke();

  let y = tableTop + 25;
  doc.fontSize(9).fillColor('#0f172a');
  
  data.orders.forEach((order) => {
    if (y > 700) {
      doc.addPage();
      y = 50;
    }
    doc.text(order._id.toString().substring(0, 10) + '...', 50, y);
    doc.text(order.restaurant?.name || 'N/A', 150, y);
    doc.text(order.driver?.fullName || 'Unassigned', 280, y);
    doc.text(order.status, 410, y);
    doc.text(`$${order.total.toFixed(2)}`, 500, y);
    y += 20;
  });

  doc.end();
};

export const generateOrdersReportExcel = async (res, data) => {
  const workbook = new exceljs.Workbook();
  const worksheet = workbook.addWorksheet('Orders');

  worksheet.columns = [
    { header: 'Order ID', key: 'id', width: 25 },
    { header: 'Customer', key: 'customer', width: 20 },
    { header: 'Restaurant', key: 'restaurant', width: 25 },
    { header: 'Driver', key: 'driver', width: 20 },
    { header: 'Status', key: 'status', width: 18 },
    { header: 'Subtotal', key: 'subtotal', width: 12 },
    { header: 'Total', key: 'total', width: 12 },
    { header: 'Payment Method', key: 'paymentMethod', width: 15 },
    { header: 'Date', key: 'date', width: 15 }
  ];

  worksheet.getRow(1).eachCell((cell) => {
    cell.font = { bold: true, color: { argb: 'FFFFFF' } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '0284C7' } };
  });

  data.orders.forEach((order) => {
    worksheet.addRow({
      id: order._id.toString(),
      customer: order.customer?.fullName || 'N/A',
      restaurant: order.restaurant?.name || 'N/A',
      driver: order.driver?.fullName || 'Unassigned',
      status: order.status,
      subtotal: order.subtotal,
      total: order.total,
      paymentMethod: order.paymentMethod,
      date: new Date(order.createdAt).toLocaleDateString()
    });
  });

  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', 'attachment; filename=orders_report.xlsx');
  await workbook.xlsx.write(res);
  res.end();
};
