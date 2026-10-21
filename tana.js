/**
 * TANA HOTEL - FULL CLIENT ENGINE (tana.js)
 * Connects UI, LocalStorage, and Telegram API directly
 */

// 1. TELEGRAM NOTIFICATION CONFIGURATION
const TELEGRAM_CONFIG = {
  botToken: '8603247934:AAHZw5VM7vHOf39rRvA55fN9UJiw6e-S7gk', // e.g. '7123456789:AAHfkjds834-kdfjh489y54hjkdf'
  chatId: '5069397446'      // e.g. '123456789' or '-100xxxxxxx'
};

// 2. CONFIGURATION & DATA
const CURRENCY_CONFIG = {
  activeCurrency: 'ETB',
  rateUsdToEtb: 125,
  symbols: { USD: '$', ETB: 'Br ' }
};

const ROOMS_DATA = [
  {
    id: 'room-traditional-twin',
    title: 'Amhara Heritage Twin Room',
    category: 'traditional',
    priceUSD: 65,
    priceETB: 8125,
    image: 'OIP.webp',
    badge: 'Cultural Pick',
    size: '32 m²',
    bed: '2 Twin Beds',
    guests: '2 Adults',
    description: 'Traditional Amhara handwoven tapestries and serene garden views.'
  },
  {
    id: 'room-deluxe-lakeview',
    title: 'Lake Tana Panoramic Suite',
    category: 'lakeview',
    priceUSD: 120,
    priceETB: 15000,
    image: 'OIP (1).webp',
    badge: 'Lake Front',
    size: '48 m²',
    bed: '1 King Bed',
    guests: '2 Adults',
    description: 'Unobstructed sunrise views over Lake Tana and illuminated gardens.'
  },
  {
    id: 'room-botanical-garden',
    title: 'Botanical Garden Villa',
    category: 'traditional',
    priceUSD: 85,
    priceETB: 10625,
    image: 'tana-hotel.jpg',
    badge: 'Garden Walk',
    size: '38 m²',
    bed: '1 Queen Bed',
    guests: '2 Adults',
    description: 'Direct walking access to lush landscaped resort pathways.'
  }
];

const TOURS_DATA = [
  {
    id: 'tour-monastery',
    title: 'Monastery Boat Charter',
    priceUSD: 45,
    priceETB: 5625,
    desc: 'Private motorboat to Ura Kidane Mehret.'
  },
  {
    id: 'tour-falls',
    title: 'Blue Nile Falls (Tis Abay)',
    priceUSD: 35,
    priceETB: 4375,
    desc: 'Guided day trip with round-trip 4WD transport.'
  }
];

let bookingState = {
  selectedRoomId: ROOMS_DATA[0].id,
  nights: 1,
  selectedAddons: []
};

// 3. INITIALIZATION
document.addEventListener('DOMContentLoaded', () => {
  renderRooms('all');
  populateBookingRooms();
  renderAddons();
  initDates();
  updateBookingCalculation();
  loadSavedBookings();

  document.getElementById('currency-select')?.addEventListener('change', (e) => {
    CURRENCY_CONFIG.activeCurrency = e.target.value;
    renderRooms('all');
    renderAddons();
    updateBookingCalculation();
  });
});

// 4. NAVIGATION
function navigateTo(pageId) {
  document.querySelectorAll('.page-view').forEach(p => p.classList.remove('active'));
  document.getElementById('page-' + pageId)?.classList.add('active');
  document.querySelectorAll('.nav-item').forEach(b => b.classList.toggle('active', b.dataset.page === pageId));
  window.scrollTo({ top: 0, behavior: 'smooth' });
}
function openDirectBooking() { navigateTo('booking'); }
function startSearchFromHero() { navigateTo('booking'); }

