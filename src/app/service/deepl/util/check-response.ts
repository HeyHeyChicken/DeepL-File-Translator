export interface CheckResponse{
    document_id: string;
    status: string;
    seconds_remaining: number;
    error_message: string;
    message: string;
    billed_characters: string;
}