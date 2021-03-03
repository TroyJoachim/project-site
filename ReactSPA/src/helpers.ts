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
function humanFileSize(bytes: number, si = false, dp = 1) {
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

// Source: https://github.com/kennethjiang/js-file-download
function fileDownload(
    data: string | ArrayBuffer | ArrayBufferView | Blob,
    filename: string,
    mime?: string,
    bom?: string | Uint8Array
): void {
    var blobData = typeof bom !== "undefined" ? [bom, data] : [data];
    var blob = new Blob(blobData, { type: mime || "application/octet-stream" });
    if (typeof window.navigator.msSaveBlob !== "undefined") {
        // IE workaround for "HTML7007: One or more blob URLs were
        // revoked by closing the blob for which they were created.
        // These URLs will no longer resolve as the data backing
        // the URL has been freed."
        window.navigator.msSaveBlob(blob, filename);
    } else {
        var blobURL =
            window.URL && window.URL.createObjectURL
                ? window.URL.createObjectURL(blob)
                : window.webkitURL.createObjectURL(blob);
        var tempLink = document.createElement("a");
        tempLink.style.display = "none";
        tempLink.href = blobURL;
        tempLink.setAttribute("download", filename);

        // Safari thinks _blank anchor are pop ups. We only want to set _blank
        // target if the browser does not support the HTML5 download attribute.
        // This allows you to download files in desktop safari if pop up blocking
        // is enabled.
        if (typeof tempLink.download === "undefined") {
            tempLink.setAttribute("target", "_blank");
        }

        document.body.appendChild(tempLink);
        tempLink.click();

        // Fixes "webkit blob resource error 1"
        setTimeout(function () {
            document.body.removeChild(tempLink);
            window.URL.revokeObjectURL(blobURL);
        }, 200);
    }
}

// Converts IFile[] to File[]
function convertFiles(fileAttachments: IFile[]): File[] {
    return fileAttachments.map((fa) => {
        // TODO: add file size
        return new File([], fa.file_name);
    });
}

// Gets the users JWT token from the global state
function getUserToken() {
    let token = null;
    const session = globalState.session.get();
    if (session) {
        token = session.getAccessToken().getJwtToken();
    }
    return token;
}

// TODO: add to global state like the one above.
function getIdentityId() {
    return Auth.currentCredentials().then((result) => {
        return result.identityId;
    });
}

// Helper to remove empty values from an array in Typescript
// Source: https://stackoverflow.com/questions/43118692/typescript-filter-out-nulls-from-an-array
function notEmpty<TValue>(value: TValue | null | undefined): value is TValue {
    if (value === null || value === undefined) return false;
    const testDummy: TValue = value;
    return true;
}

// Converts UTC DateTime to localized date time
function localizeDateTime(utc: string) {
    const date = new Date(utc);
    return date.toLocaleString(navigator.language, { timeZone: 'UTC' });
}

export {
    humanFileSize,
    fileDownload,
    convertFiles,
    getUserToken,
    getIdentityId,
    notEmpty,
    localizeDateTime,
};
