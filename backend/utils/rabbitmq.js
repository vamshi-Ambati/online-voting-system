require("dotenv").config();
const amqp = require("amqplib");
const nodemailer = require("nodemailer");

let channel, connection;
const voteConfirmationQueue = "vote_confirmation_queue";
const electionResultsQueue = "election_results_queue";

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
    await channel.assertQueue(voteConfirmationQueue, { durable: true });
    await channel.assertQueue(electionResultsQueue, { durable: true });
    console.log("Connected to RabbitMQ and asserted queues.");

    consumeVoteConfirmationMessages();
    consumeElectionResultsMessages();
  } catch (err) {
    console.error("RabbitMQ connection error:", err);
  }
};

const sendEmailMessage = (data) => {
  if (channel) {
    channel.sendToQueue(
      voteConfirmationQueue,
      Buffer.from(JSON.stringify(data)),
      {
        persistent: true,
      }
    );
    // console.log(
    //   `Sent vote confirmation message to queue: ${JSON.stringify(data)}`
    // );
  } else {
    console.error("RabbitMQ channel not available. Message not sent.");
  }
};

const sendResultsEmailMessage = (data) => {
  if (channel) {
    channel.sendToQueue(
      electionResultsQueue,
      Buffer.from(JSON.stringify(data)),
      {
        persistent: true,
      }
    );
    // console.log(
    //   `Sent election results message to queue: ${JSON.stringify(data)}`
    // );
  } else {
    console.error("RabbitMQ channel not available. Message not sent.");
  }
};

const consumeVoteConfirmationMessages = () => {
  channel.consume(
    voteConfirmationQueue,
    async (msg) => {
      if (msg !== null) {
        try {
          const emailData = JSON.parse(msg.content.toString());
          // console.log(
          //   "💌 Received vote confirmation message from queue:",
          //   emailData
          // );

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

          await transporter.sendMail(mailOptions);
          console.log(
            `Vote confirmation email sent to ${emailData.voterEmail}`
          );
          channel.ack(msg);
        } catch (error) {
          console.error(
            "Error processing vote confirmation message:",
            error
          );
          channel.nack(msg);
        }
      }
    },
    { noAck: false }
  );
};

const consumeElectionResultsMessages = () => {
  channel.consume(
    electionResultsQueue,
    async (msg) => {
      if (msg !== null) {
        try {
          const emailData = JSON.parse(msg.content.toString());
          // console.log(
          //   "💌 Received election results message from queue:",
          //   emailData
          // );

          const mailOptions = {
            from: `"${process.env.EMAIL_SENDER_NAME}" <${process.env.GMAIL_USER}>`,
            to: emailData.voterEmail,
            subject: emailData.subject,
            html: emailData.htmlContent, // Use the dynamic HTML content
          };

          await transporter.sendMail(mailOptions);
          console.log(
            ` Election results email sent to ${emailData.voterEmail}`
          );
          channel.ack(msg);
        } catch (error) {
          console.error("Error processing election results message:", error);
          channel.nack(msg);
        }
      }
    },
    { noAck: false }
  );
};

module.exports = { connectRabbitMQ, sendEmailMessage, sendResultsEmailMessage };
