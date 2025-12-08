// Helper functions để làm việc với cookies
export function setCookie(name: string, value: string, days: number = 1) {
    const maxAge = days * 24 * 60 * 60; // Convert days to seconds
    document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${maxAge}`;
}

export function getCookie(name: string): string | null {
    if (typeof document === 'undefined') return null;
    
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    
    if (parts.length === 2) {
        const cookieValue = parts.pop()?.split(';').shift();
        return cookieValue ? decodeURIComponent(cookieValue) : null;
    }
    return null;
}

export function deleteCookie(name: string) {
    document.cookie = `${name}=; path=/; max-age=0`;
}