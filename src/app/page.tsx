"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type DashboardApplication = {
  id: string;
  candidate_id: string;
  candidate_name: string;
  candidate_email: string;
  job_id: string;
  job_title: string;
  department: string | null;
  ai_fit_score: number | null;
  ai_classification: string | null;
  risk_level: string | null;
  ai_decision: string | null;
  final_status: string | null;
  applied_at: string | null;
};

type DashboardResponse = {
  stats: {
    total_applications: number;
    average_score: number;
    strong_matches: number;
    rejected: number;
  };
  applications: DashboardApplication[];
};

export default function Home() {
  const API_URL =
    process.env.NEXT_PUBLIC_API_URL ||
    "http://127.0.0.1:8000";

  const [data, setData] = useState<DashboardResponse>({
    stats: {
      total_applications: 0,
      average_score: 0,
      strong_matches: 0,
      rejected: 0,
    },
    applications: [],
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadDashboard() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `${API_URL}/dashboard`,
          {
            cache: "no-store",
          }
        );

        const result = await response.json();

        if (!response.ok) {
          throw new Error(
            result.detail ||
              "Failed to load dashboard"
          );
        }

        setData(result);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load dashboard"
        );
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, [API_URL]);

  function formatLabel(value: string | null) {
    if (!value) {
      return "Pending";
    }

    return value
      .replaceAll("_", " ")
      .replace(
        /\b\w/g,
        (char) => char.toUpperCase()
      );
  }

  function scoreClass(score: number | null) {
    if (score === null) {
      return "text-slate-500";
    }

    if (score >= 75) {
      return "text-green-400";
    }

    if (score >= 45) {
      return "text-yellow-400";
    }

    return "text-red-400";
  }

  function decisionClass(
    decision: string | null
  ) {
    if (decision === "shortlist") {
      return "bg-green-500/15 text-green-400";
    }

    if (decision === "human_review") {
      return "bg-yellow-500/15 text-yellow-400";
    }

    if (decision === "reject") {
      return "bg-red-500/15 text-red-400";
    }

    return "bg-slate-700/40 text-slate-400";
  }

  function formatDate(value: string | null) {
    if (!value) {
      return "—";
    }

    return new Date(value).toLocaleString();
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="flex min-h-screen">

        {/* SIDEBAR */}
        <aside className="hidden w-64 shrink-0 border-r border-slate-800 bg-slate-900 p-6 lg:block">
          <h1 className="mb-10 text-2xl font-bold">
            AI Recruitment
          </h1>

          <nav className="space-y-3">
            <div className="rounded-lg bg-blue-600 px-4 py-3">
              Dashboard
            </div>

            <Link
              href="/apply"
              className="block rounded-lg px-4 py-3 transition hover:bg-slate-800"
            >
              Apply / Check Fit
            </Link>
          </nav>

          <div className="mt-10 rounded-xl border border-slate-800 bg-slate-950 p-4">
            <p className="text-xs uppercase tracking-wider text-slate-500">
              Final FYP Flow
            </p>

            <p className="mt-2 text-sm leading-6 text-slate-400">
              CV + GitHub + Job Position → AI Fit Score
            </p>
          </div>
        </aside>

        {/* MAIN */}
        <section className="min-w-0 flex-1 p-5 sm:p-8">

          <div className="mb-8 flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-400">
                AI Recruitment Screening
              </p>

              <h2 className="mt-2 text-3xl font-bold">
                Recruitment Dashboard
              </h2>

              <p className="mt-2 text-slate-400">
                AI screening results from FastAPI,
                Supabase, CV parsing and GitHub analysis.
              </p>
            </div>

            <Link
              href="/apply"
              className="rounded-lg bg-blue-600 px-5 py-3 text-center font-semibold transition hover:bg-blue-500"
            >
              + Analyze New Candidate
            </Link>
          </div>

          {/* STATS */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">
              <p className="text-sm text-slate-400">
                Total Applications
              </p>

              <h3 className="mt-2 text-3xl font-bold">
                {data.stats.total_applications}
              </h3>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">
              <p className="text-sm text-slate-400">
                Average AI Score
              </p>

              <h3 className="mt-2 text-3xl font-bold text-blue-400">
                {data.stats.average_score}
                <span className="text-lg text-slate-500">
                  /100
                </span>
              </h3>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">
              <p className="text-sm text-slate-400">
                Strong Matches
              </p>

              <h3 className="mt-2 text-3xl font-bold text-green-400">
                {data.stats.strong_matches}
              </h3>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">
              <p className="text-sm text-slate-400">
                AI Rejected
              </p>

              <h3 className="mt-2 text-3xl font-bold text-red-400">
                {data.stats.rejected}
              </h3>
            </div>
          </div>

          {/* RECENT APPLICATIONS */}
          <div className="mt-8 rounded-xl border border-slate-800 bg-slate-900 p-6">
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <h3 className="text-xl font-semibold">
                  Recent Applications
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  Latest AI-screened candidates
                </p>
              </div>

              <Link
                href="/apply"
                className="text-sm font-medium text-blue-400 hover:underline"
              >
                Check another candidate
              </Link>
            </div>

            {error && (
              <div className="mb-5 rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-red-400">
                {error}
              </div>
            )}

            {loading ? (
              <p className="text-slate-400">
                Loading applications...
              </p>
            ) : data.applications.length === 0 ? (
              <div className="rounded-lg border border-dashed border-slate-700 p-8 text-center">
                <p className="text-slate-400">
                  No applications found.
                </p>

                <Link
                  href="/apply"
                  className="mt-4 inline-block text-blue-400 hover:underline"
                >
                  Analyze the first candidate
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[900px] text-left">
                  <thead className="border-b border-slate-700 text-sm text-slate-400">
                    <tr>
                      <th className="pb-3">
                        Candidate
                      </th>

                      <th className="pb-3">
                        Position
                      </th>

                      <th className="pb-3">
                        Fit Score
                      </th>

                      <th className="pb-3">
                        Classification
                      </th>

                      <th className="pb-3">
                        AI Decision
                      </th>

                      <th className="pb-3">
                        Applied
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {data.applications
                      .slice(0, 15)
                      .map((application) => (
                        <tr
                          key={application.id}
                          className="border-b border-slate-800 transition hover:bg-slate-800/40"
                        >
                          <td className="py-4 pr-6">
                            <p className="font-medium">
                              {application.candidate_name}
                            </p>

                            <p className="mt-1 text-xs text-slate-500">
                              {application.candidate_email}
                            </p>
                          </td>

                          <td className="pr-6">
                            <p>
                              {application.job_title}
                            </p>

                            {application.department && (
                              <p className="mt-1 text-xs text-slate-500">
                                {application.department}
                              </p>
                            )}
                          </td>

                          <td className="pr-6">
                            <span
                              className={`text-lg font-bold ${scoreClass(
                                application.ai_fit_score
                              )}`}
                            >
                              {application.ai_fit_score !== null
                                ? `${application.ai_fit_score}/100`
                                : "N/A"}
                            </span>
                          </td>

                          <td className="pr-6 text-sm">
                            {formatLabel(
                              application.ai_classification
                            )}
                          </td>

                          <td className="pr-6">
                            <span
                              className={`rounded-full px-3 py-1 text-sm font-medium ${decisionClass(
                                application.ai_decision
                              )}`}
                            >
                              {formatLabel(
                                application.ai_decision
                              )}
                            </span>
                          </td>

                          <td className="text-sm text-slate-400">
                            {formatDate(
                              application.applied_at
                            )}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
