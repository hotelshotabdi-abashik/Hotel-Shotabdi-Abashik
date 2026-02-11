
import emailjs from 'https://esm.sh/@emailjs/browser';

const SERVICE_ID = "service_ek24m6g";
const TEMPLATE_ID = "template_kikr6i5";
const PUBLIC_KEY = "yB6aUxmgXmZ_9jx2D";

interface EmailParams {
  to_name: string;
  to_email: string;
  subject: string;
  message: string;
  booking_id: string;
}

/**
 * Sends a branded email notification to a guest or admin.
 * Color Palette: Red (#E53935) and White (#FFFFFF)
 */
export const sendGuestEmail = async (params: EmailParams) => {
  try {
    const templateParams = {
      ...params,
      hotel_name: "Hotel Shotabdi Residential",
      hotel_location: "Sylhet, Bangladesh",
      contact_line: "+880 1717-425702"
    };

    const response = await emailjs.send(
      SERVICE_ID,
      TEMPLATE_ID,
      templateParams,
      PUBLIC_KEY
    );
    
    console.log('Email sent successfully:', response.status, response.text);
    return true;
  } catch (error) {
    console.error('Email failed to send:', error);
    return false;
  }
};

/**
 * Specifically notifies the owner of a new booking request.
 */
export const notifyOwnerOfBooking = async (bookingDetails: any) => {
  return sendGuestEmail({
    to_name: "Fuad Ahmed",
    to_email: "hotelshotabdiabashik@gmail.com",
    subject: "NEW BOOKING REQUEST",
    message: `A new booking has been logged. Guest: ${bookingDetails.userName}. Room: ${bookingDetails.roomTitle}. Dates: ${bookingDetails.checkIn} to ${bookingDetails.checkOut}. ID: ${bookingDetails.id}`,
    booking_id: bookingDetails.id
  });
};
