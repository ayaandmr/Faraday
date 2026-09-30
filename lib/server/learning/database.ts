import type { GradeLevel, LearnerLevel, LessonUi, LearningPhase, ProfileState, ProgressStatus, ResponseFormat, SessionCard, StudentMemory, TeachingStyle } from "../../learning/contracts";
import type { EvidenceKind, MemoryCandidate, MemoryContext, RecentTurn } from "./providers/teacher-provider";
import { getSupabaseAdmin, isSupabaseConfigured } from "../supabase";

type DbUser = { id: string; clerk_user_id: string };
type DbProfile = { grade_level: number; preferred_style: TeachingStyle; preferred_format: ResponseFormat; pilot_consent_at: string };
export type DbSession = {
  id: string; user_id: string; topic: string; selected_subtopic_id: string | null; selected_subtopic_label: string | null; style: TeachingStyle; content_format: ResponseFormat; declared_level: LearnerLevel;
  phase: LearningPhase; status: "active" | "paused" | "completed"; summary: string; current_teacher_message: string; current_ui: LessonUi; progress_status: ProgressStatus; progress_confidence: number; model_id: string; last_active_at: string;
};

function databaseError(error: { message: string } | null) {
  if (error) throw new Error(`Learning database error: ${error.message}`);
}

export function normalizeMemory(value: string) {
  return value.toLocaleLowerCase().replace(/\s+/g, " ").trim();
}

async function userFor(clerkUserId: string): Promise<DbUser> {
  const db = getSupabaseAdmin();
  const found = await db.from("app_users").select("id, clerk_user_id").eq("clerk_user_id", clerkUserId).maybeSingle();
  databaseError(found.error);
  if (found.data) return found.data as DbUser;
  const created = await db.from("app_users").insert({ clerk_user_id: clerkUserId }).select("id, clerk_user_id").single();
  databaseError(created.error);
  return created.data as DbUser;
}

async function existingUser(clerkUserId: string): Promise<DbUser | null> {
  const db = getSupabaseAdmin();
  const found = await db.from("app_users").select("id, clerk_user_id").eq("clerk_user_id", clerkUserId).maybeSingle();
  databaseError(found.error);
  return found.data as DbUser | null;
}

export function learningDatabaseConfigured() {
  return isSupabaseConfigured();
}

export async function getProfileState(clerkUserId: string): Promise<ProfileState> {
  const user = await existingUser(clerkUserId);
  if (!user) return { complete: false, gradeLevel: null, preferredStyle: null, preferredFormat: null };
  const db = getSupabaseAdmin();
  const profile = await db.from("student_profiles").select("grade_level, preferred_style, preferred_format, pilot_consent_at").eq("user_id", user.id).maybeSingle();
  databaseError(profile.error);
  if (!profile.data) return { complete: false, gradeLevel: null, preferredStyle: null, preferredFormat: null };
  const data = profile.data as DbProfile;
  return { complete: true, gradeLevel: data.grade_level as GradeLevel, preferredStyle: data.preferred_style, preferredFormat: data.preferred_format ?? "real_examples" };
}

export async function ensureProfile(clerkUserId: string, gradeLevel: GradeLevel | undefined, pilotConsent: boolean | undefined, preferredStyle: TeachingStyle, preferredFormat: ResponseFormat) {
  const user = await userFor(clerkUserId);
  const db = getSupabaseAdmin();
  const current = await db.from("student_profiles").select("grade_level, preferred_style, preferred_format, pilot_consent_at").eq("user_id", user.id).maybeSingle();
  databaseError(current.error);
  if (!current.data) {
    if (!gradeLevel || !pilotConsent) throw new Error("PROFILE_REQUIRED");
    const created = await db.from("student_profiles").insert({ user_id: user.id, grade_level: gradeLevel, preferred_style: preferredStyle, preferred_format: preferredFormat, pilot_consent_at: new Date().toISOString() });
    databaseError(created.error);
    return { user, profile: { grade_level: gradeLevel, preferred_style: preferredStyle, preferred_format: preferredFormat } };
  }
  const profile = current.data as DbProfile;
  if (profile.preferred_style !== preferredStyle || profile.preferred_format !== preferredFormat) {
    const updated = await db.from("student_profiles").update({ preferred_style: preferredStyle, preferred_format: preferredFormat, updated_at: new Date().toISOString() }).eq("user_id", user.id);
    databaseError(updated.error);
  }
  return { user, profile };
}

