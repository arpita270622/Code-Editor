import React, { useEffect, useRef, useCallback } from 'react';
import Codemirror from 'codemirror';
import 'codemirror/lib/codemirror.css';
import 'codemirror/theme/dracula.css';
import 'codemirror/mode/javascript/javascript';
import 'codemirror/addon/edit/closetag';
import 'codemirror/addon/edit/closebrackets';
import ACTIONS from '../Actions';

const Editor = ({ socketRef, roomId, onCodeChange }) => {
  const editorRef = useRef(null);

  const handleCodeChange = useCallback(
    (code) => {
      if (onCodeChange) onCodeChange(code);
    },
    [onCodeChange]
  );

  useEffect(() => {
    editorRef.current = Codemirror.fromTextArea(
      document.getElementById('realtimeEditor'),
      {
        mode: { name: 'javascript', json: true },
        theme: 'dracula',
        autoCloseTags: true,
        autoCloseBrackets: true,
        lineNumbers: true,
      }
    );

    editorRef.current.on('change', (instance, changes) => {
      const { origin } = changes;
      const code = instance.getValue();
      handleCodeChange(code);

      if (origin !== 'setValue' && socketRef.current) {
        socketRef.current.emit(ACTIONS.CODE_CHANGE, { roomId, code });
      }
    });
  }, [handleCodeChange, roomId, socketRef]);

  useEffect(() => {
    const currentSocket = socketRef.current;

    if (!currentSocket) return;

    const codeChangeListener = ({ code }) => {
      if (code !== null && editorRef.current) {
        editorRef.current.setValue(code);
      }
    };

    currentSocket.on(ACTIONS.CODE_CHANGE, codeChangeListener);

    return () => {
      if (currentSocket) {
        currentSocket.off(ACTIONS.CODE_CHANGE, codeChangeListener);
      }
    };
  }, [socketRef]);

  return <textarea id="realtimeEditor"></textarea>;
};

export default Editor;
