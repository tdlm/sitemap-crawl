import pLimit from 'p-limit';
import type { Sitemap, UrlCheckResult } from './types.js';

export async function fetchWithRedirects(
  url: string,
  method: 'HEAD' | 'GET',
  timeout: number,
  maxRedirects: number,
): Promise<{ status: number }> {
  let currentUrl = url;
  let redirectCount = 0;

  while (true) {
    const res = await fetch(currentUrl, {
      method,
      redirect: 'manual',
      signal: AbortSignal.timeout(timeout),
    });

    const location = res.headers.get('location');
    if (location && res.status >= 300 && res.status < 400) {
      redirectCount++;
      if (redirectCount > maxRedirects) {
        return { status: res.status };
      }
      // Resolve relative redirects
      currentUrl = new URL(location, currentUrl).href;
      continue;
    }

    return { status: res.status };
  }
}

export async function checkUrl(
  url: string,
  timeout: number,
  maxRedirects: number,
): Promise<UrlCheckResult> {
  try {
    // Try HEAD first
    const headResult = await fetchWithRedirects(url, 'HEAD', timeout, maxRedirects);

    // Fall back to GET on 405 Method Not Allowed or 403 Forbidden
    if (headResult.status === 405 || headResult.status === 403) {
      const getResult = await fetchWithRedirects(url, 'GET', timeout, maxRedirects);
      return { url, statusCode: getResult.status };
    }

    return { url, statusCode: headResult.status };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return { url, statusCode: 0, error: message };
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isRetryable(result: UrlCheckResult): boolean {
  return result.statusCode === 503 || result.statusCode === 0;
}

export async function checkUrls(
  sitemap: Sitemap,
  concurrency: number,
  timeout: number,
  maxRedirects: number,
  delay: number,
  maxRetries: number,
  onProgress: () => void,
  onRetryRound?: (attempt: number, count: number) => void,
): Promise<UrlCheckResult[]> {
  const limit = pLimit(concurrency);
  let first = true;

  const tasks = sitemap.urls.map((u) =>
    limit(async () => {
      if (delay > 0) {
        if (first) {
          first = false;
        } else {
          await sleep(delay);
        }
      }
      const result = await checkUrl(u.loc, timeout, maxRedirects);
      onProgress();
      return result;
    }),
  );

  const results = await Promise.all(tasks);

  // Retry retryable errors (503, timeouts) at the end
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    const retryableIndices = results
      .map((r, i) => (isRetryable(r) ? i : -1))
      .filter((i) => i >= 0);

    if (retryableIndices.length === 0) break;

    onRetryRound?.(attempt, retryableIndices.length);

    const retryTasks = retryableIndices.map((i) =>
      limit(async () => {
        if (delay > 0) await sleep(delay);
        return { index: i, result: await checkUrl(results[i].url, timeout, maxRedirects) };
      }),
    );

    const retryResults = await Promise.all(retryTasks);
    for (const { index, result } of retryResults) {
      results[index] = result;
    }
  }

  return results;
}
