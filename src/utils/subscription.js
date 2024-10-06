const getToken = () => {
    return new Promise((resolve) => {
        chrome.storage.local.get(['token'], (result) => {
            resolve(result.token || "");
        });
    });
};
const checkSubscription = async () => {
    // const token = await getToken();
    // if (token) {
    //     const response = await fetch('https://quickswiper.com/api/subscription/subscriptions', {
    //         headers: { 'x-auth-token': token }
    //     });
    //     const data = await response.json();
    //     if (data.msg === 'Token is not valid') {
    //         chrome.storage.local.remove('token');
    //         return null;
    //     }
    //     const findActiveSubscription = data.find((sub) => sub.status === 'active');
    //     console.log(findActiveSubscription);
    //     return findActiveSubscription;
    // }
    // return null;
    return true;
};

export { checkSubscription, getToken };