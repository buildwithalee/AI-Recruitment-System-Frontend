"use client";

import {
  FormEvent,
  useEffect,
  useRef,
  useState,
} from "react";

type Job = {
  id: string;
  title: string;
  department: string | null;
};

type AnalysisResult = {
  fit_score: number;
  classification: string;
  risk_level: string;
  decision: string;
  reason: string;
  missing_skills: string[];
};

type AnalyzeResponse = {
  message: string;
  application_id: string;
  candidate: {
    id: string;
    full_name: string;
    email: string;
  };
  job: {
    id: string;
    title: string;
  };
  github: {
    available: boolean;
    username?: string;
    name?: string | null;
    bio?: string | null;
    public_repos?: number;
    followers?: number;
    languages?: string[];
  };
  result: AnalysisResult;
};

export default function ApplyPage() {
  const API_URL =
    process.env.NEXT_PUBLIC_API_URL ||
    "http://127.0.0.1:8000";

  const resultRef = useRef<HTMLElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [jobs, setJobs] = useState<Job[]>([]);
  const [resume, setResume] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [jobsLoading, setJobsLoading] = useState(true);
  const [error, setError] = useState("");
  const [analysis, setAnalysis] =
    useState<AnalyzeResponse | null>(null);

  const [form, setForm] = useState({
    full_name: "",
    email: "",
    phone: "",
    github_username: "",
    skills: "",
    experience_years: "",
    position: "",
  });

  useEffect(() => {
    async function loadJobs() {
      try {
        setJobsLoading(true);
        setError("");

        const response = await fetch(`${API_URL}/jobs`, {
          cache: "no-store",
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.detail || "Jobs could not be loaded"
          );
        }

        setJobs(data.jobs || []);
      } catch (err) {
        console.error("Failed to load jobs:", err);

        setError(
          err instanceof Error
            ? err.message
            : "Failed to load jobs."
        );
      } finally {
        setJobsLoading(false);
      }
    }

    loadJobs();
  }, [API_URL]);

  useEffect(() => {
    if (analysis && resultRef.current) {
      resultRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }, [analysis]);

  function handleChange(
    event:
      | React.ChangeEvent<HTMLInputElement>
      | React.ChangeEvent<HTMLSelectElement>
  ) {
    setForm({
      ...form,
      [event.target.name]: event.target.value,
    });
  }

  function handleResumeChange(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0];

    setError("");
    setAnalysis(null);

    if (!file) {
      setResume(null);
      return;
    }

    if (file.type !== "application/pdf") {
      setError("Only PDF resume files are allowed.");
      event.target.value = "";
      setResume(null);
      return;
    }

    const maxSize = 10 * 1024 * 1024;

    if (file.size > maxSize) {
      setError("Resume must be smaller than 10 MB.");
      event.target.value = "";
      setResume(null);
      return;
    }

    setResume(file);
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();

    setLoading(true);
    setError("");
    setAnalysis(null);

    try {
      if (!resume) {
        throw new Error(
          "Please upload your CV in PDF format."
        );
      }

      if (!form.position) {
        throw new Error(
          "Please select a position."
        );
      }

      const formData = new FormData();

      formData.append(
        "full_name",
        form.full_name.trim()
      );

      formData.append(
        "email",
        form.email.trim()
      );

      formData.append(
        "position",
        form.position
      );

      formData.append(
        "skills",
        form.skills.trim()
      );

      formData.append(
        "experience_years",
        form.experience_years || "0"
      );

      formData.append(
        "github_username",
        form.github_username.trim()
      );

      formData.append(
        "phone",
        form.phone.trim()
      );

      formData.append(
        "cv",
        resume
      );

      const response = await fetch(
        `${API_URL}/analyze-application`,
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail ||
            "Application could not be analyzed."
        );
      }

      setAnalysis(data);
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

  function formatLabel(value: string) {
    return value
      .replaceAll("_", " ")
      .replace(
        /\b\w/g,
        (char) => char.toUpperCase()
      );
  }

  function scoreColor(score: number) {
    if (score >= 75) {
      return "text-green-400";
    }

    if (score >= 45) {
      return "text-yellow-400";
    }

    return "text-red-400";
  }

  function decisionStyle(decision: string) {
    if (decision === "shortlist") {
      return "border-green-500/30 bg-green-500/10 text-green-300";
    }

    if (decision === "human_review") {
      return "border-yellow-500/30 bg-yellow-500/10 text-yellow-300";
    }

    return "border-red-500/30 bg-red-500/10 text-red-300";
  }

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-10 text-white sm:px-6">
      <div className="mx-auto max-w-5xl">

        {/* HEADER */}
        <div className="mb-10 text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.25em] text-blue-400">
            AI Recruitment Screening
          </p>

          <h1 className="text-3xl font-bold sm:text-4xl">
            Check Your Job Fit
          </h1>

          <p className="mx-auto mt-4 max-w-2xl text-slate-400">
            Choose a position, upload your CV and optionally add
            your GitHub profile. AI will compare your profile
            against the selected role and instantly show your
            fit score.
          </p>

          <p className="mt-3 text-sm text-slate-500">
            {jobsLoading
              ? "Loading available positions..."
              : `${jobs.length} open position${
                  jobs.length === 1 ? "" : "s"
                } available`}
          </p>
        </div>

        {/* FORM */}
        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-xl sm:p-8"
        >
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">

            <div>
              <label className="mb-2 block text-sm font-medium">
                Full Name *
              </label>

              <input
                type="text"
                name="full_name"
                value={form.full_name}
                onChange={handleChange}
                required
                placeholder="Enter your full name"
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Email Address *
              </label>

              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                required
                placeholder="yourname@example.com"
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Phone Number
              </label>

              <input
                type="text"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="+92 300 1234567"
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                GitHub Username / URL
              </label>

              <input
                type="text"
                name="github_username"
                value={form.github_username}
                onChange={handleChange}
                placeholder="raza-IT-expert or github.com/username"
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-blue-500"
              />

              <p className="mt-2 text-xs text-slate-500">
                Optional. Missing GitHub will not block your application.
              </p>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Experience (Years)
              </label>

              <input
                type="number"
                name="experience_years"
                value={form.experience_years}
                onChange={handleChange}
                min="0"
                step="0.5"
                placeholder="0"
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Apply For *
              </label>

              <select
                name="position"
                value={form.position}
                onChange={handleChange}
                required
                disabled={jobsLoading}
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-blue-500 disabled:opacity-50"
              >
                <option value="">
                  {jobsLoading
                    ? "Loading positions..."
                    : "Select Position"}
                </option>

                {jobs.map((job) => (
                  <option
                    key={job.id}
                    value={job.title}
                  >
                    {job.title}
                    {job.department
                      ? ` — ${job.department}`
                      : ""}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-6">
            <label className="mb-2 block text-sm font-medium">
              Your Skills *
            </label>

            <input
              type="text"
              name="skills"
              value={form.skills}
              onChange={handleChange}
              required
              placeholder="e.g. Python, SQL, React, Networking"
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-blue-500"
            />

            <p className="mt-2 text-xs text-slate-500">
              Separate multiple skills using commas.
            </p>
          </div>

          <div className="mt-6">
            <label className="mb-2 block text-sm font-medium">
              Resume / CV *
            </label>

            <div className="rounded-lg border-2 border-dashed border-slate-700 bg-slate-950 p-6">
              <input
                ref={fileInputRef}
                type="file"
                accept="application/pdf"
                required
                onChange={handleResumeChange}
                className="block w-full text-sm text-slate-400 file:mr-4 file:rounded-lg file:border-0 file:bg-blue-600 file:px-4 file:py-2 file:font-semibold file:text-white hover:file:bg-blue-500"
              />

              <p className="mt-3 text-xs text-slate-500">
                PDF only. Maximum size: 10 MB.
              </p>

              {resume && (
                <p className="mt-3 text-sm text-green-400">
                  Selected: {resume.name}
                </p>
              )}
            </div>
          </div>

          {error && (
            <div className="mt-6 rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-red-400">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={
              loading ||
              jobsLoading ||
              jobs.length === 0
            }
            className="mt-8 w-full rounded-lg bg-blue-600 px-6 py-4 text-lg font-semibold transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading
              ? "AI is analyzing your CV and GitHub..."
              : "Analyze My Application"}
          </button>
        </form>

        {/* AI RESULT */}
        {analysis && (
          <section
            ref={resultRef}
            className="mt-8 scroll-mt-6 rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-xl sm:p-8"
          >
            <div className="mb-8 flex flex-col gap-6 border-b border-slate-800 pb-6 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-widest text-blue-400">
                  AI Screening Result
                </p>

                <h2 className="mt-2 text-2xl font-bold">
                  {analysis.candidate.full_name}
                </h2>

                <p className="mt-1 text-slate-400">
                  Applied for {analysis.job.title}
                </p>
              </div>

              <div className="md:text-right">
                <p className="text-sm text-slate-400">
                  Fit Score
                </p>

                <p
                  className={`text-5xl font-bold ${scoreColor(
                    analysis.result.fit_score
                  )}`}
                >
                  {analysis.result.fit_score}
                  <span className="text-2xl text-slate-500">
                    /100
                  </span>
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="rounded-xl border border-slate-800 bg-slate-950 p-5">
                <p className="text-sm text-slate-400">
                  Classification
                </p>

                <p className="mt-2 text-lg font-semibold">
                  {formatLabel(
                    analysis.result.classification
                  )}
                </p>
              </div>

              <div className="rounded-xl border border-slate-800 bg-slate-950 p-5">
                <p className="text-sm text-slate-400">
                  Risk Level
                </p>

                <p className="mt-2 text-lg font-semibold">
                  {formatLabel(
                    analysis.result.risk_level
                  )}
                </p>
              </div>

              <div
                className={`rounded-xl border p-5 ${decisionStyle(
                  analysis.result.decision
                )}`}
              >
                <p className="text-sm opacity-80">
                  AI Decision
                </p>

                <p className="mt-2 text-lg font-bold">
                  {formatLabel(
                    analysis.result.decision
                  )}
                </p>
              </div>
            </div>

            <div className="mt-6 rounded-xl border border-slate-800 bg-slate-950 p-5">
              <p className="text-sm font-medium text-slate-400">
                Why this score?
              </p>

              <p className="mt-3 leading-7 text-slate-200">
                {analysis.result.reason}
              </p>
            </div>

            <div className="mt-6">
              <p className="mb-3 text-sm font-medium text-slate-400">
                Missing / Recommended Skills
              </p>

              {analysis.result.missing_skills.length >
              0 ? (
                <div className="flex flex-wrap gap-2">
                  {analysis.result.missing_skills.map(
                    (skill) => (
                      <span
                        key={skill}
                        className="rounded-full border border-red-500/30 bg-red-500/10 px-3 py-1.5 text-sm text-red-300"
                      >
                        {skill}
                      </span>
                    )
                  )}
                </div>
              ) : (
                <p className="text-green-400">
                  No major missing skills identified.
                </p>
              )}
            </div>

            <div className="mt-6 rounded-xl border border-blue-500/20 bg-blue-500/5 p-5">
              <p className="text-sm font-medium text-blue-300">
                GitHub Analysis
              </p>

              {analysis.github.available ? (
                <div className="mt-2 space-y-1 text-sm text-slate-300">
                  <p>
                    Profile:{" "}
                    {analysis.github.name ||
                      analysis.github.username}
                  </p>

                  {analysis.github.bio && (
                    <p className="text-slate-400">
                      {analysis.github.bio}
                    </p>
                  )}

                  <p>
                    Public repositories:{" "}
                    {analysis.github.public_repos ?? 0}
                  </p>

                  {analysis.github.languages?.length ? (
                    <p>
                      Languages:{" "}
                      {analysis.github.languages.join(", ")}
                    </p>
                  ) : null}
                </div>
              ) : (
                <p className="mt-2 text-sm text-slate-400">
                  GitHub was not provided or could not be analyzed.
                  The application was still evaluated using the CV
                  and submitted information.
                </p>
              )}
            </div>

            <p className="mt-6 text-xs text-slate-500">
              Application ID: {analysis.application_id}
            </p>
          </section>
        )}

        <div className="mt-6 text-center">
          <a
            href="/"
            className="text-sm text-blue-400 hover:underline"
          >
            ← Back to Recruitment Dashboard
          </a>
        </div>
      </div>
    </main>
  );
}
