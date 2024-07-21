// auth.js

const login = async ({ email, password }) => {
    const response = await fetch('https://quickswiper.com/api/user/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
    });
    const data = await response.json();
    if (data.token) {
        chrome.storage.local.set({ token: data.token });
    }
    return data.token;
}

const register = async ({ email, password }) => {
    const response = await fetch('https://quickswiper.com/api/user/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
    });
    const data = await response.json();
    if (data.token) {
        chrome.storage.local.set({ token: data.token });
    }
    return data.token;
}

export { login, register };