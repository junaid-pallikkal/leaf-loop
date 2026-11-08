import jsPDF from 'jspdf';
import { Redemption, Profile, Reward } from '@/types';

export interface ReceiptData {
  redemption: Partial<Redemption>;
  user: Partial<Profile>;
  reward: Partial<Reward>;
}

export function generateVoucherPDFReceipt(data: ReceiptData): jsPDF {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const primaryGreen = [22, 101, 52]; // #166534
  const lightGreen = [220, 252, 231]; // #dcfce7
  const darkText = [15, 23, 42];
  const mutedText = [100, 116, 139];

  // Header banner
  doc.setFillColor(primaryGreen[0], primaryGreen[1], primaryGreen[2]);
  doc.rect(0, 0, 210, 42, 'F');

  // Brand title & Tagline
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.text('LEAFLOOP', 16, 20);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text('Every Good Habit Counts • Official Environmental Reward Receipt', 16, 28);

  // Official badge
  doc.setFillColor(34, 197, 94); // Leaf green
  doc.roundedRect(148, 14, 46, 16, 2, 2, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('VERIFIED RECEIPT', 153, 24);

  // Receipt meta box
  doc.setFillColor(248, 250, 248);
  doc.setDrawColor(227, 235, 227);
  doc.roundedRect(16, 50, 178, 26, 3, 3, 'FD');

  doc.setTextColor(mutedText[0], mutedText[1], mutedText[2]);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text('RECEIPT ID', 24, 59);
  doc.text('REDEMPTION DATE', 88, 59);
  doc.text('STATUS', 152, 59);

  doc.setTextColor(darkText[0], darkText[1], darkText[2]);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text(data.redemption.receipt_id || 'LL-VCH-PENDING', 24, 68);
  doc.text(
    data.redemption.created_at
      ? new Date(data.redemption.created_at).toLocaleDateString('en-IN', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        })
      : new Date().toLocaleDateString('en-IN'),
    88,
    68
  );
  doc.setTextColor(22, 101, 52);
  doc.text((data.redemption.status || 'PAID').toUpperCase(), 152, 68);

  // Beneficiary details
  doc.setTextColor(darkText[0], darkText[1], darkText[2]);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text('Beneficiary Citizen Details', 16, 88);

  doc.setDrawColor(227, 235, 227);
  doc.line(16, 92, 194, 92);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(mutedText[0], mutedText[1], mutedText[2]);
  doc.text('Citizen Name:', 16, 102);
  doc.text('Registered Email:', 16, 110);
  doc.text('Contact Phone:', 16, 118);

  doc.setTextColor(darkText[0], darkText[1], darkText[2]);
  doc.setFont('helvetica', 'bold');
  doc.text(data.user.full_name || 'Eco Steward', 60, 102);
  doc.setFont('helvetica', 'normal');
  doc.text(data.user.email || 'N/A', 60, 110);
  doc.text(data.user.phone || 'N/A', 60, 118);

  // Reward Breakdown Box
  doc.setTextColor(darkText[0], darkText[1], darkText[2]);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text('Reward & Voucher Allocation', 16, 134);
  doc.line(16, 138, 194, 138);

  // Table header
  doc.setFillColor(240, 246, 240);
  doc.rect(16, 144, 178, 10, 'F');
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(22, 101, 52);
  doc.text('ITEM DESCRIPTION', 22, 150);
  doc.text('LEAF COINS', 120, 150);
  doc.text('VALUE', 162, 150);

  // Table row
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(darkText[0], darkText[1], darkText[2]);
  doc.text(data.reward.title || 'Digital Reward Voucher', 22, 162);
  doc.text(`${data.redemption.coins_spent || 0} LC`, 120, 162);
  doc.setFont('helvetica', 'bold');
  doc.text(`INR ${data.redemption.reward_value_inr || 0}`, 162, 162);

  doc.line(16, 168, 194, 168);

  // Voucher Code Highlight Box
  if (data.redemption.voucher_code) {
    doc.setFillColor(lightGreen[0], lightGreen[1], lightGreen[2]);
    doc.setDrawColor(34, 197, 94);
    doc.roundedRect(16, 176, 178, 30, 3, 3, 'FD');

    doc.setTextColor(22, 101, 52);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('YOUR AUTHENTIC REDEMPTION CODE', 24, 185);

    doc.setFont('courier', 'bold');
    doc.setFontSize(18);
    doc.text(data.redemption.voucher_code, 24, 196);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor( mutedText[0], mutedText[1], mutedText[2]);
    doc.text('Redeemable on the merchant platform. Keep this code secure and confidential.', 24, 202);
  } else if (data.redemption.type === 'cash') {
    doc.setFillColor(240, 246, 240);
    doc.roundedRect(16, 176, 178, 30, 3, 3, 'F');

    doc.setTextColor(22, 101, 52);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('DIRECT BANK DISBURSEMENT RECORD', 24, 186);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(darkText[0], darkText[1], darkText[2]);
    doc.text(`Bank Account: ${data.redemption.bank_account_masked || 'Verified Bank Account'}`, 24, 194);
    doc.text(`IFSC: ${data.redemption.bank_ifsc || 'N/A'}    |    UTR: ${data.redemption.utr_number || 'Under Processing'}`, 24, 201);
  }

  // Terms & Conditions
  doc.setTextColor(darkText[0], darkText[1], darkText[2]);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('Terms & Conditions', 16, 222);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(mutedText[0], mutedText[1], mutedText[2]);

  const terms = data.reward.terms_and_conditions || 
    '1. This receipt confirms valid redemption of environmental Leaf Coins earned through verified stewardship activities.\n' +
    '2. Vouchers are non-transferable, non-refundable, and cannot be exchanged for alternate cash equivalents outside platform rules.\n' +
    '3. LeafLoop reserves the right to audit and invalidate redemptions acquired through fraudulent or duplicate activity submissions.\n' +
    '4. For dispute resolution or merchant inquiries, contact support@leafloop.eco referencing this Receipt ID.';

  const splitTerms = doc.splitTextToSize(terms, 178);
  doc.text(splitTerms, 16, 228);

  // Footer
  doc.setDrawColor(227, 235, 227);
  doc.line(16, 268, 194, 268);

  doc.setFontSize(8);
  doc.setTextColor(mutedText[0], mutedText[1], mutedText[2]);
  doc.text('LeafLoop Technologies • Empowering Citizen Climate Action • https://leafloop.eco', 16, 274);
  doc.text(`Generated on ${new Date().toUTCString()}`, 130, 274);

  return doc;
}
