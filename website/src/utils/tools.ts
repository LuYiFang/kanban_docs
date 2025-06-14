const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

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
  const regex = /!\[.*]\((.*\/api\/files\/[^)]+)\)/g;
  const urls: string[] = [];
  let match;
  while ((match = regex.exec(content)) !== null) {
    const fileId = match[1].split("/").pop();
    if (!fileId) continue;
    urls.push(fileId);
  }
  return urls;
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
