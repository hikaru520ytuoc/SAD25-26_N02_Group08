export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
}

export function successResponse<T>(data: T, message = 'Thao tác thành công'): ApiResponse<T> {
  return {
    success: true,
    data,
    message,
  };
}
