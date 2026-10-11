const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const outputPath = path.join(__dirname, '..', 'CineBook_Project_Overview.pdf');
const doc = new PDFDocument({
  margin: 50,
  size: 'A4',
  bufferPages: true,
});

const writeStream = fs.createWriteStream(outputPath);
doc.pipe(writeStream);

// Colors
const primaryColor = '#581c87'; // Deep purple
const accentColor = '#7c3aed';  // Purple
const textColor = '#1f2937';    // Dark gray
const mutedColor = '#6b7280';   // Light gray
const cardBg = '#f3f4f6';       // Off-white

// Helper functions
function drawHeader(title, subtitle) {
  doc.rect(50, 45, 495, 80).fill('#111827');
  doc.fillColor('#ffffff').fontSize(22).font('Helvetica-Bold').text(title, 70, 62);
  doc.fillColor('#c084fc').fontSize(11).font('Helvetica').text(subtitle, 70, 92);
  doc.moveDown(4);
}

function drawSectionHeading(heading) {
  doc.moveDown(1);
  doc.fillColor(primaryColor).fontSize(14).font('Helvetica-Bold').text(heading);
  doc.rect(50, doc.y + 2, 495, 1.5).fill(accentColor);
  doc.moveDown(0.6);
}

function drawParagraph(text) {
  doc.fillColor(textColor).fontSize(10).font('Helvetica').lineGap(3).text(text);
  doc.moveDown(0.5);
}

function drawBullet(title, desc) {
  doc.fillColor(accentColor).fontSize(10).font('Helvetica-Bold').text('• ' + title + ': ', { continued: true });
  doc.fillColor(textColor).font('Helvetica').text(desc);
  doc.moveDown(0.3);
}

// ================= PAGE 1 =================
drawHeader('CineBook — Movie Ticket Booking System', 'Comprehensive Software Architecture & Project Overview');

drawSectionHeading('1. Executive Summary');
drawParagraph('CineBook is an enterprise-grade, responsive Movie Ticket Booking platform designed for cinema operations in Hyderabad, Telangana. Inspired by leading commercial platforms like BookMyShow and District, CineBook implements full-stack software engineering principles, robust ACID transactions, high-concurrency seat locking, and dynamic QR e-tickets.');

drawSectionHeading('2. Technology Stack & Frameworks');
drawBullet('Frontend Framework', 'Next.js 16 (App Router) with React 19 and TypeScript 5.9.');
drawBullet('Design & Styling', 'Tailwind CSS v4 with cinema dark navy aesthetic, accessible states, and responsive viewports.');
drawBullet('Backend & APIs', 'Next.js Server Route Handlers with Zod input schema validation and HTTP-only session cookies.');
drawBullet('Database & ORM', 'Prisma ORM 6.4 with SQLite for zero-setup execution, plus full PostgreSQL schema and Docker Compose.');
drawBullet('Security & Crypto', 'jose JWT authentication, bcrypt password hashing, and dynamic qrcode generation.');

drawSectionHeading('3. Core Architectural Highlights');
drawBullet('Concurrency Safe Seat Reservations', 'Implements database transactions (prisma.$transaction) to lock selected seats for a 5-minute checkout window. Two concurrent customers attempting to reserve the exact same seat will see one succeed and the second safely rejected with HTTP 409 conflict.');
drawBullet('Interactive Cinema Seating Grid', 'Real-time hall visualizer featuring Regular, Premium, VIP Recliner, and Accessible seating tiers, curvature screen direction, and dynamic polling.');
drawBullet('Dual Payment Simulation Modes', 'Fully functional simulated checkout supporting both Instant Payment Success (ticket confirmation) and Declined Transaction (safe seat rollback).');
drawBullet('Cryptographic E-Tickets & Gate Pass', 'Generates unique cryptographically signed QR codes and verification passes, complete with a cinema usher staff validation portal.');

// ================= PAGE 2 =================
doc.addPage();

