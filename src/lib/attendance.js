export function summarizeAttendance(registrations = []) {
    const summary = registrations.reduce((acc, registration) => {
        const status = registration.status || 'confirmed'

        if (status === 'confirmed') acc.registered += 1
        if (status === 'cancelled') acc.cancelled += 1
        if (status === 'waitlisted') acc.waitlisted += 1
        if (status === 'confirmed' && registration.attended) acc.attended += 1

        return acc
    }, {
        registered: 0,
        attended: 0,
        absent: 0,
        cancelled: 0,
        waitlisted: 0,
        rate: 0,
    })

    summary.absent = Math.max(summary.registered - summary.attended, 0)
    summary.rate = summary.registered ? Math.round((summary.attended / summary.registered) * 100) : 0

    return summary
}

export function summarizeAttendanceByEvent(registrations = []) {
    return registrations.reduce((acc, registration) => {
        const eventId = registration.event_id
        if (!eventId) return acc

        if (!acc[eventId]) acc[eventId] = []
        acc[eventId].push(registration)

        return acc
    }, {})
}

