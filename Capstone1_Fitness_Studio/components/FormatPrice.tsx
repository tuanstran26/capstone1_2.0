const VND_TO_USD_RATE = 24000; // ví dụ: 1 USD = 24,000 VND

export const convertVNDToUSD = (vnd: number): number => {
    return vnd / VND_TO_USD_RATE;
};

export const formatUSD = (usd: number): string => {
    return usd.toLocaleString('en-US', {
        style: 'currency',
        currency: 'USD',
    });
};


export const formatVNDToUSD = (vnd: number): string => {
    const usd = convertVNDToUSD(vnd);
    return formatUSD(usd);
};