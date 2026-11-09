import React, { useEffect, useState } from "react";
import { castVote, getVoteAccess, getVoteLocations } from "../api/client.js";
import "./VoteLocationPage.css";

// Displays eligible locations and submits a single location selection (FR-VOT-01, FR-VOT-03, FR-VOT-05).
export default function VoteLocationPage({ roundId = "prototype-round" }) {
  const [locations, setLocations] = useState(null);
  const [canVote, setCanVote] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);
  const [selectedLocationId, setSelectedLocationId] = useState("");
  const [loadError, setLoadError] = useState("");
  const [voteError, setVoteError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const highestVoteCount =
    locations?.length > 0
      ? Math.max(...locations.map((location) => location.total_votes))
      : null;
  const tiedTopLocations =
    highestVoteCount === null
      ? []
      : locations.filter((location) => location.total_votes === highestVoteCount);
  const voteStatus = hasVoted
    ? "ใช้สิทธิ์แล้ว"
    : canVote
      ? selectedLocationId
        ? "พร้อมยืนยัน"
        : "รอเลือกสถานที่"
      : "แสดงผลคะแนน";

  useEffect(() => {
    let active = true;

    Promise.all([getVoteAccess(), getVoteLocations(roundId)])
      .then(([access, result]) => {
        if (active) {
          setCanVote(["lecturer", "committee"].includes(access.role));
          setLocations(result.locations);
          setHasVoted(result.has_voted);
          setLoadError("");
        }
      })
      .catch((error) => {
        if (active) setLoadError(error.message);
      });

    return () => {
      active = false;
    };
  }, [roundId]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!selectedLocationId || isSubmitting || hasVoted) return;

    setIsSubmitting(true);
    setVoteError("");
    try {
      const result = await castVote(roundId, selectedLocationId);
      setLocations((currentLocations) =>
        currentLocations.map((location) =>
          location.location_id === selectedLocationId
            ? { ...location, total_votes: result.total_votes }
            : location,
        ),
      );
      setHasVoted(result.has_voted);
    } catch (error) {
      setVoteError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (locations === null) {
    return (
      <main className="min-h-screen bg-slate-50 px-4 py-10 font-sans text-slate-700 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <header className="mb-10 text-center">
            <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-emerald-100 bg-white px-3 py-1 text-sm font-semibold text-emerald-800 shadow-sm">
              <span className="h-2 w-2 rounded-full bg-emerald-500" aria-hidden="true" />
              ต้นแบบเพื่อสาธิต
            </p>
            <h1 className="text-3xl font-bold tracking-tight text-slate-800 sm:text-4xl">
              ลงคะแนนสถานที่ค่าย
            </h1>
            <p className="mt-3 text-sm leading-6 text-slate-500 sm:text-base">
              ข้อมูลจำลอง ไม่บันทึกลงระบบจริง
            </p>
          </header>
          {loadError ? (
            <p
              className="mx-auto max-w-xl rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-center text-red-700"
              role="alert"
            >
              {loadError}
            </p>
          ) : (
            <p
              className="mx-auto flex max-w-xl items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white px-5 py-6 text-slate-600 shadow-sm"
              role="status"
            >
              <span
                className="h-5 w-5 animate-spin rounded-full border-2 border-emerald-600 border-t-transparent"
                aria-hidden="true"
              />
              กำลังโหลดข้อมูล
            </p>
          )}
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10 font-sans text-slate-700 sm:px-6 sm:py-14 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8 flex flex-col items-center text-center">
          <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-100 bg-white px-3.5 py-1.5 text-sm font-semibold text-emerald-800 shadow-sm">
            <svg
              aria-hidden="true"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="1.8"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M20.25 3.75c-8.5 0-14.5 3.25-14.5 10 0 3.5 2.5 6.5 6 6.5 6.75 0 8.5-8 8.5-16.5Z"
              />
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 21c3-5 7-8 12-11" />
            </svg>
            ต้นแบบเพื่อสาธิต
          </span>
          <h1 className="text-3xl font-bold tracking-tight text-slate-800 sm:text-4xl">
            ลงคะแนนสถานที่ค่าย
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
            ข้อมูลจำลอง ไม่บันทึกลงระบบจริง
          </p>
          <div
            aria-live="polite"
            className="mt-5 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-800 ring-1 ring-inset ring-emerald-100"
          >
            <span
              className={`h-2 w-2 rounded-full ${hasVoted ? "bg-emerald-600" : "bg-emerald-500"}`}
              aria-hidden="true"
            />
            สถานะ: {voteStatus}
          </div>
        </header>

        {canVote && locations.length > 0 && (
          <div
            aria-label="ความคืบหน้าการลงคะแนน"
            className="mx-auto mb-8 flex max-w-2xl items-center justify-center gap-3 rounded-2xl border border-slate-200/80 bg-white px-4 py-4 shadow-sm sm:gap-5 sm:px-8"
          >
            <div className="flex items-center gap-2 text-sm font-medium text-emerald-800">
              <span
                className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
                  selectedLocationId || hasVoted
                    ? "bg-emerald-600 text-white"
                    : "bg-emerald-100 text-emerald-800"
                }`}
              >
                {selectedLocationId || hasVoted ? "✓" : "1"}
              </span>
              <span>เลือกสถานที่</span>
            </div>
            <span className="h-px w-8 bg-slate-200 sm:w-16" aria-hidden="true" />
            <div
              className={`flex items-center gap-2 text-sm font-medium ${
                hasVoted ? "text-emerald-800" : "text-slate-400"
              }`}
            >
              <span
                className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
                  hasVoted ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-500"
                }`}
              >
                {hasVoted ? "✓" : "2"}
              </span>
              <span>ยืนยันคะแนน</span>
            </div>
          </div>
        )}

        <form className="space-y-7" onSubmit={handleSubmit}>
          {locations.length === 0 ? (
            <p className="mx-auto max-w-xl rounded-2xl border border-slate-200 bg-white px-5 py-6 text-center text-slate-600 shadow-sm">
              ไม่มีสถานที่ที่ผ่านการพิจารณา
            </p>
          ) : (
            <>
              {tiedTopLocations.length > 1 && (
                <p
                  className="mx-auto max-w-3xl rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-center leading-7 text-emerald-900"
                  role="status"
                >
                  คะแนนสูงสุดเสมอกัน:{" "}
                  {tiedTopLocations.map((location) => location.name).join(" และ ")}
                  {" — "}คณะกรรมการโปรดพิจารณาตัดสินใจต่อ ระบบจะไม่เลือกผู้ชนะ
                </p>
              )}
              <fieldset>
                <legend className="mb-4 text-base font-semibold text-slate-700">
                  เลือกสถานที่ 1 แห่ง
                </legend>
                <div className="grid grid-cols-1 items-stretch gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {locations.map((location) => {
                    const selected = selectedLocationId === location.location_id;
                    const card = (
                      <article
                        className={`h-full overflow-hidden rounded-2xl border bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${
                          canVote ? "cursor-pointer" : ""
                        } ${
                          selected
                            ? "border-emerald-500 bg-emerald-50/40 ring-2 ring-emerald-500 shadow-lg shadow-emerald-500/10"
                            : "border-slate-200 hover:border-emerald-200"
                        }`}
                      >
                        <div className="relative aspect-video overflow-hidden bg-emerald-50">
                          <img
                            className="h-full w-full object-cover"
                            src={location.image_url}
                            alt={`ภาพตัวอย่าง: ${location.name}`}
                          />
                          <div
                            className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-900/35 via-transparent to-transparent"
                            aria-hidden="true"
                          />
                          {selected && (
                            <span
                              className="absolute right-3 top-3 inline-flex h-9 w-9 items-center justify-center rounded-full bg-emerald-600 text-white shadow-lg ring-2 ring-white"
                              aria-label="เลือกสถานที่นี้แล้ว"
                            >
                              <svg
                                aria-hidden="true"
                                className="h-5 w-5"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth="2.5"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="m5 12 4 4L19 6"
                                />
                              </svg>
                            </span>
                          )}
                        </div>
                        <div className="p-5">
                          <h2 className="text-lg font-bold leading-snug text-slate-800">
                            {location.name}
                          </h2>
                          <p className="mt-2 min-h-12 text-sm leading-6 text-slate-500">
                            {location.survey_summary}
                          </p>
                          <p className="mt-4 flex items-center justify-between gap-3 border-t border-slate-100 pt-4 text-sm font-medium text-slate-600">
                            <span>คะแนนรวม</span>
                            <output className="inline-flex min-w-10 items-center justify-center rounded-full bg-emerald-50 px-3 py-1 font-semibold text-emerald-700">
                              {location.total_votes}
                            </output>
                          </p>
                        </div>
                      </article>
                    );

                    if (!canVote) {
                      return <div key={location.location_id}>{card}</div>;
                    }

                    return (
                      <label key={location.location_id} className="group relative block">
                        <input
                          type="radio"
                          name="location"
                          className="peer sr-only"
                          value={location.location_id}
                          aria-label={`เลือก ${location.name}`}
                          checked={selected}
                          disabled={hasVoted}
                          onChange={() => setSelectedLocationId(location.location_id)}
                        />
                        <div className="h-full rounded-2xl peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-4 peer-focus-visible:outline-emerald-500">
                          {card}
                        </div>
                      </label>
                    );
                  })}
                </div>
              </fieldset>
            </>
          )}
          {canVote && locations.length > 0 && (
            <div className="flex justify-center pt-1">
              <button
                className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 px-7 py-3 font-semibold text-white shadow-lg shadow-emerald-700/20 transition-all duration-200 hover:-translate-y-0.5 hover:from-emerald-700 hover:to-green-700 hover:shadow-xl active:translate-y-0 disabled:cursor-not-allowed disabled:from-slate-300 disabled:to-slate-400 disabled:shadow-none sm:w-auto sm:min-w-56"
                type="submit"
                disabled={!selectedLocationId || isSubmitting || hasVoted}
              >
                {isSubmitting ? (
                  <>
                    <span
                      className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"
                      aria-hidden="true"
                    />
                    กำลังบันทึกคะแนน
                  </>
                ) : (
                  <>
                    <svg
                      aria-hidden="true"
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="m5 12 4 4L19 6" />
                    </svg>
                    {hasVoted ? "ใช้สิทธิ์แล้ว" : "ยืนยันการลงคะแนน"}
                  </>
                )}
              </button>
            </div>
          )}
        </form>

        {voteError && (
          <p
            className="mx-auto mt-6 max-w-xl rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-center text-red-700"
            role="alert"
          >
            {voteError}
          </p>
        )}
        {hasVoted && (
          <p
            className="mx-auto mt-6 max-w-xl rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-center font-medium text-emerald-800"
            role="status"
          >
            ท่านได้ใช้สิทธิ์ไปแล้ว
          </p>
        )}
      </div>
    </main>
  );
}
