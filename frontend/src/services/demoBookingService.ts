export interface DemoBookingPayload {
  name: string;
  email: string;
  company: string;
  ats: string;
  volume: string;
  plan: string;
  requestedSlot: string;
}

export interface DemoBookingResponse {
  id: string;
  status: string;
  requestedSlot: string;
  createdAt: string;
  message: string;
}

export const createDemoBooking = async (
  payload: DemoBookingPayload,
): Promise<DemoBookingResponse> => {
  const response = await fetch('/api/demo-bookings', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  let data: Partial<DemoBookingResponse> & {
    errors?: Record<string, string>;
  } = {};

  try {
    data = await response.json();
  } catch {
    // Backend hoặc reverse proxy có thể trả response không phải JSON.
  }

  if (!response.ok) {
    const firstValidationError = data.errors
      ? Object.values(data.errors)[0]
      : undefined;
    throw new Error(
      firstValidationError ||
        data.message ||
        'Không thể đặt lịch demo. Vui lòng thử lại sau.',
    );
  }

  return data as DemoBookingResponse;
};
