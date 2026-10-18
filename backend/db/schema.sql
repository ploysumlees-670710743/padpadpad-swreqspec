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

CREATE TABLE IF NOT EXISTS assignments (
    assignment_id TEXT PRIMARY KEY,
    assignment_name TEXT NOT NULL,
    assignment_type TEXT NOT NULL CHECK (assignment_type IN ('group', 'department')),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS participants (
    participant_id TEXT PRIMARY KEY,
    full_name TEXT NOT NULL,
    selection_status TEXT NOT NULL DEFAULT 'selected' CHECK (selection_status IN ('selected', 'not_selected')),
    current_assignment_id TEXT REFERENCES assignments (assignment_id),
    assignment_status TEXT NOT NULL DEFAULT 'pending' CHECK (assignment_status IN ('pending', 'assigned')),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
