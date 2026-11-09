"""Camp enrollment queries."""

from psycopg import Connection

from backend.app.validators.enrollment_validator import ENROLLMENT_REQUIRED_FIELDS

def get_configured_camp(
    connection: Connection,
    camp_id: str,
) -> dict[str, object] | None:
    """Fetch only the camp selected by server configuration (FR-ENR-01, CON-ENR-01)."""
    query = """
        SELECT camp_id, name, status, open_date, close_date
        FROM camps
        WHERE camp_id = %s
    """
    with connection.cursor() as cursor:
        cursor.execute(query, (camp_id,))
        row = cursor.fetchone()

    if row is None:
        return None

    return {
        "camp_id": row[0],
        "name": row[1],
        "status": row[2],
        "open_date": row[3],
        "close_date": row[4],
        "required_fields": list(ENROLLMENT_REQUIRED_FIELDS),
        "required_documents": [],
    }
