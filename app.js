// ==========================================
// TELEGRAM ALERT CONFIGURATION
// ==========================================
const TELEGRAM_CONFIG = {
  botToken: '8603247934:AAHZw5VM7vHOf39rRvA55fN9UJiw6e-S7gk',   // Replace with your BotFather token
  chatId: '5069397446'        // Replace with your Chat ID
};

async function sendTelegramAlert(reservation) {
  const message = `
🏨 *NEW BOOKING: TANA HOTEL*
━━━━━━━━━━━━━━━━━━━
📌 *Booking Ref:* \`${reservation.code}\`
👤 *Guest:* ${reservation.name}
📞 *Phone:* ${reservation.phone}
✉️ *Email:* ${reservation.email}
🛏 *Room:* ${reservation.room}
🌙 *Nights:* ${reservation.nights}
💰 *Total:* ${reservation.total}
📝 *Notes:* ${reservation.notes || 'None'}
━━━━━━━━━━━━━━━━━━━
_Pay at Check-In (Pending Front-Desk Confirmation)_
  `.trim();

  const url = `https://api.telegram.org/bot${TELEGRAM_CONFIG.botToken}/sendMessage`;

  try {
    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: TELEGRAM_CONFIG.chatId,
        text: message,
        parse_mode: 'Markdown'
      })
    });
    console.log('Telegram notification sent successfully!');
  } catch (error) {
    console.error('Failed to dispatch Telegram alert:', error);
  }
}