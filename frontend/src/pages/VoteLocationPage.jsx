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
      <main className="vote-page">
        <header className="vote-page__header">
          <h1>ลงคะแนนสถานที่ค่าย</h1>
          <p className="vote-page__description">
            ต้นแบบเพื่อสาธิต — ข้อมูลจำลอง ไม่บันทึกลงระบบจริง
          </p>
        </header>
        {loadError ? (
          <p className="vote-message vote-message--error" role="alert">
            {loadError}
          </p>
        ) : (
          <p className="vote-message" role="status">
            กำลังโหลดข้อมูล
          </p>
        )}
      </main>
    );
  }

  return (
    <main className="vote-page">
      <header className="vote-page__header">
        <h1>ลงคะแนนสถานที่ค่าย</h1>
        <p className="vote-page__description">
          ต้นแบบเพื่อสาธิต — ข้อมูลจำลอง ไม่บันทึกลงระบบจริง
        </p>
      </header>
      <form className="vote-form" onSubmit={handleSubmit}>
        {locations.length === 0 ? (
          <p className="vote-message">ไม่มีสถานที่ที่ผ่านการพิจารณา</p>
        ) : (
          <>
            {tiedTopLocations.length > 1 && (
              <p className="vote-message vote-message--success" role="status">
                คะแนนสูงสุดเสมอกัน: {tiedTopLocations.map((location) => location.name).join(" และ ")}
                {" — "}คณะกรรมการโปรดพิจารณาตัดสินใจต่อ ระบบจะไม่เลือกผู้ชนะ
              </p>
            )}
            <fieldset className="vote-location-list">
              <legend className="vote-location-list__legend">เลือกสถานที่ 1 แห่ง</legend>
              {locations.map((location) => (
                <article className="vote-location-card" key={location.location_id}>
                  {canVote ? (
                    <label className="vote-location-card__choice">
                      <input
                        type="radio"
                        name="location"
                        className="vote-location-card__radio"
                        value={location.location_id}
                        checked={selectedLocationId === location.location_id}
                        disabled={hasVoted}
                        onChange={() => setSelectedLocationId(location.location_id)}
                      />
                      <span className="vote-location-card__name">{location.name}</span>
                    </label>
                  ) : (
                    <h2 className="vote-location-card__name">{location.name}</h2>
                  )}
                  <img
                    className="vote-location-card__image"
                    src={location.image_url}
                    alt={`ภาพตัวอย่าง: ${location.name}`}
                  />
                  <p className="vote-location-card__summary">{location.survey_summary}</p>
                  <p className="vote-location-card__score">
                    คะแนนรวม:{" "}
                    <output className="vote-location-card__badge">{location.total_votes}</output>
                  </p>
                </article>
              ))}
            </fieldset>
          </>
        )}
        {canVote && locations.length > 0 && (
          <button
            className="vote-submit"
            type="submit"
            disabled={!selectedLocationId || isSubmitting || hasVoted}
          >
            {isSubmitting
              ? "กำลังบันทึกคะแนน"
              : hasVoted
                ? "ใช้สิทธิ์แล้ว"
                : "ยืนยันการลงคะแนน"}
          </button>
        )}
      </form>
      {voteError && (
        <p className="vote-message vote-message--error" role="alert">
          {voteError}
        </p>
      )}
      {hasVoted && (
        <p className="vote-message vote-message--success" role="status">
          ท่านได้ใช้สิทธิ์ไปแล้ว
        </p>
      )}
    </main>
  );
}
