import * as CloudStore from "react-native-cloud-store";
import {
  defaultICloudContainerPath,
  PathUtils,
} from "react-native-cloud-store";

const CONCURRENT_LIMIT = 10; // Limit the number of concurrent promises

const cloudReadDirectoryAsync = async (fileUri) => {
  try {
    const dirs = await CloudStore.readDir(decodeURI(fileUri));
    const validDirs = dirs.filter((item) => !item.includes(".Trash"));

    const processDir = async (item) => {
      const filePath = item.slice(item.lastIndexOf("/") + 1, item.length);
      const uri = `${fileUri}/${filePath}`;
      const fileStat = await stat(uri);

      if (fileStat.isDirectory) {
        return cloudReadDirectoryAsync(uri);
      } else {
        return { ...fileStat, uri };
      }
    };

    // Limit the number of concurrent promises
    const results = [];
    for (let i = 0; i < validDirs.length; i += CONCURRENT_LIMIT) {
      const chunk = validDirs.slice(i, i + CONCURRENT_LIMIT);
      const chunkResults = await Promise.all(chunk.map(processDir));
      results.push(...chunkResults.flat());
    }

    return results;
  } catch (e) {
    console.log(e);
  }
};

async function stat(icloudPath) {
  try {
    const statResult = await CloudStore.stat(icloudPath);

    return {
      isInICloud: statResult.isInICloud,
      containerDisplayName: statResult.containerDisplayName,

      isDownloading: statResult.isDownloading,
      hasCalledDownload: statResult.hasCalledDownload,
      downloadStatus: statResult.downloadStatus,
      downloadError: statResult.downloadError,

      isUploaded: statResult.isUploaded,
      isUploading: statResult.isUploading,
      uploadError: statResult.uploadError,

      hasUnresolvedConflicts: statResult.hasUnresolvedConflicts,

      modifyTimestamp: statResult.modifyTimestamp,
      createTimestamp: statResult.createTimestamp,
      name: statResult.name,
      localizedName: statResult.localizedName,
      isDirectory: statResult.isDirectory, // Add this property to determine if it's a directory
    };
  } catch (e) {
    console.log(e);
  }
}

var cancelDownload = false;
var actualIndex = 0;
var itemsCalled = [];
var itemsDownloaded = [];
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}


async function commenceDownloadChain({ items, index = 0 }) {
  if (index >= items.length) {
    return;
  }

  const item = items[index];

  const downloadWithProgressCheck = async (resolve) => {
    await CloudStore.download(decodeURI(item), {
      onProgress: (data) => {
        console.log(data.progress)
        if (data.progress === 100) {
          resolve();
        }
      },
    });
  };

  await new Promise((resolve) => {
    downloadWithProgressCheck(resolve);
  });

  await commenceDownloadChain({ items, index: index + 1 });
}

// Usage:



module.exports = {
  cloudReadDirectoryAsync,
  cancelDownload: () => (cancelDownload = true),
  commenceDownloadChain
};
