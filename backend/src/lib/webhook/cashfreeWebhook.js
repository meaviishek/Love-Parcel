
import { verifyCashfreeSignature } from "../payment/verifyCashfreeSignature.js";
import pkg from "@prisma/client";

const { PrismaClient, BookingStatus, PaymentStatus } = pkg;

const prisma = new PrismaClient();


export const cashfreeWebhook = async (req, res) => {
  const signature = req.headers["x-webhook-signature"];
  const timestamp = req.headers["x-webhook-timestamp"];
  const rawBody = req.body;

  if (!signature || !timestamp) {
    return res.status(400).json({ message: "INVALID_WEBHOOK_HEADERS" });
  }

  const isValid = verifyCashfreeSignature({
    payload: rawBody,
    timestamp,
    signature,
    secret: process.env.CASHFREE_SECRET_KEY,
  });

  if (!isValid) {
    return res.status(401).json({ message: "INVALID_SIGNATURE" });
  }

  const event = JSON.parse(rawBody.toString("utf8"));

  // const eventType = event.type;
  const orderId = event.data?.order?.order_id;
  const orderStatus = event.data?.order?.order_status;
  const paymentStatus = event.data?.payment?.payment_status;

  if (!orderId) {
    return res.status(400).json({ message: "ORDER_ID_MISSING" });
  }

  const allowedEvents = [
    "PAYMENT_SUCCESS_WEBHOOK",
    "PAYMENT_FAILED_WEBHOOK",
    "ORDER_PAID",
  ];

  if (!allowedEvents.includes(eventType)) {
    return res.status(200).json({ message: "EVENT_IGNORED" });
  }

  try {
    await prisma.$transaction(async (tx) => {
      const bookings = await tx.booking.findMany({
        where: { orderId },
      });

      if (!bookings.length) {
        throw new Error("BOOKING_NOT_FOUND");
      }

      // Idempotency guard
      if (
        bookings[0].paymentStatus === PaymentStatus.PAID ||
        bookings[0].paymentStatus === PaymentStatus.FAILED
      ) {
        return;
      }

      const ticketId = bookings[0].ticketId;
      const ticketCount = bookings.length;

      if (orderStatus === "PAID" && paymentStatus === "SUCCESS") {
        const ticket = await tx.ticket.findUnique({
          where: { id: ticketId },
        });

        if (!ticket || ticket.quantity < ticketCount) {
          // Payment succeeded but stock unavailable
          await tx.booking.updateMany({
            where: { orderId },
            data: {
              paymentStatus: PaymentStatus.FAILED,
              bookingStatus: BookingStatus.CANCELLED,
              cancelledAt: new Date(),
            },
          });

          // TODO: trigger refund logic here
          return;
        }

        await tx.ticket.update({
          where: { id: ticketId },
          data: {
            quantity: { decrement: ticketCount },
          },
        });

        await tx.booking.updateMany({
          where: { orderId },
          data: {
            paymentStatus: PaymentStatus.PAID,
            bookingStatus: BookingStatus.CONFIRMED,
            paidAt: new Date(),
          },
        });
      } else {
        // Payment failed or cancelled
        await tx.booking.updateMany({
          where: { orderId },
          data: {
            paymentStatus: PaymentStatus.FAILED,
            bookingStatus: BookingStatus.CANCELLED,
            cancelledAt: new Date(),
          },
        });
      }
    });

    return res.status(200).json({ message: "WEBHOOK_PROCESSED" });
  } catch (error) {
    console.error("Cashfree Webhook Error:", error);
    // Always respond 200 to prevent retries storm
    return res.status(200).json({ message: "ERROR_LOGGED" });
  }
};
