import React from "react";
import { View, Text, Button } from "react-native";
import { cloudReadDirectoryAsync, commenceDownloadChain } from "./functions";
import * as CloudStore from "react-native-cloud-store";
import {
  defaultICloudContainerPath,
  PathUtils,
} from "react-native-cloud-store";
const iCloudDocumentDirectory = defaultICloudContainerPath + "/Documents";
const App = () => {
  React.useEffect(() => {
    const downloadEvent = CloudStore.registerGlobalDownloadEvent();
    return () => {
      downloadEvent?.remove();
    };
  }, []);
  const [files, setFiles] = React.useState([]);
  const [successfulDownloads, seSuccessfulDownloads] = React.useState(0);

  return (
    <View style={{ flex: 1, marginTop: 100, alignItems: "center" }}>
      <Text>iCloud Download example issue.</Text>

      <Button
        title="Read Directory"
        onPress={async () => {
          setFiles(await cloudReadDirectoryAsync(iCloudDocumentDirectory));
        }}
      ></Button>
      <Button
        title="Start"
        onPress={() => {
          //
          commenceDownloadChain({
            items: files
              .filter((file) => file.uri.includes(".icloud"))
              .map((file) => file.uri),
          })
            .then(() => {
              console.log("All downloads complete");
            })
            .catch((error) => {
              console.error("Error in download chain:", error);
            });
        }}
      ></Button>
      <Text>{JSON.stringify(files?.[0])}</Text>
      <Text>{JSON.stringify(files?.length)} Files</Text>
      <Text>
        {JSON.stringify(
          files?.filter((file) => file.uri.includes(".icloud")).length
        )}{" "}
        Not Downloaded
      </Text>
    </View>
  );
};

export default App;
