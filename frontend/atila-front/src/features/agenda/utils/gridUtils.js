export const computeLayout = (events) => {
    if (!events.length) return [];

    // Sort events by start time
    const sortedEvents = [...events].sort((a, b) => new Date(a.inicio) - new Date(b.inicio));
    const layoutEvents = [];

    // Group overlapping events
    const groups = [];
    let currentGroup = [];
    let groupEnd = 0;

    sortedEvents.forEach(event => {
        const start = new Date(event.inicio).getTime();
        const end = new Date(event.fin).getTime();

        if (currentGroup.length === 0) {
            currentGroup.push(event);
            groupEnd = end;
        } else {
            if (start < groupEnd) {
                // Overlaps with the current group
                currentGroup.push(event);
                groupEnd = Math.max(groupEnd, end);
            } else {
                // New group
                groups.push(currentGroup);
                currentGroup = [event];
                groupEnd = end;
            }
        }
    });
    if (currentGroup.length > 0) groups.push(currentGroup);

    // Process each group to assign columns
    groups.forEach(group => {
        const columns = [];
        group.forEach(event => {
            let placed = false;
            for (let i = 0; i < columns.length; i++) {
                const column = columns[i];
                const lastEventInColumn = column[column.length - 1];
                // Simple collision check within column
                if (new Date(event.inicio) >= new Date(lastEventInColumn.fin)) {
                    column.push(event);
                    placed = true;
                    event.colIndex = i;
                    break;
                }
            }
            if (!placed) {
                columns.push([event]);
                event.colIndex = columns.length - 1;
            }
        });

        const totalColumns = columns.length;

        group.forEach(event => {
            const start = new Date(event.inicio);
            const end = new Date(event.fin);
            const startHour = start.getHours();
            const startMinutes = start.getMinutes();
            const duration = (end - start) / (1000 * 60 * 60); // hours

            // 10 AM start offset, 96px per hour
            // We use 10.0 because the grid starts at 10:00 AM
            const top = (startHour - 10 + startMinutes / 60) * 96;

            // Dejar 15% de margen a la izquierda para permitir clicks en el grid
            // Las citas ocuparán el 80% del ancho disponible
            const availableWidth = 80; // 80% del ancho total
            const leftMargin = 15; // 15% de margen a la izquierda

            const widthPct = availableWidth / totalColumns;
            const leftPct = leftMargin + (event.colIndex || 0) * widthPct;

            layoutEvents.push({
                cita: event,
                style: {
                    top: `${top}px`,
                    height: `${duration * 96}px`,
                    left: `${leftPct}%`,
                    width: `${widthPct}%`,
                    position: 'absolute'
                }
            });
        });
    });

    return layoutEvents;
};

export const STAFF_COLORS = [
    { bg: 'bg-blue-200', border: 'border-blue-600', text: 'text-blue-900' },
    { bg: 'bg-green-200', border: 'border-green-600', text: 'text-green-900' },
    { bg: 'bg-purple-200', border: 'border-purple-600', text: 'text-purple-900' },
    { bg: 'bg-amber-200', border: 'border-amber-600', text: 'text-amber-900' },
    { bg: 'bg-rose-200', border: 'border-rose-600', text: 'text-rose-900' },
    { bg: 'bg-cyan-200', border: 'border-cyan-600', text: 'text-cyan-900' },
    { bg: 'bg-indigo-200', border: 'border-indigo-600', text: 'text-indigo-900' },
    { bg: 'bg-fuchsia-200', border: 'border-fuchsia-600', text: 'text-fuchsia-900' },
];

export const getStaffColor = (id) => {
    if (!id) return STAFF_COLORS[0];
    const index = typeof id === 'number' ? id % STAFF_COLORS.length : parseInt(id) % STAFF_COLORS.length;
    return STAFF_COLORS[isNaN(index) ? 0 : index];
};