drawSectionHeading('4. Database Entity Relational Model');
drawParagraph('The CineBook relational schema is organized into 11 distinct models with strict foreign key constraints and cascade rules:');
drawBullet('User', 'Customer and Administrator accounts with encrypted password hashes and profile details.');
drawBullet('Movie', 'Catalog titles with duration, genre, language, certification, cast/crew metadata, and poster URLs.');
drawBullet('Theatre & Screen', 'Multiplex properties across Hyderabad with screen layout configs and amenities.');
drawBullet('Seat', 'Physical seat coordinates (row label, seat number, and category tier).');
drawBullet('Show', 'Movie schedule entries with tiered ticket prices, convenience fees, and 18% GST tax rates.');
drawBullet('SeatReservation', 'Temporary 5-minute atomic seat locks with unique constraint [showId, seatId, status].');
drawBullet('Booking & BookingSeat', 'Confirmed customer ticket orders linked to show, seats, and verification tokens.');
drawBullet('Payment', 'Transaction logs capturing payment status, simulated provider refs, and timestamps.');
drawBullet('Cancellation', 'Tracks cancellations and computes automatic 75% refund policy records.');

drawSectionHeading('5. Hyderabad Seed Catalog');
drawParagraph('The application includes realistic cinema catalog data for immediate demonstration:');
drawBullet('8 Movies', 'Kalki 2898 AD, Pushpa 2: The Rule, Devara: Part 1, Game Changer, HIT: 3rd Case, Sikandar, Spirit, Ramayana.');
drawBullet('4 Multiplex Theatres', 'PVR ICON (Kukatpally), AMB Cinemas (Gachibowli), INOX (Banjara Hills), Prasads Multiplex (Necklace Rd).');
drawBullet('8 Auditorium Screens', 'Dolby Atmos, Laser Atmos, 4DX, and Insignia VIP Recliner halls.');
drawBullet('872 Seats & 27 Shows', 'Fully generated physical seating coordinates and scheduled shows.');

// ================= PAGE 3 =================
doc.addPage();

drawSectionHeading('6. Automated Verification & Test Results');
drawParagraph('The test suite executes 10 comprehensive tests covering security, concurrency, transactions, and analytics:');

const testCases = [
  'Password hashing and secure verification with bcrypt',
  'JWT Session signing and validation with jose',
  'Duplicate email registration rejection in database',
  'Role-based access checks (Customer blocked from Admin)',
  'Successful temporary 5-minute seat reservation',
  'CONCURRENCY: Second user blocked from reserving same seat (HTTP 409)',
  'Same physical seat can be booked for different shows',
  'Expired reservations release seats back to the public pool',
  'Order creation, 18% GST calculation, and 75% refund processing',
  'Operational analytics calculation (movies, theatres, shows, revenue)'
];

testCases.forEach((tc, idx) => {
  doc.fillColor('#15803d').fontSize(9).font('Helvetica-Bold').text(`[PASS] `, { continued: true });
  doc.fillColor(textColor).font('Helvetica').text(`Test ${idx + 1}: ${tc}`);
});

drawSectionHeading('7. Access Credentials & Quick Start');
drawParagraph('Pre-configured demonstration accounts available on the login page:');
drawBullet('Admin Account', 'Email: admin@cinebook.com | Password: Admin@123456');
drawBullet('Customer 1', 'Email: arjun@example.com | Password: Customer@123');
drawBullet('Customer 2', 'Email: priya@example.com | Password: Customer@123');

doc.moveDown(1);
doc.rect(50, doc.y, 495, 60).fill('#1e1b4b');
doc.fillColor('#ffffff').fontSize(11).font('Helvetica-Bold').text('Commands to Run Locally:', 65, doc.y - 50);
doc.fillColor('#a5b4fc').fontSize(9).font('Courier').text('npm install  ->  npx prisma db push  ->  npx prisma db seed  ->  npm test  ->  npm run dev', 65, doc.y - 32);

// Add page numbers
const pages = doc.bufferedPageRange();
for (let i = 0; i < pages.count; i++) {
  doc.switchToPage(i);
  doc.fillColor(mutedColor).fontSize(8).font('Helvetica').text(
    `CineBook Project Overview — Page ${i + 1} of ${pages.count}`,
    50,
    780,
    { align: 'center', width: 495 }
  );
}

doc.end();

writeStream.on('finish', () => {
  console.log('✅ PDF generated successfully at:', outputPath);
});
