import apiClient from "./apiClient";

const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
const markdownImgRegex = /!\[([^\]]*)\]\((.*\/api\/files\/[^)]+)\)/g;
const BLOB_MAP_KEY = "markdownBlobMap";

export function convertUtcToLocal(utcDateString: string) {
  const utcDate = new Date(utcDateString);
  return utcDate.toLocaleString(undefined, {
    timeZone: userTimeZone,
    hour12: false,
  });
}

export const formatToCapitalCase = (value: string) => {
  if (value.includes("-")) {
    return value
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join("-");
  }

  return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
};

export function convertToKebabCase(value: string): string {
  return value.toLowerCase().replace(/\s+/g, "-");
}

// Helper function to extract file URLs from content
export const extractFileUrls = (content: string): string[] => {
  const fileIds: string[] = [];
  let match;
  while ((match = markdownImgRegex.exec(content)) !== null) {
    const fileId = match[1].split("/").pop();
    if (!fileId) continue;
    fileIds.push(fileId);
  }
  return fileIds;
};

export const readMarkdownFile = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      resolve(event.target?.result as string);
    };
    reader.onerror = (error) => {
      reject(error);
    };
    reader.readAsText(file);
  });
};

export const UUID_PATTERN =
  /[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}/;

export const isTaskUrl = (url: string): boolean => {
  const taskUrlPattern = new RegExp(`#\/task\/${UUID_PATTERN.source}$`);
  return taskUrlPattern.test(url);
};

export async function transformMarkdownImagesToBlobUrls(
  content: string,
): Promise<string> {
  const matches = [...content.matchAll(markdownImgRegex)];

  const replacements: Record<string, string> = {};
  const blobMap: Record<string, string> = {};

  await Promise.all(
    matches.map(async (match) => {
      const original = match[0]; // 整個 ![](url)
      const altText = match[1];
      const url = match[2]; // 圖片 URL

      if (replacements[original]) return; // 已處理過

      try {
        const response = await apiClient.get(url, {
          responseType: "blob",
        });

        const blobUrl = URL.createObjectURL(response.data);
        replacements[original] = `![${altText}](${blobUrl})`;
        blobMap[blobUrl] = url;
      } catch (err) {
        console.error("Failed to fetch image:", match, err);
        replacements[original] = `![Image failed to load](${url})`;
      }
    }),
  );
  const existBlobMap: Record<string, string> = getBlobMap();
  sessionStorage.setItem(
    BLOB_MAP_KEY,
    JSON.stringify({ ...existBlobMap, ...blobMap }),
  );

  let transformed = content;
  for (const [original, replacement] of Object.entries(replacements)) {
    transformed = transformed.replace(original, replacement);
  }
  return transformed;
}

export function restoreBlobUrlsToOriginal(content: string): string {
  const blobMap: Record<string, string> = getBlobMap();
  if (!blobMap) return content;

  let transformed = content;

  const imageRegex = /!\[([^\]]*)\]\((blob\\:[^\)]+)\)/g;

  for (const match of content.matchAll(imageRegex)) {
    const fullMatch = match[0];
    const altText = match[1];
    const blobUrl = normalizeBlobUrls(match[2]);

    const originalUrl = blobMap[blobUrl];
    if (originalUrl) {
      const replacement = `![${altText}](${originalUrl})`;
      transformed = transformed.replace(fullMatch, replacement);
    }
  }
  return transformed;
}

function getBlobMap() {
  const blobMapRaw = sessionStorage.getItem(BLOB_MAP_KEY);
  if (!blobMapRaw) return {};

  return JSON.parse(blobMapRaw);
}

export function normalizeBlobUrls(markdown: string): string {
  return markdown.replace(/blob\\:/g, "blob:");
}

export function formatGitLabLink(url: string): string | null {
  const issueMatch = url.match(/\/issues\/(\d+)/);
  if (issueMatch) {
    const issueNumber = issueMatch[1];
    return `[#${issueNumber}](${url})`;
  }

  const mrMatch = url.match(/\/merge_requests\/(\d+)/);
  if (mrMatch) {
    const mrNumber = mrMatch[1];
    return `[!${mrNumber}](${url})`;
  }

  return null;
}
