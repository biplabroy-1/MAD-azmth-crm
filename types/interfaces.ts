export interface Customer {
  name: string;
  number: string;
}

export interface CallRecord {
  id: string;
  assistantId: string;
  type: string;
  startedAt: string;
  endedAt: string;
  transcript: string;
  summary: string;
  createdAt: string;
  updatedAt: string;
  status: string;
  customer: Customer;
  endedReason?: string;
  phoneCallProvider?: string;
  phoneCallProviderId?: string;
  phoneCallTransport?: string;
  phoneNumber?: {
    twilioPhoneNumber: string;
    twilioAccountSid: string;
  };
  [key: string]: any;
}
