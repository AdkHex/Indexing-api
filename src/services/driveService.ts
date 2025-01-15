import { config } from "../config";

class DriveService {
  async getFileInfo(fileId) {
    const url = `${config.baseUrl}/files/${fileId}?supportsAllDrives=true&includeItemsFromAllDrives=true&fields=id,name,size,webContentLink,mimeType&key=${config.googleApiKey}`;
    const response = await fetch(url);
    return response.json();
  }

  async listFolderContents(folderId) {
    const url = `${config.baseUrl}/files?q='${folderId}'+in+parents&supportsAllDrives=true&includeItemsFromAllDrives=true&pageSize=1000&orderBy=name&fields=files(id,name,size,webContentLink,mimeType)&key=${config.googleApiKey}`;
    const response = await fetch(url);
    return response.json();
  }

  async extractContent(mimeId) {
    try {
      const itemInfo = await this.getFileInfo(mimeId);

      if (itemInfo.mimeType !== "application/vnd.google-apps.folder") {
        return {
          type: "file",
          info: itemInfo,
        };
      }

      const contents = await this.listFolderContents(mimeId);
      const items = contents.files || [];

      const processedItems = await Promise.all(
        items.map(async (item) => {
          if (item.mimeType === "application/vnd.google-apps.folder") {
            const subfolderContents = await this.listFolderContents(item.id);
            return {
              type: "folder",
              info: item,
              contents: subfolderContents.files || [],
            };
          }
          return {
            type: "file",
            info: item,
          };
        })
      );

      return {
        type: "folder",
        info: itemInfo,
        contents: processedItems,
      };
    } catch (error) {
      console.error("Error extracting content:", error);
      throw error;
    }
  }
}

export const driveService = new DriveService();
