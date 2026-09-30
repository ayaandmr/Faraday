import type { TeacherProvider } from "./teacher-provider";
import { GroqTeacherProvider } from "./groq-teacher-provider";

export function getTeacherProvider(): TeacherProvider {
  const provider = process.env.FARADAY_TEACHER_PROVIDER?.trim().toLowerCase() || "groq";
  if (provider === "groq") return new GroqTeacherProvider();
  throw new Error(`Teacher provider "${provider}" is not installed. Set FARADAY_TEACHER_PROVIDER=groq.`);
}
