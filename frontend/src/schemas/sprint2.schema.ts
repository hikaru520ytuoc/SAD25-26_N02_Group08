import { z } from 'zod';

export const projectPeriodSchema = z
  .object({
    name: z.string().min(1, 'Tên đợt đồ án bắt buộc'),
    academicYear: z.string().min(1, 'Năm học bắt buộc'),
    semester: z.string().min(1, 'Học kỳ bắt buộc'),
    startDate: z.string().min(1, 'Ngày bắt đầu bắt buộc'),
    endDate: z.string().min(1, 'Ngày kết thúc bắt buộc'),
    registrationStartDate: z.string().optional(),
    registrationEndDate: z.string().optional(),
  })
  .refine((data) => new Date(data.startDate) <= new Date(data.endDate), {
    message: 'Ngày bắt đầu không được sau ngày kết thúc',
    path: ['endDate'],
  })
  .refine(
    (data) =>
      !data.registrationStartDate ||
      !data.registrationEndDate ||
      new Date(data.registrationStartDate) <= new Date(data.registrationEndDate),
    {
      message: 'Ngày bắt đầu đăng ký không được sau ngày kết thúc đăng ký',
      path: ['registrationEndDate'],
    },
  );


export const topicSchema = z.object({
  title: z.string().min(1, 'Tên đề tài bắt buộc'),
  description: z.string().min(1, 'Mô tả đề tài bắt buộc'),
  objectives: z.string().optional(),
  expectedOutput: z.string().optional(),
  major: z.string().optional(),
  maxStudents: z.coerce.number().min(1, 'Số lượng sinh viên phải từ 1 trở lên'),
  projectPeriodId: z.string().min(1, 'Vui lòng chọn đợt đồ án.'),
});

export const rejectTopicSchema = z.object({
  rejectionReason: z.string().min(1, 'Lý do từ chối bắt buộc'),
});