export async function createSession(input: { userId: string; topic: string; style: TeachingStyle; format: ResponseFormat; level: LearnerLevel; summary: string; teacherMessage: string; ui: LessonUi; modelId: string }) {
  const db = getSupabaseAdmin();
  const result = await db.from("learning_sessions").insert({ user_id: input.userId, topic: input.topic, style: input.style, content_format: input.format, declared_level: input.level, phase: "teach", summary: input.summary, current_teacher_message: input.teacherMessage, current_ui: input.ui, model_id: input.modelId, selected_subtopic_id: "foundations", selected_subtopic_label: `${input.topic} basics` }).select("*").single();
  databaseError(result.error);
  return result.data as DbSession;
}

export async function getSession(clerkUserId: string, sessionId: string): Promise<DbSession | null> {
  const user = await existingUser(clerkUserId);
  if (!user) return null;
  const db = getSupabaseAdmin();
  const result = await db.from("learning_sessions").select("*").eq("id", sessionId).eq("user_id", user.id).maybeSingle();
  databaseError(result.error);
  return result.data as DbSession | null;
}

export async function getActiveSessionCards(clerkUserId: string): Promise<SessionCard[]> {
  if (!learningDatabaseConfigured()) return [];
  const user = await existingUser(clerkUserId);
  if (!user) return [];
  const db = getSupabaseAdmin();
  const result = await db.from("learning_sessions").select("id, topic, selected_subtopic_label, progress_status, progress_confidence, last_active_at").eq("user_id", user.id).eq("status", "active").order("last_active_at", { ascending: false }).limit(6);
  databaseError(result.error);
  return (result.data ?? []).map((row) => ({ id: row.id, topic: row.topic, subtopic: row.selected_subtopic_label, progressStatus: row.progress_status as ProgressStatus, confidence: row.progress_confidence, lastActiveAt: row.last_active_at }));
}

export async function getRecentTurns(sessionId: string): Promise<RecentTurn[]> {
  const db = getSupabaseAdmin();
  const result = await db.from("lesson_turns").select("student_message, teacher_message").eq("session_id", sessionId).order("created_at", { ascending: false }).limit(4);
  databaseError(result.error);
  return (result.data ?? []).reverse().map((row) => ({ studentMessage: row.student_message, teacherMessage: row.teacher_message }));
}

export async function getRelevantMemories(userId: string): Promise<MemoryContext[]> {
  const db = getSupabaseAdmin();
  const result = await db.from("student_memories").select("type, content").eq("user_id", userId).order("last_used_at", { ascending: false, nullsFirst: false }).limit(6);
  databaseError(result.error);
  return (result.data ?? []) as MemoryContext[];
}

export async function countRecentTurns(userId: string) {
  const since = new Date(Date.now() - 10 * 60 * 1000).toISOString();
  const db = getSupabaseAdmin();
  const result = await db.from("lesson_turns").select("id", { count: "exact", head: true }).eq("user_id", userId).gte("created_at", since);
  databaseError(result.error);
  return result.count ?? 0;
}

export function calculateProgress(confidenceBefore: number, evidence: EvidenceKind, action: string) {
  const delta: Record<EvidenceKind, number> = { understood: 18, confused: -4, engaged: 5, none: 0 };
  const confidence = Math.max(0, Math.min(100, confidenceBefore + delta[evidence]));
  const correctChecks = evidence === "understood" ? 1 : 0;
  let status: ProgressStatus = confidence >= 80 ? "confident" : confidence >= 35 ? "learning" : evidence === "confused" ? "needs_review" : "exploring";
  if (action === "choose_next") status = "learning";
  return { confidence, status, correctChecks };
}

