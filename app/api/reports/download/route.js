// app/api/reports/download/route.js
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { report } = await request.json();
    
    let content = '';
    let filename = '';
    let type = '';

    switch (report.type) {
      case 'Sales':
        content = generateSalesReportCSV(report.data);
        filename = `sales-report-${new Date().toISOString().split('T')[0]}.csv`;
        type = 'text/csv';
        break;
      case 'Inventory':
        content = generateInventoryReportCSV(report.data);
        filename = `inventory-summary-${new Date().toISOString().split('T')[0]}.csv`;
        type = 'text/csv';
        break;
      default:
        content = JSON.stringify(report.data, null, 2);
        filename = `${report.name.replace(/\s+/g, '-').toLowerCase()}.json`;
        type = 'application/json';
    }

    return new NextResponse(content, {
      headers: {
        'Content-Type': type,
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });

  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

function generateSalesReportCSV(data) {
  const rows = [
    ['Metric', 'Value'],
    ['Total Sales', `₱${data.totalSales.toFixed(2)}`],
    ['Total Transactions', data.totalTransactions],
    ['Average Sale', `₱${data.averageSale.toFixed(2)}`],
    ['Period', data.period],
    [],
    ['Category', 'Quantity Sold', 'Amount']
  ];

  data.categoryBreakdown.forEach(cat => {
    rows.push([cat.category || 'Uncategorized', cat.quantity, `₱${cat.amount.toFixed(2)}`]);
  });

  return rows.map(row => row.join(',')).join('\n');
}

function generateInventoryReportCSV(data) {
  const rows = [
    ['Metric', 'Value'],
    ['Total Products', data.totalProducts],
    ['Total Items in Stock', data.totalItems],
    ['Total Value', `₱${data.totalValue.toFixed(2)}`],
    ['Low Stock Items', data.lowStockItems],
    ['Out of Stock Items', data.outOfStockItems],
    ['Inventory Health Score', `${data.healthScore}%`]
  ];

  return rows.map(row => row.join(',')).join('\n');
}