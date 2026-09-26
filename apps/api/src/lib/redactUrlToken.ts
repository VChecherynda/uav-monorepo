export const redactUrlToken = (urlString: string): string => {
  const url = new URL(urlString, 'https://x');

  if (!url.searchParams.has('token')) {
    return urlString;
  }

  url.searchParams.set('token', 'redacted');

  return url.pathname + url.search;
};
