const Gpio = require("onoff").Gpio;
const gpioPinForAcceptorIn = 2; // ตัวอย่างเลือกขา GPIO 2
const acceptorIn = new Gpio(gpioPinForAcceptorIn, "in", "both");
//const gpioPinForAcceptorOut = [1, 3, 4, 5, 6, 7, 8, 17, 18, 19, 20, 21, 22, 23, 24, 33, 34, 35, 36, 37, 38, 39, 40,]; // ตัวอย่างเลือกขา GPIO 17
const gpioPinForAcceptorOut = [17, 18, 19, 20, 21, 22, 23, 24]; // ตัวอย่างเลือกขา GPIO 17
const acceptorOut = gpioPinForAcceptorOut.map((pin) => new Gpio(pin, "out"));
const Time = new Date();
const connectMqtt = require("./controller/mqtt");
const API = require("./controller/apiService");
const acceptorInValue = acceptorIn.readSync();
let money = 0;
let pulsing = false;
let coin = 0;
let coin_received;
let Timeout = 0;
let Qr_key = null;

//acceptorOut.writeSync(0);//อยากให้บบรทัดนี้ขา gpio 17 ปิดการทำงาน
acceptorOut.forEach((gpio) => gpio.writeSync(0)); // เปลี่ยนไปใช้ forEach() เพื่อเข้าถึงแต่ละ Gpio object และเรียก writeSync(0)
console.log(Time.toString() + "\n");
connectMqtt.ReceivedData(processmqtt);
console.log("==============================");

acceptorIn.watch(calculateMoney);

function calculateMoney(err, value) {
  if (err) {
    console.log("Error: ", err);
    return;
  }
  if (pulsing) {
    return;
  }
  pulsing = true;
  if (pulsing == true) {
    setTimeout(async function () {
      coin = coin + 10;
      console.log("==============================");
      console.log("Sum Val = ", coin + "Baht");
        if (money != 0) {
          connectMqtt.SendData(coin);
        } else {
          console.log("NO Received Data");
        }
        if (coin == money) {
          console.log("==============================");
          console.log("COMPLETE");
          console.log("==============================");
          console.log("\n");

          reset();
          acceptorOut.forEach((gpio) => gpio.writeSync(0));
        } else if (coin >= money) {
          coin = 0;
        }

        pulsing = false;
    }, 1200);
  }
}

function unexportOnclose() {
  acceptorIn.unexport();
  acceptorOut.forEach((gpio) => gpio.unexport());
}
async function processmqtt(data) {
  money = data.money;
  coin_received = data.coin_received;
  Qr_key = data.Qr_key;
  Timeout = data.Timeout;
  acceptorOut.forEach((gpio) => gpio.writeSync(1));
  if(Timeout == 1){
      console.log(coin);
      console.log(Qr_key);
      console.log(Timeout);
      await API.SaveCoinReceived(coin,Qr_key);
   //API P'Nu

   reset();
   acceptorOut.forEach((gpio) => gpio.writeSync(0));
    }
  if(coin_received !== 0){
    coin = coin_received;
    }
}


function reset(){
  coin = 0;
  money = 0;
  coin_received = 0;
  Timeout = 0;

}
process.on("SIGINT", () => {
  unexportOnclose();
  acceptorOut.forEach((gpio) => gpio.writeSync(1));
  process.exit(1);
  });
