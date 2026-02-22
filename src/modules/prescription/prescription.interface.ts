export interface IUploadPdfSuccessResult {
    secure_url:string;
    public_id:string;
    original_filename:string;
}
export interface IUploadPdfFailedResult {
    message:string;
    statusCode:number;
}

export interface ICreatePrescriptionPayload {
    appointmentId:string;
      instructions: string;
            followUpDate: Date;
}
export interface IUpdatePrescriptionPayload {
    appointmentId:string;
      instructions: string;
            followUpDate: Date;
}


export interface IUploadPdfOptions {
    folder:string;
    resource_type: "image" | "video" | "raw" | "auto" | any;
    public_id:string;
}


