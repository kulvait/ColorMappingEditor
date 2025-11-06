import React, {useEffect, useRef, useState} from 'react';
import {TransferFunctionEditor, TransparencyEditor, ColorMapEditor, ColorPicker} from 'color-mapping-editor';

const TestColorMapping = () => {
  const [tfOutput, setTfOutput] = useState('');
  const [tpOutput, setTpOutput] = useState('');
  const [cmOutput, setCmOutput] = useState('');
  const [cpOutput, setCpOutput] = useState('');

  const tfRef = useRef(null);
  const tpRef = useRef(null);
  const cmRef = useRef(null);
  const cpRef = useRef(null);

  useEffect(() => {
    // Initialize TransferFunctionEditor
    const tf = new TransferFunctionEditor(tfRef.current, {
      initialColorMap: {
        colorStops: [
          {stop: 0, color: 'blue'},
          {stop: 0.5, color: 'white'},
          {stop: 1, color: 'red'},
        ],
        interpolationMethod: 'HSL',
      },
    });
    tf.addListener((tfInstance) => {
      setTfOutput(JSON.stringify(tfInstance.getTransferFunction(), null, 2));
    });

    // Initialize TransparencyEditor
    const tp = new TransparencyEditor(tpRef.current);
    tp.addListener((te) => {
      setTpOutput(JSON.stringify(te.getAlphaStops(), null, 2));
    });

    // Initialize ColorMapEditor
    const cm = new ColorMapEditor(cmRef.current, {
      initialColorMap: {
        colorStops: [
          {stop: 0, color: '#0f0'},
          {stop: 0.5, color: '#f00'},
          {stop: 0.75, color: '#bb00bb'},
          {stop: 1, color: '#000'},
        ],
        interpolationMethod: 'HSL',
        discrete: false,
        bins: 9,
      },
      showStopNumbers: true,
      binSelectorEditable: true,
      interpolationMethodsEditable: true,
    });
    cm.addListener((cmInstance) => {
      const result = cmInstance.discrete ? cmInstance.getDiscreteColorMap() : cmInstance.getColorMap();
      setCmOutput(JSON.stringify(result, null, 2));
    });

    // Initialize ColorPicker
    const cp = new ColorPicker(cpRef.current, {initialColor: 'cyan'});
    cp.addListener((c) => {
      setCpOutput(JSON.stringify(c.getColor(), null, 2));
    });

    return () => {
      // Cleanup when component is unmounted
      tf.removeListener();
      tp.removeListener();
      cm.removeListener();
      cp.removeListener();
    };
  }, []);

  return (
    <div id="root">
      <h1>Transfer Function Editor</h1>
      <div className="section">
        <div ref={tfRef}></div>
        <pre id="tf-output" className="preview">
          {tfOutput}
        </pre>
      </div>

      <hr />

      <h1>Transparency Editor</h1>
      <div className="section">
        <div ref={tpRef}></div>
        <pre id="tp-output" className="preview">
          {tpOutput}
        </pre>
      </div>

      <hr />

      <h1>Color Map Editor</h1>
      <div className="section">
        <div ref={cmRef}></div>
        <pre id="cm-output" className="preview">
          {cmOutput}
        </pre>
      </div>

      <hr />

      <h1>Color Picker</h1>
      <div className="section">
        <div ref={cpRef}></div>
        <pre id="cp-output" className="preview">
          {cpOutput}
        </pre>
      </div>

      <footer>
        <div id="footer">
          <div>Author: German Aerospace Center (DLR)</div>
          <div>
            <a href="https://www.dlr.de/service/impressum.html">Imprint</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default TestColorMapping;
