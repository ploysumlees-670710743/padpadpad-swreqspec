CREATE TABLE IF NOT EXISTS camp_projects (
    project_id TEXT PRIMARY KEY,
    project_name TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'draft', 'archived'))
);

CREATE TABLE IF NOT EXISTS camp_locations (
    location_id TEXT PRIMARY KEY,
    project_id TEXT NOT NULL REFERENCES camp_projects (project_id),
    location_name TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS sub_activities (
    activity_id TEXT PRIMARY KEY,
    project_id TEXT NOT NULL REFERENCES camp_projects (project_id),
    location_id TEXT NOT NULL REFERENCES camp_locations (location_id),
    activity_name TEXT NOT NULL,
    activity_date TEXT NOT NULL,
    start_time TEXT NOT NULL,
    end_time TEXT NOT NULL,
    description TEXT NOT NULL,
    facilitator_or_responsible TEXT NOT NULL,
    checklist_status TEXT NOT NULL DEFAULT 'Pending' CHECK (checklist_status IN ('Pending', 'Done')),
    created_by TEXT,
    updated_by TEXT
);

CREATE TABLE IF NOT EXISTS user_permissions (
    user_id TEXT PRIMARY KEY,
    role TEXT NOT NULL CHECK (role IN ('committee', 'faculty', 'staff')),
    can_view_schedule BOOLEAN NOT NULL DEFAULT FALSE,
    can_manage_schedule BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS applications (
    application_id TEXT PRIMARY KEY,
    student_id TEXT NOT NULL,
    application_status TEXT NOT NULL,
    camp_name TEXT NOT NULL,
    activity_start_at TEXT NOT NULL,
    activity_end_at TEXT NOT NULL,
    camp_location TEXT NOT NULL,
    preparation_info TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_applications_student_id
    ON applications (student_id);

-- Supports FR-VOT-04, CON-TECH-01, CON-DATA-01, and NFR-SEC-01.
CREATE TABLE IF NOT EXISTS vote_eligibility (
    user_id TEXT NOT NULL,
    round_id TEXT NOT NULL,
    has_voted INTEGER NOT NULL DEFAULT 0 CHECK (has_voted IN (0, 1)),
    PRIMARY KEY (user_id, round_id)
);

-- Supports FR-VOT-02: voting permission is scoped to a selection round.
CREATE TABLE IF NOT EXISTS vote_eligible_users (
    user_id TEXT NOT NULL,
    round_id TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('lecturer', 'committee')),
    PRIMARY KEY (user_id, round_id)
);

-- Supports CON-DATA-01: ballot rows intentionally contain no voter identifier.
CREATE TABLE IF NOT EXISTS vote_ballots (
    ballot_id INTEGER PRIMARY KEY,
    round_id TEXT NOT NULL,
    location_id TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_vote_ballots_round_id
    ON vote_ballots (round_id);
CREATE TABLE IF NOT EXISTS applicants (
    applicant_id TEXT PRIMARY KEY,
    full_name TEXT NOT NULL,
    registration_timestamp TEXT NOT NULL,
    eligibility_status TEXT NOT NULL DEFAULT 'eligible' CHECK (eligibility_status IN ('eligible', 'ineligible', 'pending')),
    selection_status TEXT NOT NULL DEFAULT 'pending' CHECK (selection_status IN ('pending', 'selected', 'rejected')),
    is_valid_data BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS selection_batches (
    batch_id TEXT PRIMARY KEY,
    requested_quota INTEGER NOT NULL,
    actual_selected_count INTEGER NOT NULL DEFAULT 0,
    max_quota INTEGER NOT NULL DEFAULT 150,
    created_by TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'confirmed', 'cancelled'))
);

CREATE TABLE IF NOT EXISTS selection_audit_logs (
    log_id TEXT PRIMARY KEY,
    batch_id TEXT NOT NULL,
    actor_id TEXT NOT NULL,
    action_name TEXT NOT NULL,
    target_type TEXT NOT NULL,
    target_id TEXT NOT NULL,
    action_time TEXT NOT NULL,
    result_status TEXT NOT NULL
);
