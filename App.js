import React, {Component, useRef} from 'react';
import {Platform, Button} from 'react-native';
import PSPDFKitView from 'react-native-pspdfkit';
import {useState} from 'react/cjs/react.production.min';

const DOCUMENT =
  Platform.OS === 'ios' ? 'Document.pdf' : 'file:///android_asset/Document.pdf';
const App = () => {
  const ref1 = useRef();
  const [openfile, setOpenFile] = useState(false);

  return (
    <>
      <Button
        onPress={setOpenFile(true)}
        title="Learn More"
        color="#841584"
        accessibilityLabel="Learn more about this purple button"
      />
      {openfile ? (
        <PSPDFKitView
          document={DOCUMENT}
          configuration={{
            showThumbnailBar: 'scrollable',
            pageTransition: 'scrollContinuous',
            scrollDirection: 'vertical',
          }}
          fragmentTag="PDF1"
          style={{flex: 1}}
        />
      ) : null}
    </>
  );
};
export default App;
