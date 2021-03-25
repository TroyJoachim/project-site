import { IFile } from "./types";
import { globalState } from "./globalState";
import { Auth } from "aws-amplify";

// Source: https://stackoverflow.com/a/14919494
/**
 * Format bytes as human-readable text.
 *
 * @param bytes Number of bytes.
 * @param si True to use metric (SI) units, aka powers of 1000. False to use
 *           binary (IEC), aka powers of 1024.
 * @param dp Number of decimal places to display.
 *
 * @return Formatted string.
 */
 export function humanFileSize(bytes: number, si = false, dp = 1) {
  const thresh = si ? 1000 : 1024;

  if (Math.abs(bytes) < thresh) {
    return bytes + " B";
  }

  const units = si
    ? ["kB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"]
    : ["KiB", "MiB", "GiB", "TiB", "PiB", "EiB", "ZiB", "YiB"];
  let u = -1;
  const r = 10 ** dp;

  do {
    bytes /= thresh;
    ++u;
  } while (
    Math.round(Math.abs(bytes) * r) / r >= thresh &&
    u < units.length - 1
  );

  return bytes.toFixed(dp) + " " + units[u];
}

// Converts IFile[] to File[]
export function convertFiles(fileAttachments: IFile[]): File[] {
  return fileAttachments.map((fa) => {
    // TODO: add file size
    return new File([], fa.fileName);
  });
}

// Gets the users JWT token from the global state
export function getUserToken() {
  let token = null;
  const session = globalState.session.get();
  if (session) {
    token = session.getAccessToken().getJwtToken();
  }
  return token;
}

// TODO: add to global state like the one above.
export function getIdentityId() {
  return Auth.currentCredentials().then((result) => {
    return result.identityId;
  });
}

// Helper to remove empty values from an array in Typescript
// Source: https://stackoverflow.com/questions/43118692/typescript-filter-out-nulls-from-an-array
export function notEmpty<TValue>(value: TValue | null | undefined): value is TValue {
  if (value === null || value === undefined) return false;
  const testDummy: TValue = value;
  return true;
}

// Converts UTC DateTime to localized date time
export function localizeDateTime(utc: string) {
  const date = new Date(utc);
  return date.toLocaleDateString(navigator.language, { timeZone: "UTC" });
}

export function errorMessage(err: any) {
  if (typeof err === "string") {
    return err;
  }
  return err.message ? err.message : JSON.stringify(err);
}

// Converts the base64 uri into a file
export function dataURLtoFile(dataurl: string, filename: string) {
  let arr = dataurl.split(",");
  let f = arr[0];
  if (!f) return;
  let match = f.match(/:(.*?);/);
  if (!match) return;
  let mime = match[1];
  let bstr = atob(arr[1]);
  let n = bstr.length;
  let u8arr = new Uint8Array(n);

  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }

  return new File([u8arr], filename, { type: mime });
}

// Source: https://docs.amplify.aws/lib/storage/download/q/platform/js#file-download-option
export function downloadBlob(blob: any, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename || "download";
  const clickHandler = () => {
    setTimeout(() => {
      URL.revokeObjectURL(url);
      a.removeEventListener("click", clickHandler);
    }, 150);
  };
  a.addEventListener("click", clickHandler, false);
  a.click();
  return a;
}
