import type { TeacherProvider } from "./teacher-provider";
import { MockTeacherProvider } from "./mock-teacher-provider";

export function getTeacherProvider(): TeacherProvider {
  const provider = process.env.FARADAY_TEACHER_PROVIDER?.trim().toLowerCase() || "mock";

  if (provider === "mock") return new MockTeacherProvider();

  throw new Error(`Teacher provider "${provider}" is not installed. Set FARADAY_TEACHER_PROVIDER=mock until a model adapter is configured.`);
}
