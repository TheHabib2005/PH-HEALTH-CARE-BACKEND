export interface IcreateSpecialtyPayload {
    title: string
    description?: string
    icon?: string
}


export interface SpecialityType {
    id: string;
    title: string;
    description: string | null;
    icon: string | null;
    createdAt: Date;
    updatedAt: Date;
    isDeleted: boolean;
    deletedAt: Date | null;


}