// 5. ROOMS CATALOG
function renderRooms(category) {
  const container = document.getElementById('rooms-container');
  if (!container) return;

  const list = category === 'all' ? ROOMS_DATA : ROOMS_DATA.filter(r => r.category === category);
  const sym = CURRENCY_CONFIG.symbols[CURRENCY_CONFIG.activeCurrency];

  container.innerHTML = list.map(r => {
    const pr = CURRENCY_CONFIG.activeCurrency === 'ETB' ? r.priceETB : r.priceUSD;
    return `
      <article class="room-card">
        <div class="room-img-box">
          <img src="${r.image}" alt="${r.title}">
          <span class="room-badge">${r.badge}</span>
        </div>
        <div class="room-details">
          <h3>${r.title}</h3>
          <div class="room-specs"><span>${r.size}</span> &bull; <span>${r.bed}</span></div>
          <p>${r.description}</p>
          <div class="room-footer">
            <div class="room-price-box">
              <div class="price">${sym}${pr.toLocaleString()}</div>
            </div>
            <button class="btn btn-gold" onclick="selectAndBook('${r.id}')">Book</button>
          </div>
        </div>
      </article>
    `;
  }).join('');
}

function filterRooms(cat, el) {
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  el.classList.add('active');
  renderRooms(cat);
}

function populateBookingRooms() {
  const s = document.getElementById('book-room-type');
  if (s) {
    s.innerHTML = ROOMS_DATA.map(r => `<option value="${r.id}">${r.title}</option>`).join('');
  }
}

function renderAddons() {
  const container = document.getElementById('addon-list-container');
  if (!container) return;

  const sym = CURRENCY_CONFIG.symbols[CURRENCY_CONFIG.activeCurrency];
  container.innerHTML = TOURS_DATA.map(t => {
    const pr = CURRENCY_CONFIG.activeCurrency === 'ETB' ? t.priceETB : t.priceUSD;
    return `
      <div class="addon-item">
        <div>
          <strong>${t.title}</strong><br>
          <small>${t.desc}</small>
        </div>
        <div>
          <span>+${sym}${pr.toLocaleString()}</span>
          <input type="checkbox" onchange="toggleAddon('${t.id}', this.checked)">
        </div>
      </div>
    `;
  }).join('');
}

function toggleAddon(id, checked) {
  if (checked) {
    bookingState.selectedAddons.push(id);
  } else {
    bookingState.selectedAddons = bookingState.selectedAddons.filter(x => x !== id);
  }
  updateBookingCalculation();
}

function initDates() {
  const today = new Date().toISOString().split('T')[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];

  const inEl = document.getElementById('book-checkin');
  const outEl = document.getElementById('book-checkout');
  if (inEl && outEl) {
    inEl.value = today;
    inEl.min = today;
    outEl.value = tomorrow;
    outEl.min = tomorrow;
  }
}

function goToStep(s) {
  for (let i = 1; i <= 3; i++) {
    document.getElementById('step-ind-' + i)?.classList.toggle('active', i === s);
    document.getElementById('step-tab-' + i)?.classList.toggle('active', i === s);
  }
}

function selectAndBook(id) {
  const s = document.getElementById('book-room-type');
  if (s) s.value = id;
  navigateTo('booking');
  updateBookingCalculation();
}

function updateBookingCalculation() {
  const checkinVal = document.getElementById('book-checkin')?.value;
  const checkoutVal = document.getElementById('book-checkout')?.value;
  const roomId = document.getElementById('book-room-type')?.value || ROOMS_DATA[0].id;

  let nights = 1;
  if (checkinVal && checkoutVal) {
    const diff = Math.ceil((new Date(checkoutVal) - new Date(checkinVal)) / (1000 * 60 * 60 * 24));
    nights = diff > 0 ? diff : 1;
  }
  bookingState.nights = nights;

  const room = ROOMS_DATA.find(r => r.id === roomId) || ROOMS_DATA[0];
  const isETB = CURRENCY_CONFIG.activeCurrency === 'ETB';
  const sym = CURRENCY_CONFIG.symbols[CURRENCY_CONFIG.activeCurrency];

  const roomCost = (isETB ? room.priceETB : room.priceUSD) * nights;
  let addonsCost = 0;
  bookingState.selectedAddons.forEach(aid => {
    const a = TOURS_DATA.find(t => t.id === aid);
    if (a) addonsCost += isETB ? a.priceETB : a.priceUSD;
  });

  const tax = Math.round((roomCost + addonsCost) * 0.15);
  const total = roomCost + addonsCost + tax;

  document.getElementById('sum-room-name').textContent = room.title;
  document.getElementById('sum-duration').textContent = `${nights} Night(s)`;
  document.getElementById('sum-room-subtotal').textContent = `${sym}${roomCost.toLocaleString()}`;
  document.getElementById('sum-addons-subtotal').textContent = `${sym}${addonsCost.toLocaleString()}`;
  document.getElementById('sum-tax').textContent = `${sym}${tax.toLocaleString()}`;
  document.getElementById('sum-grand-total').textContent = `${sym}${total.toLocaleString()}`;
}

