import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { ConfigForm } from '../src/components/ConfigForm';
import type { FormConfig } from '../src/types/config.types';
import vendorConfig from './configs/vendor-onboarding.json';
import employeeConfig from './configs/employee-onboarding.json';

const CONFIGS: Record<string, FormConfig> = {
  'Vendor Onboarding': vendorConfig as FormConfig,
  'Employee Onboarding': employeeConfig as FormConfig,
};

export default function App() {
  const [activeConfig, setActiveConfig] = useState('Vendor Onboarding');
  const [submittedData, setSubmittedData] = useState<Record<string, unknown> | null>(null);
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [rawJson, setRawJson] = useState(() => JSON.stringify(CONFIGS['Vendor Onboarding'], null, 2));
  const [parsedConfig, setParsedConfig] = useState<FormConfig>(CONFIGS['Vendor Onboarding']);

  function selectPreset(name: string) {
    setActiveConfig(name);
    setRawJson(JSON.stringify(CONFIGS[name], null, 2));
    setParsedConfig(CONFIGS[name]);
    setJsonError(null);
    setSubmittedData(null);
  }

  function handleJsonChange(text: string) {
    setRawJson(text);
    try {
      const parsed = JSON.parse(text) as FormConfig;
      setParsedConfig(parsed);
      setJsonError(null);
    } catch (e) {
      setJsonError((e as Error).message);
    }
  }

  function handleSubmit(data: Record<string, unknown>) {
    setSubmittedData(data);
  }

  return (
    <div className="playground">
      <header className="playground-header">
        <h1>rhf-config-engine playground</h1>
        <div className="preset-buttons">
          {Object.keys(CONFIGS).map((name) => (
            <button
              key={name}
              className={`preset-btn${activeConfig === name ? ' preset-btn--active' : ''}`}
              onClick={() => selectPreset(name)}
            >
              {name}
            </button>
          ))}
        </div>
      </header>

      <div className="playground-body">
        <div className="playground-left">
          <h2>Config (JSON)</h2>
          <textarea
            className={`json-editor${jsonError ? ' json-editor--error' : ''}`}
            value={rawJson}
            onChange={(e) => handleJsonChange(e.target.value)}
            spellCheck={false}
          />
          {jsonError && <p className="json-error">{jsonError}</p>}
        </div>

        <div className="playground-right">
          <h2>Live Form</h2>
          {!jsonError && (
            <ConfigForm
              key={parsedConfig.id + rawJson.length}
              config={parsedConfig}
              onSubmit={handleSubmit}
            />
          )}

          {submittedData && (
            <div className="submitted-data">
              <h3>Submitted Data</h3>
              <pre>{JSON.stringify(submittedData, null, 2)}</pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
