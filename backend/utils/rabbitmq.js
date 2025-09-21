require("dotenv").config();
const amqp = require("amqplib");
const nodemailer = require("nodemailer");

let channel, connection;
const queueName = "email_queue";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS,
  },
});

const connectRabbitMQ = async () => {
  try {
    connection = await amqp.connect("amqp://localhost:5672");
    channel = await connection.createChannel();
    await channel.assertQueue(queueName, { durable: true });
    console.log("Connected to RabbitMQ");

    consumeMessages();
  } catch (err) {
    console.error("RabbitMQ connection error:", err);
  }
};

const sendEmailMessage = (data) => {
  if (channel) {
    channel.sendToQueue(queueName, Buffer.from(JSON.stringify(data)), {
      persistent: true,
    });
    console.log(`Sent message to queue: ${JSON.stringify(data)}`);
  } else {
    console.error("RabbitMQ channel not available. Message not sent.");
  }
};

const consumeMessages = () => {
  channel.consume(
    queueName,
    async (msg) => {
      if (msg !== null) {
        try {
          const emailData = JSON.parse(msg.content.toString());
          console.log("💌 Received message from queue:", emailData);

          // Email content using environment variables for sender info
          const mailOptions = {
            from: `"${process.env.EMAIL_SENDER_NAME}" <${process.env.GMAIL_USER}>`,
            to: emailData.voterEmail,
            subject: "Vote Cast Successfully!",
            html: `
              <p>Hello ${emailData.voter_Name},</p>
              <p>Your vote has been casted successfully.</p>
              <p>Thank you for participating in the election!</p>
              <br/>
              <p>Best regards,</p>
              <p>The E-Voting Team</p>
            `,
          };

          // Send the email
          await transporter.sendMail(mailOptions);
          console.log(`✅ Email sent to ${emailData.voterEmail}`);
          channel.ack(msg); // Acknowledge the message
        } catch (error) {
          console.error("❌ Error processing RabbitMQ message:", error);
          // Nack the message to put it back in the queue or to a dead-letter exchange
          channel.nack(msg);
        }
      }
    },
    { noAck: false } // Acknowledge messages manually
  );
};

module.exports = { connectRabbitMQ, sendEmailMessage };