// 6. TELEGRAM ALERT DISPATCHER
async function sendTelegramAlert(reservation) {
  if (!TELEGRAM_CONFIG.botToken || TELEGRAM_CONFIG.botToken.includes('YOUR_BOT_TOKEN')) {
    console.warn('Telegram botToken is not configured.');
    return;
  }

  const message = 
`🏨 *NEW BOOKING: TANA HOTEL*
━━━━━━━━━━━━━━━━━━━
📌 *Booking Ref:* \`${reservation.code}\`
👤 *Guest:* ${reservation.name}
📞 *Phone:* ${reservation.phone}
✉️ *Email:* ${reservation.email}
🛏 *Room:* ${reservation.room}
🌙 *Duration:* ${reservation.nights} Night(s)
💰 *Total:* ${reservation.total}
━━━━━━━━━━━━━━━━━━━
_Pay at Check-In (Pending Front-Desk Hold)_`;

  const url = `https://api.telegram.org/bot${TELEGRAM_CONFIG.botToken}/sendMessage`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: TELEGRAM_CONFIG.chatId,
        text: message,
        parse_mode: 'Markdown'
      })
    });
    const result = await response.json();
    if (!result.ok) {
      console.error('Telegram API error:', result.description);
    }
  } catch (err) {
    console.error('Network error connecting to Telegram:', err);
  }
}

// 7. RESERVATION HANDLER & LOCAL STORAGE
function handleReservationSubmit(e) {
  e.preventDefault();

  const firstName = document.getElementById('guest-first-name')?.value || '';
  const lastName = document.getElementById('guest-last-name')?.value || '';
  const email = document.getElementById('guest-email')?.value || '';
  const phone = document.getElementById('guest-phone')?.value || '';
  const roomId = document.getElementById('book-room-type')?.value;
  const room = ROOMS_DATA.find(r => r.id === roomId) || ROOMS_DATA[0];
  const grandTotal = document.getElementById('sum-grand-total')?.textContent || '';
  const bookingCode = 'TANA-' + Math.floor(100000 + Math.random() * 900000);

  const reservation = {
    code: bookingCode,
    name: `${firstName} ${lastName}`,
    email: email,
    phone: phone,
    room: room.title,
    nights: bookingState.nights,
    total: grandTotal,
    timestamp: new Date().toLocaleDateString()
  };

  // 1. Save locally for the guest to see
  saveBookingToStorage(reservation);
  loadSavedBookings();

  // 2. Dispatch alert to your Telegram bot
  sendTelegramAlert(reservation);

  alert(`Reservation Successful!\n\nBooking Code: ${bookingCode}\nTotal: ${grandTotal}\n\nA notification has been dispatched to the front desk.`);

  // Reset form and return to step 1
  document.getElementById('reservation-form')?.reset();
  goToStep(1);
}

function saveBookingToStorage(booking) {
  const current = JSON.parse(localStorage.getItem('tana_active_bookings') || '[]');
  current.unshift(booking);
  localStorage.setItem('tana_active_bookings', JSON.stringify(current));
}

function loadSavedBookings() {
  const listContainer = document.getElementById('saved-bookings-list');
  if (!listContainer) return;

  const bookings = JSON.parse(localStorage.getItem('tana_active_bookings') || '[]');
  if (bookings.length === 0) {
    listContainer.innerHTML = '<p class="empty-res-text" style="font-size:0.85rem; color:#888;">No active reservations yet.</p>';
    return;
  }

  listContainer.innerHTML = bookings.slice(0, 4).map(b => `
    <div style="background: #F9F8F5; border: 1px solid #E5E2DC; padding: 10px 12px; border-radius: 6px; margin-bottom: 8px; display: flex; justify-content: space-between; align-items: center;">
      <div>
        <strong style="color: #0A2E2E; font-size: 0.9rem;">${b.code}</strong>
        <div style="font-size: 0.78rem; color: #666;">${b.room} &bull; ${b.nights} night(s)</div>
      </div>
      <div style="font-weight: 700; color: #C89B3C; font-size: 0.9rem;">
        ${b.total}
      </div>
    </div>
  `).join('');
}