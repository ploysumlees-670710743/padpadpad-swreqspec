import React from 'react';

export default function ActivityTable({ activities = [], onEdit, onDelete, onToggleStatus }) {
  if (!activities.length) {
    return (
      <div className="empty-state">
        <p>ยังไม่มีกิจกรรมในตาราง</p>
      </div>
    );
  }

  return (
    <div className="schedule-table-wrap">
      <table className="schedule-table">
        <thead>
          <tr>
            <th>กิจกรรม</th>
            <th>วันที่</th>
            <th>เวลา</th>
            <th>สถานที่</th>
            <th>ผู้รับผิดชอบ</th>
            <th>Checklist</th>
            <th>จัดการ</th>
          </tr>
        </thead>
        <tbody>
          {activities.map((activity) => {
            const status = activity.checklist_status ?? activity.checklistStatus ?? 'Pending';
            const activityId = activity.activity_id ?? activity.activityId;

            return (
              <tr key={activityId ?? `${activity.activity_name}-${activity.activity_date}`}>
                <td>
                  <strong>{activity.activity_name ?? activity.activityName}</strong>
                  <small>{activity.description}</small>
                </td>
                <td>{activity.activity_date ?? activity.date}</td>
                <td>
                  {activity.start_time ?? activity.startTime} - {activity.end_time ?? activity.endTime}
                </td>
                <td>{activity.location_id ?? activity.locationId}</td>
                <td>{activity.facilitator_or_responsible ?? activity.responsible}</td>
                <td>
                  <span className={`status-badge status-${status === 'Done' ? 'done' : 'pending'}`}>
                    {status}
                  </span>
                </td>
                <td className="table-actions">
                  <button type="button" className="secondary-button" onClick={() => onEdit(activity)}>
                    แก้ไข
                  </button>
                  <button
                    type="button"
                    className="primary-button small-button"
                    onClick={() => onToggleStatus(activity)}
                  >
                    {status === 'Done' ? 'Mark Pending' : 'Mark Done'}
                  </button>
                  <button type="button" className="danger-button" onClick={() => onDelete(activityId)}>
                    ลบ
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
