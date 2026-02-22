
export interface IInvoicePayload {
    status: "PENDING" | "COMPLETE";
    invoiceNumber: string;
    doctorName: string;
    patientName: string;
    paymentTime: string;
    paymentMethod: any;
    appointmentFee: number;
    quantity: number;
    totalAmount: number;
    message: string;
}

