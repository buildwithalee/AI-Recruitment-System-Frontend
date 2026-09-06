"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

type Candidate = {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  github_username: string | null;
  skills: string[];
  experience_years: number;
  resume_url: string | null;
};

type Job = {
  id: string;
  title: string;
  department: string | null;
};

type Application = {
  id: string;
  candidate_id: string;
  job_id: string;
  summary: string | null;

  ai_fit_score: number | null;
  ai_classification: string | null;
  risk_level: string | null;
  ai_decision: string | null;

  hr_decision: string | null;
  final_status: string;
  applied_at: string;
};

export default function ApplicationDetailPage() {
  const params = useParams();

  const applicationId = params.id as string;

  const API_URL =
    process.env.NEXT_PUBLIC_API_URL ||
    "http://127.0.0.1:8000";

  const [application, setApplication] =
    useState<Application | null>(null);

  const [candidate, setCandidate] =
    useState<Candidate | null>(null);

  const [job, setJob] =
    useState<Job | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [actionLoading, setActionLoading] =
    useState(false);

  const [message, setMessage] =
    useState("");

  const [error, setError] =
    useState("");

  // ==============================
  // LOAD APPLICATION DETAIL
  // ==============================

  async function loadData() {
    try {
      setLoading(true);
      setError("");

      const [
        applicationsResponse,
        candidatesResponse,
        jobsResponse,
      ] = await Promise.all([
        fetch(`${API_URL}/applications`, {
          cache: "no-store",
        }),

        fetch(`${API_URL}/candidates`, {
          cache: "no-store",
        }),

        fetch(`${API_URL}/jobs`, {
          cache: "no-store",
        }),
      ]);

      if (
        !applicationsResponse.ok ||
        !candidatesResponse.ok ||
        !jobsResponse.ok
      ) {
        throw new Error(
          "Could not load application details."
        );
      }

      const applicationsData =
        await applicationsResponse.json();

      const candidatesData =
        await candidatesResponse.json();

      const jobsData =
        await jobsResponse.json();

      const selectedApplication =
        (
          applicationsData.applications || []
        ).find(
          (item: Application) =>
            item.id === applicationId
        );

      if (!selectedApplication) {
        throw new Error(
          "Application not found."
        );
      }

      const selectedCandidate =
        (
          candidatesData.candidates || []
        ).find(
          (item: Candidate) =>
            item.id ===
            selectedApplication.candidate_id
        );

      const selectedJob =
        (
          jobsData.jobs || []
        ).find(
          (item: Job) =>
            item.id ===
            selectedApplication.job_id
        );

      setApplication(
        selectedApplication
      );

      setCandidate(
        selectedCandidate || null
      );

      setJob(
        selectedJob || null
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (applicationId) {
      loadData();
    }
  }, [applicationId]);

  // ==============================
  // HR APPROVE / REJECT
  // ==============================

  async function submitHRDecision(
    decision: "approved" | "rejected"
  ) {
    if (!application) return;

    const confirmed = window.confirm(
      decision === "approved"
        ? "Approve this candidate?"
        : "Reject this candidate?"
    );

    if (!confirmed) return;

    try {
      setActionLoading(true);
      setMessage("");
      setError("");

      const response = await fetch(
        `${API_URL}/hr-reviews`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            application_id:
              application.id,

            decision,

            comments:
              decision === "approved"
                ? "Approved from HR dashboard"
                : "Rejected from HR dashboard",
          }),
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail ||
            "HR decision failed."
        );
      }

      setMessage(
        decision === "approved"
          ? "Candidate approved successfully."
          : "Candidate rejected successfully."
      );

      await loadData();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong."
      );
    } finally {
      setActionLoading(false);
    }
  }

  // ==============================
  // LOADING
  // ==============================

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-950 p-10 text-white">
        <p className="text-slate-400">
          Loading application...
        </p>
      </main>
    );
  }

  // ==============================
  // ERROR
  // ==============================

  if (!application) {
    return (
      <main className="min-h-screen bg-slate-950 p-10 text-white">

        <div className="mx-auto max-w-5xl">

          <p className="text-red-400">
            {error ||
              "Application not found."}
          </p>

          <Link
            href="/"
            className="mt-6 inline-block text-blue-400 hover:underline"
          >
            ← Back to Dashboard
          </Link>

        </div>

      </main>
    );
  }

  const currentStatus =
    application.final_status ===
    "hr_approved"
      ? "Approved"
      : application.final_status ===
        "hr_rejected"
      ? "Rejected"
      : application.final_status ===
        "auto_shortlisted"
      ? "Shortlisted"
      : "HR Review";

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-10 text-white">

      <div className="mx-auto max-w-6xl">

        {/* HEADER */}

        <div className="mb-8 flex items-center justify-between">

          <div>

            <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-blue-400">
              AI Recruitment Copilot
            </p>

            <h1 className="text-3xl font-bold">
              Candidate Application
            </h1>

          </div>

          <Link
            href="/"
            className="rounded-lg border border-slate-700 px-4 py-2 text-sm hover:bg-slate-800"
          >
            ← Dashboard
          </Link>

        </div>

        {/* SUCCESS */}

        {message && (
          <div className="mb-6 rounded-lg border border-green-500/30 bg-green-500/10 p-4 text-green-400">
            {message}
          </div>
        )}

        {/* ERROR */}

        {error && (
          <div className="mb-6 rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-red-400">
            {error}
          </div>
        )}

        {/* TOP SECTION */}

        <div className="grid gap-6 lg:grid-cols-3">

          {/* CANDIDATE */}

          <div className="rounded-xl border border-slate-800 bg-slate-900 p-6 lg:col-span-2">

            <h2 className="mb-6 text-xl font-semibold">
              Candidate Information
            </h2>

            <div className="grid gap-5 md:grid-cols-2">

              <Info
                label="Full Name"
                value={
                  candidate?.full_name ||
                  "N/A"
                }
              />

              <Info
                label="Email"
                value={
                  candidate?.email ||
                  "N/A"
                }
              />

              <Info
                label="Phone"
                value={
                  candidate?.phone ||
                  "N/A"
                }
              />

              <Info
                label="GitHub"
                value={
                  candidate?.github_username ||
                  "N/A"
                }
              />

              <Info
                label="Experience"
                value={
                  candidate
                    ? `${candidate.experience_years} years`
                    : "N/A"
                }
              />

              <Info
                label="Position"
                value={
                  job?.title ||
                  "N/A"
                }
              />

            </div>

            <div className="mt-6">

              <p className="mb-2 text-sm text-slate-400">
                Skills
              </p>

              <div className="flex flex-wrap gap-2">

                {candidate?.skills?.length ? (
                  candidate.skills.map(
                    (skill) => (
                      <span
                        key={skill}
                        className="rounded-full bg-blue-500/10 px-3 py-1 text-sm text-blue-400"
                      >
                        {skill}
                      </span>
                    )
                  )
                ) : (
                  <span className="text-slate-300">
                    N/A
                  </span>
                )}

              </div>

            </div>

            <div className="mt-6">

              <p className="mb-2 text-sm text-slate-400">
                Candidate Summary
              </p>

              <p className="leading-7 text-slate-300">
                {application.summary ||
                  "No summary provided."}
              </p>

            </div>

          </div>

          {/* CURRENT STATUS */}

          <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">

            <h2 className="mb-5 text-xl font-semibold">
              Application Status
            </h2>

            <p className="text-sm text-slate-400">
              Current Status
            </p>

            <div className="mt-2">

              <span
                className={`inline-block rounded-full px-4 py-2 text-sm font-semibold ${
                  currentStatus ===
                  "Rejected"
                    ? "bg-red-500/20 text-red-400"
                    : currentStatus ===
                      "HR Review"
                    ? "bg-yellow-500/20 text-yellow-400"
                    : "bg-green-500/20 text-green-400"
                }`}
              >
                {currentStatus}
              </span>

            </div>

            <div className="mt-6 space-y-4">

              <Info
                label="HR Decision"
                value={
                  application.hr_decision ||
                  "pending"
                }
              />

              <Info
                label="Applied At"
                value={
                  application.applied_at
                    ? new Date(
                        application.applied_at
                      ).toLocaleString()
                    : "N/A"
                }
              />

            </div>

          </div>

        </div>

        {/* AI EVALUATION */}

        <div className="mt-6 rounded-xl border border-slate-800 bg-slate-900 p-6">

          <h2 className="mb-6 text-xl font-semibold">
            AI Evaluation
          </h2>

          <div className="grid gap-5 md:grid-cols-4">

            <div className="rounded-xl bg-slate-950 p-5">

              <p className="text-sm text-slate-400">
                AI Fit Score
              </p>

              <p className="mt-2 text-3xl font-bold text-blue-400">
                {application.ai_fit_score !==
                null
                  ? `${application.ai_fit_score}%`
                  : "N/A"}
              </p>

            </div>

            <div className="rounded-xl bg-slate-950 p-5">

              <Info
                label="Classification"
                value={
                  application.ai_classification
                    ?.replace(/_/g, " ") ||
                  "N/A"
                }
              />

            </div>

            <div className="rounded-xl bg-slate-950 p-5">

              <Info
                label="Risk Level"
                value={
                  application.risk_level ||
                  "N/A"
                }
              />

            </div>

            <div className="rounded-xl bg-slate-950 p-5">

              <Info
                label="AI Decision"
                value={
                  application.ai_decision
                    ?.replace(/_/g, " ") ||
                  "N/A"
                }
              />

            </div>

          </div>

        </div>

        {/* HR ACTIONS */}

        <div className="mt-6 rounded-xl border border-slate-800 bg-slate-900 p-6">

          <h2 className="text-xl font-semibold">
            HR Decision
          </h2>

          <p className="mt-2 text-slate-400">
            Review the candidate and make
            the final HR decision.
          </p>

          <div className="mt-6 flex flex-col gap-4 sm:flex-row">

            <button
              onClick={() =>
                submitHRDecision(
                  "approved"
                )
              }
              disabled={actionLoading}
              className="rounded-lg bg-green-600 px-8 py-3 font-semibold hover:bg-green-500 disabled:opacity-50"
            >
              {actionLoading
                ? "Processing..."
                : "Approve Candidate"}
            </button>

            <button
              onClick={() =>
                submitHRDecision(
                  "rejected"
                )
              }
              disabled={actionLoading}
              className="rounded-lg bg-red-600 px-8 py-3 font-semibold hover:bg-red-500 disabled:opacity-50"
            >
              {actionLoading
                ? "Processing..."
                : "Reject Candidate"}
            </button>

          </div>

        </div>

      </div>

    </main>
  );
}


// ==============================
// REUSABLE INFORMATION FIELD
// ==============================

function Info({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>

      <p className="text-sm text-slate-400">
        {label}
      </p>

      <p className="mt-1 capitalize text-slate-200">
        {value}
      </p>

    </div>
  );
}