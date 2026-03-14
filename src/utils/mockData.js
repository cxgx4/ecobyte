export const generateHourlyData = () => {
    const data = [];
    const startHour = new Date().getHours() - 11;
    for (let i = 0; i < 12; i++) {
        const hour = (startHour + i + 24) % 24;
        data.push({
            time: `${hour}:00`,
            pm25: Math.floor(Math.random() * 80) + 10,
            co2: Math.floor(Math.random() * 200) + 400,
        });
    }
    return data;
};

export const generateDailyData = () => {
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const currentDayIndex = new Date().getDay() === 0 ? 6 : new Date().getDay() - 1;
    const data = [];

    for (let i = 0; i < 5; i++) {
        const day = days[(currentDayIndex + i) % 7];
        data.push({
            day,
            avgAQI: Math.floor(Math.random() * 100) + 50,
            peakAQI: Math.floor(Math.random() * 150) + 80,
        });
    }
    return data;
};

export const generateIotNodes = () => {
    return Array.from({ length: 12 }).map((_, i) => {
        const isOnline = Math.random() > 0.15;
        return {
            id: `EB-KOL-${(i + 1).toString().padStart(2, '0')}`,
            status: isOnline ? 'online' : 'offline',
            uptime: isOnline ? (95 + Math.random() * 5).toFixed(1) : (80 + Math.random() * 10).toFixed(1),
        };
    });
};