export async function saveTurn(input: { session: DbSession; action: string; studentMessage: string | null; teacherMessage: string; ui: LessonUi; summary: string; phase: LearningPhase; evidence: EvidenceKind; modelId: string; memoryCandidates: MemoryCandidate[]; complete: boolean }) {
  const db = getSupabaseAdmin();
  const update = calculateProgress(input.session.progress_confidence, input.evidence, input.action);
  const status = input.complete ? "completed" : "active";
  const sessionUpdate = await db.from("learning_sessions").update({
    selected_subtopic_id: input.session.selected_subtopic_id,
    phase: input.phase, status, summary: input.summary, current_teacher_message: input.teacherMessage, current_ui: input.ui, progress_status: update.status, progress_confidence: update.confidence, model_id: input.modelId, last_active_at: new Date().toISOString(), completed_at: input.complete ? new Date().toISOString() : null,
  }).eq("id", input.session.id).eq("user_id", input.session.user_id).select("*").single();
  databaseError(sessionUpdate.error);
  const saved = sessionUpdate.data as DbSession;
  const turn = await db.from("lesson_turns").insert({ session_id: saved.id, user_id: saved.user_id, action: input.action, student_message: input.studentMessage, teacher_message: input.teacherMessage, ui: input.ui, summary: input.summary, model_id: input.modelId });
  databaseError(turn.error);
  if (input.memoryCandidates.length) {
    const rows = input.memoryCandidates.filter((candidate) => candidate.confidence >= 0.7).map((candidate) => ({ user_id: saved.user_id, type: candidate.type, content: candidate.content, normalized_content: normalizeMemory(candidate.content), confidence: candidate.confidence, source_session_id: saved.id }));
    if (rows.length) {
      const memories = await db.from("student_memories").upsert(rows, { onConflict: "user_id,type,normalized_content", ignoreDuplicates: true });
      databaseError(memories.error);
    }
  }
  const key = saved.selected_subtopic_id ?? "topic-foundations";
  const label = saved.selected_subtopic_label ?? saved.topic;
  const progress = await db.from("concept_progress").upsert({ user_id: saved.user_id, session_id: saved.id, concept_key: key, concept_label: label, status: update.status, confidence: update.confidence, correct_checks: update.correctChecks, last_evidence: input.evidence, updated_at: new Date().toISOString() }, { onConflict: "session_id,concept_key" });
  databaseError(progress.error);
  return saved;
}

export async function selectSubtopic(session: DbSession, choice: { id: string; label: string }) {
  const db = getSupabaseAdmin();
  const result = await db.from("learning_sessions").update({ selected_subtopic_id: choice.id, selected_subtopic_label: choice.label, phase: "teach", last_active_at: new Date().toISOString() }).eq("id", session.id).eq("user_id", session.user_id).select("*").single();
  databaseError(result.error);
  return result.data as DbSession;
}

export async function updateProfilePreferences(clerkUserId: string, style: TeachingStyle, format: ResponseFormat) {
  const user = await existingUser(clerkUserId);
  if (!user) throw new Error("PROFILE_REQUIRED");
  const db = getSupabaseAdmin();
  const result = await db.from("student_profiles").update({ preferred_style: style, preferred_format: format, updated_at: new Date().toISOString() }).eq("user_id", user.id);
  databaseError(result.error);
  return getProfileState(clerkUserId);
}

export async function listStudentMemories(clerkUserId: string): Promise<StudentMemory[]> {
  const user = await existingUser(clerkUserId);
  if (!user) return [];
  const db = getSupabaseAdmin();
  const result = await db.from("student_memories").select("id, type, content, confidence, created_at").eq("user_id", user.id).order("created_at", { ascending: false });
  databaseError(result.error);
  return (result.data ?? []).map((row) => ({ id: row.id, type: row.type, content: row.content, confidence: Number(row.confidence), createdAt: row.created_at })) as StudentMemory[];
}

export async function deleteStudentMemory(clerkUserId: string, memoryId: string) {
  const user = await existingUser(clerkUserId);
  if (!user) return;
  const db = getSupabaseAdmin();
  const result = await db.from("student_memories").delete().eq("id", memoryId).eq("user_id", user.id);
  databaseError(result.error);
}

export async function deleteStudentLearningData(clerkUserId: string) {
  const user = await existingUser(clerkUserId);
  if (!user) return;
  const db = getSupabaseAdmin();
  const deleted = await db.from("app_users").delete().eq("id", user.id);
  databaseError(deleted.error);
}

export async function cleanupExpiredTurns() {
  const db = getSupabaseAdmin();
  const result = await db.from("lesson_turns").delete({ count: "exact" }).lt("expires_at", new Date().toISOString());
  databaseError(result.error);
  return result.count ?? 0;
}
