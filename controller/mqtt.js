require('dotenv').config();
const amqp = require('amqplib');
const brokerUrl = `amqp://${process.env.MQTT_USERNAME}:${process.env.MQTT_PASSWORD}@${process.env.MQTT_HOSTNAME}`;
const queue_consume = `${process.env.MQTT_QUEUE_CONSUME}`;
const queue_send = `${process.env.MQTT_QUEUE_SEND}`;



//connect to RabbitMQ

async function ReceivedData(callback){
    try{
        const connection = await amqp.connect(brokerUrl);
        const channel = await connection.createChannel();
        await channel.assertQueue(queue_consume);
        
        channel.consume(queue_consume, (message) => {
         if (message !== null) {
   	  const messageContent = message.content.toString();
   	   if (messageContent.trim() !== '') {
      	    try {
               const data = JSON.parse(messageContent);
               console.log('Received:', data);
               callback(data);
               channel.ack(message);
             } catch (error) {
               console.error('Error parsing MQTT message:', error);
             }
           }
          } else {
            console.log('Consumer cancelled by server');
          }
        });

    }
    catch (error) {
        throw new Error('Error connecting to RabbitMQ: ' + error.message);
    }
};

async function SendData(msg){
    try{
        const connection = await amqp.connect(brokerUrl);
        const channel = await connection.createChannel();
        await channel.assertQueue(queue_send);
        //console.log('Connect to SendData RabbitMQ');
         let dataToSend;
         if (typeof msg === 'object') {
        dataToSend = msg;
        } else {
        dataToSend = { coin: msg }; 
        }
        const messageBuffer = Buffer.from(JSON.stringify(dataToSend));
        
        await channel.sendToQueue(queue_send,messageBuffer);
        console.log(`Sent Message to RabbitMQ: ${JSON.stringify(dataToSend)}`);
        await channel.close();
        await connection.close();

    }catch (error){
        console.log('Error connecting to RabbitMQ: ' ,error);
        
    }
}

module.exports = {
    ReceivedData,
    SendData
}
