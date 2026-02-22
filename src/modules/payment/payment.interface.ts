
export interface IInvoicePayload {
    status: "PENDING" | "COMPLETE";
    invoiceNumber: string;
    doctorName: string;
    patientName: string;
    paymentTime: number;
    paymentMethod: any;
    appointmentFee: number;
    quantity: number;
    totalAmount: number;
    message: string;
}

